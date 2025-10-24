# 🏠 HOMA - پلتفرم AI برای تست محصولات در فضای شما

پلتفرم onboarding flow برای HOMA که به کاربران اجازه می‌دهد محصولات را در فضای خود تست کنند.

---

## 🚀 شروع سریع

### 1️⃣ جابجایی فایل‌ها

**⚠️ مهم:** فایل‌ها باید در `src/` باشند نه در root!

```bash
# اسکریپت اتوماتیک (توصیه می‌شود):

# Linux/Mac
chmod +x fix-structure.sh && ./fix-structure.sh

# Windows
fix-structure.bat
```

**یا دستی:**

```bash
# Linux/Mac/Git Bash
mkdir -p src
mv App.tsx components styles types utils src/

# Windows CMD
mkdir src
move App.tsx src\
move components src\
move styles src\
move types src\
move utils src\

# Windows PowerShell
New-Item -ItemType Directory -Force -Path src
Move-Item App.tsx,components,styles,types,utils src/
```

### 2️⃣ اجرا

```bash
npm install  # فقط اولین بار
npm run dev
```

### 3️⃣ مشاهده

اپلیکیشن در `http://localhost:3000` باز می‌شود.

#### تست با محصول خاص:

```
http://localhost:3000/?productId=prod_rug_21902&utm_source=instagram
```

---

## 🎯 ویژگی‌های اصلی

