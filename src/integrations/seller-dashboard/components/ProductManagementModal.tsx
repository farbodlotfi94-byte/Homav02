import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import type { SellerProduct, PromptMetadata } from '../types/seller';

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<SellerProduct>) => void;
  product?: SellerProduct; // If editing
}

export function ProductManagementModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductManagementModalProps) {
  const isEditing = !!product;

  // Product Info State
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.nameEn || '');
  const [category, setCategory] = useState(product?.category || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(product?.status || 'active');
  const [description, setDescription] = useState(product?.description || '');
  const [fullDescription, setFullDescription] = useState(product?.fullDescription || '');
  const [images, setImages] = useState<string[]>(product?.images || []);

  // Prompt Metadata State
  const [metadata, setMetadata] = useState<PromptMetadata>(product?.promptMetadata || {});

  const handleSave = () => {
    const productData: Partial<SellerProduct> = {
      name,
      nameEn,
      category,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      sku,
      status,
      description,
      fullDescription,
      images,
      promptMetadata: metadata,
    };

    onSave(productData);
    onClose();
  };

  const updateMetadata = (key: keyof PromptMetadata, value: any) => {
    setMetadata({ ...metadata, [key]: value });
  };

  const addColor = (color: string) => {
    const colors = metadata.main_colors || [];
    if (!colors.includes(color)) {
      updateMetadata('main_colors', [...colors, color]);
    }
  };

  const removeColor = (color: string) => {
    const colors = metadata.main_colors || [];
    updateMetadata('main_colors', colors.filter(c => c !== color));
  };

  const addKeyword = (keyword: string) => {
    const keywords = metadata.brand_tone_keywords || [];
    if (!keywords.includes(keyword)) {
      updateMetadata('brand_tone_keywords', [...keywords, keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    const keywords = metadata.brand_tone_keywords || [];
    updateMetadata('brand_tone_keywords', keywords.filter(k => k !== keyword));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">اطلاعات عمومی محصول</TabsTrigger>
            <TabsTrigger value="metadata">اطلاعات پرامپت محصول</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">اطلاعات پایه</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">نام محصول (فارسی) *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: فرش دستباف کاشان"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameEn" className="text-right block">نام محصول (انگلیسی)</Label>
                  <Input
                    id="nameEn"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Example: Handwoven Kashan Rug"
                    className="ltr text-left"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-right block">دسته‌بندی *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فرش">فرش</SelectItem>
                      <SelectItem value="مبل">مبل</SelectItem>
                      <SelectItem value="میز">میز</SelectItem>
                      <SelectItem value="صندلی">صندلی</SelectItem>
                      <SelectItem value="تخت">تخت</SelectItem>
                      <SelectItem value="کمد">کمد</SelectItem>
                      <SelectItem value="تابلو">تابلو</SelectItem>
                      <SelectItem value="دکوراسیون">دکوراسیون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-right block">قیمت (تومان) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="۱,۵۰۰,۰۰۰"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-right block">موجودی</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="۱۰"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-right block">کد محصول (SKU)</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PRD-001"
                    className="ltr text-left"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-right block">وضعیت *</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">تصاویر</h3>
              
              <div className="space-y-2">
                <Label className="text-right block">تصویر اصلی</Label>
                <div className="border-2 border-dashed border-[#e6e6e6] rounded-[12px] p-8 text-center hover:border-[#212121] transition-colors duration-300 cursor-pointer">
                  <Upload className="w-8 h-8 text-[#666] mx-auto mb-2" />
                  <p className="text-[#666] text-[14px]">کلیک کنید یا تصویر را اینجا بکشید</p>
                  <p className="text-[#999] text-[12px] mt-1">PNG, JPG حداکثر ۵MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">گالری تصاویر (چند عکسی)</Label>
                <div className="border-2 border-dashed border-[#e6e6e6] rounded-[12px] p-6 text-center hover:border-[#212121] transition-colors duration-300 cursor-pointer">
                  <Upload className="w-6 h-6 text-[#666] mx-auto mb-2" />
                  <p className="text-[#666] text-[14px]">تصاویر اضافی را آپلود کنید</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">توضیحات</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-right block">توضیحات کوتاه</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح مختصری درباره محصول..."
                  rows={3}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription" className="text-right block">توضیحات کامل</Label>
                <Textarea
                  id="fullDescription"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="توضیحات جامع درباره محصول، ویژگی‌ها، مواد و..."
                  rows={6}
                  className="text-right"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Prompt Metadata */}
          <TabsContent value="metadata" className="space-y-6 mt-6">
            {/* Object Identity */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">هویت شیء (Object Identity)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="object_type" className="text-right block">نوع شیء</Label>
                  <Select value={metadata.object_type} onValueChange={(v) => updateMetadata('object_type', v)}>
                    <SelectTrigger id="object_type">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rug">فرش (rug)</SelectItem>
                      <SelectItem value="sofa">مبل (sofa)</SelectItem>
                      <SelectItem value="table">میز (table)</SelectItem>
                      <SelectItem value="chair">صندلی (chair)</SelectItem>
                      <SelectItem value="bed">تخت (bed)</SelectItem>
                      <SelectItem value="art">آرت (art)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role_in_scene" className="text-right block">نقش در صحنه</Label>
                  <Select value={metadata.role_in_scene} onValueChange={(v) => updateMetadata('role_in_scene', v)}>
                    <SelectTrigger id="role_in_scene">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main_rug">فرش اصلی</SelectItem>
                      <SelectItem value="accent_rug">فرش تکمیلی</SelectItem>
                      <SelectItem value="hero_sofa">مبل اصلی</SelectItem>
                      <SelectItem value="accent_chair">صندلی تکمیلی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style" className="text-right block">سبک</Label>
                  <Select value={metadata.style} onValueChange={(v) => updateMetadata('style', v)}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">مدرن</SelectItem>
                      <SelectItem value="scandinavian">اسکاندیناوی</SelectItem>
                      <SelectItem value="boho">بوهو</SelectItem>
                      <SelectItem value="classic">کلاسیک</SelectItem>
                      <SelectItem value="minimalist">مینیمال</SelectItem>
                      <SelectItem value="industrial">صنعتی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Visual Attributes */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">ویژگی‌های بصری</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">رنگ‌های اصلی</Label>
                  <Input
                    placeholder="مثال: beige"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addColor(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                    className="ltr text-left"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(metadata.main_colors || []).map((color) => (
                      <Badge key={color} className="bg-[#212121] text-white">
                        {color}
                        <button
                          onClick={() => removeColor(color)}
                          className="ml-1 hover:text-[#E31E24]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern" className="text-right block">الگو</Label>
                  <Select value={metadata.pattern} onValueChange={(v) => updateMetadata('pattern', v)}>
                    <SelectTrigger id="pattern">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plain">ساده</SelectItem>
                      <SelectItem value="geometric">هندسی</SelectItem>
                      <SelectItem value="oriental">شرقی</SelectItem>
                      <SelectItem value="striped">راه‌راه</SelectItem>
                      <SelectItem value="floral">گل‌دار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material" className="text-right block">جنس</Label>
                  <Select value={metadata.material} onValueChange={(v) => updateMetadata('material', v)}>
                    <SelectTrigger id="material">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wool">پشم (wool)</SelectItem>
                      <SelectItem value="cotton">پنبه (cotton)</SelectItem>
                      <SelectItem value="silk">ابریشم (silk)</SelectItem>
                      <SelectItem value="wood">چوب (wood)</SelectItem>
                      <SelectItem value="metal">فلز (metal)</SelectItem>
                      <SelectItem value="leather">چرم (leather)</SelectItem>
                      <SelectItem value="fabric">پارچه (fabric)</SelectItem>
                      <SelectItem value="velvet">مخمل (velvet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finish_texture" className="text-right block">بافت و فینیش</Label>
                  <Select value={metadata.finish_texture} onValueChange={(v) => updateMetadata('finish_texture', v)}>
                    <SelectTrigger id="finish_texture">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matte">مات</SelectItem>
                      <SelectItem value="glossy">براق</SelectItem>
                      <SelectItem value="soft">نرم</SelectItem>
                      <SelectItem value="coarse">زبر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Size & Shape */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">اندازه و شکل</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-right block">عرض (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={metadata.width || ''}
                    onChange={(e) => updateMetadata('width', parseInt(e.target.value))}
                    placeholder="200"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length" className="text-right block">طول (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={metadata.length || ''}
                    onChange={(e) => updateMetadata('length', parseInt(e.target.value))}
                    placeholder="300"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-right block">ارتفاع (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={metadata.height || ''}
                    onChange={(e) => updateMetadata('height', parseInt(e.target.value))}
                    placeholder="80"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shape" className="text-right block">شکل</Label>
                  <Select value={metadata.shape} onValueChange={(v) => updateMetadata('shape', v)}>
                    <SelectTrigger id="shape">
                      <SelectValue placeholder="انتخاب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">مستطیل</SelectItem>
                      <SelectItem value="round">گرد</SelectItem>
                      <SelectItem value="square">مربع</SelectItem>
                      <SelectItem value="runner">راهرو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scale_hint" className="text-right block">راهنمای نسبت اندازه</Label>
                <Select value={metadata.relative_scale_hint} onValueChange={(v) => updateMetadata('relative_scale_hint', v)}>
                  <SelectTrigger id="scale_hint">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large_rug_for_living_room">فرش بزرگ برای پذیرایی</SelectItem>
                    <SelectItem value="medium_rug_for_bedroom">فرش متوسط برای اتاق خواب</SelectItem>
                    <SelectItem value="small_accent_rug">فرش کوچک تکمیلی</SelectItem>
                    <SelectItem value="runner_for_hallway">راهرو برای راهرو</SelectItem>
                    <SelectItem value="large_sofa_centerpiece">مبل بزرگ محوری</SelectItem>
                    <SelectItem value="compact_sofa">مبل کامپکت</SelectItem>
                    <SelectItem value="dining_table_6_seats">میز ناهارخوری ۶ نفره</SelectItem>
                    <SelectItem value="coffee_table_standard">میز جلو مبلی استاندارد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Placement Hints */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">راهنمای قرارگیری</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_type" className="text-right block">نوع اتاق</Label>
                  <Select value={metadata.room_type} onValueChange={(v) => updateMetadata('room_type', v)}>
                    <SelectTrigger id="room_type">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living_room">پذیرایی</SelectItem>
                      <SelectItem value="bedroom">اتاق خواب</SelectItem>
                      <SelectItem value="hallway">راهرو</SelectItem>
                      <SelectItem value="dining_room">ناهارخوری</SelectItem>
                      <SelectItem value="office">اتاق کار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typical_placement" className="text-right block">مکان معمولی</Label>
                  <Select value={metadata.typical_placement} onValueChange={(v) => updateMetadata('typical_placement', v)}>
                    <SelectTrigger id="typical_placement">
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered_under_main_seating_area">وسط زیر مبل اصلی</SelectItem>
                      <SelectItem value="placed_near_bed">کنار تخت</SelectItem>
                      <SelectItem value="partially_under_sofa">نیمی زیر مبل</SelectItem>
                      <SelectItem value="entrance_area">ورودی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition_notes" className="text-right block">یادداشت‌های ترکیب‌بندی</Label>
                <Textarea
                  id="composition_notes"
                  value={metadata.composition_notes || ''}
                  onChange={(e) => updateMetadata('composition_notes', e.target.value)}
                  placeholder="۲-۳ خط توضیح درباره چگونگی قرارگیری و ترکیب این محصول در فضا..."
                  rows={3}
                  className="text-right"
                />
              </div>
            </div>

            {/* Brand Tone */}
            <div className="space-y-4">
              <h3 className="text-[#1a1a1a] text-right">لحن برند (اختیاری)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_name" className="text-right block">نام برند</Label>
                  <Input
                    id="brand_name"
                    value={metadata.brand_name || ''}
                    onChange={(e) => updateMetadata('brand_name', e.target.value)}
                    placeholder="مثال: HOMA"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-right block">کلمات کلیدی لحن برند</Label>
                  <Input
                    placeholder="مثال: warm (Enter برای افزودن)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addKeyword(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                    className="ltr text-left"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(metadata.brand_tone_keywords || []).map((keyword) => (
                      <Badge key={keyword} className="bg-[#212121] text-white">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-[#E31E24]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e6e6]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#f5f5f5] text-[#212121] rounded-full transition-all duration-300 hover:bg-[#e6e6e6]"
          >
            لغو
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#212121] text-white rounded-full transition-all duration-300 hover:bg-[#3a3a3a]"
          >
            ذخیره محصول
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}