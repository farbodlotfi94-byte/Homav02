# API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [User Endpoints](#user-endpoints)
  - [POST /api/users/register/](#post-apiusersregister)
  - [POST /api/users/login/](#post-apiuserslogin)
  - [GET /api/users/profile/](#get-apiusersprofile)
  - [PUT /api/users/profile/](#put-apiusersprofile)
  - [POST /api/users/logout/](#post-apiuserslogout)
  - [POST /api/users/refresh/](#post-apiusersrefresh)
  - [GET /api/users/gallery/](#get-apiusersgallery)
- [Shop Endpoints](#shop-endpoints)
  - [GET /api/shops/list/](#get-apishopslist)
  - [POST /api/shops/login/](#post-apishopslogin)
  - [POST /api/shops/products/](#post-apishopsproducts)
  - [GET /api/shops/products/list/](#get-apishopsproductslist)
  - [PUT /api/shops/products/edit/{product_id}/](#put-apishopsproductseditproduct_id)
  - [DELETE /api/shops/products/delete/{product_id}/](#delete-apishopsproductsdeleteproduct_id)
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
- JWT tokens with access and refresh tokens
- Token refresh using `/api/users/refresh/`
- Token blacklisting on logout

**Shop Authentication:**
- JWT access tokens (no refresh token)
- Custom authentication backend

**Token Usage:**
- Include the access token in the `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```

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

### GET /api/shops/list/

**Description:** Retrieve a list of all shops with their basic information.

**Authentication:** Not required (public endpoint)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "username": "shop1",
      "shop_name": "Furniture Store",
      "role": "shop",
      "link": "https://shop.example.com",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "username": "admin_shop",
      "shop_name": "Admin Furniture Store",
      "role": "admin",
      "link": null,
      "created_at": "2024-01-14T09:15:00Z"
    }
  ]
}
```

**Notes:**
- Returns all shops ordered by creation date (newest first)
- Includes basic shop information: ID, username, shop name, role, link, and creation timestamp
- Shop link may be `null` if not set
- Role can be "shop" (regular shop) or "admin" (admin shop)

---

### POST /api/shops/login/

**Description:** Authenticate shop with username and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "shop1",
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
      "shop_name": "Furniture Store",
      "role": "shop",
      "link": "",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Errors:**
- `400`: Invalid credentials
  - Invalid username or password
  - Shop account does not exist

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

**Description:** List all products for authenticated shop with pagination and search.

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

**Errors:**
- `401`: Authentication required

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

# Combined: search, filter by category, price range, and sort
GET /api/products/?search=chair&category=furniture&price_min=1000000&price_max=3000000&sort=price_asc&page=1&page_size=10
```

**Notes:**
- Results ordered by created_at (newest first) by default
- `image_path` is MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- Pagination metadata includes `count` (total items), `next` and `previous` links
- Search is case-insensitive and searches in product name and description
- Category filter is exact match but case-insensitive

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
  "message": "Image processed successfully"
}
```

**Notes:**
- `image_path` is MinIO object path - use `/api/images/{image_path}` endpoint to retrieve the image
- Image is automatically optimized to max 1920x1080 resolution
- EXIF data is stripped for privacy
- Customer upload image is deleted after processing for storage efficiency
- Result images are stored permanently in MinIO
- Processed image records now persist `enhancement_prompt`, `enhancement_model`, `image_generation_prompt`, and `image_generation_model` for future inspection

**Errors:**
- `400`: Invalid image or processing failed
- `401`: Authentication required
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