# API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [User Endpoints](#user-endpoints)
    - [POST /api/users/register/](#post-apiusersregister)
    - [POST /api/users/login/](#post-apiuserslogin)
    - [POST /api/users/otp/send/](#post-apiusersotpsend)
    - [POST /api/users/otp/verify/](#post-apiusersotpverify)
    - [POST /api/users/otp/resend/](#post-apiusersotpresend)
    - [POST /api/users/password/reset/](#post-apiuserspasswordreset)
    - [GET /api/users/profile/](#get-apiusersprofile)
    - [PUT /api/users/profile/](#put-apiusersprofile)
    - [POST /api/users/logout/](#post-apiuserslogout)
    - [POST /api/users/refresh/](#post-apiusersrefresh)
    - [GET /api/users/gallery/](#get-apiusersgallery)
- [Shop Endpoints](#shop-endpoints)
    - [POST /api/shops/otp/phone-verify/send/](#post-apishopsotpphone-verifysend)
    - [POST /api/shops/otp/phone-verify/verify/](#post-apishopsotpphone-verifyverify)
    - [POST /api/shops/otp/password-reset/send/](#post-apishopsotppassword-resetsend)
    - [POST /api/shops/password/reset/](#post-apishopspasswordreset)
    - [POST /api/shops/register/](#post-apishopsregister)
    - [GET /api/shops/list/](#get-apishopslist)
    - [POST /api/shops/login/](#post-apishopslogin)
    - [POST /api/shops/refresh/](#post-apishopsrefresh)
    - [GET /api/shops/dashboard/](#get-apishopsdashboard)
    - [GET /api/shops/settings/](#get-apishopssettings)
    - [PUT /api/shops/settings/](#put-apishopssettings)
    - [POST /api/shops/products/](#post-apishopsproducts)
    - [GET /api/shops/products/list/](#get-apishopsproductslist)
    - [GET /api/shops/products/{unique_link}/](#get-apishopsproductsunique_link)
    - [PUT /api/shops/products/edit/{product_id}/](#put-apishopsproductseditproduct_id)
    - [DELETE /api/shops/products/delete/{product_id}/](#delete-apishopsproductsdeleteproduct_id)
    - [GET /api/shops/products/analytics/](#get-apishopsproductsanalytics)
    - [GET /api/shops/credits/](#get-apishopscredits)
    - [GET /api/shops/credits/history/](#get-apishopscreditshistory)
    - [POST /api/shops/admin/credits/add/](#post-apishopsadmincreditsadd)
    - [POST /api/shops/admin/credits/remove/](#post-apishopsadmincreditsremove)
- [Product Endpoints (Public)](#product-endpoints-public)
    - [GET /api/products/](#get-apiproducts)
    - [GET /api/products/{unique_link}/](#get-apiproductsunique_link)
    - [POST /api/products/{unique_link}/process/](#post-apiproductsunique_linkprocess)
    - [POST /api/products/vote/](#post-apiproductsvote)
- [Image Serving Endpoints](#image-serving-endpoints)
    - [GET /api/images/{object_path}](#get-apiimagesobject_path)
- [Admin Configuration Endpoints](#admin-configuration-endpoints)
    - [GET /api/admin/model-prompt/](#get-apiadminmodel-prompt)
    - [PUT /api/admin/model-prompt/](#put-apiadminmodel-prompt)
    - [GET /api/admin/groq-prompt/](#get-apiadmingroq-prompt)
    - [PUT /api/admin/groq-prompt/](#put-apiadmingroq-prompt)
- [Recommendation Endpoints](#recommendation-endpoints)
    - [POST /api/recommendations/sessions/](#post-apirecommendationssessions)
    - [GET /api/recommendations/sessions/{session_id}/](#get-apirecommendationssessionssession_id)
    - [GET /api/recommendations/sessions/list/](#get-apirecommendationssessionslist)
    - [DELETE /api/recommendations/sessions/{session_id}/delete/](#delete-apirecommendationssessionssession_iddelete)
    - [POST /api/recommendations/sessions/{session_id}/items/{item_id}/tryon/](#post-apirecommendationssessionssession_iditemsitem_idtryon)
- [Discovery Endpoints (Product-First)](#discovery-endpoints-product-first)
    - [POST /api/recommendations/discover/](#post-apirecommendationsdiscover)
    - [GET /api/recommendations/discover/{session_id}/](#get-apirecommendationsdiscoversession_id)
    - [GET /api/recommendations/discover/list/](#get-apirecommendationsdiscoverlist)
    - [POST /api/recommendations/discover/{session_id}/visualize/{product_id}/](#post-apirecommendationsdiscoversession_idvisualizeproduct_id)
    - [POST /api/recommendations/discover/{session_id}/refine/](#post-apirecommendationsdiscoversession_idrefine)
- [External API Endpoints](#external-api-endpoints)
    - [API Key Management](#api-key-management-shop-jwt-auth)
        - [GET /api/external/keys/](#get-apiexternalkeys)
        - [POST /api/external/keys/](#post-apiexternalkeys)
        - [GET /api/external/keys/{key_id}/](#get-apiexternalkeyskey_id)
        - [PATCH /api/external/keys/{key_id}/](#patch-apiexternalkeyskey_id)
        - [POST /api/external/keys/{key_id}/revoke/](#post-apiexternalkeyskey_idrevoke)
    - [Processing API](#processing-api-api-key-auth)
        - [POST /api/external/v1/process/](#post-apiexternalv1process)
        - [GET /api/external/v1/status/{task_id}/](#get-apiexternalv1statustask_id)
        - [GET /api/external/v1/tasks/](#get-apiexternalv1tasks)
        - [GET /api/external/v1/balance/](#get-apiexternalv1balance)
        - [GET /api/external/v1/products/](#get-apiexternalv1products)
        - [GET /api/external/v1/products/{unique_link}/](#get-apiexternalv1productsunique_link)
- [System Health Endpoints](#system-health-endpoints)
    - [GET /health/](#get-health)
- [Error Responses](#error-responses)
- [API Schema](#api-schema)

## Overview

This API provides authentication, product management, and AI-powered image processing for the Homa visualization platform. The API uses JWT tokens for authentication and follows RESTful conventions.

## Base URL

```
http://localhost:8000
```

## Authentication

The API uses JWT (JSON Web Token) authentication for Users and Shops with different authentication schemes:

**User Authentication:**

Users can authenticate using two methods:

1. **Password-based Authentication** (Traditional):
    - Register: `POST /api/users/register/`
    - Login: `POST /api/users/login/`
    - Returns JWT access and refresh tokens

2. **OTP-based Authentication** (Passwordless):
    - Send OTP: `POST /api/users/otp/send/`
    - Verify OTP: `POST /api/users/otp/verify/`
    - Returns JWT access and refresh tokens
    - Auto-creates account if user doesn't exist
    - Rate limited: 3 OTP requests per hour per phone

**User Token Management:**
- JWT tokens with access and refresh tokens
- Access token expires after 30 minutes
- Refresh token expires after 7 days
- Token refresh using `/api/users/refresh/`
- Token blacklisting on logout

**Shop Authentication:**
- JWT access tokens with refresh tokens
- Custom authentication backend
- Phone number and password authentication
- OTP-based registration and password reset
- Token refresh using `/api/shops/refresh/`

**Token Usage:**
- Include the access token in the `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```

**Password Reset:**
- OTP-based password reset: `POST /api/users/otp/send/` (purpose='reset_password') → `POST /api/users/password/reset/`

## API Response Format

All API responses follow a consistent format using the `ResponseMixin` class from `core.mixins`. This ensures consistent response structure across all endpoints.

**Standard Response Format:**
```json
{
    "success": true,
    "message": "string",
    "data": { ... }  // all actual data goes here (optional)
}
```

**Success Response Methods:**
- `success_response(data=None, message='عملیات موفقیت آمیز بود', status_code=200)` - General success response
- `created_response(data, message='عملیات با موفقیت انجام شد')` - 201 Created response
- `paginate_response(queryset, serializer_class, request, context=None, message='عملیات موفقیت آمیز بود')` - Paginated response

**Error Response Methods:**
- `error_response(message='عملیات ناموفق بود', data=None, status_code=400)` - General error response

**Success Response Example:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "phone_number": "+989123456789",
            "name": "John Doe"
        },
        "tokens": {
            "access": "...",
            "refresh": "..."
        }
    }
}
```

**Paginated Response Example:**
```json
{
    "success": true,
    "message": "Success",
    "data": {
        "count": 50,
        "next": "http://localhost:8000/api/products/?page=2",
        "previous": null,
        "results": [
            {
                "id": 1,
                "name": "Wooden Chair",
                "category": "furniture"
            }
        ]
    }
}
```

## User Endpoints

### POST /api/users/register/

**Description:** Register a new user account with phone number and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number (e.g., +989123456789 or 09123456789), must be unique
- `password`: Must meet Django's password validation requirements (min 8 chars, not too common, etc.)
- `name`: Optional, user's display name

**Response (201 Created):**
```json
{
  "success": true,
  "message": "عملیات موفقیت آمیز بود",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": 1,
      "phone_number": "+989123456789",
      "name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Errors:**
- `400`: Validation failed
    - Phone number already registered
    - Password doesn't meet requirements
    - Invalid Iranian phone number format

---

### POST /api/users/login/

**Description:** Authenticate user with phone number and password. If the user is not found in the current PostgreSQL database, the system will automatically check the old MariaDB database. If found in MariaDB with correct credentials, the user will be automatically migrated to PostgreSQL and logged in.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "عملیات موفقیت آمیز بود",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": 1,
      "phone_number": "+989123456789",
      "name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Migration Behavior:**
- If user is not found in PostgreSQL, the system checks the old MariaDB database
- If user exists in MariaDB with correct password, they are automatically migrated to PostgreSQL
- User data (phone_number, name) is migrated from the old database
- Password is re-hashed using the new system's hashing method
- User is immediately logged in after successful migration
- Subsequent logins will use the PostgreSQL database only

**Errors:**
- `400`: Invalid credentials
    - Invalid phone number or password
    - User account does not exist in either database
    - User account is inactive (PostgreSQL only)

---

### POST /api/users/otp/send/

**Description:** Send OTP (One-Time Password) code to phone number via SMS for authentication. Uses Kavenegar SMS provider. Rate limited to 3 requests per hour per phone number and 10 requests per hour per IP address.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "purpose": "login"
}
```

**Parameters:**
- `phone_number`: Iranian phone number (e.g., 09123456789 or +989123456789) - Required
- `purpose`: OTP purpose - Required, one of:
    - `login`: For user authentication (default)
    - `reset_password`: For password reset flow
    - `verify_phone`: For phone number verification

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number
- `purpose`: Must be one of the allowed values

**Response (201 Created):**
```json
{
  "success": true,
  "message": "کد تایید با موفقیت ارسال شد",
  "data": {
    "phone_number": "+989123456789",
    "expires_in_seconds": 180,
    "message": "کد تایید با موفقیت ارسال شد"
  }
}
```

**Security Features:**
- OTP expires in 3 minutes (180 seconds)
- 6-digit OTP code (NIST compliant)
- SHA256 hashing before storage
- Rate limiting: 3 sends per hour per phone, 10 sends per hour per IP
- OTP codes are never logged

**Errors:**
- `400`: Invalid phone number or validation error
    - Invalid Iranian phone number format
    - Missing required fields
- `429`: Rate limit exceeded
    - Message: "تعداد درخواست‌های شما از حد مجاز گذشته است. لطفا بعدا تلاش کنید"
    - Too many requests from this phone number or IP address
- `500`: SMS provider error
    - Message: "خطا در ارسال پیامک. لطفا بعدا تلاش کنید"
    - Kavenegar service unavailable

**Notes:**
- OTP is sent via Kavenegar SMS service
- OTP expires after 3 minutes
- Maximum 3 OTP requests per hour per phone number
- Maximum 10 OTP requests per hour per IP address
- Same endpoint used for login, password reset, and phone verification (specify via `purpose`)

---

### POST /api/users/otp/verify/

**Description:** Verify OTP code and authenticate user. If the user doesn't exist, a new account is automatically created (passwordless registration). Returns JWT access and refresh tokens on success.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "otp_code": "123456",
  "purpose": "login"
}
```

**Parameters:**
- `phone_number`: Iranian phone number - Required
- `otp_code`: 6-digit OTP code received via SMS - Required
- `purpose`: OTP purpose (must match the purpose used when sending OTP) - Required

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number
- `otp_code`: Must be exactly 6 digits
- `purpose`: Must match the purpose used in send OTP request

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ورود با موفقیت انجام شد",
  "data": {
    "user": {
      "id": 1,
      "phone_number": "+989123456789",
      "name": "",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

**Security Features:**
- Maximum 5 verification attempts per OTP
- Constant-time comparison (prevents timing attacks)
- Automatic OTP invalidation after successful verification
- Account lockout after max attempts exceeded
- Auto-registration for new users (passwordless)

**Errors:**
- `400`: Invalid OTP or validation error
    - Message: "کد تایید نامعتبر است. X تلاش باقی مانده"
    - Invalid OTP code (shows remaining attempts)
    - Message: "تعداد تلاش‌های شما از حد مجاز گذشته است"
    - Maximum attempts (5) exceeded
- `410`: OTP expired (Gone)
    - Message: "کد تایید منقضی شده است. لطفا کد جدید درخواست کنید"
    - OTP has expired (> 3 minutes old)
- `500`: System error

**Notes:**
- Automatically creates user account if phone number doesn't exist (passwordless registration)
- OTP is invalidated after successful verification
- Maximum 5 verification attempts before OTP is invalidated
- Returns JWT tokens with 30-minute access token and 7-day refresh token
- User can update their name later via profile endpoint

---

### POST /api/users/otp/resend/

**Description:** Resend OTP code to phone number. Subject to the same rate limiting as send OTP endpoint.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "purpose": "login"
}
```

**Parameters:**
- `phone_number`: Iranian phone number - Required
- `purpose`: OTP purpose - Required (same as send OTP)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "کد تایید مجددا ارسال شد",
  "data": {
    "phone_number": "+989123456789",
    "expires_in_seconds": 180,
    "message": "کد تایید با موفقیت ارسال شد"
  }
}
```

**Errors:**
- `400`: Invalid phone number or validation error
- `429`: Rate limit exceeded (same limits as send OTP)
- `500`: SMS provider error

**Notes:**
- Generates a new OTP code (previous OTP is invalidated)
- Subject to same rate limiting as send OTP (3 per hour per phone)
- New OTP expires in 3 minutes
- Resets verification attempt counter

---

### POST /api/users/password/reset/

**Description:** Reset user password using OTP verification. User must first request OTP with purpose='reset_password', then verify OTP and set new password in this request.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "otp_code": "123456",
  "new_password": "NewSecurePassword123!",
  "confirm_password": "NewSecurePassword123!"
}
```

**Parameters:**
- `phone_number`: Iranian phone number - Required
- `otp_code`: 6-digit OTP code - Required
- `new_password`: New password (min 8 characters) - Required
- `confirm_password`: Password confirmation - Required

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number
- `otp_code`: Must be exactly 6 digits
- `new_password`: Must meet Django's password validation requirements (min 8 chars, not too common, etc.)
- `confirm_password`: Must match new_password
- User must exist in the database

**Response (200 OK):**
```json
{
  "success": true,
  "message": "رمز عبور با موفقیت تغییر یافت",
  "data": {}
}
```

**Password Reset Flow:**
1. User requests OTP with purpose='reset_password': `POST /api/users/otp/send/`
2. User receives 6-digit OTP via SMS
3. User verifies OTP and sets new password: `POST /api/users/password/reset/`
4. Password is updated, user can login with new password

**Errors:**
- `400`: Invalid OTP, password mismatch, or validation error
    - Message: "کد تایید نامعتبر است"
    - Invalid OTP code
    - Message: "رمزهای عبور مطابقت ندارند"
    - Passwords don't match
    - Password doesn't meet requirements
- `404`: User not found
    - Message: "کاربری با این شماره تلفن یافت نشد"
    - No account exists with this phone number
- `410`: OTP expired
    - Message: "کد تایید منقضی شده است"
    - OTP has expired

**Security Features:**
- Requires valid OTP verification before password reset
- OTP invalidated after use
- Password strength validation
- Maximum 5 OTP verification attempts
- User must exist (cannot create account via password reset)

**Notes:**
- User account must already exist
- OTP purpose must be 'reset_password' when requesting OTP
- After password reset, user should login with new password
- Old password is completely replaced
- All existing sessions remain valid (tokens not invalidated)

---

### GET /api/users/profile/

**Description:** Retrieve the authenticated user's profile information.

**Authentication:** Required (User JWT)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "phone_number": "+989123456789",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Authentication required

---

### PUT /api/users/profile/

**Description:** Update the authenticated user's profile (name only).

**Authentication:** Required (User JWT)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "phone_number": "+989123456789",
    "name": "Jane Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
  }
}
```

**Errors:**
- `400`: Invalid input data
- `401`: Authentication required

---

### POST /api/users/logout/

**Description:** Logout user by blacklisting refresh token. Can optionally logout from all devices.

**Authentication:** Required (User JWT)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "all_devices": false
}
```

**Parameters:**
- `refresh_token`: Required, the refresh token to blacklist
- `all_devices`: Optional (default: false), set to true to logout from all devices

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

**Errors:**
- `400`: Invalid or expired refresh token (note: if token is already blacklisted, logout is still considered successful)
- `401`: Authentication required

---

### POST /api/users/refresh/

**Description:** Obtain a new access token using refresh token.

**Authentication:** Not required (uses refresh token)

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors:**
- `401`: Invalid or expired refresh token

---

### GET /api/users/gallery/

**Description:** Retrieve all processed images for the authenticated user.

**Authentication:** Required (User JWT)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Wooden Chair",
      "product_category": "furniture",
      "customer_image_path": "processed/customer/abc123-customer.jpg",
      "result_image_path": "processed/results/abc123-result.jpg",
      "score": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "claimed_at": null
    }
  ]
}
```

**Notes:**
- `customer_image_path` and `result_image_path` are MinIO object paths
- Use `/api/images/{customer_image_path}` and `/api/images/{result_image_path}` endpoints to retrieve images
- `score`: 1=Good, 2=Neutral, 3=Bad, null=Not voted yet
- `claimed_at`: Timestamp when reward was claimed (if applicable)

**Errors:**
- `401`: Authentication required

---

## Shop Endpoints

### POST /api/shops/otp/phone-verify/send/

**Description:** Send OTP code to phone number for shop registration verification. Phone number must not be already registered.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789"
}
```

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number, must not be already registered as a shop

**Response (201 Created):**
```json
{
  "success": true,
  "message": "کد تایید با موفقیت ارسال شد",
  "data": {
    "phone_number": "+989123456789",
    "expires_in_seconds": 180,
    "message": "کد تایید با موفقیت ارسال شد"
  }
}
```

**Security Features:**
- OTP expires in 3 minutes (180 seconds)
- 6-digit OTP code
- Rate limiting: 3 requests per hour per phone number, 10 requests per hour per IP
- Phone number validation (Iranian format only)
- Duplicate registration prevention

**Errors:**
- `400`: Invalid phone number format or already registered
    - Message: "این شماره تلفن قبلاً ثبت نام کرده است" (already registered)
    - Message: "Invalid Iranian phone number format"
- `429`: Rate limit exceeded
- `500`: SMS provider error

**Notes:**
- OTP purpose: 'phone_verification'
- Frontend should call this endpoint first, then verify OTP before registration
- OTP codes are sent via Kavenegar SMS service

---

### POST /api/shops/otp/phone-verify/verify/

**Description:** Verify OTP code and mark phone number as verified for registration. Stores verification status in Redis cache for 10 minutes.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "otp_code": "123456"
}
```

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number
- `otp_code`: Must be exactly 6 digits

**Response (200 OK):**
```json
{
  "success": true,
  "message": "شماره تلفن تایید شد",
  "data": {
    "phone_number": "+989123456789",
    "verified": true
  }
}
```

**Security Features:**
- Maximum 5 verification attempts per OTP
- Constant-time comparison (prevents timing attacks)
- Automatic OTP invalidation after successful verification
- Verification status cached in Redis (10-minute TTL)
- One-time use (deleted after registration)

**Errors:**
- `400`: Invalid OTP code
    - Message: "کد تایید نامعتبر است. X تلاش باقی مانده" (shows remaining attempts)
    - Message: "تعداد تلاش‌های شما از حد مجاز گذشته است" (max attempts exceeded)
- `410`: OTP expired
    - Message: "کد تایید منقضی شده است. لطفا کد جدید درخواست کنید"
- `429`: Rate limit exceeded

**Notes:**
- OTP purpose must match: 'phone_verification'
- Successful verification stores flag in Redis: `shop_phone_verified:{normalized_phone}`
- Frontend can proceed with registration after successful verification
- Verification expires after 10 minutes

---

### POST /api/shops/otp/password-reset/send/

**Description:** Send OTP code to phone number for password reset. Only works if a shop account exists with this phone number.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789"
}
```

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number
- Shop account must exist with this phone number

**Response (201 Created):**
```json
{
  "success": true,
  "message": "کد تایید با موفقیت ارسال شد",
  "data": {
    "phone_number": "+989123456789",
    "expires_in_seconds": 180,
    "message": "کد تایید با موفقیت ارسال شد"
  }
}
```

**Security Features:**
- Only sends OTP if shop account exists (prevents account enumeration)
- OTP expires in 3 minutes (180 seconds)
- Rate limiting: 3 requests per hour per phone number, 10 requests per hour per IP

**Errors:**
- `400`: Invalid phone number or shop not found
    - Message: "فروشگاهی با این شماره تلفن یافت نشد" (shop not found)
- `429`: Rate limit exceeded
- `500`: SMS provider error

**Notes:**
- OTP purpose: 'password_reset'
- Only existing shops can request password reset
- OTP codes are sent via Kavenegar SMS service

---

### POST /api/shops/password/reset/

**Description:** Reset shop password using OTP verification. Shop account must exist and OTP must be valid.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "09123456789",
  "otp_code": "123456",
  "new_password": "NewSecurePassword123!",
  "confirm_password": "NewSecurePassword123!"
}
```

**Validation Rules:**
- `phone_number`: Must be a valid Iranian phone number, shop must exist
- `otp_code`: Must be exactly 6 digits
- `new_password`: Must meet Django password requirements (min 8 chars, not common, etc.)
- `confirm_password`: Must match new_password

**Response (200 OK):**
```json
{
  "success": true,
  "message": "رمز عبور با موفقیت تغییر یافت",
  "data": {}
}
```

**Security Features:**
- OTP must be for 'password_reset' purpose
- Password strength validation
- Maximum 5 OTP verification attempts
- Constant-time OTP comparison
- Passwords are hashed before storage

**Errors:**
- `400`: Invalid OTP, password mismatch, or validation error
    - Message: "کد تایید نامعتبر است" (invalid OTP)
    - Message: "رمزهای عبور مطابقت ندارند" (passwords don't match)
    - Password validation errors
- `404`: Shop not found
    - Message: "فروشگاه مورد نظر یافت نشد"
- `410`: OTP expired
    - Message: "کد تایید منقضی شده است"
- `429`: Rate limit exceeded

**Notes:**
- OTP is invalidated after successful password reset
- Old password is completely replaced
- Existing sessions remain valid (tokens not invalidated)
- Shop must exist before password reset

---

### POST /api/shops/register/

**Description:** Register a new shop account. Phone number must be verified via OTP before registration.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "shop1",
  "password": "SecurePassword123!",
  "shop_name": "My Furniture Store",
  "shop_website_link": "https://shop.example.com",
  "phone_number": "09123456789"
}
```

**Validation Rules:**
- `username`: Unique, max 100 characters
- `password`: Must meet Django password requirements
- `shop_name`: Required, max 255 characters
- `shop_website_link`: Optional URL
- `phone_number`: Must be verified via OTP within last 10 minutes

**Response (201 Created):**
```json
{
  "success": true,
  "message": "فروشگاه با موفقیت ایجاد شد",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "shop": {
      "id": 1,
      "username": "shop1",
      "shop_name": "My Furniture Store",
      "role": "shop",
      "link": "https://shop.example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "is_active": true,
      "phone_number": "+989123456789",
      "try_on_credits": 100
    }
  }
}
```

**Security Features:**
- Phone verification required before registration
- Phone verification check (Redis cache, 10-minute TTL)
- One-time verification use (deleted after registration)
- Username uniqueness validation
- Password strength requirements

**Registration Flow:**
1. User enters phone number
2. Frontend calls `POST /api/shops/otp/phone-verify/send/` to get OTP
3. User receives SMS with OTP code
4. Frontend calls `POST /api/shops/otp/phone-verify/verify/` to verify OTP
5. If verification successful, frontend can proceed with registration
6. Frontend calls `POST /api/shops/register/` with all required data
7. Backend validates phone verification before creating account

**Errors:**
- `400`: Invalid input data or phone not verified
    - Message: "شماره تلفن تایید نشده است. لطفا ابتدا کد تایید دریافت کرده و آن را تایید کنید"
    - Validation errors for username, password, etc.

**Notes:**
- Phone verification is required and must be done within 10 minutes
- Verification flag is deleted after successful registration (one-time use)
- Returns JWT tokens immediately after registration
- Default credits: 100 try-on credits

---

### GET /api/shops/list/

**Description:** Retrieve a paginated list of active shops with search functionality. This endpoint is used for the shop selection page (root view).

**Authentication:** Not required (public endpoint)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `page_size` | integer | 20 | Number of items per page (max: 100) |
| `search` | string | - | Search term for shop_name or username (case-insensitive) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 45,
    "next": "http://localhost:8000/api/shops/list/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "shop_name": "فروشگاه مبلمان مدرن",
        "username": "modern_furniture",
        "logo_url": null,
        "product_count": 25,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "shop_name": "فروشگاه دکوراسیون",
        "username": "decor_shop",
        "logo_url": null,
        "product_count": 12,
        "created_at": "2024-01-14T09:15:00Z"
      }
    ]
  }
}
```

**Response Fields:**
- `count`: Total number of shops matching the query
- `next`: URL to next page (null if no more pages)
- `previous`: URL to previous page (null if on first page)
- `results`: Array of shop objects:
    - `id`: Shop ID
    - `shop_name`: Display name of the shop (Persian)
    - `username`: URL-friendly username/slug
    - `logo_url`: URL to shop logo (null if not set, reserved for future use)
    - `product_count`: Number of active (non-deleted) products in the shop
    - `created_at`: ISO timestamp when shop was created

**Example Requests:**

```bash
# Get first page of all shops
GET /api/shops/list/

# Search for shops
GET /api/shops/list/?search=مبلمان

# Get second page with 10 items
GET /api/shops/list/?page=2&page_size=10
```

**Notes:**
- Returns only active shops (is_active=true, deleted_at=null)
- Ordered by creation date (newest first)
- Search is case-insensitive and matches both shop_name and username
- Product count only includes non-deleted products
- Logo URL is currently null (reserved for future shop logo support)

---

### POST /api/shops/login/

**Description:** Authenticate shop with phone number and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone_number": "+989123456789",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "shop": {
      "id": 1,
      "username": "shop1",
      "phone_number": "+989123456789",
      "shop_name": "Furniture Store",
      "role": "shop",
      "link": "",
      "created_at": "2024-01-15T10:30:00Z",
      "try_on_credits": 100
    }
  }
}
```

**Response Fields:**
- `access_token`: JWT access token for authentication
- `token_type`: Token type (always "bearer")
- `shop`: Shop information object
    - `try_on_credits`: Current available credits for try-on processing

**Errors:**
- `400`: Invalid credentials
    - Invalid phone number or password
    - Shop account does not exist

**Notes:**
- Shop login includes current credit balance in response
- Credits are consumed when users process try-on images with shop's products
- Both access token and refresh token are returned on successful login

---

### POST /api/shops/refresh/

**Description:** Refresh shop JWT access token using a refresh token obtained from login. The refresh token is long-lived and can be used multiple times to obtain new access tokens.

**Authentication:** Not required

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer"
  }
}
```

**Response Fields:**
- `access_token`: New JWT access token for authentication (replaces expired token)
- `token_type`: Token type (always "bearer")

**Errors:**
- `400`: Invalid or expired refresh token
    - Refresh token is malformed
    - Refresh token has expired
    - Associated shop account no longer exists or is inactive

**Notes:**
- Refresh token does not expire (or has a very long expiry)
- You can call this endpoint multiple times with the same refresh token
- Refresh token can be stored securely on client side (e.g., in httpOnly cookies)
- Use the new access token for subsequent API requests
- If refresh fails, user must log in again to get new tokens

---

### GET /api/shops/settings/

**Description:** Get current shop settings including basic information, shareable shop link, and registration date in Persian calendar.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop settings retrieved successfully",
  "data": {
    "username": "furniture_shop_123",
    "shop_name": "Modern Furniture Store",
    "phone_number": "+989123456789",
    "shop_link": "https://example.com/Modern Furniture Store/",
    "shop_website_link": "https://shop.example.com",
    "registered_since": "1403/09/15",
    "registered_since_display": "15 آذر 1403"
  }
}
```

**Response Fields:**
- `username` - Shop username
- `shop_name` - Shop display name
- `phone_number` - Phone number in +98 format
- `shop_link` - **READ-ONLY** shareable shop link (format: `https://{FRONTEND_BASE_URL}/{shop_name}/`)
- `shop_website_link` - Optional shop website URL (can be null)
- `registered_since` - Registration date in Persian calendar (YYYY/MM/DD format)
- `registered_since_display` - Human-readable Persian date (e.g., "15 آذر 1403")

**Errors:**
- `401`: Authentication required

**Notes:**
- `shop_link` is automatically generated and read-only - used for sharing shop's product catalog
- Persian dates are automatically converted from Gregorian calendar
- All fields are current values from database

---

### PUT /api/shops/settings/

**Description:** Update shop settings including basic information and optional password change.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "username": "new_username",
  "shop_name": "Updated Shop Name",
  "phone_number": "09123456789",
  "shop_website_link": "https://new-website.com",
  "old_password": "CurrentPass123!",
  "new_password": "NewSecurePass456!",
  "confirm_password": "NewSecurePass456!"
}
```

**Request Fields:**
- `username` (optional) - New username (must be unique)
- `shop_name` (optional) - New shop display name
- `phone_number` (optional) - New phone number in Iranian format (must be unique)
- `shop_website_link` (optional) - New website URL (can be null/empty to remove)

**Password Change (optional):**
- `old_password` (required if changing password) - Current password for verification
- `new_password` (required if changing password) - New password (min 8 characters)
- `confirm_password` (required if changing password) - Must match new_password

**Validation Rules:**
1. At least one field must be provided
2. If changing password, all 3 password fields (old_password, new_password, confirm_password) are required
3. Old password must be correct
4. New password must pass Django validation (min 8 chars, not too common, etc.)
5. New password and confirm_password must match
6. Username must be unique (if changed)
7. Phone number must be unique and in Iranian format (if changed)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تنظیمات فروشگاه با موفقیت به‌روزرسانی شد",
  "data": {
    "username": "new_username",
    "shop_name": "Updated Shop Name",
    "phone_number": "+989123456789",
    "shop_link": "https://example.com/Updated Shop Name/",
    "shop_website_link": "https://new-website.com",
    "registered_since": "1403/09/15",
    "registered_since_display": "15 آذر 1403"
  }
}
```

**Example Requests:**

```bash
# Update only shop name
curl -X PUT http://localhost:8000/api/shops/settings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"shop_name": "New Shop Name"}'

# Update shop name and phone number
curl -X PUT http://localhost:8000/api/shops/settings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_name": "New Shop Name",
    "phone_number": "09123456789"
  }'

# Update with password change
curl -X PUT http://localhost:8000/api/shops/settings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_name": "New Shop Name",
    "old_password": "CurrentPass123!",
    "new_password": "NewSecurePass456!",
    "confirm_password": "NewSecurePass456!"
  }'
```

**Errors:**
- `400`: Validation errors
    - "حداقل یک فیلد برای به‌روزرسانی باید ارسال شود" (No fields provided)
    - "رمز عبور فعلی اشتباه است" (Incorrect current password)
    - "رمز عبور جدید و تکرار آن مطابقت ندارند" (Password mismatch)
    - "این نام کاربری قبلا استفاده شده است" (Username already taken)
    - "این شماره تلفن قبلا استفاده شده است" (Phone number already taken)
    - "فرمت شماره تلفن اشتباه است" (Invalid phone format)
    - "برای تغییر رمز عبور، باید رمز عبور فعلی، رمز عبور جدید و تکرار آن را وارد کنید" (Incomplete password fields)
    - Django password validation errors (too short, too common, etc.)
- `401`: Authentication required

**Notes:**
- Password change requires old password for security
- Username and phone number uniqueness checked excluding current shop
- `shop_link` automatically updates when `shop_name` changes
- Password fields are write-only and never returned in responses
- Partial updates supported - only provided fields are updated
- Phone number automatically normalized to +98 format

---

### POST /api/shops/products/

**Description:** Upload a new product with image to MinIO storage.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `name`: Product name (required)
- `description`: Product description (optional)
- `category`: Product category (required)
- `price`: Product price in Rials (required, >= 0)
- `image`: Product image file (required, max 10MB, JPEG/PNG/WebP)
- `link`: Product purchase URL (optional) - If not provided, falls back to shop's link
- `extra_details`: JSON object with product features (optional) - Key-value pairs like `{"اندازه": "3x4", "جنس": "چوبی"}`

**Validation Rules:**
- Image size: Max 10MB
- Image types: JPEG, PNG, WebP only
- Price: Must be >= 0

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "shop_id": 1,
    "name": "Wooden Chair",
    "description": "Comfortable wooden chair for dining",
    "category": "furniture",
    "price": 1500000,
    "image_path": "products/2024/01/15/abc123.jpg",
    "image_url": "https://storage.example.com/...",
    "unique_link": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "link": "https://shop.example.com/product/123",
    "extra_details": {
      "اندازه": "3x4",
      "جنس بدنه": "چوبی"
    }
  }
}
```

**Errors:**
- `400`: Invalid input data
    - Image too large (> 10MB)
    - Invalid image type
    - Invalid price value
- `401`: Authentication required
- `500`: Failed to upload image to storage

---

### GET /api/shops/products/list/

**Description:** List all products for authenticated shop with pagination and search. Returns simplified product data (image_url, name, total_views, price) optimized for dashboard display.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 20, max: 100)
- `search`: Search term for product name, description, or category (optional)
- `category`: Filter by exact category (optional, case-insensitive)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 50,
    "next": "http://localhost:8000/api/shops/products/list/?page=2",
    "previous": null,
    "results": [
      {
        "image_url": "http://localhost:8000/api/products/images/products/2024/01/15/abc123.jpg",
        "name": "Wooden Chair",
        "total_views": 145,
        "price": 1500000
      },
      {
        "image_url": "http://localhost:8000/api/products/images/products/2024/01/16/def456.jpg",
        "name": "Modern Sofa",
        "total_views": 89,
        "price": 5500000
      }
    ]
  }
}
```

**Example Requests:**
```bash
# Get first page with default settings
GET /api/shops/products/list/

# Get page 2 with 50 items per page
GET /api/shops/products/list/?page=2&page_size=50

# Search for products containing "chair"
GET /api/shops/products/list/?search=chair

# Filter by category
GET /api/shops/products/list/?category=furniture

# Combined: search, filter, and paginate
GET /api/shops/products/list/?search=wood&category=furniture&page=1&page_size=10
```

**Notes:**
- Only returns products belonging to the authenticated shop
- Automatically excludes soft-deleted products
- Search is case-insensitive
- Results ordered by created_at (newest first)
- `total_views` counts all product page visits (tracked via ProductVisit model)
- Response format simplified for dashboard display (only 4 fields)
- For detailed product info, use `GET /api/shops/products/{unique_link}/`

**Errors:**
- `401`: Authentication required

---

### GET /api/shops/products/{unique_link}/

**Description:** Get detailed information about a product belonging to authenticated shop. Includes shareable frontend link for customer access.

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `unique_link`: Product unique link (UUID, e.g., "550e8400-e29b-41d4-a716-446655440000")

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Wooden Chair",
    "description": "Comfortable wooden chair for dining",
    "category": 1,
    "category_display": "FURNITURE",
    "price": 1500000,
    "image_url": "http://localhost:8000/api/products/images/products/2024/01/15/abc123.jpg",
    "unique_link": "550e8400-e29b-41d4-a716-446655440000",
    "link": "https://shop.example.com/product/123",
    "extra_details": {
      "اندازه": "3x4",
      "جنس بدنه": "چوبی"
    },
    "total_views": 145,
    "frontend_link": "https://example.com/MyShop/550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:22:00Z",
    "is_active": true
  }
}
```

**Example Request:**
```bash
GET /api/shops/products/550e8400-e29b-41d4-a716-446655440000/
Authorization: Bearer <shop_access_token>
```

**Frontend Link Format:**
The `frontend_link` field provides a shareable URL for customers in the format:
```
https://{FRONTEND_BASE_URL}/{shop_name}/{unique_link}
```

Example: `https://example.com/MyFurnitureShop/550e8400-e29b-41d4-a716-446655440000`

**Notes:**
- Only shop owner can access their product details
- `frontend_link` is dynamically generated using `FRONTEND_BASE_URL` from settings
- Shop owners can copy and share this link with customers
- `total_views` includes all historical views (even from deleted products via denormalized data)
- Use this endpoint to get full product details including the shareable link

**Errors:**
- `401`: Authentication required
- `403`: Product does not belong to authenticated shop - "شما مجاز به دسترسی به این محصول نیستید"
- `404`: Product not found - "محصول مورد نظر یافت نشد"

---

### PUT /api/shops/products/edit/{product_id}/

**Description:** Update product details for a product owned by authenticated shop. Optionally update product image.

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `product_id`: ID of the product to update

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `name`: Product name (required, max 255 characters)
- `description`: Product description (required)
- `category`: Product category (required, max 100 characters)
- `price`: Product price in Rials (required, >= 0)
- `image`: Product image file (optional, JPEG/PNG/WebP, max 10MB)
- `link`: Product purchase URL (optional)
- `extra_details`: JSON object with product features (optional)

**Validation Rules:**
- `name`: String (max 255 characters)
- `description`: String
- `category`: String (max 100 characters)
- `price`: Integer (must be >= 0, in Rials)
- `image`: Optional - if provided, must be JPEG, PNG, or WebP (max 10MB)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "shop_id": 1,
    "name": "Updated Product Name",
    "description": "Updated description",
    "category": "updated_category",
    "price": 2000000,
    "image_path": "products/2024/01/15/xyz789.jpg",
    "image_url": "https://storage.example.com/...",
    "unique_link": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "link": "https://shop.example.com/product/123",
    "extra_details": {
      "اندازه": "4x5",
      "جنس بدنه": "فلزی"
    }
  }
}
```

**Errors:**
- `400`: Invalid input data - "مشکل در اطلاعات ورودی"
    - Image too large (> 10MB)
    - Invalid image type
- `401`: Authentication required
- `404`: Product not found - "محصول مورد نظر یافت نشد"
- `500`: Failed to upload image

**Notes:**
- Shop can only edit their own products
- Image is optional - if not provided, existing image is kept
- If new image is provided, it replaces the old one
- Soft-deleted products cannot be edited
- Image URL is presigned with 1-hour expiration

**Example Requests:**
```bash
# Update all fields including image
curl -X PUT /api/shops/products/edit/1/ \
  -H "Authorization: Bearer <token>" \
  -F "name=New Chair" \
  -F "description=Updated description" \
  -F "category=furniture" \
  -F "price=2000000" \
  -F "image=@/path/to/image.jpg"

# Update only text fields (keep existing image)
curl -X PUT /api/shops/products/edit/1/ \
  -H "Authorization: Bearer <token>" \
  -F "name=New Chair" \
  -F "description=Updated description" \
  -F "category=furniture" \
  -F "price=2000000"
```

---

### DELETE /api/shops/products/delete/{product_id}/

**Description:** Soft delete a product owned by authenticated shop. The product is marked as deleted but not removed from database.

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `product_id`: ID of the product to delete

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "محصول مورد نظر با موفقیت حذف شد",
  "data": {}
}
```

**Errors:**
- `401`: Authentication required
- `404`: Product not found - "محصول مورد نظر یافت نشد"

**Notes:**
- This is a soft delete - product is marked as deleted but kept in database
- Soft-deleted products will not appear in product lists
- Shop can only delete their own products
- Already deleted products cannot be deleted again

---

### GET /api/shops/credits/

**Description:** View current credit balance and usage statistics for authenticated shop.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "current_credits": 100,
    "total_credits_used": 50,
    "total_credits_added": 150,
    "shop_name": "Furniture Store",
    "shop_id": 1
  }
}
```

**Response Fields:**
- `current_credits`: Current available credits for try-on processing
- `total_credits_used`: Total number of credits consumed (lifetime)
- `total_credits_added`: Total number of credits added to account (lifetime)
- `shop_name`: Name of the shop
- `shop_id`: Shop ID

**Errors:**
- `401`: Authentication required

**Notes:**
- Credits are consumed when users process try-on images with shop's products
- Each successful try-on processing consumes 1 credit
- Credits are automatically refunded if AI processing fails

---

### GET /api/shops/credits/history/

**Description:** View paginated credit transaction history for authenticated shop with optional filtering.

**Authentication:** Required (Shop JWT)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 20, max: 100)
- `transaction_type`: Filter by type (optional): `ADMIN_ADD`, `ADMIN_REMOVE`, `TRY_ON_DEDUCT`, `TRY_ON_REFUND`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 50,
    "next": "http://localhost:8000/api/shops/credits/history/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "amount": -1,
        "transaction_type": "TRY_ON_DEDUCT",
        "transaction_type_display": "Try-On Deduction",
        "reason": "Try-on image processing",
        "balance_after": 99,
        "created_at": "2025-01-17T12:00:00Z",
        "performed_by_username": null,
        "related_processed_image_id": 123
      },
      {
        "id": 2,
        "amount": 100,
        "transaction_type": "ADMIN_ADD",
        "transaction_type_display": "Admin Addition",
        "reason": "Monthly credit allocation",
        "balance_after": 100,
        "created_at": "2025-01-17T10:00:00Z",
        "performed_by_username": "admin_user",
        "related_processed_image_id": null
      }
    ]
  }
}
```

**Transaction Types:**
- `ADMIN_ADD`: Credits added by admin (positive amount)
- `ADMIN_REMOVE`: Credits removed by admin (negative amount)
- `TRY_ON_DEDUCT`: Credit consumed for try-on processing (negative amount)
- `TRY_ON_REFUND`: Credit refunded due to processing failure (positive amount)

**Errors:**
- `401`: Authentication required

**Example Requests:**
```bash
# Get first page
GET /api/shops/credits/history/

# Get page 2 with 50 items
GET /api/shops/credits/history/?page=2&page_size=50

# Filter by transaction type
GET /api/shops/credits/history/?transaction_type=TRY_ON_DEDUCT
```

**Notes:**
- Results ordered by created_at (newest first)
- Full audit trail with transaction reasons and admin information
- Links to related processed images when available

---

### POST /api/shops/admin/credits/add/

**Description:** Add credits to a shop's balance (admin only).

**Authentication:** Required (Admin Shop JWT)

**Request Headers:**
```
Authorization: Bearer <admin_shop_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shop_id": 1,
  "amount": 100,
  "reason": "Monthly credit allocation"
}
```

**Request Fields:**
- `shop_id`: ID of target shop (required)
- `amount`: Number of credits to add (required, must be positive integer)
- `reason`: Reason for adding credits (optional, for audit trail)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credits added successfully",
  "data": {
    "shop_id": 1,
    "shop_name": "Furniture Store",
    "credits_added": 100,
    "new_balance": 150,
    "transaction_id": 456
  }
}
```

**Errors:**
- `400`: Invalid input data
    - Amount must be positive
    - Shop does not exist
- `401`: Authentication required
- `403`: Admin permission required (only admin shops can add credits)
- `404`: Target shop not found

**Notes:**
- Only shops with `role='admin'` can use this endpoint
- Creates audit trail entry with admin username and reason
- Operation is atomic and thread-safe
- Both shops must have active accounts

---

### POST /api/shops/admin/credits/remove/

**Description:** Remove credits from a shop's balance (admin only).

**Authentication:** Required (Admin Shop JWT)

**Request Headers:**
```
Authorization: Bearer <admin_shop_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shop_id": 1,
  "amount": 50,
  "reason": "Credit adjustment"
}
```

**Request Fields:**
- `shop_id`: ID of target shop (required)
- `amount`: Number of credits to remove (required, must be positive integer)
- `reason`: Reason for removing credits (optional, for audit trail)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credits removed successfully",
  "data": {
    "shop_id": 1,
    "shop_name": "Furniture Store",
    "credits_removed": 50,
    "new_balance": 100,
    "transaction_id": 457
  }
}
```

**Errors:**
- `400`: Invalid input data
    - Amount must be positive
    - Shop does not have enough credits
    - Shop does not exist
- `401`: Authentication required
- `403`: Admin permission required (only admin shops can remove credits)
- `404`: Target shop not found

**Notes:**
- Only shops with `role='admin'` can use this endpoint
- Cannot remove more credits than shop currently has
- Creates audit trail entry with admin username and reason
- Operation is atomic and thread-safe

---

### GET /api/shops/dashboard/

Get comprehensive dashboard summary for the authenticated shop.

**Authentication:** Required (Shop JWT Token)

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "visits": {
      "today": 45,
      "this_week": 312,
      "this_month": 1203
    },
    "ai_generations": {
      "today": 12,
      "this_week": 89,
      "this_month": 387
    },
    "last_7_days": [
      {
        "day": "شنبه",
        "date": "1403/09/03",
        "visits": 23,
        "ai_generations": 5
      },
      {
        "day": "یکشنبه",
        "date": "1403/09/04",
        "visits": 45,
        "ai_generations": 12
      },
      {
        "day": "دوشنبه",
        "date": "1403/09/05",
        "visits": 67,
        "ai_generations": 18
      }
    ],
    "credits": {
      "remaining": 500,
      "total_used": 1500,
      "total_added": 2000
    }
  }
}
```

**Errors:**
- `401`: Authentication required (invalid or missing JWT token)

**Notes:**
- Visit counts include all historical visits, even for deleted products (using denormalized data)
- AI generation counts only include active (non-deleted) products
- `this_week` and `this_month` represent the last 7 and 30 days respectively
- Persian dates are in Solar Hijri calendar format (YYYY/MM/DD)
- Persian day names follow the Iranian week (Saturday = شنبه is the first day)
- Chart data is ordered chronologically from oldest to newest (7 days ago → today)

---

### GET /api/shops/products/analytics/

Get detailed analytics for each product with pagination.

**Authentication:** Required (Shop JWT Token)

**Query Parameters:**
- `period` (string, optional): Time period for filtering
    - Values: `today`, `week`, `month`, `all`
    - Default: `all`
- `ordering` (string, optional): Sort field
    - Values: `-views_total`, `-ai_total`, `name`, `views_total`, `ai_total`, `-name`
    - Default: `-views_total`
    - Prefix with `-` for descending order
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Product analytics retrieved successfully",
  "data": {
    "count": 45,
    "next": "http://localhost:8000/api/shops/products/analytics/?page=2",
    "previous": null,
    "results": [
      {
        "id": 123,
        "name": "صندلی راحتی",
        "category": 1,
        "category_display": "صندلی",
        "price": 5000000,
        "image_url": "http://localhost:8000/api/products/images/products/uuid.jpg",
        "views": {
          "today": 45,
          "total": 1203
        },
        "ai_generations": {
          "today": 12,
          "total": 387
        },
        "engagement_rate": 32.17,
        "created_at": "2024-01-15T10:30:00Z",
        "is_active": true
      },
      {
        "id": 124,
        "name": "میز ناهارخوری",
        "category": 2,
        "category_display": "میز",
        "price": 8000000,
        "image_url": "http://localhost:8000/api/products/images/products/uuid2.jpg",
        "views": {
          "today": 32,
          "total": 890
        },
        "ai_generations": {
          "today": 8,
          "total": 245
        },
        "engagement_rate": 27.53,
        "created_at": "2024-01-10T14:20:00Z",
        "is_active": true
      }
    ]
  }
}
```

**Errors:**
- `400`: Invalid query parameters
    - Invalid period value
    - Invalid ordering value
- `401`: Authentication required (invalid or missing JWT token)

**Notes:**
- Only returns active (non-deleted) products
- `engagement_rate` is calculated as: (ai_generations / views) × 100
- If a product has 0 views, engagement_rate will be 0.0
- Visit counts include all historical data (preserved even after product deletion via denormalized fields)
- Default ordering is by total views (highest first)
- Period filtering:
    - `today`: Only data from today
    - `week`: Last 7 days
    - `month`: Last 30 days
    - `all`: All time (no filtering)

---

## Product Endpoints (Public)

### GET /api/products/

**Description:** List all products available for AI processing with pagination, filtering, and sorting.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 20, max: 100)
- `search`: Search term for product name and description (case-insensitive, partial match)
- `category`: Filter by exact category (case-insensitive)
- `price_min`: Minimum price in Rials (inclusive)
- `price_max`: Maximum price in Rials (inclusive)
- `shop`: Filter by shop name (case-insensitive, exact match)
- `sort`: Sort order (default: newest)
    - `newest`: Newest products first (created_at descending)
    - `oldest`: Oldest products first (created_at ascending)
    - `price_asc`: Lowest price first
    - `price_desc`: Highest price first

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 50,
    "next": "http://localhost:8000/api/products/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Wooden Chair",
        "description": "Comfortable wooden chair for dining",
        "category": "furniture",
        "price": 1500000,
        "image_path": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
        "unique_link": "550e8400-e29b-41d4-a716-446655440000",
        "link": "https://shop.example.com/product/123",
        "extra_details": {
          "اندازه": "3x4",
          "جنس بدنه": "چوبی"
        }
      }
    ]
  }
}
```

**Example Requests:**
```bash
# Get first page with default settings (newest products)
GET /api/products/

# Get page 2 with 50 items per page
GET /api/products/?page=2&page_size=50

# Search for products containing "chair"
GET /api/products/?search=chair

# Filter by category
GET /api/products/?category=furniture

# Get products in a price range (1M to 5M Rials)
GET /api/products/?price_min=1000000&price_max=5000000

# Get cheapest products first
GET /api/products/?sort=price_asc

# Get most expensive products first
GET /api/products/?sort=price_desc

# Filter by shop name (Persian)
GET /api/products/?shop=فرش امیر کبیر

# Combined: search, filter by category, price range, and sort
GET /api/products/?search=chair&category=furniture&price_min=1000000&price_max=3000000&sort=price_asc&page=1&page_size=10
```

**Notes:**
- Results ordered by created_at (newest first) by default
- `image_path` is MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- Pagination metadata includes `count` (total items), `next` and `previous` links
- Search is case-insensitive and searches in product name and description
- Category filter is exact match but case-insensitive
- Shop filter uses `shop_name` field (e.g., "فرش امیر کبیر"), not username

---

### GET /api/products/{unique_link}/

**Description:** Retrieve detailed information about a product using its unique link.

**Authentication:** Not required (public endpoint)

**Path Parameters:**
- `unique_link`: Product's unique UUID link (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Wooden Chair",
    "description": "Comfortable wooden chair for dining",
    "category": "furniture",
    "price": 1500000,
    "image_path": "products/86ed88a1-3d16-4008-89a2-59fb755a3c34-Qali-shiraz-2-1.webp",
    "unique_link": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "link": "https://shop.example.com/product/123",
    "extra_details": {
      "اندازه": "3x4",
      "جنس بدنه": "چوبی",
      "رنگ": "قهوه‌ای"
    }
  }
}
```

**Example Request:**
```bash
GET /api/products/550e8400-e29b-41d4-a716-446655440000/
```

**Notes:**
- `image_path` is MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- Returns full product details including description and category
- Product must exist in the database to be retrieved
- **`link` field**: Product-specific purchase URL. If not set, falls back to shop's link. If shop's link is also not set, returns `null`. Frontend should hide the purchase button if `link` is `null`.
- **`extra_details` field**: JSON object containing key-value product features (e.g., size, material, color). Returns empty object `{}` if not set. Frontend should display these as bullet points in product details.

**Errors:**
- `404`: Product not found
    - Message: "Product not found"

---

### POST /api/products/{unique_link}/process/

**Description:** Upload customer's home photo and process it with AI to visualize product in their space. Uses OpenAI for prompt enhancement and Gemini for image generation.

**Authentication:** Required (User JWT)

**Rate Limit:** 5 requests per hour per user

**Path Parameters:**
- `unique_link`: Product's unique UUID link

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `customer_image`: Customer's home photo (required, JPEG/PNG, max 10MB)

**Processing Steps:**
1. Upload customer image to MinIO
2. Optimize customer image (resize to 1920x1080, JPEG quality 85)
3. Download product & customer images
4. Stage 1: OpenAI prompt enhancement
5. Stage 2: Gemini image generation
6. Upload result to MinIO
7. Delete customer image (cleanup)
8. Create ProcessedImage record
9. Return presigned URL

**Response (200 OK):**
```json
{
  "status": "success",
  "image_path": "processed/results/550e8400-e29b-41d4-a716-446655440000.jpg",
  "image_id": 1,
  "shop_credits_remaining": 99,
  "message": "Image processed successfully"
}
```

**Response Fields:**
- `image_path`: MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- `image_id`: ID of the processed image record
- `shop_credits_remaining`: Remaining credits for the shop that owns this product (after deduction)

**Notes:**
- `image_path` is MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- Image is automatically optimized to max 1920x1080 resolution
- EXIF data is stripped for privacy
- Customer upload image is deleted after processing for storage efficiency
- Result images are stored permanently in MinIO
- **Credit System**: Each successful processing consumes 1 credit from the product's shop
- Credits are deducted before processing begins
- If processing fails, credits are automatically refunded
- Processing will fail with 402 error if shop has insufficient credits
- Processed image records now persist `enhancement_prompt`, `enhancement_model`, `image_generation_prompt`, and `image_generation_model` for future inspection

**Errors:**
- `400`: Invalid image or processing failed
- `401`: Authentication required
- `402`: Payment Required - Insufficient credits
    - Message: "اعتبار کافی نیست. اعتبار فروشگاه: {credits}"
    - Shop has no credits remaining for try-on processing
- `404`: Product not found
- `429`: Rate limit exceeded (5 requests per hour)
- `500`: AI processing or storage error

---

### POST /api/products/vote/

**Description:** Submit a vote (rating) for a processed image. User must own the image.

**Authentication:** Required (User JWT)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image_id": 1,
  "vote": 1
}
```

**Parameters:**
- `image_id`: ID of the processed image (required)
- `vote`: Vote value (required): 1=Good, 2=Neutral, 3=Bad

**Response (200 OK):**
```json
{
  "status": "success",
  "image_id": 1,
  "score": 1,
  "message": "Vote recorded successfully"
}
```

**Errors:**
- `400`: Invalid vote value or user doesn't own the image
- `401`: Authentication required

**Notes:**
- User can only vote on their own processed images
- Vote can be changed by submitting a new vote for the same image

---

## Image Serving Endpoints

### GET /api/products/images/{object_path}

**Description:** Serve image files from MinIO storage with advanced caching and conditional GET support. This endpoint handles all image retrieval with optimized performance for both product and processed images.

**Authentication:**
- Product images (products/*): Not required (public)
- Processed images (processed/*): Required (User JWT)

**Path Parameters:**
- `object_path`: MinIO object path (e.g., `products/550e8400-e29b-41d4-a716-446655440000.jpg` or `processed/results/uuid-filename.jpg`)

**Access Control:**
- **Product images** (`products/*`): Publicly accessible without authentication
    - Any client can retrieve product images
    - Server verifies product exists in database before serving

- **Processed images** (`processed/*`): Requires user authentication and ownership verification
    - User must be authenticated with valid JWT token
    - User can only access images they own
    - Returns 403 Forbidden if user doesn't own the image

**Response (200 OK):**
```
Content-Type: image/jpeg (or image/png, image/webp, etc. based on file extension)
Content-Length: <file_size>
ETag: "md5_hash_of_content"
Last-Modified: HTTP_date_timestamp
Cache-Control: public/private, max-age=TTL, [stale-while-revalidate=60]

<binary_image_data>
```

**Caching Behavior:**
- **Product images**: Cached for 7 days with public cache control (allows CDN/browser caching)
- **Processed images**: Cached for 5 minutes with private cache control (user-specific)
- Supports conditional GET requests using ETags and Last-Modified headers
- Returns 304 Not Modified for valid client cache

**Conditional GET Support:**
- **If-None-Match**: Uses ETag for cache validation
- **If-Modified-Since**: Uses Last-Modified timestamp for cache validation
- Returns 304 Not Modified when client cache is still valid

**Example Requests:**
```bash
# Get a product image (no authentication needed)
GET /api/products/images/products/550e8400-e29b-41d4-a716-446655440000.jpg

# Get a processed image (authentication required)
GET /api/images/processed/results/abc123-def456.jpg
Authorization: Bearer <access_token>

# Conditional GET (client has cached version)
GET /api/products/images/products/550e8400-e29b-41d4-a716-446655440000.jpg
If-None-Match: "md5_hash_of_cached_content"
```

**Supported Content Types:**
- `image/jpeg` (.jpg, .jpeg) - Default
- `image/png` (.png)
- `image/webp` (.webp)
- `image/gif` (.gif)
- `image/svg+xml` (.svg)
- `image/bmp` (.bmp)

**Response Headers:**
- `ETag`: MD5 hash of image content for cache validation
- `Last-Modified`: Timestamp when image was served
- `Cache-Control`:
    - Product images: `public, max-age=604800, stale-while-revalidate=60`
    - Processed images: `private, max-age=300, must-revalidate`

**Errors:**
- `304`: Not Modified (conditional GET - client cache is valid)
- `401`: Authentication required (for processed images without valid token)
- `403`: Forbidden - image not owned by user (for processed images)
- `404`: Image not found (product or image does not exist)
- `500`: Server error

**Performance Features:**
- In-memory caching with Redis for frequently accessed images
- Conditional GET support reduces bandwidth usage
- Different cache policies for public vs private content
- Automatic content-type detection based on file extension
- ETag-based cache validation for optimal client-side caching

**Notes:**
- This endpoint streams the image file directly instead of generating presigned URLs
- Supports all image formats stored in MinIO
- Frontend should use this endpoint to retrieve images by passing the `image_path` value from API responses
- No rate limiting on image serving (but rate limiting may apply to AI processing endpoints)

---

## Admin Configuration Endpoints

These endpoints are for admin shops to manage AI prompt configurations.

### GET /api/admin/model-prompt/

**Description:** Retrieve the current Gemini image generation system prompt configuration.

**Authentication:** Required (Shop JWT with admin role)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "prompt_type": "model",
    "prompt": "Current Gemini system prompt text...",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Authentication required
- `403`: Admin permission required
- `404`: Prompt not configured

---

### PUT /api/admin/model-prompt/

**Description:** Update the Gemini image generation system prompt configuration.

**Authentication:** Required (Shop JWT with admin role)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "New Gemini system prompt for image generation..."
}
```

**Validation Rules:**
- `prompt`: Required, non-empty string

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Prompt updated successfully",
  "data": {
    "prompt_type": "model",
    "prompt": "New Gemini system prompt for image generation...",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Invalid input data (empty prompt)
- `401`: Authentication required
- `403`: Admin permission required
- `500`: Failed to update prompt

---

### GET /api/admin/groq-prompt/

**Description:** Retrieve the current OpenAI prompt enhancement system prompt configuration.

**Authentication:** Required (Shop JWT with admin role)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "prompt_type": "groq",
    "prompt": "Current OpenAI system prompt text...",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Authentication required
- `403`: Admin permission required
- `404`: Prompt not configured

---

### PUT /api/admin/groq-prompt/

**Description:** Update the OpenAI prompt enhancement system prompt configuration.

**Authentication:** Required (Shop JWT with admin role)

**Request Headers:**
```
Authorization: Bearer <shop_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "New OpenAI system prompt for prompt enhancement..."
}
```

**Validation Rules:**
- `prompt`: Required, non-empty string

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Prompt updated successfully",
  "data": {
    "prompt_type": "groq",
    "prompt": "New OpenAI system prompt for prompt enhancement...",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Invalid input data (empty prompt)
- `401`: Authentication required
- `403`: Admin permission required
- `500`: Failed to update prompt

---

## Recommendation Endpoints

The Recommendation API provides AI-powered room redesign and product matching capabilities. Users can upload photos of their rooms, receive AI-generated redesign suggestions with identified items, and request try-on visualizations for matched products.

### POST /api/recommendations/sessions/

Create a new redesign session by uploading a room photo.

**Authentication:** Required (User JWT)

**Content-Type:** multipart/form-data

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| room_image | File | Yes | Room photo (JPEG or PNG) |
| room_type | String | No | Type of room (living_room, bedroom, dining_room, office, hallway, entryway, nursery) |
| preferred_style | String | No | Design style (modern, contemporary, traditional, persian, minimalist, bohemian, scandinavian, industrial, rustic, classic, vintage, eclectic) |
| preferred_colors | Array | No | List of preferred colors |
| user_notes | String | No | Additional notes or preferences (max 500 chars) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "جلسه طراحی ایجاد شد و در حال پردازش است",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending"
  }
}
```

**Errors:**
- `400`: Invalid image format or validation error
    - Message: "درخواست نامعتبر است"
- `401`: Unauthorized

**Notes:**
- Session processing is asynchronous (Celery task)
- Poll the session status endpoint for updates
- Sessions expire after 24 hours by default

---

### GET /api/recommendations/sessions/{session_id}/

Get the current status and results of a redesign session.

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The session ID |

**Response (200 OK - Processing):**
```json
{
  "success": true,
  "message": "وضعیت جلسه دریافت شد",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "generating",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-16T10:30:00Z"
  }
}
```

**Response (200 OK - Ready):**
```json
{
  "success": true,
  "message": "وضعیت جلسه دریافت شد",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-16T10:30:00Z",
    "redesigned_image_url": "https://...",
    "items": [
      {
        "item_id": 1,
        "item_type": "rug",
        "description": {...},
        "matched_products": [...],
        "tryon_status": "pending",
        "tryon_image_url": null
      }
    ]
  }
}
```

**Status Values:**
- `pending`: Session created, awaiting processing
- `analyzing`: AI is analyzing the room
- `generating`: AI is generating the redesign
- `matching`: Finding matching products
- `ready`: Processing complete, results available
- `failed`: Error occurred during processing

**Errors:**
- `401`: Unauthorized
- `404`: Session not found
    - Message: "جلسه یافت نشد"

---

### GET /api/recommendations/sessions/list/

Get a list of the user's redesign sessions.

**Authentication:** Required (User JWT)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "لیست جلسات کاربر",
  "data": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "ready",
      "room_type": "living_room",
      "preferred_style": "modern",
      "created_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-16T10:30:00Z",
      "is_expired": false,
      "items_count": 3,
      "thumbnail_url": "https://..."
    }
  ]
}
```

**Notes:**
- Returns up to 20 most recent sessions
- Includes thumbnail URL if redesign is complete

---

### DELETE /api/recommendations/sessions/{session_id}/delete/

Delete a redesign session (soft delete).

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The session ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "جلسه با موفقیت حذف شد"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Session not found
    - Message: "جلسه یافت نشد"

---

### POST /api/recommendations/sessions/{session_id}/items/{item_id}/tryon/

Request a try-on visualization for a specific product.

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The session ID |
| item_id | Integer | The item ID from the session |

**Request Body:**
```json
{
  "product_id": 123
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "درخواست امتحان محصول ثبت شد",
  "data": {
    "status": "pending"
  }
}
```

**Errors:**
- `400`: Invalid request or product not in matched products list
    - Message: "درخواست نامعتبر است" or "محصول در لیست پیشنهادات نیست"
- `401`: Unauthorized
- `404`: Session or item not found
    - Message: "جلسه یا آیتم یافت نشد"

**Notes:**
- Try-on generation is asynchronous
- Deducts 1 credit from the product's shop
- Poll the session status endpoint to get the try-on image URL
- Session must be in `ready` status

---

## Discovery Endpoints (Product-First)

The Discovery API provides a product-first recommendation flow where:
1. User uploads a room photo
2. AI analyzes the room and generates search queries
3. Vector search finds matching products from the catalog
4. User browses products and optionally requests visualization

This flow **coexists** with the Redesign flow and provides a more browsing-focused experience.

### POST /api/recommendations/discover/

Create a new discovery session to find matching products for a room.

**Authentication:** Required (User JWT)

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| room_image | File | Yes | Room photo (JPEG or PNG) |
| categories | Array[String] | No | Product categories to search: `rug`, `furniture`, `bedspread` |
| user_notes | String | No | Additional notes or preferences (max 500 chars) |

**Example Request:**
```http
POST /api/recommendations/discover/
Content-Type: multipart/form-data
Authorization: Bearer <user_token>

room_image: <file>
categories: ["rug", "furniture"]
user_notes: "Looking for modern minimalist pieces"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "جلسه کشف محصول ایجاد شد",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending"
  }
}
```

**Errors:**
- `400`: Invalid image format or validation error
    - Message: "درخواست نامعتبر است"
- `401`: Unauthorized

**Notes:**
- Processing is asynchronous (Celery task)
- Session expires after 24 hours by default
- Poll the status endpoint to check when ready
- Categories filter: `rug`, `furniture`, `bedspread` (empty = all categories)

---

### GET /api/recommendations/discover/{session_id}/

Get the status and results of a discovery session.

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The discovery session ID |

**Response (200 OK - Ready):**
```json
{
  "success": true,
  "message": "وضعیت جلسه کشف محصول",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "created_at": "2025-01-15T10:30:00Z",
    "expires_at": "2025-01-16T10:30:00Z",
    "room_analysis": {
      "room_type": "living_room",
      "detected_style": "modern",
      "color_palette": ["beige", "cream", "white"],
      "recommended_product_types": ["rug", "sofa"],
      "style_recommendations": ["minimalist", "scandinavian"],
      "search_queries": [
        "modern beige wool rug with geometric pattern",
        "minimalist cream area rug for living room",
        "contemporary neutral-toned floor covering"
      ],
      "design_notes": "This modern living room features neutral tones and would benefit from products that complement its minimalist aesthetic."
    },
    "products": [
      {
        "id": 123,
        "name": "Persian Modern Rug",
        "category": "rug",
        "category_display": "فرش و قالی",
        "image_url": "https://storage.example.com/products/123.jpg",
        "match_score": 0.87,
        "shop_name": "Persian Gallery"
      },
      {
        "id": 456,
        "name": "Minimalist Area Rug",
        "category": "rug",
        "category_display": "فرش و قالی",
        "image_url": "https://storage.example.com/products/456.jpg",
        "match_score": 0.82,
        "shop_name": "Modern Home"
      }
    ],
    "visualizations": [
      {
        "product_id": 123,
        "image_url": "https://storage.example.com/visualizations/abc.jpg",
        "status": "completed"
      }
    ]
  }
}
```

**Response (200 OK - Processing):**
```json
{
  "success": true,
  "message": "وضعیت جلسه کشف محصول",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "analyzing",
    "created_at": "2025-01-15T10:30:00Z",
    "expires_at": "2025-01-16T10:30:00Z"
  }
}
```

**Session Status Values:**

| Status | Description |
|--------|-------------|
| `pending` | Session created, waiting for processing |
| `analyzing` | AI is analyzing the room |
| `searching` | Searching for matching products |
| `ready` | Results available |
| `failed` | Processing failed (check error field) |

**Errors:**
- `404`: Session not found
    - Message: "جلسه یافت نشد"

**Notes:**
- Returns up to 20 matched products ordered by similarity score
- `room_analysis` includes AI-detected room type, style, colors, and search queries
- `visualizations` array contains only completed try-on images

---

### GET /api/recommendations/discover/list/

List all discovery sessions for the authenticated user.

**Authentication:** Required (User JWT)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "لیست جلسات کشف محصول",
  "data": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "ready",
      "created_at": "2025-01-15T10:30:00Z",
      "expires_at": "2025-01-16T10:30:00Z",
      "is_expired": false,
      "products_count": 15,
      "visualizations_count": 2,
      "room_type": "living_room"
    }
  ]
}
```

**Notes:**
- Returns up to 20 most recent sessions
- `room_type` is extracted from room_analysis if available
- Sessions are ordered by creation date (newest first)

---

### POST /api/recommendations/discover/{session_id}/visualize/{product_id}/

Request a visualization of a product in the user's room.

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The discovery session ID |
| product_id | Integer | The product ID to visualize |

**Response (202 Accepted - Processing Started):**
```json
{
  "success": true,
  "message": "درخواست ایجاد تصویر ثبت شد",
  "data": {
    "status": "pending"
  }
}
```

**Response (200 OK - Already Completed):**
```json
{
  "success": true,
  "message": "تصویر قبلاً ایجاد شده است",
  "data": {
    "status": "completed",
    "image_url": "https://storage.example.com/visualizations/abc123.jpg"
  }
}
```

**Errors:**
- `400`: Product not in search results
    - Message: "محصول در نتایج جستجو نیست"
- `404`: Session not found or not ready
    - Message: "جلسه یافت نشد یا آماده نیست"

**Notes:**
- Visualization is asynchronous
- Deducts 1 credit from the product's shop
- Each product can only be visualized once per session
- Poll the session status endpoint to get the visualization image URL

---

### POST /api/recommendations/discover/{session_id}/refine/

Refine search results with a new query or category filter.

**Authentication:** Required (User JWT)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| session_id | UUID | The discovery session ID |

**Request Body:**
```json
{
  "query": "red traditional persian rug with medallion design",
  "categories": ["rug"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | String | Yes | New search query (max 500 chars) |
| categories | Array[String] | No | Filter by categories |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "نتایج جستجوی جدید",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "search_query": "red traditional persian rug with medallion design",
    "products": [
      {
        "id": 789,
        "name": "Traditional Red Persian Rug",
        "category": "rug",
        "category_display": "فرش و قالی",
        "image_url": "https://storage.example.com/products/789.jpg",
        "match_score": 0.91,
        "shop_name": "Persian Carpets"
      }
    ]
  }
}
```

**Errors:**
- `400`: Invalid query or validation error
    - Message: "درخواست نامعتبر است"
- `404`: Session not found or not ready
    - Message: "جلسه یافت نشد یا آماده نیست"

**Notes:**
- This endpoint updates the session's search results
- Previous visualizations are preserved
- Refinement is free (no credit charge)
- Returns up to 20 matching products

---

## External API Endpoints

The External API enables third-party integrations to use Homa's AI image visualization pipeline. It supports async processing with webhooks for result delivery.

### Authentication Methods

**API Key Management:** Uses Shop JWT Authentication (same as other shop endpoints)
```
Authorization: Bearer <shop_access_token>
```

**Processing API:** Uses API Key Authentication
```
Authorization: ApiKey homa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### API Key Format

API keys follow the format: `homa_` + 35 random characters (40 chars total)
- Example: `homa_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r`
- Keys are shown only once during creation
- Stored as SHA256 hash for security

### Rate Limiting

Each API key has configurable rate limits:
- Default: 100 requests/hour, 1000 requests/day
- Rate limit headers returned on responses:
    - `X-RateLimit-Limit`: Maximum requests allowed
    - `X-RateLimit-Remaining`: Requests remaining
    - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_001` | 401 | Invalid API key format or not found |
| `AUTH_002` | 401 | API key has expired |
| `AUTH_003` | 401 | API key has been revoked |
| `AUTH_004` | 403 | Request IP not in allowed list |
| `AUTH_005` | 403 | Shop account is inactive |
| `RATE_001` | 429 | Hourly rate limit exceeded |
| `RATE_002` | 429 | Daily rate limit exceeded |
| `CREDIT_001` | 402 | Shop has insufficient credits |
| `INPUT_001` | 400 | Product not found or inactive |
| `INPUT_002` | 400 | Invalid image format |
| `INPUT_003` | 400 | Image exceeds 10MB limit |
| `INPUT_004` | 400 | Missing required field |
| `PROC_001` | 500 | AI processing failed |
| `TASK_001` | 404 | Task not found |
| `TASK_002` | 403 | Task belongs to different API key |

---

## API Key Management (Shop JWT Auth)

### GET /api/external/keys/

**Description:** List all API keys for the authenticated shop.

**Authentication:** Required (Shop JWT)

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API keys retrieved successfully",
  "data": {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Production API Key",
        "key_prefix": "homa_a1b",
        "is_active": true,
        "rate_limit_per_hour": 100,
        "rate_limit_per_day": 1000,
        "webhook_url": "https://example.com/webhook",
        "total_requests": 1523,
        "last_used_at": "2025-01-15T14:30:00Z",
        "expires_at": null,
        "created_at": "2025-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/external/keys/

**Description:** Create a new API key. The full key is returned only once.

**Authentication:** Required (Shop JWT)

**Request Body:**
```json
{
  "name": "Production API Key",
  "rate_limit_per_hour": 100,
  "rate_limit_per_day": 1000,
  "webhook_url": "https://example.com/webhook",
  "allowed_ips": ["192.168.1.0/24", "10.0.0.1"],
  "expires_at": "2026-01-01T00:00:00Z"
}
```

**Request Fields:**
- `name`: Human-readable name (required, max 100 chars)
- `rate_limit_per_hour`: Requests per hour (optional, default: 100)
- `rate_limit_per_day`: Requests per day (optional, default: 1000)
- `webhook_url`: Default webhook URL (optional, must be HTTPS)
- `allowed_ips`: IP whitelist (optional, supports CIDR notation)
- `expires_at`: Expiration datetime (optional)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "homa_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r",
    "key_prefix": "homa_a1b",
    "name": "Production API Key",
    "is_active": true,
    "rate_limit_per_hour": 100,
    "rate_limit_per_day": 1000,
    "webhook_url": "https://example.com/webhook",
    "webhook_secret": "a1b2c3d4e5f6...",
    "allowed_ips": ["192.168.1.0/24", "10.0.0.1"],
    "expires_at": "2026-01-01T00:00:00Z",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Important:** The `key` field is only returned during creation. Store it securely.

---

### GET /api/external/keys/{key_id}/

**Description:** Get details of a specific API key.

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `key_id`: UUID of the API key

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API key retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Production API Key",
    "key_prefix": "homa_a1b",
    "is_active": true,
    "rate_limit_per_hour": 100,
    "rate_limit_per_day": 1000,
    "webhook_url": "https://example.com/webhook",
    "allowed_ips": ["192.168.1.0/24"],
    "total_requests": 1523,
    "last_used_at": "2025-01-15T14:30:00Z",
    "expires_at": null,
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### PATCH /api/external/keys/{key_id}/

**Description:** Update an API key's settings.

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `key_id`: UUID of the API key

**Request Body (all fields optional):**
```json
{
  "name": "Updated Key Name",
  "rate_limit_per_hour": 200,
  "rate_limit_per_day": 2000,
  "webhook_url": "https://new-endpoint.com/webhook",
  "allowed_ips": ["10.0.0.0/8"],
  "expires_at": "2027-01-01T00:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API key updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Key Name",
    "key_prefix": "homa_a1b",
    "is_active": true,
    "rate_limit_per_hour": 200,
    "rate_limit_per_day": 2000,
    "webhook_url": "https://new-endpoint.com/webhook",
    "allowed_ips": ["10.0.0.0/8"],
    "expires_at": "2027-01-01T00:00:00Z",
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### POST /api/external/keys/{key_id}/revoke/

**Description:** Revoke an API key (deactivate permanently).

**Authentication:** Required (Shop JWT)

**Path Parameters:**
- `key_id`: UUID of the API key

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API key revoked successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Production API Key",
    "is_active": false,
    "revoked_at": "2025-01-15T15:00:00Z"
  }
}
```

---

## Processing API (API Key Auth)

### POST /api/external/v1/process/

**Description:** Submit an image for AI processing. Returns task ID for async tracking.

**Authentication:** Required (API Key)

**Request Headers:**
```
Authorization: ApiKey homa_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `product_unique_link`: Product UUID (required)
- `customer_image`: Image file (required, JPEG/PNG/WebP, max 10MB)
- `selected_size`: Size code for rugs (optional)
- `webhook_url`: Override default webhook URL (optional)
- `priority`: Task priority 1-10 (optional, default: 5)
- `idempotency_key`: Client-provided key for deduplication (optional)

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Processing task created successfully",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "status_url": "https://api.homa.ir/api/external/v1/status/550e8400-e29b-41d4-a716-446655440000/",
    "estimated_wait_seconds": 30,
    "credits_remaining": 99,
    "webhook_url": "https://example.com/webhook"
  }
}
```

**Errors:**
- `400`: Invalid input (INPUT_001-004)
- `401`: Invalid API key (AUTH_001-003)
- `402`: Insufficient credits (CREDIT_001)
- `403`: IP not allowed (AUTH_004)
- `429`: Rate limit exceeded (RATE_001-002)

---

### GET /api/external/v1/status/{task_id}/

**Description:** Check the status of a processing task.

**Authentication:** Required (API Key)

**Path Parameters:**
- `task_id`: UUID of the processing task

**Response (200 OK - Pending):**
```json
{
  "success": true,
  "message": "Task status retrieved",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "priority": 5,
    "created_at": "2025-01-15T14:30:00Z",
    "started_at": null,
    "completed_at": null,
    "credits_remaining": 99
  }
}
```

**Response (200 OK - Processing):**
```json
{
  "success": true,
  "message": "Task status retrieved",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "priority": 5,
    "created_at": "2025-01-15T14:30:00Z",
    "started_at": "2025-01-15T14:30:05Z",
    "completed_at": null,
    "credits_remaining": 99
  }
}
```

**Response (200 OK - Completed):**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "priority": 5,
    "result": {
      "image_url": "https://cdn.homa.ir/processed/results/uuid.webp",
      "image_id": 12345
    },
    "processing_duration_ms": 25000,
    "created_at": "2025-01-15T14:30:00Z",
    "started_at": "2025-01-15T14:30:05Z",
    "completed_at": "2025-01-15T14:30:30Z",
    "credits_remaining": 99
  }
}
```

**Response (200 OK - Failed):**
```json
{
  "success": true,
  "message": "Task failed",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "failed",
    "error": {
      "code": "PROC_001",
      "message": "AI processing failed"
    },
    "created_at": "2025-01-15T14:30:00Z",
    "started_at": "2025-01-15T14:30:05Z",
    "completed_at": "2025-01-15T14:30:10Z",
    "credits_remaining": 100
  }
}
```

**Task Status Values:**
- `pending`: Waiting in queue
- `processing`: Currently being processed
- `completed`: Successfully completed
- `failed`: Processing failed
- `cancelled`: Task was cancelled

---

### GET /api/external/v1/tasks/

**Description:** List all processing tasks for the API key.

**Authentication:** Required (API Key)

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "count": 50,
    "next": "https://api.homa.ir/api/external/v1/tasks/?page=2",
    "previous": null,
    "results": [
      {
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "product_unique_link": "abc123",
        "priority": 5,
        "processing_duration_ms": 25000,
        "created_at": "2025-01-15T14:30:00Z"
      }
    ]
  }
}
```

---

### GET /api/external/v1/balance/

**Description:** Get shop credit balance and usage statistics.

**Authentication:** Required (API Key)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Balance retrieved successfully",
  "data": {
    "credits_remaining": 99,
    "total_credits_used": 1501,
    "total_credits_added": 1600,
    "shop_name": "My Furniture Store"
  }
}
```

---

### GET /api/external/v1/products/

**Description:** List products available for processing.

**Authentication:** Required (API Key)

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `category`: Filter by category (optional)
- `search`: Search in name/description (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "count": 25,
    "next": null,
    "previous": null,
    "results": [
      {
        "unique_link": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Modern Sofa",
        "category": 1,
        "category_display": "Furniture",
        "price": 5500000,
        "image_url": "https://cdn.homa.ir/products/uuid.jpg",
        "available_sizes": null
      }
    ]
  }
}
```

---

### GET /api/external/v1/products/{unique_link}/

**Description:** Get detailed product information.

**Authentication:** Required (API Key)

**Path Parameters:**
- `unique_link`: Product UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "unique_link": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Modern Sofa",
    "description": "Comfortable modern sofa for living room",
    "category": 1,
    "category_display": "Furniture",
    "price": 5500000,
    "image_url": "https://cdn.homa.ir/products/uuid.jpg",
    "available_sizes": null,
    "extra_details": {
      "material": "Leather",
      "color": "Gray"
    }
  }
}
```

---

### Webhook Payload

When a task completes (success or failure), a webhook is sent to the configured URL.

**Headers:**
```
Content-Type: application/json
X-Homa-Signature: sha256=<hmac_signature>
X-Homa-Event: processing.completed
X-Homa-Delivery-ID: <uuid>
```

**Payload (Success):**
```json
{
  "event": "processing.completed",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "image_url": "https://cdn.homa.ir/processed/results/uuid.webp",
    "image_id": 12345
  },
  "product_unique_link": "abc123",
  "processing_duration_ms": 25000,
  "timestamp": "2025-01-15T14:30:30Z"
}
```

**Payload (Failure):**
```json
{
  "event": "processing.failed",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": {
    "code": "PROC_001",
    "message": "AI processing failed"
  },
  "product_unique_link": "abc123",
  "timestamp": "2025-01-15T14:30:10Z"
}
```

**Signature Verification:**
```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = 'sha256=' + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

**Retry Policy:**
- Max 5 delivery attempts
- Exponential backoff: 30s, 1m, 2m, 4m, 8m (capped at 1 hour)
- Success: HTTP 2xx response
- Timeout: 30 seconds per attempt

---

## System Health Endpoints

### GET /health/

**Description:** Health check endpoint for monitoring system status including database and cache connectivity.

**Authentication:** Not required

**Response (200 OK - Healthy):**
```json
{
  "status": "healthy",
  "database": true,
  "cache": true
}
```

**Response (503 Service Unavailable - Unhealthy):**
```json
{
  "status": "unhealthy",
  "database": false,
  "cache": true
}
```

**Health Checks:**
- `database`: Checks PostgreSQL database connectivity
- `cache`: Checks Redis cache connectivity
- `status`: Overall health status ("healthy" or "unhealthy")

**Notes:**
- Used for load balancer health checks and monitoring
- Returns 503 status code when system is unhealthy
- All checks must pass for overall health to be "healthy"

---

## Error Responses

All error responses follow this consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "data": {}
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## API Schema

### Swagger UI
Access interactive API documentation at:
```
http://localhost:8000/api/v1/swagger/
```

### ReDoc
Access ReDoc documentation at:
```
http://localhost:8000/api/v1/redoc/
```

### OpenAPI Schema
Download the OpenAPI JSON schema at:
```
http://localhost:8000/api/schema/
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Phone numbers should follow Iranian mobile number format (+989XXXXXXXXX or 09XXXXXXXXX)
- Image uploads support JPEG, PNG, and WebP formats (max 10MB)
- JWT tokens are used for authentication
- User access tokens expire after 30 minutes (1800 seconds)
- Presigned URLs for images expire after 1 hour
- All endpoints return responses in JSON format
- Soft-deleted entities cannot be accessed via API
- AI processing is rate-limited to 5 requests per hour per user
- Product images are stored permanently in MinIO
- Customer upload images are deleted after AI processing

### Product Fields

**`link` field (Purchase URL):**
- Optional product-specific purchase/redirect URL
- Can be set during product creation or update
- If not provided, automatically falls back to the shop's link
- If both product and shop links are null, returns `null`
- Frontend should hide the purchase button when `link` is `null`
- Use case: After AI image processing, users can click to be redirected to this URL to purchase the product

**`extra_details` field (Product Features):**
- Optional JSON object for key-value product specifications
- Can contain unlimited features like size, material, color, etc.
- Example: `{"اندازه": "3x4", "جنس بدنه": "چوبی", "رنگ": "قهوه‌ای"}`
- Returns empty object `{}` if not set
- Frontend should display these as bullet points in product detail page
- Supports Persian/Farsi text for both keys and values