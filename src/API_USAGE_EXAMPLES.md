# 🔌 راهنمای استفاده از API در HOMA Platform

این فایل نمونه‌های کامل استفاده از API Services را نشان می‌دهد.

---

## 📚 فهرست

1. [Setup اولیه](#setup-اولیه)
2. [دریافت محصولات](#دریافت-محصولات)
3. [آپلود تصویر](#آپلود-تصویر)
4. [پردازش با AI](#پردازش-با-ai)
5. [ذخیره Visualization](#ذخیره-visualization)
6. [ثبت Analytics](#ثبت-analytics)
7. [ارسال Feedback](#ارسال-feedback)
8. [Error Handling](#error-handling)

---

## Setup اولیه

### 1. ایجاد فایل `.env`

```bash
# کپی کردن از .env.example
cp .env.example .env
```

سپس مقادیر را بروز کنید:

```bash
# .env
VITE_API_BASE_URL=https://api.homa.example.com
VITE_ENABLE_AI_PROCESSING=true
VITE_MOCK_MODE=false
```

### 2. بررسی اتصال

```tsx
import { apiHealthCheck } from '../utils/apiClient';

// در component یا useEffect:
const checkAPI = async () => {
  const isHealthy = await apiHealthCheck();
  console.log('API Status:', isHealthy ? '✅ Connected' : '❌ Disconnected');
};
```

---

## دریافت محصولات

### مثال 1: دریافت یک محصول

```tsx
import { useEffect } from 'react';
import { useAPI } from '../utils/useAPI';
import { getProduct } from '../utils/apiServices';

function ProductDetails({ productId }: { productId: string }) {
  const { data: product, loading, error, execute } = useAPI(
    getProduct,
    {
      onSuccess: (data) => {
        console.log('محصول دریافت شد:', data);
      },
      onError: (error) => {
        console.error('خطا در دریافت محصول:', error);
      },
    }
  );

  useEffect(() => {
    execute({ productId });
  }, [productId, execute]);

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="card-interactive">
      <h2>{product.product.name}</h2>
      <p>{product.product.description}</p>
      <p className="text-accent">{product.product.price.toLocaleString('fa-IR')} تومان</p>
    </div>
  );
}
```

### مثال 2: لیست محصولات با Pagination

```tsx
import { useState } from 'react';
import { useAPI } from '../utils/useAPI';
import { listProducts } from '../utils/apiServices';

function ProductList() {
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const { data, loading, error, execute } = useAPI(listProducts);

  useEffect(() => {
    execute({
      limit,
      offset,
      category: 'rugs', // اختیاری
    });
  }, [offset, execute]);

  const handleNextPage = () => {
    if (data?.hasMore) {
      setOffset((prev) => prev + limit);
    }
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  return (
    <div>
      {loading && <div className="animate-pulse-soft">در حال بارگذاری...</div>}
      
      {error && <div className="text-red-500">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.products.map((product) => (
              <div key={product.id} className="card-interactive">
                <img src={product.images[0]} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.price.toLocaleString('fa-IR')} تومان</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button 
              onClick={handlePrevPage} 
              disabled={offset === 0}
              className="btn-secondary"
            >
              قبلی
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={!data.hasMore}
              className="btn-secondary"
            >
              بعدی
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## آپلود تصویر

### مثال 1: آپلود ساده

```tsx
import { useState } from 'react';
import { useUpload } from '../utils/useAPI';
import { uploadRoomImage } from '../utils/apiServices';

function ImageUploader({ productId }: { productId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data, loading, error, progress, upload, reset } = useUpload(
    (file, onProgress) => 
      uploadRoomImage({ file, productId }, onProgress),
    {
      onSuccess: (data) => {
        console.log('آپلود موفق:', data);
      },
      onError: (error) => {
        console.error('خطا در آپلود:', error);
      },
    }
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      reset(); // پاک کردن وضعیت قبلی
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await upload(selectedFile);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="input-primary"
      />

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'در حال آپلود...' : 'آپلود تصویر'}
        </button>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm">{Math.round(progress)}%</p>
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      {data && (
        <div className="text-green-600">
          ✅ آپلود موفق! شناسه: {data.imageId}
        </div>
      )}
    </div>
  );
}
```

---

## پردازش با AI

### مثال 1: پردازش تصویر

```tsx
import { useState } from 'react';
import { useAPI } from '../utils/useAPI';
import { processImage } from '../utils/apiServices';

function AIProcessor({ 
  imageFile, 
  productId 
}: { 
  imageFile: File; 
  productId: string;
}) {
  const { data, loading, error, execute } = useAPI(processImage, {
    onSuccess: (result) => {
      console.log('پردازش موفق:', result);
      // نمایش نتیجه
    },
    onError: (error) => {
      console.error('خطا در پردازش:', error);
    },
  });

  const handleProcess = () => {
    execute({
      imageFile,
      productId,
      sessionId: localStorage.getItem('sessionId') || undefined,
    });
  };

  return (
    <div>
      <button 
        onClick={handleProcess}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'در حال پردازش...' : 'پردازش با AI'}
      </button>

      {loading && (
        <div className="animate-pulse-soft mt-4">
          <p>لطفاً صبر کنید، در حال پردازش تصویر...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="text-green-600">
            ✅ پردازش موفق! زمان: {data.processingTime}ms
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2">تصویر اصلی:</p>
              <img 
                src={data.originalImageUrl} 
                alt="Original" 
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <p className="mb-2">تصویر پردازش شده:</p>
              <img 
                src={data.visualizedImageUrl} 
                alt="Processed" 
                className="rounded-lg w-full"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            اطمینان: {Math.round(data.confidence * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}
```

### مثال 2: Polling برای وضعیت پردازش

```tsx
import { usePolling } from '../utils/useAPI';
import { getProcessingStatus } from '../utils/apiServices';

function ProcessingMonitor({ jobId }: { jobId: string }) {
  const { data, loading, isPolling, startPolling, stopPolling } = usePolling(
    () => getProcessingStatus(jobId),
    {
      interval: 2000, // هر 2 ثانیه
      maxAttempts: 30, // حداکثر 60 ثانیه
      shouldStop: (data) => data.status === 'completed' || data.status === 'failed',
      onSuccess: (data) => {
        console.log('پردازش تکمیل شد:', data);
      },
      onError: (error) => {
        console.error('خطا:', error);
      },
    }
  );

  return (
    <div>
      {!isPolling && (
        <button onClick={startPolling} className="btn-primary">
          شروع بررسی وضعیت
        </button>
      )}

      {isPolling && (
        <div className="space-y-2">
          <p>در حال بررسی وضعیت...</p>
          {data && (
            <>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              <p>وضعیت: {data.status}</p>
              <p>پیشرفت: {data.progress}%</p>
            </>
          )}
          <button onClick={stopPolling} className="btn-secondary">
            توقف
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## ذخیره Visualization

```tsx
import { useMutation } from '../utils/useAPI';
import { saveVisualization } from '../utils/apiServices';

function SaveVisualization({
  productId,
  originalImageUrl,
  visualizedImageUrl,
}: {
  productId: string;
  originalImageUrl: string;
  visualizedImageUrl: string;
}) {
  const { data, loading, error, mutate } = useMutation(saveVisualization, {
    onSuccess: (data) => {
      console.log('ذخیره موفق:', data);
      // هدایت به صفحه نتیجه یا نمایش لینک share
    },
  });

  const handleSave = () => {
    // دریافت UTM parameters از URL
    const urlParams = new URLSearchParams(window.location.search);
    
    mutate({
      productId,
      originalImageUrl,
      visualizedImageUrl,
      sessionId: localStorage.getItem('sessionId') || undefined,
      utm: {
        source: urlParams.get('utm_source') || undefined,
        medium: urlParams.get('utm_medium') || undefined,
        campaign: urlParams.get('utm_campaign') || undefined,
      },
    });
  };

  return (
    <div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'در حال ذخیره...' : 'ذخیره نتیجه'}
      </button>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {data && (
        <div className="mt-4 bg-green-50 p-4 rounded-lg">
          <p className="text-green-600">✅ ذخیره موفق!</p>
          <p className="text-sm mt-2">شناسه: {data.visualizationId}</p>
          {data.shareUrl && (
            <a 
              href={data.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              لینک اشتراک‌گذاری
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## ثبت Analytics

```tsx
import { useEffect } from 'react';
import { trackEvent } from '../utils/apiServices';

function ProductPage({ productId }: { productId: string }) {
  useEffect(() => {
    // ثبت page view
    trackEvent({
      eventType: 'page_view',
      productId,
      sessionId: localStorage.getItem('sessionId') || undefined,
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }, [productId]);

  const handlePurchaseClick = () => {
    // ثبت کلیک خرید
    trackEvent({
      eventType: 'purchase_click',
      productId,
      sessionId: localStorage.getItem('sessionId') || undefined,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // هدایت به صفحه خرید
    window.location.href = `https://shop.homa.example.com/products/${productId}`;
  };

  return (
    <div>
      {/* محتوای صفحه */}
      <button onClick={handlePurchaseClick} className="btn-primary">
        خرید محصول
      </button>
    </div>
  );
}
```

---

## ارسال Feedback

```tsx
import { useState } from 'react';
import { useMutation } from '../utils/useAPI';
import { submitFeedback } from '../utils/apiServices';

function FeedbackForm({ visualizationId }: { visualizationId: string }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { data, loading, error, mutate } = useMutation(submitFeedback, {
    onSuccess: () => {
      console.log('نظر شما ثبت شد');
      // پاک کردن فرم
      setRating(0);
      setFeedback('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate({
      visualizationId,
      rating,
      feedback,
      sessionId: localStorage.getItem('sessionId') || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">امتیاز شما:</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="feedback" className="block mb-2">
          نظر شما:
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="input-primary min-h-[100px]"
          placeholder="نظر خود را بنویسید..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="btn-primary"
      >
        {loading ? 'در حال ارسال...' : 'ارسال نظر'}
      </button>

      {error && <div className="text-red-500">{error}</div>}
      
      {data && (
        <div className="text-green-600">
          ✅ نظر شما با موفقیت ثبت شد!
        </div>
      )}
    </form>
  );
}
```

---

## Error Handling

### مثال 1: Retry Logic

```tsx
import { useState } from 'react';
import { useAPI } from '../utils/useAPI';
import { processImage } from '../utils/apiServices';

function ResilientProcessor({ 
  imageFile, 
  productId 
}: { 
  imageFile: File; 
  productId: string;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const { data, loading, error, execute } = useAPI(processImage, {
    onError: (error) => {
      console.error(`تلاش ${retryCount + 1} ناموفق:`, error);
      
      if (retryCount < maxRetries) {
        // تلاش مجدد بعد از 2 ثانیه
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          handleProcess();
        }, 2000);
      }
    },
  });

  const handleProcess = () => {
    execute({
      imageFile,
      productId,
      sessionId: localStorage.getItem('sessionId') || undefined,
    });
  };

  return (
    <div>
      <button onClick={handleProcess} disabled={loading} className="btn-primary">
        پردازش تصویر
      </button>

      {loading && (
        <div className="mt-4">
          <p>در حال پردازش...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">
              تلاش {retryCount} از {maxRetries}
            </p>
          )}
        </div>
      )}

      {error && retryCount >= maxRetries && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
          <p className="text-red-600">
            متأسفانه بعد از {maxRetries} تلاش، پردازش موفق نبود.
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              handleProcess();
            }}
            className="btn-secondary mt-2"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {data && <div className="text-green-600 mt-4">✅ پردازش موفق!</div>}
    </div>
  );
}
```

### مثال 2: Error Boundary

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class APIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('API Error:', error, errorInfo);
    
    // ثبت در error tracking service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h2 className="text-red-600 mb-2">خطایی رخ داد</h2>
            <p className="text-sm text-gray-600">
              {this.state.error?.message || 'خطای ناشناخته'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-secondary mt-4"
            >
              تلاش مجدد
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// استفاده:
function App() {
  return (
    <APIErrorBoundary>
      <YourComponent />
    </APIErrorBoundary>
  );
}
```

---

## 🎯 Best Practices

### 1. همیشه Loading State نشان دهید

```tsx
{loading && <div className="animate-pulse-soft">در حال بارگذاری...</div>}
```

### 2. Error Messages را واضح نشان دهید

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

### 3. از Session ID استفاده کنید

```tsx
// در App.tsx یا main.tsx:
useEffect(() => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
}, []);
```

### 4. UTM Parameters را Track کنید

```tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const utm = {
    source: urlParams.get('utm_source'),
    medium: urlParams.get('utm_medium'),
    campaign: urlParams.get('utm_campaign'),
  };
  
  // ذخیره برای استفاده بعدی
  if (utm.source) {
    localStorage.setItem('utm', JSON.stringify(utm));
  }
}, []);
```

### 5. از TypeScript استفاده کنید

همیشه types را import کنید تا IntelliSense و Type Safety داشته باشید.

---

## 📚 منابع بیشتر

- **`/utils/apiClient.ts`** - HTTP Client اصلی
- **`/utils/apiServices.ts`** - تمام API Services
- **`/utils/useAPI.ts`** - React Hooks
- **`.env.example`** - Environment Variables

---

**حالا آماده‌اید برای اتصال به Backend! 🚀**
