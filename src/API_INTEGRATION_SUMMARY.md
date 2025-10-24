# 🚀 خلاصه: زیرساخت API برای HOMA Platform

## ✅ آماده شده!

زیرساخت کامل اتصال به Backend برای شما ایجاد شد.

---

## 📦 فایل‌های ایجاد شده

### 1️⃣ Core API Files

| فایل | توضیحات |
|------|---------|
| **`/utils/apiClient.ts`** | HTTP Client با GET, POST, PUT, DELETE, Upload |
| **`/utils/apiServices.ts`** | تمام API Services (Products, Images, AI, Analytics, etc.) |
| **`/utils/useAPI.ts`** | React Hooks برای استفاده راحت از API |

### 2️⃣ Configuration Files

| فایل | توضیحات |
|------|---------|
| **`.env.example`** | نمونه Environment Variables (کامل با توضیحات) |

### 3️⃣ Documentation Files

| فایل | توضیحات |
|------|---------|
| **`API_USAGE_EXAMPLES.md`** | مثال‌های کامل استفاده (10+ مثال) |
| **`BACKEND_API_SPEC.md`** | مشخصات کامل API برای Backend Developer |
| **`API_INTEGRATION_SUMMARY.md`** | این فایل (خلاصه) |

---

## 🎯 قابلیت‌های API Client

### ✅ HTTP Methods

```tsx
import { apiGet, apiPost, apiUpload, apiPut, apiDelete } from './utils/apiClient';

// GET
const response = await apiGet('/products', { limit: 20 });

// POST
const response = await apiPost('/analytics/events', { eventType: 'page_view' });

// Upload با Progress
const response = await apiUpload('/images/upload', file, {}, (progress) => {
  console.log(`آپلود: ${progress}%`);
});
```

### ✅ React Hooks

```tsx
import { useAPI, useUpload, usePolling, useMutation } from './utils/useAPI';

// Query
const { data, loading, error, execute } = useAPI(getProduct);

// Upload
const { data, loading, progress, upload } = useUpload(uploadRoomImage);

// Polling (برای وضعیت AI)
const { data, isPolling, startPolling, stopPolling } = usePolling(getProcessingStatus);

// Mutation
const { data, loading, mutate } = useMutation(saveVisualization);
```

### ✅ API Services

```tsx
import {
  getProduct,
  listProducts,
  uploadRoomImage,
  processImage,
  saveVisualization,
  trackEvent,
  submitFeedback,
} from './utils/apiServices';

// همه API ها Type-Safe هستند!
```

---

## 🔧 نحوه استفاده

### گام 1: تنظیم Environment Variables

```bash
# کپی کردن .env.example
cp .env.example .env
```

ویرایش `.env`:

```bash
VITE_API_BASE_URL=https://api.homa.example.com/api
VITE_ENABLE_AI_PROCESSING=true
VITE_MOCK_MODE=false
```

### گام 2: استفاده در کامپوننت

```tsx
import { useAPI } from '../utils/useAPI';
import { processImage } from '../utils/apiServices';

function MyComponent() {
  const { data, loading, error, execute } = useAPI(processImage, {
    onSuccess: (result) => {
      console.log('موفق:', result);
    },
    onError: (error) => {
      console.error('خطا:', error);
    },
  });

  const handleProcess = async () => {
    await execute({
      imageFile: myFile,
      productId: 'prod_123',
    });
  };

  if (loading) return <div>در حال پردازش...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (data) return <div>نتیجه: {data.visualizationId}</div>;

  return <button onClick={handleProcess}>پردازش</button>;
}
```

---

## 📋 API Endpoints

### Products

- `GET /products/:id` - دریافت یک محصول
- `GET /products` - لیست محصولات
- `GET /products/search` - جستجو

### Images

- `POST /images/upload` - آپلود تصویر

### AI Processing

- `POST /ai/process` - پردازش تصویر
- `GET /ai/status/:jobId` - وضعیت پردازش

### Visualizations

- `POST /visualizations` - ذخیره visualization
- `GET /visualizations/:id` - دریافت visualization

### Analytics

- `POST /analytics/events` - ثبت event
- `GET /analytics` - دریافت آمار
- `GET /analytics/kpis` - دریافت KPIs

### Feedback

- `POST /feedback` - ارسال feedback

### Sessions

- `POST /sessions/:id` - ایجاد/بروز session
- `GET /sessions/:id` - دریافت session

---

## 🎨 ویژگی‌های خاص

### 1. Error Handling

```tsx
// خودکار error handling
const { error } = useAPI(getProduct);

if (error) {
  // error به صورت فارسی و واضح
  return <div className="text-red-500">{error}</div>;
}
```

