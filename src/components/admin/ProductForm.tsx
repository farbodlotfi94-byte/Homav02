/**
 * ProductForm Component
 * Handles product creation and editing with image upload and validation
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type {
  AdminProduct,
  AdminProductFormData,
  AdminError
} from '../../types/admin';
import { ADMIN_CATEGORIES } from '../../types/admin';
import { optimizeImage } from '../../utils/imageOptimizer';

interface ProductFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  product?: AdminProduct;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: AdminError) => void;
}

export function ProductForm({ 
  isOpen, 
  mode, 
  product, 
  onClose, 
  onSuccess, 
  onError 
}: ProductFormProps) {
  const [formData, setFormData] = useState<AdminProductFormData>({
    name: '',
    description: '',
    category: '',
    price: 0,
    is_predefined: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price || 0,
        is_predefined: product.is_predefined,
      });
      setPreviewUrl(adminService.getProductImageUrl(product.image_path));
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        is_predefined: 0,
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setErrors({});
  }, [product, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate price (required and must be > 0)
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'قیمت باید بیشتر از صفر باشد';
    }

    // Note: name, description, and category are optional per API spec
    // Only validate if file is required (create mode)
    if (mode === 'create' && !selectedFile) {
      newErrors.file = 'تصویر محصول الزامی است';
    }

    if (selectedFile) {
      const validation = adminService.validateFile(selectedFile);
      if (!validation.isValid) {
        newErrors.file = validation.error || 'فایل نامعتبر است';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let response;

      if (mode === 'create') {
        if (!selectedFile) {
          throw new Error('تصویر محصول الزامی است');
        }
        response = await adminService.createProduct(formData, selectedFile);
      } else {
        response = await adminService.updateProduct(
          product!.id,
          formData,
          selectedFile || undefined
        );
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        const adminError: AdminError = {
          message: response.error || 'خطا در ذخیره محصول',
          statusCode: response.statusCode,
          type: 'server',
        };
        onError(adminError);
      }
    } catch (error) {
      const adminError: AdminError = {
        message: error instanceof Error ? error.message : 'خطای ناشناخته',
        statusCode: 0,
        type: 'server',
      };
      onError(adminError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    const validation = adminService.validateFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, file: validation.error || 'فایل نامعتبر است' }));
      return;
    }

    try {
      setIsOptimizing(true);
      setErrors(prev => ({ ...prev, file: '' }));

      // Optimize image (convert to WebP if needed and compress)
      const optimizedFile = await optimizeImage(file);

      setSelectedFile(optimizedFile);
      setPreviewUrl(URL.createObjectURL(optimizedFile));
    } catch (error) {
      console.error('[ProductForm] Image optimization error:', error);
      setErrors(prev => ({
        ...prev,
        file: error instanceof Error ? error.message : 'خطا در بهینه‌سازی تصویر'
      }));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (mode === 'create') {
      setPreviewUrl('');
    } else {
      setPreviewUrl(adminService.getProductImageUrl(product!.image_path));
    }
  };

  const handleInputChange = (field: keyof AdminProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'افزودن محصول جدید' : 'ویرایش محصول'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                نام محصول
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="نام محصول را وارد کنید"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                توضیحات
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="توضیحات محصول را وارد کنید"
                className={errors.description ? 'border-red-500' : ''}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                دسته‌بندی
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent align="start" sideOffset={4}>
                  {ADMIN_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                قیمت (ریال) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder="قیمت را به ریال وارد کنید"
                className={errors.price ? 'border-red-500' : ''}
                disabled={isSubmitting}
                min="1"
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                نوع محصول
              </Label>
              <Select
                value={formData.is_predefined.toString()}
                onValueChange={(value) => handleInputChange('is_predefined', parseInt(value))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع محصول را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">سفارشی</SelectItem>
                  <SelectItem value="1">پیش‌تعریف شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                تصویر محصول {mode === 'create' && '*'}
              </Label>

              {isOptimizing ? (
                <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50">
                  <Loader2 className="w-12 h-12 text-[#E31E24] animate-spin mb-4" />
                  <p className="text-gray-600 mb-2">
                    در حال بهینه‌سازی تصویر...
                  </p>
                  <p className="text-sm text-gray-500">
                    لطفاً صبر کنید
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={previewUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-[#E31E24] bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${errors.file ? 'border-red-500' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    تصویر را اینجا بکشید یا کلیک کنید
                  </p>
                  <p className="text-sm text-gray-500">
                    فرمت‌های مجاز: JPG, PNG, WebP (حداکثر 10MB)
                  </p>
                </div>
              )}

              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting || isOptimizing}
              />

              {errors.file && (
                <p className="text-sm text-red-600">{errors.file}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="flex items-center justify-end gap-3 pt-4 border-t"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  mode === 'create' ? 'افزودن محصول' : 'ذخیره تغییرات'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

