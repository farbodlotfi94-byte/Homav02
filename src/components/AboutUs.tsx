import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface AboutUsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutUs({ open, onOpenChange }: AboutUsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">درباره هوما</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-right" dir="rtl">
          {/* Company Introduction */}
          <section>
            <h3 className="text-lg font-semibold mb-2">معرفی</h3>
            <p className="text-gray-700 leading-relaxed">
              هوما یک پلتفرم نوآورانه برای تجسم و طراحی فضاهای داخلی است. ما با
              استفاده از فناوری هوش مصنوعی، به شما کمک می‌کنیم تا قبل از خرید
              مبلمان و دکوراسیون، بتوانید نتیجه نهایی را در فضای خود مشاهده کنید.
            </p>
          </section>

          {/* Mission */}
          <section>
            <h3 className="text-lg font-semibold mb-2">ماموریت ما</h3>
            <p className="text-gray-700 leading-relaxed">
              ماموریت ما ساده‌سازی فرآیند انتخاب و خرید مبلمان است. با هوما،
              دیگر نیازی به حدس و گمان نیست. شما می‌توانید با اطمینان کامل،
              محصولی را انتخاب کنید که کاملاً با سلیقه و فضای شما هماهنگ باشد.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h3 className="text-lg font-semibold mb-2">چگونه کار می‌کند؟</h3>
            <ol className="text-gray-700 leading-relaxed space-y-2 list-decimal list-inside">
              <li>محصول مورد نظر خود را انتخاب کنید</li>
              <li>عکسی از فضای خود بگیرید یا آپلود کنید</li>
              <li>هوش مصنوعی ما محصول را در فضای شما قرار می‌دهد</li>
              <li>نتیجه را مشاهده کنید و تصمیم بگیرید</li>
            </ol>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold mb-2">ویژگی‌های هوما</h3>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>✓ تجسم واقع‌گرایانه با هوش مصنوعی پیشرفته</li>
              <li>✓ رابط کاربری ساده و کاربرپسند</li>
              <li>✓ پشتیبانی از انواع مبلمان و محصولات دکوراسیون</li>
              <li>✓ سرعت بالا در پردازش تصاویر</li>
              <li>✓ نتایج با کیفیت بالا</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-lg font-semibold mb-2">تماس با ما</h3>
            <div className="text-gray-700 leading-relaxed space-y-1">
              <p>برای ارتباط با ما می‌توانید از راه‌های زیر استفاده کنید:</p>
              <p>📧 واتساپ: 09389563525</p>
              <p>🌐 وب‌سایت: www.myhoma.ir</p>
            </div>
          </section>

          {/* Footer Note */}
          <section className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              هوما - تجسم هوشمند فضای زندگی شما
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
