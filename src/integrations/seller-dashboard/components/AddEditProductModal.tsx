import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { SellerProductImage } from './SellerProductImage';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductSpecsInput } from './ProductSpecsInput';
import { ProductPreviewModal } from './ProductPreviewModal';
import { RugSizeSelector } from './RugSizeSelector';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { RUG_CATEGORY_ID } from '../../../constants/rugSizes';
import type { SellerProduct, ProductSpec } from '../types/seller';
import { toast } from 'sonner';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<SellerProduct>, productImage?: File | null) => void;
  product?: SellerProduct | null;
}

// Category options for products (must match backend ProductCategory IntegerChoices)
const CATEGORY_OPTIONS = [
  { value: '1', label: 'مبلمان' },
  { value: '2', label: 'فرش و قالی' },
  { value: '3', label: 'روتختی' },
];

export function AddEditProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: AddEditProductModalProps) {
  const isEdit = !!product;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || '2', // Default to 'فرش و قالی'
    specs: product?.specs || [] as ProductSpec[],
    availableSizes: product?.availableSizes || [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.images?.[0] || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        category: product?.category || '2',
        specs: product?.specs || [],
        availableSizes: product?.availableSizes || [],
      });
      setImagePreview(product?.images?.[0] || null);
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, product]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('لطفاً نام و قیمت محصول را وارد کنید');
      return;
    }

    if (!formData.category) {
      toast.error('لطفاً دسته‌بندی محصول را انتخاب کنید');
      return;
    }

    // For rugs, at least one size must be selected
    if (formData.category === RUG_CATEGORY_ID && formData.availableSizes.length === 0) {
      toast.error('برای فرش و قالی، انتخاب حداقل یک سایز الزامی است');
      return;
    }

    // For new products, image file is required
    // For edit, image file is optional (keep existing image if not changed)
    if (!isEdit && !selectedFile) {
      toast.error('لطفاً عکس محصول را آپلود کنید');
      return;
    }

    const productData: Partial<SellerProduct> = {
      id: product?.id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      currency: 'IRR',
      images: imagePreview ? [imagePreview] : [],
      specs: formData.specs.filter(spec => spec.key && spec.value),
      // Only include availableSizes for rugs
      availableSizes: formData.category === RUG_CATEGORY_ID ? formData.availableSizes : [],
    };

    onSave(productData, selectedFile);
    // Note: onClose is called by parent after save completes, not here
    // This ensures the modal stays open during the save operation
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 rtl" dir="rtl">
        <DialogTitle className="sr-only">
          {isEdit ? 'ویرایش محصول' : 'افزودن محصول جدید'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          فرم {isEdit ? 'ویرایش' : 'افزودن'} محصول با اطلاعات اصلی
        </DialogDescription>
        
        {/* Header - Fixed - RTL */}
        <div className="flex items-center border-b border-border pb-4 flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6" dir="rtl">
          <h2 className="text-foreground text-right flex-1">{isEdit ? 'ویرایش محصول' : 'افزودن محصول'}</h2>
        </div>

        {/* Scrollable Content - RTL */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 px-4 sm:px-6" dir="rtl">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-4 sm:py-6" dir="rtl">
            {/* Image Upload - RTL aligned */}
            <div dir="rtl">
              <label className="block mb-1 sm:mb-2 text-foreground text-right">عکس محصول *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-square max-h-[200px] sm:max-h-none bg-input-background rounded-[12px] sm:rounded-[var(--radius-card)] border-2 border-dashed border-border hover:border-foreground cursor-pointer transition-all duration-300 overflow-hidden"
              >
                {imagePreview ? (
                  <ImageWithFallback
                    src={imagePreview}
                    alt="پیش‌نمایش"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 mb-2" />
                    <p className="caption sm:text-[15px] text-center">کلیک کنید یا عکس را بکشید</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Name - RTL */}
            <div dir="rtl">
              <label htmlFor="name" className="block mb-1 text-foreground text-right">
                نام محصول *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input-background border border-border rounded-[8px] sm:rounded-[12px] text-foreground text-right focus:outline-none focus:border-accent transition-all duration-300"
                placeholder="مثال: مبل راحتی مدرن"
                dir="rtl"
                required
              />
            </div>

            {/* Category - RTL */}
            <div dir="rtl">
              <label htmlFor="category" className="block mb-1 text-foreground text-right">
                دسته‌بندی *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input-background border border-border rounded-[8px] sm:rounded-[12px] text-foreground text-right focus:outline-none focus:border-accent transition-all duration-300"
                dir="rtl"
                required
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rug Size Selector - Only shown for Rug/Carpet category */}
            {formData.category === RUG_CATEGORY_ID && (
              <div dir="rtl">
                <label className="block mb-1 text-foreground text-right">
                  سایزهای موجود * (حداقل یک سایز انتخاب کنید)
                </label>
                <RugSizeSelector
                  selectedSizes={formData.availableSizes}
                  onChange={(sizes) => setFormData({ ...formData, availableSizes: sizes })}
                />
              </div>
            )}

            {/* Description - RTL with Rich Text Editor */}
            <div dir="rtl">
              <label htmlFor="description" className="block mb-1 text-foreground text-right">
                توضیحات محصول
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="توضیحات بیشتر درباره محصول، ویژگی‌ها و نکات مهم..."
                minHeight="100px"
              />
            </div>

            {/* Price - RTL */}
            <div dir="rtl">
              <label htmlFor="price" className="block mb-1 text-foreground text-right">
                قیمت (تومان) *
              </label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input-background border border-border rounded-[8px] sm:rounded-[12px] text-foreground text-right focus:outline-none focus:border-accent transition-all duration-300"
                placeholder="15000000"
                dir="rtl"
                required
              />
            </div>

            {/* Product Specs - RTL */}
            <div dir="rtl">
              <label className="block mb-1 text-foreground text-right">
                جزئیات محصول (اختیاری)
              </label>
              <ProductSpecsInput 
                value={formData.specs}
                onChange={(value) => setFormData({ ...formData, specs: value })}
              />
            </div>

            {/* Actions - RTL button order */}
            <div className="flex flex-col-reverse sm:flex-row-reverse gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border" dir="rtl">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 btn-secondary py-2.5 sm:py-3 rounded-full text-center"
              >
                انصراف
              </button>
              
              {/* Preview Button - Secondary Style */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="w-full sm:flex-1 transition-all duration-300 py-2.5 sm:py-3 rounded-full text-center"
                style={{
                  height: '48px',
                  borderRadius: '24px',
                  border: '1px solid #D9D9D9',
                  backgroundColor: '#FFFFFF',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#999999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#D9D9D9';
                }}
              >
                پیش‌نمایش محصول
              </button>
              
              <button 
                type="submit" 
                className="w-full sm:flex-1 btn-primary py-2.5 sm:py-3 rounded-full text-center"
              >
                {isEdit ? 'ذخیره تغییرات' : 'ایجاد لینک Try'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Product Preview Modal */}
        <ProductPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          productData={{
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: imagePreview,
            specs: formData.specs
          }}
        />
      </DialogContent>
    </Dialog>
  );
}