# 🐙 راهنمای کامل GitHub برای HOMA Platform

این راهنما به شما کمک می‌کند پروژه HOMA را در GitHub قرار دهید.

---

## 🚨 مشکل فعلی

فایل‌های اصلی (`App.tsx`, `components/`, `styles/`, etc.) در **root پروژه** هستند، نه در **`src/`**!

این باعث می‌شود:
- ❌ Git ساختار اشتباه را track کند
- ❌ Vite فایل‌ها را پیدا نکند
- ❌ GitHub مخزن ناقص داشته باشد

---

## ✅ راه حل (3 مرحله ساده)

### مرحله 1️⃣: Fix کردن ساختار فایل‌ها

```bash
# Linux/Mac:
chmod +x fix-structure.sh
./fix-structure.sh

# Windows:
fix-structure.bat
```

**این اسکریپت:**
- ✅ فایل‌ها را به `src/` منتقل می‌کند
- ✅ Import paths را بروز می‌کند
- ✅ Cache را پاک می‌کند
- ✅ Git status را نشان می‌دهد

**یا به صورت دستی:**

```bash
# ایجاد src/ اگر وجود ندارد:
mkdir -p src

# انتقال فایل‌ها:
mv App.tsx src/
mv components src/
mv styles src/
mv types src/
mv utils src/

# پاک کردن cache:
npm run clean
```

**سپس `src/main.tsx` را بروز کنید:**

```tsx
// قبل:
import App from '../App';
import '../styles/globals.css';

// بعد:
import App from './App';
import './styles/globals.css';
```

---

### مرحله 2️⃣: آماده‌سازی Git

#### اگر Git هنوز init نشده:

```bash
# 1. Initialize Git
git init

# 2. بررسی .gitignore
cat .gitignore
# باید node_modules/, dist/, .vite/, etc. را ignore کند

# 3. Add all files
git add .

# 4. اولین commit
git commit -m "🎉 Initial commit: HOMA Platform - AI Product Visualization"
```

#### اگر Git قبلاً init شده:

```bash
# 1. بررسی status
git status

# 2. Add تغییرات
git add .

# 3. Commit
git commit -m "🔧 Fix: Move files to src/ directory"
```

---

### مرحله 3️⃣: Push به GitHub

#### گام 1: ساخت Repository در GitHub

1. برو به https://github.com/new
2. نام repository: `homa-platform` (یا هر نام دیگری)
3. Description: `HOMA - AI Product Visualization Platform with Instagram Integration`
4. **Public** یا **Private** (به انتخاب شما)
5. ❌ **خالی بگذارید**: 
   - "Add a README file"
   - "Add .gitignore"
   - "Choose a license"
6. کلیک روی **"Create repository"**

#### گام 2: Connect کردن Local Repository

```bash
# اضافه کردن remote (آدرس repo خودتون رو جایگزین کنید):
git remote add origin https://github.com/YOUR_USERNAME/homa-platform.git

# بررسی remote:
git remote -v
# باید ببینید:
# origin  https://github.com/YOUR_USERNAME/homa-platform.git (fetch)
# origin  https://github.com/YOUR_USERNAME/homa-platform.git (push)

# تغییر نام branch به main:
git branch -M main

# اولین push:
git push -u origin main
```

#### گام 3: بررسی در GitHub

برو به `https://github.com/YOUR_USERNAME/homa-platform`

باید این فایل‌ها را ببینی:
```
✅ README.md
✅ package.json
✅ src/
   ✅ App.tsx
   ✅ main.tsx
   ✅ components/
   ✅ styles/
   ✅ types/
   ✅ utils/
✅ components/ui/
✅ imports/
✅ public/
✅ guidelines/
✅ .gitignore
✅ vite.config.ts
✅ tsconfig.json
✅ postcss.config.js
```

❌ **نباید** ببینی:
```
❌ node_modules/
❌ dist/
❌ .vite/
❌ .cache/
```

---

## 🔐 Authentication

### گزینه 1: HTTPS (ساده‌تر)

```bash
# هر بار push/pull پسورد می‌خواد
git push origin main

# یا با Personal Access Token:
# Settings → Developer settings → Personal access tokens → Generate new token
# سپس از token به جای پسورد استفاده کنید
```

### گزینه 2: SSH (امن‌تر)

```bash
# 1. ساخت SSH key:
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. کپی کردن public key:
cat ~/.ssh/id_ed25519.pub

# 3. اضافه کردن به GitHub:
# Settings → SSH and GPG keys → New SSH key

# 4. تغییر remote به SSH:
git remote set-url origin git@github.com:YOUR_USERNAME/homa-platform.git

# 5. تست:
ssh -T git@github.com
# باید ببینید: "Hi YOUR_USERNAME! You've successfully authenticated..."
```

---

## 📦 فایل‌هایی که باید در Git باشند

### ✅ باید باشند:

```
✅ src/                    # تمام کد منبع
✅ components/ui/          # UI components (ShadCN)
✅ imports/                # Figma imports و SVG ها
✅ guidelines/             # Development guidelines
✅ public/                 # Static assets
✅ package.json            # Dependencies
✅ tsconfig.json           # TypeScript config
✅ vite.config.ts          # Vite config
✅ postcss.config.js       # PostCSS config
✅ index.html              # Entry HTML
✅ README.md               # مستندات اصلی
✅ SETUP.md                # راهنمای setup
✅ TROUBLESHOOTING.md      # راهنمای troubleshooting
✅ .gitignore              # Git ignore rules
✅ .nvmrc                  # Node version
✅ .env.example            # Environment variables example
```

### ❌ نباید باشند (در `.gitignore`):

