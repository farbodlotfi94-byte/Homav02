# 🚨 راهنمای سریع رفع مشکلات HOMA

## 🔥 مشکلات فوری

### دیزاین کار نمی‌کند؟

```bash
# راه حل 1 (سریع‌ترین):
./fix-now.sh        # Linux/Mac
fix-now.bat         # Windows

# راه حل 2 (دستی):
npm run clean
npm run dev

# راه حل 3 (قدرتمند):
npm run clean:all
```

### رنگ‌های HOMA نمایش داده نمی‌شوند؟

```bash
# 1. Hard refresh مرورگر:
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 2. Check در Console:
getComputedStyle(document.documentElement).getPropertyValue('--accent')
# باید "#E31E24" برگرداند

# 3. اگر null برگشت:
npm install -D @tailwindcss/postcss
npm run clean
npm run dev
```

---

## 📋 Checklist کامل

### 1️⃣ Dependencies

```bash
# نصب packages ناقص:
npm install

# مشکل در package-lock.json:
rm -rf node_modules package-lock.json
npm install

# بررسی Tailwind CSS v4:
npm list @tailwindcss/postcss
# باید نسخه 4.0.0 را نشان دهد
```

### 2️⃣ Cache

```bash
# پاک کردن Vite cache:
rm -rf node_modules/.vite

# پاک کردن browser cache:
rm -rf .cache

# پاک کردن dist:
rm -rf dist

# یا همه با هم:
npm run clean
```

### 3️⃣ Config Files

**بررسی `postcss.config.js`:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ این باید باشد
    autoprefixer: {},
  },
};
```

**بررسی `vite.config.ts`:**
```ts
// باید شامل این باشد:
assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp'],
```

**بررسی `src/main.tsx`:**
```tsx
import '../styles/globals.css';  // ✅ این باید باشد
```

### 4️⃣ CSS Variables

**DevTools → Console:**
```js
// چک کردن accent color:
getComputedStyle(document.documentElement).getPropertyValue('--accent')
// Output: "#E31E24" ✅

// چک کردن accent-light:
getComputedStyle(document.documentElement).getPropertyValue('--accent-light')
// Output: "#F5E6D3" ✅

// چک کردن font:
getComputedStyle(document.documentElement).getPropertyValue('--font-family-vazirmatn')
// Output: "Vazirmatn, ..." ✅
```

### 5️⃣ Fonts

**DevTools → Network → فیلتر: font**
- باید `Vazirmatn.woff2` را ببینید
- اگر 404 است، CDN fallback دارد

### 6️⃣ Assets (SVG/Images)

```bash
# اگر Figma assets لود نمی‌شوند:
npm run clean
npm run dev

# بررسی imports:
# ✅ درست:
import svgPaths from './imports/svg-example.ts';

# ❌ اشتباه:
import svgPaths from './imports/svg-example';
```

---

## 🐛 خطاهای رایج

### Error: "Cannot find module @tailwindcss/postcss"

```bash
npm install -D @tailwindcss/postcss
```

### Error: "CSS variables not defined"

```bash
# مطمئن شوید globals.css import شده:
# در src/main.tsx:
import '../styles/globals.css';
```

### Error: "Port 3000 already in use"

```bash
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# یا port دیگری:
npm run dev -- --port 3001
```

### Warning: "Styles not applying"

```bash
# 1. Hard refresh:
Ctrl+Shift+R

# 2. پاک کردن cache:
npm run clean

# 3. Disable browser cache:
# DevTools → Network tab → "Disable cache" ✅
```

### TypeScript Errors

```bash
# بررسی خطاها:
npm run type-check

# اگر خطای "Cannot find module":
npm install -D @types/react @types/react-dom

# پاک کردن TypeScript cache:
rm -rf node_modules/.cache
```

---

## 🔍 دیباگ حرفه‌ای

### بررسی وضعیت Vite

```bash
# Start با verbose logging:
npm run dev -- --debug

# بررسی config:
npx vite --help
```

### بررسی Tailwind

```bash
# لیست کلاس‌های compile شده:
# DevTools → Elements → <body>
# باید کلاس‌های Tailwind (bg-accent, etc.) را ببینید
```

### بررسی Performance

```bash
# DevTools → Lighthouse
# Run audit

# بررسی network waterfall:
# DevTools → Network → disable cache → reload
```

---

## 🎯 سناریوهای خاص

### سناریو 1: "من install کردم ولی دیزاین خرابه"

```bash
# 1. پاک کردن کامل:
rm -rf node_modules/.vite .cache dist

# 2. Hard refresh مرورگر:
Ctrl+Shift+R

# 3. اجرای مجدد:
npm run dev

# 4. اگر باز هم خرابه:
npm run clean:all
```

### سناریو 2: "فقط رنگ‌های HOMA کار نمی‌کنند"

```bash
# 1. بررسی Tailwind theme:
# در DevTools → Console:
getComputedStyle(document.documentElement).getPropertyValue('--color-accent')

# 2. اگر undefined بود:
npm install -D @tailwindcss/postcss
npm run clean
npm run dev
```

### سناریو 3: "فونت فارسی نمایش داده نمی‌شود"

```bash
# 1. بررسی Network:
# DevTools → Network → فیلتر: font
# باید Vazirmatn.woff2 با status 200 را ببینید

# 2. اگر 404 بود:
# CDN fallback در globals.css موجود است
# پاک کردن cache:
npm run clean
npm run dev
```

### سناریو 4: "Build موفق نمی‌شود"

```bash
# 1. Type check:
npm run type-check

# 2. اگر خطایی نبود:
npm run clean
npm run build

# 3. اگر باز هم مشکل داشت:
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 اگر همچنان مشکل دارید

### Checklist نهایی:

- [ ] `node -v` → نسخه 18+ ؟
- [ ] `npm -v` → نسخه 9+ ؟
- [ ] `npm install` بدون error ؟
- [ ] `postcss.config.js` شامل `@tailwindcss/postcss` ؟
- [ ] Hard refresh کردید؟ (Ctrl+Shift+R)
- [ ] DevTools Console بدون error قرمز ؟
- [ ] `npm run clean` اجرا شد؟
- [ ] مرورگر را کاملاً بستید و دوباره باز کردید؟

### اگر همه ✅ بود ولی باز هم مشکل داشت:

```bash
# آخرین راه حل (نوک تیز):
rm -rf node_modules package-lock.json .cache dist node_modules/.vite
npm cache clean --force
npm install
npm run dev
```

### هنوز کار نمی‌کند؟

1. Issue در GitHub باز کنید
2. اطلاعات زیر را ارسال کنید:
   - نسخه Node.js: `node -v`
   - نسخه npm: `npm -v`
   - سیستم عامل
   - مرورگر و نسخه
   - Console errors (screenshot)
   - Network tab (screenshot)

---

## 📚 منابع

- **SETUP.md**: راهنمای کامل راه‌اندازی
- **README.md**: مستندات اصلی
- **guidelines/Guidelines.md**: راهنمای توسعه

---

**99% مشکلات با `npm run clean` حل می‌شوند!** 🎯
