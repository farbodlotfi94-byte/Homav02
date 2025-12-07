# 🔌 HOMA Platform - Backend API Specification

این سند مشخصات کامل API های مورد نیاز برای Backend را شرح می‌دهد.

---

## 📋 فهرست

1. [Base URL و Authentication](#base-url-و-authentication)
2. [Response Format](#response-format)
3. [Products API](#products-api)
4. [Images API](#images-api)
5. [AI Processing API](#ai-processing-api)
6. [Visualizations API](#visualizations-api)
7. [Analytics API](#analytics-api)
8. [Feedback API](#feedback-api)
9. [Sessions API](#sessions-api)
10. [Error Codes](#error-codes)

---

## Base URL و Authentication

### Base URL

```
Production: https://api.homa.example.com/api
Development: http://localhost:3001/api
```

### Headers

```http
Content-Type: application/json
Accept: application/json
X-Session-ID: <session-id>  (اختیاری)
X-API-Key: <api-key>  (برای production)
```

---

## Response Format

همه پاسخ‌ها باید به این فرمت باشند:

### Success Response

```json
{
  "success": true,
  "data": {
    // داده‌های مورد نظر
  },
  "message": "عملیات موفق",  // اختیاری
  "statusCode": 200
}
```

### Error Response

```json
{
  "success": false,
  "error": "پیام خطا",
  "message": "توضیحات بیشتر",  // اختیاری
  "statusCode": 400
}
```

---

## Products API

### 1. دریافت یک محصول

```http
GET /products/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_rug_21902",
      "name": "فرش دستباف کاشان",
      "description": "فرش زیبای دستباف با طرح سنتی",
      "category": "rugs",
      "price": 15000000,
      "currency": "IRR",
      "images": [
        "https://cdn.homa.example.com/products/prod_rug_21902_1.jpg",
        "https://cdn.homa.example.com/products/prod_rug_21902_2.jpg"
      ],
      "variants": [
        {
          "id": "var_001",
          "name": "سایز 2x3",
          "dimensions": { "width": 200, "height": 300, "unit": "cm" },
          "price": 15000000,
          "image": "https://cdn.homa.example.com/products/var_001.jpg"
        }
      ],
      "tags": ["فرش", "دستباف", "کاشان"],
      "metadata": {
        "material": "پشم",
        "origin": "کاشان",
        "weight": "15kg"
      }
    }
  }
}
```

### 2. لیست محصولات

```http
GET /products?category=rugs&tags=دستباف&limit=20&offset=0
```

**Query Parameters:**
- `category` (string, optional): دسته‌بندی
- `tags` (string, optional): تگ‌ها (comma-separated)
- `limit` (number, optional): تعداد (default: 20)
- `offset` (number, optional): offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "محصول 1",
        // ... سایر فیلدها
      }
    ],
    "total": 150,
    "hasMore": true
  }
}
```

### 3. جستجوی محصولات

```http
GET /products/search?q=فرش&limit=10
```

**Response:** مشابه لیست محصولات

---

## Images API

### 1. آپلود تصویر

```http
POST /images/upload
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file` (File): فایل تصویر
- `productId` (string): شناسه محصول
- `sessionId` (string, optional): شناسه session
- `type` (string): نوع تصویر (room, product, etc.)

**Response:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.homa.example.com/uploads/image_123.jpg",
    "imageId": "img_123456",
    "thumbnailUrl": "https://cdn.homa.example.com/uploads/image_123_thumb.jpg",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "size": 2048576,
      "format": "jpeg"
    }
  }
}
```

### 2. حذف تصویر

```http
DELETE /images/:imageId
```

**Response:**

```json
{
  "success": true,
  "message": "تصویر حذف شد"
}
```

---

## AI Processing API

### 1. پردازش تصویر

```http
POST /ai/process
```

**Body:**

```json
{
  "imageId": "img_123456",
  "imageUrl": "https://cdn.homa.example.com/uploads/image_123.jpg",
  "productId": "prod_rug_21902",
  "variantId": "var_001",  // اختیاری
  "userId": "user_123",  // اختیاری
  "sessionId": "session_abc"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "visualizationId": "viz_789",
    "visualizedImageUrl": "https://cdn.homa.example.com/visualizations/viz_789.jpg",
    "originalImageUrl": "https://cdn.homa.example.com/uploads/image_123.jpg",
    "processingTime": 3542,
    "confidence": 0.95,
    "metadata": {
      "detectedRoom": "living_room",
      "lighting": "natural",
      "angle": "front",
      "productPlacement": {
        "x": 450,
        "y": 320,
        "width": 800,
        "height": 600,
        "rotation": 0
      }
    }
  }
}
```

### 2. وضعیت پردازش (برای Async Processing)

```http
GET /ai/status/:jobId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "job_456",
    "status": "processing",  // pending | processing | completed | failed
    "progress": 65,  // 0-100
    "estimatedTimeRemaining": 1500,  // میلی‌ثانیه
    "result": null  // زمانی که completed شد، result اینجاست
  }
}
```

---

## Visualizations API

### 1. ذخیره Visualization

```http
POST /visualizations
```

**Body:**

```json
{
  "productId": "prod_rug_21902",
  "originalImageUrl": "https://cdn.homa.example.com/uploads/image_123.jpg",
  "visualizedImageUrl": "https://cdn.homa.example.com/visualizations/viz_789.jpg",
  "userId": "user_123",  // اختیاری
  "sessionId": "session_abc",
  "variantId": "var_001",  // اختیاری
  "utm": {
    "source": "instagram",
    "medium": "social",
    "campaign": "spring_sale"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "visualizationId": "viz_789",
    "shareUrl": "https://homa.example.com/v/viz_789"
  }
}
```

### 2. دریافت Visualization

```http
GET /visualizations/:visualizationId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "visualizationId": "viz_789",
    "productId": "prod_rug_21902",
    "product": {
      // اطلاعات محصول
    },
    "originalImageUrl": "...",
    "visualizedImageUrl": "...",
    "createdAt": "2025-10-24T10:30:00Z",
    "utm": {
      "source": "instagram",
      "medium": "social",
      "campaign": "spring_sale"
    }
  }
}
```

### 3. لیست Visualizations کاربر

```http
GET /visualizations/user/:userId?limit=10&offset=0
```

**Response:**

```json
{
  "success": true,
  "data": {
    "visualizations": [
      {
        "visualizationId": "viz_789",
        "productId": "prod_rug_21902",
        "thumbnailUrl": "...",
        "createdAt": "2025-10-24T10:30:00Z"
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

---

## Analytics API

### 1. ثبت Event

```http
POST /analytics/events
```

**Body:**

```json
{
  "eventType": "page_view",
  "productId": "prod_rug_21902",
  "sessionId": "session_abc",
  "userId": "user_123",  // اختیاری
  "metadata": {
    "path": "/product/prod_rug_21902",
    "referrer": "https://instagram.com",
    "device": "mobile"
  },
  "utm": {
    "source": "instagram",
    "medium": "social",
    "campaign": "spring_sale"
  },
  "timestamp": "2025-10-24T10:30:00Z"
}
```

**Event Types:**
- `page_view`
- `product_view`
- `upload_started`
- `upload_completed`
- `upload_failed`
- `precheck_pass`
- `precheck_fail`
- `processing_started`
- `processing_completed`
- `processing_failed`
- `visualization_view`
- `purchase_click`
- `share_click`
- `feedback_submitted`
- `retry_attempt`

**Response:**

```json
{
  "success": true,
  "data": {
    "eventId": "evt_123456"
  }
}
```

### 2. دریافت آمار

```http
GET /analytics?startDate=2025-10-01&endDate=2025-10-24&productId=prod_rug_21902&eventType=purchase_click
```

**Response:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventType": "purchase_click",
        "count": 145,
        "timestamp": "2025-10-24"
      }
    ],
    "metrics": {
      "totalViews": 5420,
      "totalUploads": 1250,
      "totalConversions": 145,
      "conversionRate": 11.6
    }
  }
}
```

### 3. دریافت KPIs

```http
GET /analytics/kpis
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadRate": 85.5,  // درصد
    "conversionRate": 11.6,  // درصد
    "avgProcessingTime": 3542,  // میلی‌ثانیه
    "totalVisualizations": 15420,
    "totalUsers": 12350,
    "activeUsers24h": 850,
    "avgSessionDuration": 180,  // ثانیه
    "topProducts": [
      {
        "productId": "prod_rug_21902",
        "name": "فرش دستباف کاشان",
        "views": 1250,
        "uploads": 350,
        "conversions": 45
      }
    ]
  }
}
```

---

## Feedback API

### 1. ارسال Feedback

```http
POST /feedback
```

**Body:**

```json
{
  "visualizationId": "viz_789",
  "rating": 5,  // 1-5
  "feedback": "عالی بود! خیلی واقعی شده.",
  "wouldRecommend": true,
  "sessionId": "session_abc"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbackId": "fb_123456"
  }
}
```

### 2. دریافت Feedbacks یک محصول

```http
GET /feedback/product/:productId?limit=20&offset=0
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "feedbackId": "fb_123456",
        "rating": 5,
        "feedback": "عالی بود!",
        "wouldRecommend": true,
        "createdAt": "2025-10-24T10:30:00Z"
      }
    ],
    "averageRating": 4.7,
    "total": 350
  }
}
```

---

## Sessions API

### 1. ایجاد/بروزرسانی Session

```http
POST /sessions/:sessionId
```

**Body:**

```json
{
  "productId": "prod_rug_21902",
  "utm": {
    "source": "instagram",
    "medium": "social",
    "campaign": "spring_sale"
  },
  "lastActivity": "2025-10-24T10:30:00Z",
  "metadata": {
    "device": "mobile",
    "browser": "Chrome",
    "platform": "iOS"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "session_abc",
    "createdAt": "2025-10-24T09:00:00Z",
    "lastActivity": "2025-10-24T10:30:00Z"
  }
}
```

### 2. دریافت Session

```http
GET /sessions/:sessionId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "session_abc",
      "productId": "prod_rug_21902",
      "utm": {
        "source": "instagram",
        "medium": "social",
        "campaign": "spring_sale"
      },
      "createdAt": "2025-10-24T09:00:00Z",
      "lastActivity": "2025-10-24T10:30:00Z",
      "events": [
        {
          "eventType": "page_view",
          "timestamp": "2025-10-24T09:00:00Z"
        },
        {
          "eventType": "upload_completed",
          "timestamp": "2025-10-24T09:15:00Z"
        }
      ]
    }
  }
}
```

---

## Error Codes

### HTTP Status Codes

| Code | معنی | توضیحات |
|------|------|---------|
| 200 | OK | موفق |
| 201 | Created | ایجاد موفق |
| 400 | Bad Request | درخواست نامعتبر |
| 401 | Unauthorized | نیاز به authentication |
| 403 | Forbidden | دسترسی ممنوع |
| 404 | Not Found | پیدا نشد |
| 408 | Request Timeout | زمان انتظار تمام شد |
| 413 | Payload Too Large | فایل خیلی بزرگه |
| 422 | Unprocessable Entity | داده‌ها نامعتبر |
| 429 | Too Many Requests | درخواست بیش از حد |
| 500 | Internal Server Error | خطای سرور |
| 503 | Service Unavailable | سرویس در دسترس نیست |

### Error Messages فارسی

```json
{
  "400": "درخواست نامعتبر است",
  "401": "لطفاً وارد شوید",
  "403": "شما به این بخش دسترسی ندارید",
  "404": "یافت نشد",
  "408": "زمان درخواست به پایان رسید",
  "413": "حجم فایل بیش از حد مجاز است",
  "422": "اطلاعات وارد شده نامعتبر است",
  "429": "تعداد درخواست‌های شما بیش از حد است. لطفاً کمی صبر کنید",
  "500": "خطای سرور. لطفاً دوباره تلاش کنید",
  "503": "سرویس موقتاً در دسترس نیست"
}
```

---

## 🔒 Security

### Rate Limiting

```
- Anonymous: 100 requests / hour
- Authenticated: 1000 requests / hour
- Upload: 10 files / hour
```

### File Upload Limits

```
- Max file size: 10 MB
- Allowed formats: JPEG, PNG, WebP, HEIC
- Min resolution: 800x600
- Max resolution: 4096x4096
```

### API Key Authentication

برای production، از API Key استفاده کنید:

```http
X-API-Key: your_api_key_here
```

---

## 📊 Monitoring & Health Check

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "storage": "healthy",
      "ai": "healthy"
    }
  }
}
```

---

## 🚀 Best Practices

### 1. همیشه Pagination استفاده کنید

```http
GET /products?limit=20&offset=0
```

### 2. از Caching استفاده کنید

```http
Cache-Control: public, max-age=3600
ETag: "abc123"
```

### 3. CORS را درست تنظیم کنید

```
Access-Control-Allow-Origin: https://homa.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Session-ID, X-API-Key
```

### 4. از Compression استفاده کنید

```
Content-Encoding: gzip
```

### 5. Logging جامع

همه requests/responses را log کنید:
- Request ID
- User ID / Session ID
- Timestamp
- Endpoint
- Status Code
- Response Time
- Error Messages

---

## 📚 مثال‌های کامل

### مثال 1: فلو کامل Upload + Process

```bash
# 1. آپلود تصویر
curl -X POST https://api.homa.example.com/api/images/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@room.jpg" \
  -F "productId=prod_rug_21902" \
  -F "sessionId=session_abc"

# Response:
# {"success": true, "data": {"imageId": "img_123", "imageUrl": "..."}}

# 2. پردازش با AI
curl -X POST https://api.homa.example.com/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": "img_123",
    "imageUrl": "...",
    "productId": "prod_rug_21902",
    "sessionId": "session_abc"
  }'

# Response:
# {"success": true, "data": {"visualizationId": "viz_789", ...}}

# 3. ذخیره و دریافت لینک share
curl -X POST https://api.homa.example.com/api/visualizations \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_rug_21902",
    "originalImageUrl": "...",
    "visualizedImageUrl": "...",
    "sessionId": "session_abc"
  }'

# Response:
# {"success": true, "data": {"visualizationId": "viz_789", "shareUrl": "..."}}
```

---

**این API Spec را به Backend Developer بدهید تا بتواند API های مورد نیاز را بسازد!** 🚀
