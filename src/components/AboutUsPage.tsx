/**
 * About Us Page Component
 *
 * A standalone page for SEO indexing by search engines and LLMs.
 * Contains information about HOMA - the AI-powered furniture visualization platform.
 */

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

export function AboutUsPage() {
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: "انتخاب محصول", description: "محصول مورد نظر خود را از کاتالوگ انتخاب کنید" },
    { number: 2, title: "آپلود عکس", description: "عکسی از فضای خود بگیرید یا آپلود کنید" },
    { number: 3, title: "پردازش هوش مصنوعی", description: "هوش مصنوعی ما محصول را در فضای شما قرار می‌دهد" },
    { number: 4, title: "مشاهده نتیجه", description: "نتیجه را مشاهده کنید و تصمیم بگیرید" },
  ];

  const features = [
    "تجسم واقع‌گرایانه با هوش مصنوعی پیشرفته",
    "رابط کاربری ساده و کاربرپسند",
    "پشتیبانی از انواع مبلمان و دکوراسیون",
    "سرعت بالا در پردازش تصاویر",
    "نتایج با کیفیت بالا",
    "پشتیبانی ۲۴ ساعته",
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">بازگشت</span>
          </button>
          <div dir="ltr">
            <Logo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            درباره هوما
          </h1>
          <p className="text-lg text-gray-600">
            پلتفرم هوشمند تجسم مبلمان در فضای شما
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Company Introduction */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">معرفی</h2>
            <p className="text-gray-600 leading-7">
              هوما یک پلتفرم نوآورانه برای تجسم و طراحی فضاهای داخلی است. ما با
              استفاده از فناوری هوش مصنوعی پیشرفته، به شما کمک می‌کنیم تا قبل از خرید
              مبلمان و دکوراسیون، بتوانید نتیجه نهایی را در فضای خود مشاهده کنید.
            </p>
          </section>

          {/* Mission */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">ماموریت ما</h2>
            <p className="text-gray-600 leading-7">
              ماموریت ما ساده‌سازی فرآیند انتخاب و خرید مبلمان است. با هوما،
              دیگر نیازی به حدس و گمان نیست. شما می‌توانید با اطمینان کامل،
              محصولی را انتخاب کنید که کاملاً با سلیقه و فضای شما هماهنگ باشد.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">چگونه کار می‌کند؟</h2>
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className="bg-gray-900 text-white rounded-full flex items-center justify-center font-bold"
                    style={{ width: '40px', height: '40px', minWidth: '40px', fontSize: '16px' }}
                    dir="ltr"
                  >
                    {step.number}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ویژگی‌های هوما</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    style={{ minWidth: '22px' }}
                  >
                    <circle cx="11" cy="11" r="11" fill="#22c55e" />
                    <path
                      d="M6 11l3 3 7-7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-900 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">تماس با ما</h2>
            <p className="text-gray-300 mb-6">
              برای ارتباط با ما می‌توانید از راه‌های زیر استفاده کنید:
            </p>
            <div className="space-y-3">
              <a
                href="https://wa.me/989389563525"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white hover:text-green-400 transition-colors"
              >
                <span className="text-xl">📱</span>
                <span>واتساپ: 09389563525</span>
              </a>
              <a
                href="https://www.myhoma.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors"
              >
                <span className="text-xl">🌐</span>
                <span>وب‌سایت: www.myhoma.ir</span>
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-gray-500 text-sm">
            هوما - تجسم هوشمند فضای زندگی شما
          </p>
          <p className="text-gray-400 text-xs mt-1">
            © {new Date().getFullYear()} HOMA. تمامی حقوق محفوظ است.
          </p>
        </footer>
      </main>
    </div>
  );
}
