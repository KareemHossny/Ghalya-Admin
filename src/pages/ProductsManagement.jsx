import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { toast } from 'sonner';

// دالة ذكية لضغط الصور تعمل على جميع الأجهزة
const compressImageUniversal = (file, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve, reject) => {
    // التحقق مما إذا كان المتصفح يدعم Canvas
    if (!window.HTMLCanvasElement) {
      // إذا كان Canvas غير مدعوم، استخدم الصورة الأصلية
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsDataURL(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
      try {
        let width = img.width;
        let height = img.height;

        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // تعبئة الخلفية باللون الأبيض للصور الشفافة
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // رسم الصورة
        ctx.drawImage(img, 0, 0, width, height);

        // تحديد الجودة بناءً على حجم الملف الأصلي
        let quality = 0.8; // جودة افتراضية أعلى لأن Cloudinary سيعتني بالضغط
        
        if (file.size > 2 * 1024 * 1024) { // إذا كان الملف أكبر من 2MB
          quality = 0.7;
        } else if (file.size > 1 * 1024 * 1024) { // إذا كان الملف أكبر من 1MB
          quality = 0.75;
        }

        // تحويل إلى Base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = function() {
      reject(new Error('فشل في تحميل الصورة'));
    };

    // استخدام FileReader مباشرة
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };
    reader.readAsDataURL(file);
  });
};

