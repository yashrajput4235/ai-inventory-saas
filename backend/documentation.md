# AI Inventory SaaS API Documentation

This document provides the request and response shapes for all the backend REST API endpoints.

## Base URL
All API requests are prepended with `/api` by default. Example: `http://localhost:5001/api`.

---

## 1. Authentication & Users (`/api/auth`)

### `POST /api/auth/register`
Register a new user to an existing organization and send an OTP.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "message": "OTP sent to email"
  }
  ```

### `POST /api/auth/verify-otp`
Verify OTP to activate the user account.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "otp": "123456"
  }
  ```
- **Response Structure (200 OK): Sets `token` cookie.**
  ```json
  {
    "message": "Account verified successfully"
  }
  ```

### `POST /api/auth/login`
Logs in a verified user.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response Structure (200 OK): Sets `token` cookie.**
  ```json
  {
    "message": "Login successful"
  }
  ```

### `POST /api/auth/resend-otp`
Resends the verification OTP.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "message": "OTP sent to email"
  }
  ```

### `POST /api/auth/forgot-password`
Sends a password reset link to the user's email.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com"
  }
  ```

### `POST /api/auth/reset-password`
Resets the password using a reset token.
- **Request Body:**
  ```json
  {
    "token": "reset-token-received-in-email",
    "newPassword": "newPassword123"
  }
  ```

### `POST /api/auth/logout`
Logs out the user and clears the cookie.
- **Response Structure (200 OK): Clears `token` cookie.**
  ```json
  {
    "message": "Logout successful"
  }
  ```

### `GET /api/auth/admin-dashboard`
Returns a simple welcome message for the admin dashboard.
**Auth**: Admin only.
- **Response Structure (200 OK):**
  ```json
  {
    "message": "Admin dashboard"
  }
  ```

### `GET /api/auth/manager-dashboard`
Returns a simple welcome message for the manager dashboard.
**Auth**: Manager only.
- **Response Structure (200 OK):**
  ```json
  {
    "message": "Manager dashboard"
  }
  ```


---

## 2. Organization (`/api/org`)

### `POST /api/org/register-admin`
Creates a new organization alongside an admin user.
- **Request Body:**
  ```json
  {
    "organizationName": "Acme Corp",
    "name": "Admin User",
    "email": "admin@acme.com",
    "password": "securepassword123"
  }
  ```
- **Response Structure (201 Created):**
  ```json
  {
    "message": "Organization and admin created. Verify OTP."
  }
  ```

---

## 3. Store Management (`/api/stores`)

### `POST /api/stores/`
**Auth**: Admin only. Creates a new store in the organization.
- **Request Body:**
  ```json
  {
    "name": "Downtown Branch",
    "location": "New York, NY"
  }
  ```
- **Response Structure (201 Created):**
  ```json
  {
    "message": "Store created successfully",
    "store": {
      "id": "store-uuid",
      "name": "Downtown Branch",
      "location": "New York, NY",
      "organizationId": "org-uuid"
    }
  }
  ```

### `GET /api/stores/`
**Auth**: Admin / Manager. Gets all stores for the organization.
- **Response Structure (200 OK):**
  ```json
  {
    "stores": [
      {
        "id": "store-uuid",
        "name": "Downtown Branch",
        "location": "New York, NY",
        "organizationId": "org-uuid",
        "employees": 12,
        "revenue": "$14,500"
      }
    ]
  }
  ```

---

## 4. Products Management (`/api/products`)

### `POST /api/products/`
**Auth**: Admin only. Creates a new product for the organization.
- **Request Body:**
  ```json
  {
    "name": "Wireless Mouse",
    "sku": "WM-001",
    "category": "Electronics",
    "price": 29.99,
    "cost": 12.50
  }
  ```
- **Response Structure (201 Created):**
  ```json
  {
    "message": "Product created successfully",
    "product": {
      "id": "product-uuid",
      "name": "Wireless Mouse",
      "sku": "WM-001",
      "price": 29.99,
      "category": "Electronics"
    }
  }
  ```

### `GET /api/products/`
**Auth**: Admin / Manager. Gets all products in the organization.
- **Response Structure (200 OK):**
  ```json
  {
    "products": [
      {
        "id": "product-uuid",
        "name": "Wireless Mouse",
        "sku": "WM-001",
        "category": "Electronics",
        "price": 29.99,
        "createdAt": "2026-03-07T00:00:00.000Z"
      }
    ]
  }
  ```

---

## 5. Inventory Operations (`/api/inventory`)

### `POST /api/inventory/add-stock`
**Auth**: Admin / Manager. Adds stock to a specific product in a store.
- **Request Body:**
  ```json
  {
    "storeId": "store-uuid",
    "productId": "product-uuid",
    "quantity": 100
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "message": "Stock added successfully",
    "inventory": {
      "newQuantity": 150
    }
  }
  ```

