import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ExternalLink, CheckCircle, Upload } from "lucide-react";
import type { Product } from "../types/product";
import { RichTextDisplay } from "./ui/RichTextDisplay";

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onUploadSticky: () => void;
}

export function ProductDetailsModal({ 
  open, 
  onClose, 
  product,
  onUploadSticky 
}: ProductDetailsModalProps) {
  const displayPrice = product.price 
    ? `${product.price.toLocaleString('fa-IR')} ${product.currency}`
    : product.priceRange
    ? `${product.priceRange.min.toLocaleString('fa-IR')} - ${product.priceRange.max.toLocaleString('fa-IR')} ${product.currency}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">جزئیات محصول</DialogTitle>
          <DialogDescription className="text-gray-600">اطلاعات کامل محصول را در اینجا مشاهده کنید.</DialogDescription>
        </DialogHeader>

        {/* Product Images Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img 
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Description */}
          {product.description && (
            <div className="text-gray-600 leading-relaxed">
              <RichTextDisplay content={product.description} />
            </div>
          )}

          {/* Extra Details (Product Features) */}
          {product.extra_details && Object.keys(product.extra_details).length > 0 && (
            <div>
              <h3 className="text-gray-900 mb-2">جزئیات محصول</h3>
              <ul className="space-y-2">
                {Object.entries(product.extra_details).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2 text-gray-600">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{key}: {value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variants */}
          {product.variants && (
            <div className="space-y-3">
              {product.variants.colors && (
                <div>
                  <h4 className="text-gray-900 mb-2">رنگ‌های موجود</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map((color) => (
                      <div
                        key={color.name}
                        className={`px-3 py-1.5 rounded-full border ${
                          color.available
                            ? "border-gray-300 bg-white text-gray-900"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        }`}
                      >
                        {color.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.sizes && (
                <div>
                  <h4 className="text-gray-900 mb-2">سایزهای موجود</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <div
                        key={size.name}
                        className={`px-3 py-1.5 rounded-full border ${
                          size.available
                            ? "border-gray-300 bg-white text-gray-900"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        }`}
                      >
                        {size.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 pt-4 -mx-6 px-6 -mb-6 pb-6">
          <Button
            onClick={onUploadSticky}
            className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            آپلود عکس برای تست
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}