### 2. Loading States

```tsx
// loading state خودکار
const { loading } = useAPI(processImage);

if (loading) {
  return <div className="animate-pulse-soft">در حال پردازش...</div>;
}
```

### 3. Upload Progress

```tsx
// progress tracking برای آپلود
const { progress, upload } = useUpload(uploadRoomImage);

return (
  <div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
    <p>{Math.round(progress)}%</p>
  </div>
);
```

### 4. Polling

```tsx
// برای بررسی مداوم وضعیت (مثلاً AI processing)
const { data, isPolling, startPolling, stopPolling } = usePolling(
  () => getProcessingStatus(jobId),
  {
    interval: 2000, // هر 2 ثانیه
    shouldStop: (data) => data.status === 'completed',
  }
);
```

### 5. Retry Logic

```tsx
// retry خودکار در صورت خطا
const [retryCount, setRetryCount] = useState(0);

const { execute } = useAPI(processImage, {
  onError: (error) => {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        execute({ ... });
      }, 2000);
    }
  },
});
```

---

## 🔐 Security

### Rate Limiting

```
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Upload: 10 files/hour
```

### File Upload Limits

```
- Max size: 10 MB
- Formats: JPEG, PNG, WebP, HEIC
- Min resolution: 800x600
- Max resolution: 4096x4096
```

### Timeout

```
- Default: 30 seconds
- Upload: No timeout (progress tracking)
```

---

## 📚 مستندات

### برای Frontend Developer:

1. **`API_USAGE_EXAMPLES.md`** - شروع از اینجا!
   - مثال‌های کامل
   - Best practices
   - Error handling
   - Retry logic

### برای Backend Developer:

2. **`BACKEND_API_SPEC.md`** - مشخصات کامل
   - تمام endpoints
   - Request/Response formats
   - Error codes
   - مثال‌های cURL

---

## 🎯 Next Steps

### برای Development (با Mock):

```bash
# .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_MOCK_MODE=true
VITE_ENABLE_AI_PROCESSING=false
```

فایل‌های mock فعلی (`utils/aiImageProcessor.ts`, etc.) همچنان کار می‌کنند.

### برای Production (با Backend واقعی):

```bash
# .env
VITE_API_BASE_URL=https://api.homa.example.com/api
VITE_MOCK_MODE=false
VITE_ENABLE_AI_PROCESSING=true
```

سپس:

```tsx
// فقط کافیه از همون API Services استفاده کنید
// هیچ تغییری در کامپوننت‌ها لازم نیست!
```

---

## ✅ Checklist اتصال به Backend

- [ ] Backend API آماده است
- [ ] `.env` تنظیم شده
- [ ] `VITE_API_BASE_URL` صحیح است
- [ ] CORS در Backend تنظیم شده
- [ ] API Keys تنظیم شده (اگر نیاز باشد)
- [ ] Health check موفق: `curl https://api.homa.example.com/api/health`
- [ ] Test یک endpoint: `getProduct`
- [ ] Test آپلود: `uploadRoomImage`
- [ ] Test AI processing: `processImage`

---

## 🐛 Troubleshooting

### مشکل: "Failed to fetch"

```bash
# بررسی CORS در Backend:
Access-Control-Allow-Origin: *
# یا
Access-Control-Allow-Origin: https://homa.example.com
```

### مشکل: "Timeout"

```bash
# افزایش timeout:
VITE_API_TIMEOUT=60000  # 60 seconds
```

### مشکل: "File too large"

```bash
# بررسی محدودیت‌ها:
VITE_MAX_FILE_SIZE=10485760  # 10MB
```

---

## 📞 Support

اگر سوال یا مشکلی داشتید:

1. **مستندات را بخوانید**: `API_USAGE_EXAMPLES.md`
2. **Console را چک کنید**: تمام API calls log می‌شوند
3. **Network Tab را بررسی کنید**: DevTools → Network
4. **Spec را به Backend Developer بدهید**: `BACKEND_API_SPEC.md`

---

## 🎉 آماده است!

همه چیز آماده اتصال به Backend است:

✅ **HTTP Client** - با تمام قابلیت‌ها  
✅ **API Services** - Type-safe و کامل  
✅ **React Hooks** - برای استفاده راحت  
✅ **Error Handling** - جامع و واضح  
✅ **Loading States** - خودکار  
✅ **Progress Tracking** - برای آپلود  
✅ **Polling** - برای وضعیت پردازش  
✅ **Documentation** - کامل و فارسی  

**فقط کافیه `.env` رو تنظیم کنید و شروع کنید!** 🚀

---

**ساخته شده با ❤️ برای HOMA**  
**تاریخ:** اکتبر 2025