- ✅ **Product-Aware Flow**: شناسایی محصول از URL و UTM parameters
- ✅ **AI Image Processing**: پردازش تصویر و جایگذاری محصول (mock)
- ✅ **KPI Tracking**: ردیابی کامل metrics و conversion rates
- ✅ **RTL Support**: پشتیبانی کامل از راست‌چین فارسی
- ✅ **Brand Colors**: رنگ‌های برند HOMA (#E31E24 قرمز، #F5E6D3 بژ)
- ✅ **Responsive Design**: طراحی واکنشگرا برای موبایل و دسکتاپ
- ✅ **Admin Dashboard**: داشبورد تحلیل در زمان واقعی
- ✅ **Error Recovery**: مدیریت هوشمند خطاها

---

## 🎨 رنگ‌های برند

```css
--accent: #E31E24;           /* قرمز اصلی HOMA */
--accent-light: #F5E6D3;     /* بژ/کرم ثانویه */
```

**میانبر:** برای مشاهده راهنمای رنگ‌ها: **Shift + Ctrl + B**

---

## 📊 داشبورد تحلیل

**میانبر:** برای مشاهده KPI Dashboard: **Shift + Ctrl + K**

### Metrics ردیابی شده:

#### 📤 Upload Metrics
- Upload Rate (Success Rate)
- Time to First Upload (TTFU)
- Upload Failed / Completed

#### 💰 Conversion Metrics
- Conversion Rate
- Purchase CTR (Click-through Rate)
- Visualization Views

#### ✅ Quality Metrics
- Precheck Pass Rate
- AI Placement Success Rate

#### 🎯 Engagement Metrics
- Feedback Submitted
- Share Clicks
- Retry Attempts

---

## 🧪 تست و شبیه‌سازی

در Console مرورگر (F12):

```javascript
// شبیه‌سازی یک فلو کامل
homaTest.simulateCompleteFlow()

// شبیه‌سازی چند کاربر همزمان
homaTest.simulateMultipleUsers(10)

// شبیه‌سازی سناریوهای مختلف
homaTest.simulateScenarios()

// تولید داده‌های تصادفی
homaTest.generateRandomMetrics()

// نمایش آمار فعلی
homaTest.showCurrentStats()

// پاک کردن داده‌ها
homaTest.clearAllData()
```

---

## 🔄 فلو کامل

```
1. Loading
   ↓
2. Product Landing (معرفی محصول)
   ↓
3. Photo Upload (انتخاب/گرفتن عکس)
   ↓
4. File Precheck (کنترل کیفیت)
   ↓
5. Staged Upload (آپلود مرحله‌ای 3 مرحله)
   ↓
6. AI Processing (پردازش و جایگذاری)
   ↓
7. Visualization (نمایش قبل/بعد + CTA)
   ↓
8. Success / Error Recovery
```

---

## 📁 ساختار فایل‌ها

```
src/
├── main.tsx                           # Entry point
├── App.tsx                            # کامپوننت اصلی
├── components/
│   ├── ProductAwareLanding.tsx        # صفحه ورود محصول‌محور
│   ├── PhotoUpload.tsx                # آپلود عکس
│   ├── FilePrecheck.tsx               # کنترل کیفیت
│   ├── StagedUpload.tsx               # آپلود مرحله‌ای
│   ├── AIProcessingStatus.tsx         # وضعیت پردازش AI
│   ├── ProductVisualization.tsx       # نمایش نتیجه
│   ├── AdminDashboard.tsx             # داشبورد تحلیل
│   ├── BrandColors.tsx                # راهنمای رنگ‌ها
│   └── ui/                            # shadcn/ui components
├── styles/
│   └── globals.css                    # استایل‌ها + CSS variables
├── utils/
│   ├── aiImageProcessor.ts            # سرویس AI (mock)
│   ├── analytics.ts                   # سرویس KPI tracking
│   ├── productLoader.ts               # بارگذاری محصولات
│   └── testHelpers.ts                 # ابزارهای تست
└── types/
    └── product.ts                     # TypeScript types
```

---

## 🛠 تکنولوژی‌ها

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS v4.0**
- **Motion** (Framer Motion) - انیمیشن‌ها
- **shadcn/ui** - کامپوننت‌های UI
- **Lucide React** - آیکون‌ها
- **Unsplash API** - تصاویر placeholder

---

## 🔌 اتصال به Backend

فعلاً اپلیکیشن از **mock services** استفاده می‌کند.

### زیرساخت API آماده است! ✅

برای اتصال به Backend:

**1️⃣ تنظیم Environment Variables:**

```bash
# کپی کردن .env.example
cp .env.example .env

# ویرایش .env:
VITE_API_BASE_URL=https://api.homa.example.com
VITE_ENABLE_AI_PROCESSING=true
VITE_MOCK_MODE=false
```

**2️⃣ استفاده از API Services:**

```tsx
import { processImage, getProduct } from './utils/apiServices';
import { useAPI } from './utils/useAPI';

// در component:
const { data, loading, error, execute } = useAPI(processImage);

await execute({
  imageFile: file,
  productId: 'prod_rug_21902',
});
```

**3️⃣ مستندات کامل:**

- **[`API_USAGE_EXAMPLES.md`](./API_USAGE_EXAMPLES.md)** - مثال‌های کامل استفاده
- **[`BACKEND_API_SPEC.md`](./BACKEND_API_SPEC.md)** - مشخصات API برای Backend Developer

### فایل‌های API:

```
utils/
├── apiClient.ts        # HTTP Client (GET, POST, Upload, etc.)
├── apiServices.ts      # تمام API Services
└── useAPI.ts           # React Hooks برای API
```

### ویژگی‌های API Client:

- ✅ TypeScript Type-Safe
- ✅ Error Handling جامع
- ✅ Loading & Progress States
- ✅ Retry Logic
- ✅ Timeout Management
- ✅ File Upload با Progress
- ✅ Polling برای وضعیت پردازش
- ✅ React Hooks آماده

---

## برای production:

1. **AI Image Processing**: فایل `utils/aiImageProcessor.ts` را به API واقعی متصل کنید
2. **Product Database**: فایل `utils/productLoader.ts` را به Supabase یا database متصل کنید
3. **Analytics**: فایل `utils/analytics.ts` را به Google Analytics یا Mixpanel متصل کنید
4. **Storage**: تصاویر را به S3 یا Cloudinary آپلود کنید

---

## 📱 Responsive & RTL

- ✅ کاملاً responsive (موبایل → دسکتاپ)
- ✅ RTL support برای فارسی
- ✅ فونت Vazir برای فارسی
- ✅ Accessibility (keyboard navigation, screen readers)

---

## 🎭 وضعیت Features

### ✅ آماده و کامل
- Product-aware landing از Instagram links
- UTM tracking
- آپلود تصویر (دوربین + گالری)
- کنترل کیفیت تصویر (resolution, file size, format)
- پردازش AI (mock با progress tracking)
- نمایش Before/After با slider
- تغییر variant محصول
- KPI tracking جامع
- Admin dashboard
- Error recovery و retry logic

### ⏳ نیاز به Backend
- AI واقعی برای جایگذاری محصول
- ذخیره تصاویر در cloud
- دیتابیس برای محصولات
- Analytics backend

---

## 🔑 میانبرهای کلیدی

| کلید | عملکرد |
|------|---------|
| `Shift + Ctrl + K` | باز کردن Admin Dashboard |
| `Shift + Ctrl + B` | باز کردن راهنمای رنگ‌های برند |

---

## 💡 نکات مهم

- 🎨 از کلاس‌های custom مثل `btn-primary`، `card-interactive`، `input-primary` استفاده کنید
- 🎨 برای transitions از `transition-all duration-300` استفاده کنید (نه `transition-smooth`)
- 📱 همیشه mobile-first طراحی کنید
- 🌐 RTL را فراموش نکنید
- ♿ Accessibility را رعایت کنید

---

## 📦 Build برای Production

```bash
# Build
npm run build

# Preview
npm run preview
```

فایل‌های بهینه شده در پوشه `dist/` قرار می‌گیرند.

---
a
## 🎯 Next Steps

1. ✅ **Frontend**: کامل و آماده
2. ⏳ **Backend AI**: اتصال به سرویس پردازش تصویر
3. ⏳ **Database**: راه‌اندازی Supabase یا PostgreSQL
4. ⏳ **Cloud Storage**: S3 یا Cloudinary برای تصاویر
5. ⏳ **Analytics**: Google Analytics یا Mixpanel
6. ⏳ **Testing**: تست روی دستگاه‌های واقعی
7. ⏳ **Performance**: بهینه‌سازی و lazy loading
8. ⏳ **SEO**: Meta tags و structured data

---

## 📄 License

MIT License - ساخته شده برای HOMA

---

## 🐙 GitHub

برای push کردن به GitHub، ابتدا ساختار فایل‌ها را درست کنید:

```bash
# اجرای اسکریپت fix:
./fix-structure.sh       # Linux/Mac
fix-structure.bat        # Windows
```

سپس:

```bash
# Initialize Git:
git init

# Add files:
git add .

# First commit:
git commit -m "🎉 Initial commit: HOMA Platform"

# Connect to GitHub:
git remote add origin https://github.com/YOUR_USERNAME/homa-platform.git
git branch -M main
git push -u origin main
```

**📚 راهنمای کامل:** [`GITHUB.md`](./GITHUB.md)

---

## 📞 پشتیبانی

برای سوالات یا مشکلات:
- Console logs را بررسی کنید (F12)
- Admin Dashboard را چک کنید (Shift + Ctrl + K)
- Test helpers را امتحان کنید (Console)

---

**ساخته شده با ❤️ برای HOMA** 🏠  
**تاریخ:** اکتبر 2025  
**وضعیت:** ✅ Production Ready (Frontend)