```
❌ node_modules/           # Dependencies (npm install می‌کنه)
❌ dist/                   # Build output
❌ .vite/                  # Vite cache
❌ .cache/                 # General cache
❌ .env                    # Environment variables (حاوی secrets)
❌ .env.local              # Local env
❌ package-lock.json       # یا yarn.lock (اختیاری)
❌ .DS_Store               # macOS
❌ Thumbs.db               # Windows
```

---

## 🔄 Workflow روزانه

### هر بار که تغییر دادید:

```bash
# 1. بررسی تغییرات:
git status

# 2. مشاهده diff:
git diff

# 3. Add فایل‌های خاص:
git add src/components/NewComponent.tsx

# یا همه:
git add .

# 4. Commit با پیام معنادار:
git commit -m "✨ feat: Add new ProductCard component"

# 5. Push:
git push origin main
```

### انواع Commit Messages:

```bash
✨ feat:      # ویژگی جدید
🐛 fix:       # رفع باگ
📝 docs:      # تغییر مستندات
💄 style:     # تغییرات UI/styling
♻️  refactor:  # بازنویسی کد
⚡️ perf:      # بهبود performance
✅ test:      # اضافه کردن تست
🔧 chore:     # تغییرات config، build، etc.

# مثال‌ها:
git commit -m "✨ feat: Add AI image processing"
git commit -m "🐛 fix: Fix RTL layout in ProductCard"
git commit -m "💄 style: Update HOMA brand colors"
git commit -m "📝 docs: Update README with setup instructions"
```

---

## 🌿 Branching Strategy (پیشرفته)

### برای تیم‌ها:

```bash
# Main branch: production-ready code
main

# Development branch:
git checkout -b develop

# Feature branches:
git checkout -b feature/product-carousel
git checkout -b feature/analytics-dashboard

# Bug fix branches:
git checkout -b fix/upload-error

# بعد از اتمام feature:
git checkout develop
git merge feature/product-carousel
git push origin develop

# Release:
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

---

## 📊 بررسی History

```bash
# لیست commit ها:
git log --oneline

# با graph:
git log --oneline --graph --all

# فقط 5 تای آخر:
git log -5

# تغییرات یک فایل:
git log -p src/App.tsx

# چه کسی چه تغییری داده:
git blame src/App.tsx
```

---

## 🔙 Undo Changes

### قبل از Commit:

```bash
# بازگشت یک فایل:
git checkout -- src/components/MyComponent.tsx

# بازگشت همه تغییرات:
git checkout -- .

# Unstage کردن فایل:
git reset HEAD src/components/MyComponent.tsx
```

### بعد از Commit:

```bash
# بازگشت آخرین commit (تغییرات نگه داشته می‌شن):
git reset --soft HEAD~1

# بازگشت آخرین commit (تغییرات حذف می‌شن):
git reset --hard HEAD~1

# ⚠️ خطرناک! فقط برای local
```

---

## 🚀 GitHub Actions (CI/CD)

یک workflow ساده برای auto-build:

```bash
# ساخت فایل:
mkdir -p .github/workflows
```

سپس `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Type check
      run: npm run type-check
      
    - name: Build
      run: npm run build
```

---

## 📝 README خوب برای GitHub

README.md شما خوب است، ولی می‌توانید اضافه کنید:

```markdown
## 🌟 Live Demo

[View Demo](https://your-username.github.io/homa-platform)

## 📸 Screenshots

![Landing Page](./docs/screenshots/landing.png)
![Product Visualization](./docs/screenshots/visualization.png)

## 🏆 Features

- ✅ Product-aware onboarding flow
- ✅ AI-powered image processing
- ✅ Instagram UTM tracking
- ✅ Real-time KPI dashboard
- ✅ Persian RTL support
- ✅ Responsive design

## 🛠️ Tech Stack

- React 18
- TypeScript
- Tailwind CSS v4
- Vite
- Motion (Framer Motion)
- Radix UI
- Lucide Icons

## ⚡ Quick Start

```bash
npm install
npm run dev
```

## 📄 License

MIT © HOMA
```

---

## 🎯 Checklist نهایی

قبل از اولین push:

- [ ] `fix-structure.sh` یا `fix-structure.bat` اجرا شده
- [ ] `npm run dev` کار می‌کند بدون error
- [ ] `.gitignore` وجود دارد و درست است
- [ ] `node_modules/` در Git نیست
- [ ] README.md کامل و بروز است
- [ ] All sensitive data در `.env` است (نه در Git)
- [ ] Repository در GitHub ساخته شده
- [ ] Remote صحیح اضافه شده
- [ ] اولین commit با پیام معنادار
- [ ] Push موفقیت‌آمیز بوده

---

## 🐛 مشکلات رایج

### "remote: Permission denied"

```bash
# بررسی authentication:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# استفاده از Personal Access Token به جای password
```

### "Updates were rejected"

```bash
# Pull اول، بعد push:
git pull origin main --rebase
git push origin main
```

### "Large files detected"

```bash
# حذف از Git (ولی نگه داشتن local):
git rm --cached path/to/large-file

# اضافه به .gitignore:
echo "path/to/large-file" >> .gitignore
git add .gitignore
git commit -m "Ignore large file"
```

---

## 📞 کمک بیشتر

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **Interactive Git Tutorial**: https://learngitbranching.js.org

---

**حالا آماده‌اید! 🚀**

1. `./fix-structure.sh` اجرا کنید
2. ساختار فایل‌ها را بررسی کنید
3. Git init/commit کنید
4. Repository در GitHub بسازید
5. Push کنید

**موفق باشید!** 🎉