### `GET /api/inventory/:storeId`
**Auth**: Admin / Manager. Gets current inventory for a specified store.
- **Response Structure (200 OK):**
  ```json
  {
    "inventory": [
      {
        "id": "inv-uuid",
        "quantity": 150,
        "lowStockThreshold": 10,
        "product": {
          "name": "Wireless Mouse",
          "sku": "WM-001",
          "price": 29.99
        }
      }
    ]
  }
  ```

### `PATCH /api/inventory/update-threshold`
**Auth**: Admin / Manager. Configures low stock alert threshold.
- **Request Body:**
  ```json
  {
    "storeId": "store-uuid",
    "productId": "product-uuid",
    "lowStockThreshold": 20
  }
  ```

---

## 6. Point of Sales (`/api/sales`)

### `POST /api/sales/`
**Auth**: Admin / Manager. Records a point of sale and automatically decrements inventory.
- **Request Body:**
  ```json
  {
    "storeId": "store-uuid",
    "productId": "product-uuid",
    "quantity": 2
  }
  ```
- **Response Structure (201 Created):**
  ```json
  {
    "message": "Sale recorded successfully",
    "sale": {
      "id": "sale-uuid",
      "quantity": 2,
      "totalAmount": 59.98,
      "profit": 34.98,
      "soldAt": "2026-03-07..."
    }
  }
  ```

---

## 7. Analytics & Dashboard (`/api/analytics`)

### `GET /api/analytics/store-summary/:storeId`
**Auth**: Admin / Manager. Returns high level metrics for a store.
- **Response Structure (200 OK):**
  ```json
  {
    "totalRevenue": 15000.50,
    "totalProfit": 6000.25,
    "totalSales": 142,
    "inventoryValue": 45000.00
  }
  ```

### `GET /api/analytics/top-products/:storeId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
**Auth**: Admin / Manager. Returns top 5 grossing products. Date range defaults to last 30 days if omitted.
- **Response Structure (200 OK):**
  ```json
  [
    {
      "productId": "product-uuid",
      "name": "Wireless Mouse",
      "totalQuantitySold": 150,
      "totalRevenue": 4498.50,
      "totalProfit": 2623.50
    }
  ]
  ```

### `GET /api/analytics/low-stock/:storeId`
**Auth**: Admin / Manager. Returns items below their assigned `lowStockThreshold`.
- **Response Structure (200 OK):**
  ```json
  [
    {
      "id": "inv-uuid",
      "storeId": "store-uuid",
      "productId": "product-uuid",
      "quantity": 5,
      "lowStockThreshold": 10,
      "product": {
        "name": "Wireless Mouse",
        "sku": "WM-001"
      }
    }
  ]
  ```

---

## 8. BigQuery & AI Predictions (`/api`)

### `GET /api/`
Returns the general demand forecast data from BigQuery prediction tables.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2026-03-08",
        "series_id": "product-uuid",
        "predicted_quantity": 42
      }
    ]
  }
  ```

### `GET /api/alerts`
Identifies products where predicted demand exceeds current stock.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "alert": [
      {
        "series_id": "product-uuid",
        "predicted_demand": 50,
        "current_stock": 12
      }
    ]
  }
  ```

### `GET /api/reorder`
Generates optimal reorder quantities based on predictions and a safety buffer.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "recommendations": [
      {
        "series_id": "product-uuid",
        "date": "2026-03-08",
        "predicted_demand": 50,
        "current_stock": 10,
        "safety_buffer": 10,
        "recommended_order": 50
      }
    ]
  }
  ```

### `GET /api/dashboard`
Aggregated view for the central dashboard listing demand and reorder metrics.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "dashboard": [
      {
        "series_id": "product-uuid",
        "date": "2026-03-08",
        "predicted_demand": 50,
        "current_stock": 10,
        "recommended_order": 50
      }
    ]
  }
  ```

### `GET /api/trend?series_id={product_id}`
Demand trend over time for a specific product ID.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "trend": [
      {
        "date": "2026-03-08",
        "series_id": "product-uuid",
        "predicted_demand": 45
      }
    ]
  }
  ```

### `POST /api/run-forecast`
Triggers Google Vertex AI batch prediction to generate daily forecasts.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "message": "Forecast job triggered"
  }
  ```

### `POST /api/retrain-model`
Triggers a custom training pipeline in Google Vertex AI to retrain the underlying forecasting model.
- **Response Structure (200 OK):**
  ```json
  {
    "success": true,
    "message": "Model retraining started"
  }
  ```

---

## Health Checks

### `GET /api/health`
Checks if the API is responsive.
- **Response Structure (200 OK):**
  ```json
  {
    "status": "OK"
  }
  ```
