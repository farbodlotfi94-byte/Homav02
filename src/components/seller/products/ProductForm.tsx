/**
 * Product Form Component
 *
 * Create or edit product form
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import { sellerApiService } from '../../../services/sellerApiService';
import type { ProductFormData } from '../../../types/seller-api';

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: 0,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const result = await sellerApiService.getProductDetails(productId.toString());

      if (result.success && result.data) {
        setFormData({
          name: result.data.name,
          description: result.data.description,
          category: result.data.category.toString(),
          price: result.data.price,
        });
        setImagePreview(result.data.image_url);
      } else {
        toast.error(result.error || 'خطا در دریافت اطلاعات محصول');
        navigate('/seller/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('خطا در اتصال به سرور');
      navigate('/seller/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.category || formData.price <= 0) {
      toast.error('لطفا همه فیلدهای ضروری را پر کنید');
      return;
    }

    if (!selectedImage && !isEditing) {
      toast.error('لطفا تصویر محصول را انتخاب کنید');
      return;
    }

    try {
      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price.toString());

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      let result;
      if (isEditing && id) {
        result = await sellerApiService.updateProduct(parseInt(id), formDataToSend);
      } else {
        result = await sellerApiService.createProduct(formDataToSend);
      }

      if (result.success) {
        toast.success(isEditing ? 'محصول با موفقیت بروزرسانی شد' : 'محصول با موفقیت ایجاد شد');
        navigate('/seller/products');
      } else {
        toast.error(result.error || 'خطا در ذخیره محصول');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'ویرایش محصول' : 'افزودن محصول جدید'}
        </h1>
        <button
          onClick={() => navigate('/seller/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="w-5 h-5" />
          بازگشت
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تصویر محصول *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="product-image"
            />
            <label
              htmlFor="product-image"
              className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#EEFF41] transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-gray-500">انتخاب تصویر</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نام محصول *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            placeholder="مثال: مبل راحتی مدرن"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            توضیحات *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
            placeholder="توضیحات محصول را وارد کنید..."
            required
          />
        </div>

        {/* Category and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              دسته‌بندی *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
              required
            >
              <option value="">انتخاب دسته‌بندی</option>
              <option value="1">مبل و صندلی</option>
              <option value="2">میز و صندلی غذاخوری</option>
              <option value="3">تخت خواب</option>
              <option value="4">فرش و موکت</option>
              <option value="5">دکوراسیون</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              قیمت (تومان) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#EEFF41] text-black px-6 py-3 rounded-lg hover:bg-[#D9E838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <span>{isEditing ? 'بروزرسانی محصول' : 'افزودن محصول'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
