# 🚀 راهنمای راه‌اندازی HOMA Platform

## ⚡ شروع سریع (30 ثانیه)

### نصب Dependencies

```bash
npm install
```

### اجرای Development Server

```bash
npm run dev
```

صفحه در `http://localhost:3000` باز می‌شود.

---

## 🐛 رفع مشکلات رایج

### ❌ مشکل: Styles کار نمی‌کنند / دیزاین خراب است

#### علل احتمالی:
1. ✅ **Vite Cache قدیمی**
2. ✅ **Browser Cache**
3. ✅ **Tailwind CSS v4 PostCSS Plugin نصب نیست**
4. ✅ **Figma Assets import نمی‌شوند**

#### راه حل:

**گام 1: پاک کردن Cache**

```bash
# Linux/Mac
./fix-now.sh

# Windows
fix-now.bat

# یا دستی:
npm run clean
npm run dev
```

**گام 2: پاک کردن کامل (اگر گام 1 کار نکرد)**

```bash
npm run clean:all
# یا:
rm -rf node_modules/.vite node_modules dist .cache
npm install
npm run dev
```

**گام 3: Hard Refresh مرورگر**

- **Chrome/Edge**: `Ctrl + Shift + R` (Windows/Linux) یا `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows/Linux) یا `Cmd + Shift + R` (Mac)
- یا: DevTools باز کنید → Network tab → "Disable cache" را فعال کنید

**گام 4: بررسی Tailwind CSS v4**

```bash
# مطمئن شوید این package نصب است:
npm install -D @tailwindcss/postcss

# فایل postcss.config.js باید شامل این باشد:
# {
#   plugins: {
#     '@tailwindcss/postcss': {},
#     autoprefixer: {},
#   }
# }
```

---

### ❌ مشکل: فونت‌ها فارسی نمایش داده نمی‌شوند

#### راه حل:

1. مطمئن شوید `styles/globals.css` درست import شده:

```tsx
// src/main.tsx
import '../styles/globals.css';
```

2. بررسی کنید فونت Vazirmatn لود می‌شود:

```bash
# در DevTools → Network → فیلتر "Font"
# باید Vazirmatn.woff2 را ببینید
```

3. اگر فونت لود نمی‌شود، از CDN fallback استفاده کنید:

```css
/* در styles/globals.css */
@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
```

---

### ❌ مشکل: SVG ها یا Figma Assets نمایش داده نمی‌شوند

#### راه حل:

1. **بررسی import path**:

```tsx
// ✅ درست
import svgPaths from './imports/svg-example.ts';
import roomImage from 'figma:asset/xxxxx.png';

// ❌ اشتباه
import svgPaths from './imports/svg-example';  // بدون .ts
```

2. **Cache را پاک کنید**:

```bash
npm run clean
npm run dev
```

3. **Vite config را چک کنید**:

```ts
// vite.config.ts باید شامل این باشد:
assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp'],
```

---

### ❌ مشکل: رنگ‌های برند HOMA (قرمز #E31E24) نمایش داده نمی‌شوند

#### راه حل:

1. **بررسی CSS Variables**:

```bash
# DevTools → Elements → :root
# باید این متغیرها را ببینید:
--accent: #E31E24;
--accent-light: #F5E6D3;
```

2. **استفاده از Tailwind classes**:

```tsx
// ✅ درست
<button className="bg-accent text-accent-foreground">
  دکمه قرمز HOMA
</button>

<div className="bg-accent-light text-accent-light-foreground">
  پس‌زمینه بژ
</div>

// ❌ اشتباه
<button className="bg-red-500">دکمه</button>
```

3. **اگر Tailwind classes کار نمی‌کنند**:

```bash
# Tailwind v4 PostCSS را نصب کنید:
npm install -D @tailwindcss/postcss

# بررسی کنید postcss.config.js درست است:
cat postcss.config.js
```

---

### ❌ مشکل: TypeScript Errors

#### راه حل:

```bash
# Type check بدون build:
npm run type-check

# رایج‌ترین خطا: missing types
npm install -D @types/react @types/react-dom

# اگر خطای "Cannot find module" می‌گیرید:
# مطمئن شوید vite.config.ts شامل alias ها است:
# '@components': path.resolve(__dirname, './components'),
```

---

### ❌ مشکل: Port 3000 قبلاً استفاده شده

#### راه حل:

```bash
# گزینه 1: Process را kill کنید
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# گزینه 2: Port دیگری استفاده کنید
npm run dev -- --port 3001
```

---

### ❌ مشکل: Build موفق نمی‌شود

#### راه حل:

```bash
# 1. Type errors را بررسی کنید:
npm run type-check