// Extract ProductForm to a separate component
const ProductForm = ({ show, onClose, onSubmit, editingProduct, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    bestseller: false
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Reset form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        bestseller: editingProduct.bestseller || false
      });
      setImagePreview(editingProduct.image || '');
      setImageBase64(''); // لا نحتاج لـ Base64 للمنتجات الحالية
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        bestseller: false
      });
      setImagePreview('');
      setImageBase64('');
    }
  }, [editingProduct]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('يجب اختيار ملف صورة فقط (JPEG, PNG, WebP)');
      return;
    }

    // تحقق من الحجم (5MB كحد أقصى)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5MB');
      return;
    }

    setImageLoading(true);

    try {
      // معاينة فورية أولية
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      console.log('🔄 جاري معالجة الصورة...');
      
      // محاولة الضغط أولاً
      const compressedBase64 = await compressImageUniversal(file, 800, 800);
      
      // تنظيف معاينة URL المؤقتة
      URL.revokeObjectURL(previewUrl);
      
      setImagePreview(compressedBase64);
      setImageBase64(compressedBase64);
      
      const compressedSize = Math.round((compressedBase64.length * 3) / 4 / 1024);
      console.log(`📊 حجم الصورة بعد الضغط: ${compressedSize}KB`);
      
      toast.success(`تم تحميل الصورة بنجاح (${compressedSize}KB)`);
    } catch (error) {
      console.error('❌ خطأ في معالجة الصورة:', error);
      
      // طريقة بديلة مباشرة بدون ضغط
      toast.info('جاري استخدام طريقة بديلة...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const fileSize = Math.round((base64.length * 3) / 4 / 1024);
        
        if (fileSize > 3000) {
          toast.error('حجم الصورة كبير جداً. يرجى اختيار صورة أخرى');
          setImagePreview('');
          setImageBase64('');
        } else {
          setImagePreview(base64);
          setImageBase64(base64);
          toast.success('تم تحميل الصورة بنجاح');
        }
      };
      reader.onerror = () => {
        toast.error('فشل في تحميل الصورة. حاول مرة أخرى');
        setImagePreview('');
        setImageBase64('');
      };
      reader.readAsDataURL(file);
    } finally {
      setImageLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageBase64('');
    // إعادة تعيين حقل الإدخال
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من وجود صورة للمنتج الجديد
    if (!editingProduct && !imageBase64) {
      toast.error('الصورة مطلوبة للمنتج الجديد');
      return;
    }

    // للمنتج الجديد، تحقق من حجم الصورة قبل الإرسال
    if (!editingProduct && imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const fileSizeInKB = (base64Data.length * 3) / 4 / 1024;
      
      if (fileSizeInKB > 2000) {
        toast.error('حجم الصورة كبير جداً بعد المعالجة. يرجى اختيار صورة أخرى');
        return;
      }
    }

    onSubmit(formData, imageBase64);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* معاينة الصورة */}
            {(imagePreview || (editingProduct && editingProduct.image)) && (
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={imagePreview || editingProduct.image}
                    alt="معاينة الصورة"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {imagePreview ? 'معاينة الصورة الجديدة' : 'الصورة الحالية'}
                </p>
              </div>
            )}

            {/* حقل رفع الصورة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingProduct ? 'تغيير صورة المنتج (اختياري)' : 'صورة المنتج *'}
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                اختر صورة من الجهاز - أقصى حجم 5MB
                {editingProduct && editingProduct.image && (
                  <span className="block text-green-600">✓ الصورة الحالية مخزنة في السحابة</span>
                )}
              </p>
              
              {imageLoading && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  <span className="mr-2 text-xs text-gray-600">جاري معالجة الصورة...</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المنتج *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر (ج.م) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المخزون *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleInputChange}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label className="mr-2 text-sm font-medium text-gray-700">
                منتج متميز
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                disabled={loading || imageLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                disabled={loading || imageLoading}
              >
                {loading || imageLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {imageLoading ? 'جاري معالجة الصورة...' : 
                     editingProduct ? 'جاري التحديث...' : 'جاري الإضافة...'}
                  </>
                ) : (
                  editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { getProducts, createProduct, updateProduct, deleteProduct, loading, error } = useApi();
  const [formLoading, setFormLoading] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('فشل في تحميل المنتجات');
    }
  };

  const handleFormSubmit = async (formData, imageBase64) => {
    setFormLoading(true);

    try {
      console.log('📤 بدء إرسال بيانات المنتج...');

      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        bestseller: formData.bestseller,
        imageBase64: imageBase64 || null // يمكن أن يكون null للمنتجات المعدلة بدون تغيير الصورة
      };

      console.log('📋 البيانات المرسلة:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        bestseller: formData.bestseller,
        hasNewImage: !!imageBase64
      });

      if (editingProduct) {
        // تحديث المنتج الموجود
        console.log('🔄 جاري تحديث المنتج:', editingProduct._id);
        const updatedProduct = await updateProduct(editingProduct._id, productData);
        
        setProducts(prev => 
          prev.map(product => 
            product._id === editingProduct._id ? updatedProduct : product
          )
        );
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        // إنشاء منتج جديد
        console.log('🆕 جاري إنشاء منتج جديد');
        const newProduct = await createProduct(productData);
        
        setProducts(prev => [newProduct, ...prev]);
        toast.success('تم إضافة المنتج بنجاح');
      }

      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('🔴 Error saving product:', err);
      
      // رسائل خطأ محددة
      let errorMessage = err.message;
      if (err.message.includes('Cloudinary') || err.message.includes('رفع الصورة')) {
        errorMessage = 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى';
      } else if (err.message.includes('5MB')) {
        errorMessage = 'حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5MB';
      } else if (err.message.includes('timed out')) {
        errorMessage = 'انتهت مهلة الاتصال. تحقق من اتصال الإنترنت وحاول مرة أخرى';
      }
      
      toast.error(errorMessage || (editingProduct ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج'));
    } finally {
      setFormLoading(false);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const deleteProductHandler = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(product => product._id !== productId));
      toast.success('تم حذف المنتج بنجاح');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('فشل في حذف المنتج');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="mr-3 text-gray-600">جاري تحميل المنتجات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-600 mt-1">إدارة وعرض جميع منتجات المتجر</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors flex items-center gap-2 mt-4 sm:mt-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة منتج جديد
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">{error}</p>
          <p className="text-yellow-600 text-sm mt-1">يتم عرض بيانات تجريبية</p>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة أول منتج إلى متجرك</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors"
          >
            إضافة منتج جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=صورة+غير+متوفرة';
                  }}
                />
                {product.bestseller && (
                  <span className="absolute top-3 left-3 bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    متميز
                  </span>
                )}
                <div className="absolute top-3 right-3 flex space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => editProduct(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteProductHandler(product._id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-pink-600">
                    {product.price} ج.م
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `متوفر (${product.stock})` : 'نفذ من المخزون'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  تم الإضافة: {new Date(product.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm 
        show={showForm}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
        loading={formLoading}
      />
    </div>
  );
};

export default ProductsManagement;