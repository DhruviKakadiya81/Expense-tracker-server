# 🛡️ Backend Architecture & Implementation Plan

## 1. Overview & Technology Stack
- **Runtime & Framework**: Node.js & Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Bearer token header
- **Password Security**: Bcrypt.js (salted hashing)
- **Validation**: Zod (Schema-based runtime validation for params, query, and body)
- **File Uploads**: Multer (Local disk storage with static serving; modular paths for avatars, receipts, and videos)
- **Security & Utilities**: Helmet, CORS, Morgan (logger), Dotenv

---

## 2. Directory Structure (`/server`)
Classic MVC (Model-View-Controller) architecture with dedicated folders for Models, Controllers, Routes, Middlewares, and Validations.

```
server/
├── uploads/                        # Static uploads directory
│   ├── avatars/                    # User profile photos
│   ├── receipts/                   # Transaction receipt images
│   └── videos/                     # Attached transaction videos
├── src/
│   ├── config/
│   │   ├── db.ts                   # MongoDB connection configuration
│   │   ├── env.ts                  # Typed environment variables validation
│   │   └── multer.ts               # Multer storage configs (file types, size limits)
│   ├── models/
│   │   ├── userModel.ts            # User Mongoose Schema
│   │   ├── categoryModel.ts        # Category Mongoose Schema
│   │   └── transactionModel.ts     # Transaction Mongoose Schema
│   ├── controllers/
│   │   ├── authController.ts       # Register, login, get current user
│   │   ├── userController.ts       # Get profile, update profile, avatar upload
│   │   ├── categoryController.ts   # CRUD operations with integrity checks
│   │   ├── transactionController.ts# CRUD, filter, search, media attachments
│   │   └── dashboardController.ts  # Total stats, charts, recent activities
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/auth routes
│   │   ├── userRoutes.ts           # /api/user routes
│   │   ├── categoryRoutes.ts       # /api/categories routes
│   │   ├── transactionRoutes.ts    # /api/transactions routes
│   │   ├── dashboardRoutes.ts      # /api/dashboard routes
│   │   └── index.ts                # Central router aggregating all routes
│   ├── middlewares/
│   │   ├── authMiddleware.ts       # JWT verification & req.user injection
│   │   ├── validateMiddleware.ts   # Generic Zod validation middleware
│   │   ├── uploadMiddleware.ts     # Multer upload interceptors
│   │   └── errorMiddleware.ts      # Global centralized error handler
│   ├── validations/
│   │   ├── authValidation.ts       # Zod schemas for register, login
│   │   ├── userValidation.ts       # Zod schemas for user profile update
│   │   ├── categoryValidation.ts   # Zod schemas for category CRUD
│   │   └── transactionValidation.ts# Zod schemas for transaction CRUD & filters
│   ├── utils/
│   │   ├── apiResponse.ts          # Standard JSON response wrapper
│   │   ├── apiError.ts             # Custom HTTP error class
│   │   └── jwt.ts                  # Sign & verify JWT tokens
│   ├── app.ts                      # Express app initialization, middlewares, routing
│   └── server.ts                   # Entry point (port listening & DB connect)
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 3. Database Schema Design (Mongoose)

### 3.1. `User` Schema
* `name`: String (Required, trimmed)
* `email`: String (Required, unique, lowercase, trimmed)
* `password`: String (Required, hashed with Bcrypt)
* `phone`: String (Optional)
* `avatarUrl`: String (Default avatar or path to uploaded file)
* `timestamps`: true

### 3.2. `Category` Schema
* `name`: String (Required, trimmed)
* `type`: String (`income` | `expense`, Required)
* `user`: ObjectId (Ref `User`, Required)
* `color`: String (Optional, for frontend tag display)
* `timestamps`: true
* *Indexes*: Compound index `{ user: 1, name: 1 }` to prevent duplicate category names per user.

### 3.3. `Transaction` Schema
* `user`: ObjectId (Ref `User`, Required)
* `title`: String (Required, trimmed)
* `amount`: Number (Required, positive number)
* `type`: String (`income` | `expense`, Required)
* `category`: ObjectId (Ref `Category`, Required)
* `date`: Date (Required, default: `Date.now`)
* `description`: String (Optional)
* `receiptUrl`: String (Optional file path)
* `videoUrl`: String (Optional file path or external video URL)
* `timestamps`: true
* *Indexes*: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`, `{ title: "text" }`

---

## 4. API Endpoints Specification

### 4.1. Auth Module (`/api/auth`)
* `POST /register`: Validate user input, hash password with `bcrypt.hash(password, 10)`, save user, return JWT + sanitized user.
* `POST /login`: Validate credentials, compare password with `bcrypt.compare`, return JWT + user profile.
* `GET /me`: Authenticated endpoint to fetch logged-in user state.

### 4.2. User Profile Module (`/api/user`)
* `GET /profile`: Get profile details.
* `PUT /profile`: Update name, email, phone number (validated).
* `POST /avatar`: Multer single-file upload for avatar image; updates `avatarUrl`.

### 4.3. Category Module (`/api/categories`)
* `GET /`: Retrieve all categories belonging to the authenticated user.
* `POST /`: Create a new category.
* `PUT /:id`: Update existing category name/type.
* `DELETE /:id`: **Integrity Check**:
  ```ts
  const count = await Transaction.countDocuments({ user: req.user._id, category: id });
  if (count > 0) {
    throw new ApiError(400, "Cannot delete category: It is currently linked to existing transactions.");
  }
  await Category.findByIdAndDelete(id);
  ```

### 4.4. Transaction Module (`/api/transactions`)
* `GET /`: List transactions with query filters:
  - `search`: Text regex search on `title`
  - `category`: Filter by category ID
  - `type`: Filter by `income` or `expense`
  - `startDate` & `endDate`: Filter by date range
  - Pagination: `page` & `limit`
* `POST /`: Add transaction. Accepts multipart form data (with optional receipt file and video file or `videoUrl`).
* `GET /:id`: Get single transaction with populated category.
* `PUT /:id`: Edit transaction details, replace or remove receipt/video files.
* `DELETE /:id`: Delete transaction and clean up linked media files if stored locally.

### 4.5. Dashboard Module (`/api/dashboard`)
* `GET /summary`: Aggregates:
  - `totalIncome`: Total sum of all income transactions.
  - `totalExpense`: Total sum of all expense transactions.
  - `currentBalance`: `totalIncome - totalExpense`.
  - `recentTransactions`: Last 5 transactions.
  - `incomeVsExpense`: Monthly breakdown (e.g., grouped by month or category) for charting.

---

## 5. Security & Validation Strategy
1. **Zod Validation Middleware**: Incoming request body, query, and params validated before reaching controller.
2. **Centralized Error Handling**: Unified error response `{ success: false, message: string, errors?: any }`.
3. **Data Sanitization**: Strip passwords from all API returns.
4. **File Upload Security**:
   - Limit receipts to images (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5MB).
   - Limit videos to MP4/WebM/MOV (max 50MB) or validate URL format.