# 2. Cache را پاک کنید:
npm run clean

# 3. Build دوباره:
npm run build

# 4. اگر باز هم مشکل دارید، dependencies را rebuild کنید:
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📦 Scripts موجود

```bash
# Development
npm run dev              # شروع dev server
npm run dev:clean        # شروع dev server با cache پاک

# Build
npm run build            # Build برای production
npm run preview          # پیش‌نمایش build

# Maintenance
npm run clean            # پاک کردن cache و dist
npm run clean:all        # پاک کردن کامل + reinstall

# Quality
npm run type-check       # بررسی TypeScript errors
npm run lint             # بررسی ESLint errors
```

---

## 🔧 فایل‌های کانفیگ مهم

### `vite.config.ts`
- تنظیمات Vite و asset handling
- Alias ها برای imports
- Server configuration

### `postcss.config.js`
- **مهم**: باید `@tailwindcss/postcss` داشته باشد (Tailwind v4)
- Autoprefixer برای browser compatibility

### `styles/globals.css`
- تمام CSS variables برای design system
- رنگ‌های برند HOMA
- Typography و فونت‌ها
- Custom utility classes

### `tsconfig.json`
- تنظیمات TypeScript
- Path aliases

---

## 🧪 تست کردن

### تست با محصول خاص

```bash
# با productId:
http://localhost:3000/?productId=prod_rug_21902

# با UTM parameters:
http://localhost:3000/?productId=prod_rug_21902&utm_source=instagram&utm_campaign=spring_sale

# تست complete flow:
# در Console مرورگر:
homaTest.simulateCompleteFlow()
```

### Admin Dashboard

کلیدهای `Shift + Ctrl + K` (یا `Shift + Cmd + K` در Mac)

### راهنمای رنگ‌های برند

کلیدهای `Shift + Ctrl + B` (یا `Shift + Cmd + B` در Mac)

---

## 🌐 RTL Support

پروژه به صورت پیش‌فرض RTL است:

```html
<!-- index.html -->
<html lang="fa" dir="rtl">
```

اگر نیاز به LTR دارید:

```tsx
<div className="ltr">
  English content
</div>
```

---

## 📊 بررسی سلامت پروژه

### Checklist:

✅ **Dependencies نصب شده‌اند؟**
```bash
ls node_modules/@tailwindcss/postcss  # باید موجود باشد
```

✅ **CSS Variables لود شده‌اند؟**
```bash
# DevTools → Console:
getComputedStyle(document.documentElement).getPropertyValue('--accent')
# باید "#E31E24" برگرداند
```

✅ **Fonts لود شده‌اند؟**
```bash
# DevTools → Network → فیلتر "font"
# باید Vazirmatn.woff2 را ببینید
```

✅ **No console errors?**
```bash
# DevTools → Console
# نباید هیچ error قرمزی وجود داشته باشد
```

---

## 🆘 کمک بیشتر

### مستندات:

- **README.md**: توضیحات کامل پروژه
- **guidelines/Guidelines.md**: راهنمای style و development

### Dev Tools:

```bash
# Console Commands:
homaTest.simulateCompleteFlow()     # تست کل فلو
homaTest.simulateMultipleUsers(5)   # تست با 5 کاربر
homaTest.showCurrentStats()          # نمایش آمار فعلی
```

### اگر همچنان مشکل دارید:

1. ✅ `fix-now.sh` یا `fix-now.bat` را اجرا کنید
2. ✅ مرورگر را کاملاً ببندید و دوباره باز کنید
3. ✅ `npm run clean:all` را اجرا کنید
4. ✅ مطمئن شوید Node.js نسخه 18+ است: `node -v`
5. ✅ مطمئن شوید npm نسخه 9+ است: `npm -v`

---

## 🎯 System Requirements

- **Node.js**: 18.0.0 یا بالاتر
- **npm**: 9.0.0 یا بالاتر
- **مرورگر**: Chrome/Edge/Firefox (آخرین نسخه)
- **سیستم عامل**: Windows 10+, macOS 11+, Linux (هر distro)

---

**همه چیز آماده است! 🎉**

اگر هر مشکلی داشتید، اول `fix-now.sh` را اجرا کنید!
