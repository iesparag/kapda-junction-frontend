# Kapda Junction - Complete E-Commerce Platform

A complete, extensible Angular e-commerce platform with Node.js/Express backend, JWT authentication, and role-based access control.

## Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure login/register system
- **Role-Based Access**: Admin and User roles with different permissions
- **Protected Routes**: Admin routes protected, checkout/orders require authentication
- **Auto Token Refresh**: JWT tokens stored and automatically sent with requests

### Admin Panel (Admin Only)
- **Product Module Management**: Create, update, enable/disable product modules
- **Category Management**: Full CRUD for categories and subcategories
- **Product Management**: Complete product management with images, pricing, discounts, stock
- **Inventory Management**: Track stock levels with visual indicators
- **Order Management**: View and update order statuses

### User Frontend
- **Dynamic Home Page**: Displays product modules dynamically from backend
- **Module-Based Browsing**: Browse products by module
- **Category Navigation**: Dynamic category and subcategory filtering
- **Product Listing**: Advanced filtering (price range, category) and sorting
- **Product Detail Page**: Full product information with image gallery
- **Shopping Cart**: Add, update, and remove items
- **Checkout**: Complete checkout flow with shipping address
- **Order Tracking**: View order history and status

## Tech Stack

### Frontend
- Angular 18 (Standalone Components)
- TypeScript
- RxJS
- Angular Router
- HTTP Client with Interceptors

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs for password hashing
- File-based JSON storage (easily replaceable with database)

## Project Structure

```
kapda-junction/
├── backend/
│   ├── server.js          # Express server with all API endpoints
│   ├── package.json
│   ├── .env               # Environment variables
│   └── data/              # JSON data files (auto-created)
│       ├── users.json
│       ├── productModules.json
│       ├── categories.json
│       ├── products.json
│       └── orders.json
├── src/
│   └── app/
│       ├── admin/         # Admin panel components
│       ├── auth/          # Login/Register components
│       ├── core/          # Services, guards, interceptors
│       ├── models/        # TypeScript interfaces
│       ├── shared/        # Shared components
│       └── user/          # User frontend components
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults provided):
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Default Credentials

### Admin Account
- **Email**: `admin@kapdajunction.com`
- **Password**: `admin123`

### User Registration
Users can register new accounts through the registration page. All new users get `user` role by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected)

### Product Modules
- `GET /api/product-modules` - Get active modules (public)
- `GET /api/product-modules/all` - Get all modules (admin)
- `GET /api/product-modules/:id` - Get module by ID
- `GET /api/product-modules/slug/:slug` - Get module by slug
- `POST /api/product-modules` - Create module (admin)
- `PUT /api/product-modules/:id` - Update module (admin)
- `DELETE /api/product-modules/:id` - Delete module (admin)

### Categories
- `GET /api/categories` - Get active categories (public)
- `GET /api/categories/module/:moduleId` - Get categories by module
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Products
- `GET /api/products` - Get active products (public, supports ?moduleId= & ?categoryId=)
- `GET /api/products/all` - Get all products (admin)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get orders (user sees own, admin sees all)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (authenticated)
- `PUT /api/orders/:id/status` - Update order status (admin)

## Authentication Flow

1. User registers/logs in through frontend
2. Backend returns JWT token and user info
3. Frontend stores token in localStorage
4. HTTP Interceptor automatically adds token to all requests
5. Backend validates token on protected routes
6. Role-based guards check user permissions

## Data Storage

Currently uses file-based JSON storage in `backend/data/` directory. This is perfect for development and can be easily replaced with:
- MongoDB
- PostgreSQL
- MySQL
- Any other database

Just update the `readData()` and `writeData()` functions in `server.js`.

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based authorization
- Protected API endpoints
- CORS enabled for frontend
- Input validation

## Development Notes

- All admin operations require admin role
- Orders are automatically filtered by user ID for regular users
- Stock is automatically updated when orders are placed
- Frontend automatically refreshes data after mutations
- Error handling with user-friendly messages

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` in backend `.env` file
2. Use a proper database instead of file storage
3. Add environment-specific API URLs
4. Enable HTTPS
5. Add rate limiting
6. Add request validation middleware
7. Set up proper logging
8. Configure CORS for production domain

## License

This project is created for demonstration purposes.
