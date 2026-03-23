# POP Software Backend API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [File Uploads](#file-uploads)
- [Socket.io Integration](#socketio-integration)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## 🎯 Overview

Restaurant Software is a comprehensive restaurant management system with the following core features:

### **Core Features:**
- 🍽️ **Restaurant Management**: Multi-restaurant support with QR codes
- 📝 **Order Management**: Real-time order processing with variants
- 🪑 **Table Management**: Table status tracking and assignment
- 🧾 **Invoice Generation**: PDF invoices with QR code integration
- 📊 **Analytics & Reports**: Sales and order analytics
- 🔐 **Authentication**: Role-based access control
- 📱 **Real-time Updates**: Socket.io for live order status

### **Technology Stack:**
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer for images
- **PDF Generation**: Puppeteer
- **Real-time**: Socket.io
- **Validation**: Joi for input validation

---

## 📁 Project Structure

```
Backend/
├── controllers/           # Business logic handlers
│   ├── Inventory/          # Inventory management controllers
│   ├── POS_Billing/         # POS billing controllers
│   ├── addOnController.js
│   ├── bannerController.js
│   ├── categoryController.js
│   ├── customerMenuController.js
│   ├── invoiceTemplateController.js
│   ├── menuItemController.js
│   ├── menuManagementController.js
│   ├── notificationController.js
│   ├── orderController.js
│   ├── paymentMethodController.js
│   ├── permissioncontroller.js
│   ├── restaurentController.js
│   ├── roleController.js
│   ├── sidebar.controller.js
│   ├── taxController.js
│   ├── userController.js
│   └── variantController.js
├── middleWares/          # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/              # Database schemas
│   ├── Inventory/          # Inventory models
│   ├── POS/               # POS models
│   ├── PaymentMethod.js
│   ├── RolePermissionModel.js
│   ├── VariantGroupModel.js
│   ├── addOnGroupModel.js
│   ├── addOnModel.js
│   ├── bannersModel.js
│   ├── categoryModel.js
│   ├── comboModel.js
│   ├── customerModel.js
│   ├── invoiceTemplateModel.js
│   ├── menuItemAddonModel.js
│   ├── menuItemModel.js
│   ├── notificationModel.js
│   ├── orderModel.js
│   ├── permissionModel.js
│   ├── restaurentModel.js
│   ├── roleModel.js
│   ├── tableModel.js
│   ├── taxModel.js
│   ├── userModel.js
│   └── varianModel.js
├── routes/              # API route definitions
│   ├── adminCommonRoutes.js
│   ├── bannerRoute.js
│   ├── categoryRoute.js
│   ├── customerMenuRoutes.js
│   ├── inventoryRoutes.js
│   ├── menuItemRoutes.js
│   ├── menuManagementCommonRoutes.js
│   ├── notificationRoute.js
│   ├── orderRoute.js
│   ├── paymentMethodRoute.js
│   ├── permissonRoutes.js
│   ├── popBillingRoutes.js
│   ├── posRoutes.js
│   ├── roleRoutes.js
│   ├── superadminRoutes.js
│   └── userRoute.js
├── socket/              # Socket.io handlers
│   └── socket.js
├── database/            # Database connection
│   └── database.js
├── utils/               # Utility functions
│   ├── constants.js
│   └── helpers.js
├── cron/               # Scheduled tasks
├── uploads/             # File upload directory
│   ├── logos/
│   ├── qrcodes/
│   └── categories/
├── .env                # Environment variables
├── .gitignore
├── app.js              # Express app configuration
├── server.js           # Main server entry point
├── package.json
└── README.md
```

---

## 🚀 Installation

### **Prerequisites:**
- Node.js (v16+)
- MongoDB
- npm or yarn

### **Setup Steps:**

1. **Clone Repository:**
```bash
git clone <repository-url>
cd Backend
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
cp .env.example .env
# Configure .env variables (see below)
```

4. **Database Setup:**
```bash
# Start MongoDB service
mongod
```

5. **Start Server:**
```bash
# Development
npm run dev

# Production
npm start
```

---

## ⚙️ Environment Variables

Create `.env` file with following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pop_software

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:3000

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## API Endpoints

### **Authentication Routes (`/api/v1/auth`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/me` | Get current user | ✅ |

### **Restaurant Routes (`/api/v1/restaurant`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/create` | Create new restaurant | ✅ |
| GET | `/get-all` | Get all restaurants | ✅ |
| GET | `/:id` | Get restaurant by ID | ✅ |
| PUT | `/:id` | Update restaurant | ✅ |
| DELETE | `/:id` | Delete restaurant | ✅ |
| POST | `/upload-logo` | Upload restaurant logo | ✅ |
| POST | `/upload-qr` | Upload QR code | ✅ |

### **Order Routes (`/api/v1/order`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/place-order` | Place new order | ✅ |
| GET | `/get-all-order` | Get all orders | ✅ |
| GET | `/get-my-orders` | Get user orders | ✅ |
| GET | `/get-status-counts` | Get order status counts | ✅ |
| PUT | `/update-order-stauts/:id` | Update order status | ✅ |
| PUT | `/update-order-details/:id` | Update order details | ✅ |
| PUT | `/update-preparation-time/:id` | Update preparation time | ✅ |
| GET | `/download-invoice/:id` | Download invoice PDF | ✅ |

### **Table Routes (`/api/v1/table`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/create` | Create new table | ✅ |
| GET | `/get-all` | Get all tables | ✅ |
| PUT | `/:id` | Update table status | ✅ |

### **Menu Management Routes (`/api/v1/menu`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/create-item` | Create menu item | ✅ |
| GET | `/get-items` | Get all menu items | ✅ |
| PUT | `/update-item/:id` | Update menu item | ✅ |
| DELETE | `/delete-item/:id` | Delete menu item | ✅ |
| POST | `/create-category` | Create category | ✅ |
| GET | `/get-categories` | Get all categories | ✅ |
| PUT | `/update-category/:id` | Update category | ✅ |

### **Inventory Routes (`/api/v1/inventory`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/add-stock` | Add inventory stock | ✅ |
| GET | `/get-stock` | Get inventory levels | ✅ |
| PUT | `/update-stock/:id` | Update stock quantity | ✅ |
| POST | `/create-item` | Create inventory item | ✅ |

### **POS Billing Routes (`/api/v1/pos`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/process-payment` | Process payment | ✅ |
| GET | `/get-receipt/:id` | Get receipt details | ✅ |
| POST | `/generate-bill` | Generate final bill | ✅ |

### **User Management Routes (`/api/v1/users`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/create-user` | Create new user | ✅ |
| GET | `/get-users` | Get all users | ✅ |
| PUT | `/update-user/:id` | Update user | ✅ |
| DELETE | `/delete-user/:id` | Delete user | ✅ |
| PUT | `/update-role/:id` | Update user role | ✅ |

### **Super Admin Routes (`/api/v1/superadmin`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| GET | `/get-all-restaurants` | Get all restaurants (admin) | ✅ |
| GET | `/get-all-users` | Get all users (admin) | ✅ |
| POST | `/create-restaurant` | Create restaurant (admin) | ✅ |
| PUT | `/toggle-restaurant/:id` | Toggle restaurant status | ✅ |

### **Banner Management Routes (`/api/v1/banner`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| POST | `/create-banner` | Create banner | ✅ |
| GET | `/get-banners` | Get all banners | ✅ |
| PUT | `/update-banner/:id` | Update banner | ✅ |
| DELETE | `/delete-banner/:id` | Delete banner | ✅ |

### **Notification Routes (`/api/v1/notification`)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|-------|
| GET | `/get-notifications` | Get user notifications | ✅ |
| PUT | `/mark-read/:id` | Mark notification as read | ✅ |
| POST | `/send-notification` | Send notification | ✅ |

---

## Database Models

### **User Model**
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // "admin", "restaurant", "user"
  restaurant: ObjectId, // Reference to Restaurant
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Restaurant Model**
```javascript
{
  name: String,
  outletCode: String,
  phone: String,
  email: String,
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  gstNumber: String,
  isActive: Boolean,
  logo: String, // File path
  qrCodeForPayment: String, // QR code file path
  serviceType: [String], // ["dine_in", "qsr", "hybrid"] // Dining Inside Restaurant, Quick Service Restaurant, Hybrid (Both)
  createdBy: ObjectId,
  invoiceTemplate: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **Order Model**
```javascript
{
  orderNumber: String, // Auto-generated
  restaurant: ObjectId,
  table: ObjectId,
  orderType: String, // "DINE_IN", "TAKEAWAY", "DELIVERY"
  customerName: String,
  waiterName: String,
  items: [{
    itemId: ObjectId,
    name: String,
    basePrice: Number,
    quantity: Number,
    variants: [{
      variantId: ObjectId,
      name: String,
      price: Number,
      quantity: Number
    }],
    totalPrice: Number
  }],
  subTotal: Number,
  taxAmount: Number,
  grandTotal: Number,
  orderStatus: String, // "NEW", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"
  preparationTime: Number,
  tokenBillNumber: String,
  orderAccessToken: String, // For guest access
  createdAt: Date,
  updatedAt: Date
}
```

### **Table Model**
```javascript
{
  tableNumber: String,
  capacity: Number,
  status: String, // "free", "occupied", "reserved"
  restaurant: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **Menu Item Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId, // Reference to Category
  restaurant: ObjectId,
  image: [String], // Array of image URLs
  variants: [ObjectId], // Reference to Variant
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Category Model**
```javascript
{
  name: String,
  description: String,
  restaurant: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Variant Model**
```javascript
{
  name: String,
  price: Number,
  menuItem: ObjectId, // Reference to Menu Item
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Payment Method Model**
```javascript
{
  name: String,
  description: String,
  isActive: Boolean,
  restaurant: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **Notification Model**
```javascript
{
  title: String,
  message: String,
  type: String, // "ORDER", "PAYMENT", "SYSTEM"
  receiver: ObjectId, // Reference to User
  sender: ObjectId, // Reference to User
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Role Model**
```javascript
{
  name: String, // "admin", "restaurant", "user"
  permissions: [ObjectId], // Reference to Permission
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Permission Model**
```javascript
{
  name: String,
  description: String,
  module: String, // "orders", "menu", "users", etc.
  action: String, // "create", "read", "update", "delete"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Banner Model**
```javascript
{
  title: String,
  description: String,
  image: String, // Image URL
  link: String, // Optional link
  isActive: Boolean,
  restaurant: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### **Invoice Template Model**
```javascript
{
  name: String,
  template: String, // HTML template
  restaurant: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Add-on Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId,
  restaurant: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Combo Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  items: [ObjectId], // Reference to Menu Items
  restaurant: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication

### **JWT Token Flow:**

1. **Login Request:**
```javascript
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

2. **Login Response:**
```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "restaurant"
  }
}
```

3. **Protected Routes:**
```javascript
// Add Authorization header
Authorization: Bearer <jwt_token>
```

### **Role-Based Access:**
- **Super Admin**: Full access to all restaurants
- **Restaurant Admin**: Access to own restaurant only
- **User**: Limited access based on role

---

## 📁 File Uploads

### **Multer Configuration:**

```javascript
// Logo Upload
{
  destination: './uploads/logos/',
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}

// QR Code Upload
{
  destination: './uploads/qrcodes/',
  filename: (req, file, cb) => {
    cb(null, `qr-${Date.now()}${path.extname(file.originalname)}`);
  }
}
```

### **File Upload Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/restaurant/upload-logo` | Upload restaurant logo |
| POST | `/api/v1/restaurant/upload-qr` | Upload QR code |

---

## 🔌 Socket.io Integration

### **Connection Events:**

```javascript
// Client connects
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

// Join restaurant room
socket.on('joinRestaurant', (restaurantId) => {
  socket.join(`restaurant_${restaurantId}`);
});

// Leave restaurant room
socket.on('leaveRestaurant', (restaurantId) => {
  socket.leave(`restaurant_${restaurantId}`);
});
```

### **Order Events:**

```javascript
// New order placed
io.to(`restaurant_${restaurantId}`).emit('newOrder', orderData);

// Order status updated
io.to(`restaurant_${restaurantId}`).emit('orderUpdated', orderData);

// Preparation time updated
io.to(`restaurant_${restaurantId}`).emit('preparationTimeUpdated', {
  orderId: '64f8a1b2c3d4e5f6a7b8c9d0',
  preparationTime: 15
});
```

### **Real-time Features:**
- 📱 **Live Order Updates**: Instant order status changes
- 🪑 **Table Status**: Real-time table availability
- ⏱️ **Preparation Time**: Live cooking time updates
- 📊 **Dashboard Stats**: Real-time order counts

---

## 🧾 Invoice Generation Workflow

### **PDF Generation Process:**

1. **Order Retrieval:**
```javascript
const order = await Order.findById(id)
  .populate("restaurant")
  .populate("table");
```

2. **QR Code Processing:**
```javascript
// Convert QR code to base64
const qrBase64 = getBase64Image(imagePath);

// Function
const getBase64Image = (filePath) => {
  try {
    const image = fs.readFileSync(filePath);
    return `data:image/png;base64,${image.toString("base64")}`;
  } catch (err) {
    console.log("Image read error:", err);
    return null;
  }
};
```

3. **HTML Template Generation:**
```javascript
const html = `
  <html>
    <head>
      <style>/* Invoice styles */</style>
    </head>
    <body>
      <div class="invoice">
        <!-- Restaurant details -->
        <!-- Order items -->
        <!-- QR code with base64 -->
        <img src="${qrBase64}" width="100" height="100" />
      </div>
    </body>
  </html>
`;
```

4. **PDF Generation with Puppeteer:**
```javascript
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });

const pdf = await page.pdf({
  width: "80mm",
  printBackground: true,
  margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" }
});

await browser.close();
```

5. **Response:**
```javascript
res.set({
  "Content-Type": "application/pdf",
  "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`
});
res.send(pdf);
```

---

## ⚠️ Error Handling

### **Global Error Handler:**
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message);
    error.statusCode = 404;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

### **Response Format:**
```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🚀 Deployment

### **Production Setup:**

1. **Environment Variables:**
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db_name
```

2. **Build Process:**
```bash
# Install production dependencies
npm ci --only=production

# Start production server
npm start
```

3. **PM2 Configuration:**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "pop-backend"

# Monitor
pm2 monit
```

### **Docker Deployment:**

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./Backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/pop_software
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 🔄 API Workflow Examples

### **Complete Order Flow:**

1. **User Authentication:**
```javascript
// Login
POST /api/v1/auth/login
// Get JWT token
```

2. **Place Order:**
```javascript
POST /api/v1/order/place-order
{
  "restaurant": "64f8a1b2c3d4e5f6a7b8c9d0",
  "table": "64f8a1b2c3d4e5f6a7b8c9d1",
  "orderType": "DINE_IN",
  "items": [
    {
      "itemId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "quantity": 2,
      "variants": [
        {
          "variantId": "64f8a1b2c3d4e5f6a7b8c9d3",
          "quantity": 1
        }
      ]
    }
  ],
  "subTotal": 500,
  "taxAmount": 50,
  "grandTotal": 550
}
```

3. **Real-time Updates:**
```javascript
// Socket events received by frontend
socket.on('newOrder', (order) => {
  // Update UI with new order
});

socket.on('orderUpdated', (order) => {
  // Update order status in UI
});
```

4. **Update Order Status:**
```javascript
PUT /api/v1/order/update-order-stauts/64f8a1b2c3d4e5f6a7b8c9d0
{
  "status": "PREPARING"
}
```

5. **Download Invoice:**
```javascript
GET /api/v1/order/download-invoice/64f8a1b2c3d4e5f6a7b8c9d0
// Returns PDF with QR code
```

---

## 📞 Support & Contact

### **Common Issues:**

1. **CORS Errors**: Check `FRONTEND_URL` in .env
2. **Database Connection**: Verify MongoDB is running
3. **File Upload**: Check upload permissions and disk space
4. **Socket.io**: Ensure proper room joining

### **Debug Mode:**
```bash
# Enable debug logs
DEBUG=* npm run dev
```

---

## 📝 Development Guidelines

### **Code Standards:**
- Use ES6+ syntax
- Follow RESTful conventions
- Implement proper error handling
- Add input validation
- Write meaningful comments
- Use async/await for async operations

### **Git Workflow:**
```bash
# Feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Maintainer**: POP Software Development Team