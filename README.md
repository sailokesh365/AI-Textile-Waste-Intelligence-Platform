# AI Textile Waste Intelligence Platform — Milestone 1 Enterprise Release

## 📌 Project Overview

The **AI Textile Waste Intelligence Platform** is a full-stack enterprise web application designed to track, categorize, and trace post-industrial and post-consumer textile waste batches. Built strictly to production engineering standards, **Milestone 1** establishes the robust full-stack foundation: secure JWT authentication with Role-Based Access Control (RBAC), end-to-end Textile Inventory Management CRUD, an enterprise landing dashboard, and standardized dataset architecture.

---

## 🏛️ Milestone 1 Features

### 1. Landing Page
- **Modern Enterprise UI**: High-impact hero section, architecture breakdown, platform value proposition, and responsive footer built with Tailwind CSS.
- **Responsive Layout**: Designed for mobile, tablet, and desktop viewports.

### 2. Authentication & Access Management
- **User Registration & Login**: Built with JWT authentication and secure bcrypt password hashing.
- **Role-Based Access Control (RBAC)**: Supports `Admin` and `User` roles.
- **Protected Routes**: Middleware protection across backend endpoints and frontend views.
- **User Profile Management**: View account metadata and update personal profile settings.

### 3. Textile Inventory Management (Full CRUD)
Every textile batch captures 7 standardized attributes required for circular supply chain traceability:
1. **Waste Batch ID** (`wasteBatchId`)
2. **Fabric Type** (`fabricType`: Cotton, Polyester, Denim, Wool, Silk, Blend, Other)
3. **Source** (`source`: Garment Factory, Post-Consumer, Mill Waste, Boutique, Retail Return, Other)
4. **Quantity** (`quantity`: Weight in KG)
5. **Color** (`color`)
6. **Condition** (`condition`: Recyclable, Good, Damaged, Heavily Damaged, Unsorted)
7. **Collection Date** (`collectionDate`)

- **Create**: Register new waste batches via interactive modal.
- **Read**: View, filter by fabric & condition, search by Batch ID or Color, and inspect KPIs.
- **Update**: Modify existing batch attributes.
- **Delete**: Remove obsolete inventory entries safely.

### 4. Dataset Integration
- Structured dataset directories (`raw/`, `processed/`, `metadata/`, `sample_images/`).
- Includes `dataset/README.md` documentation ready for future machine learning model ingestion.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (Vite), React Router v7, Tailwind CSS v4, Axios
- **Backend**: Node.js, Express.js 5, MongoDB (Mongoose), JSON Web Tokens (JWT), bcryptjs

---

## 📁 Clean Architecture Folder Structure

```
AI-Textile-Waste-Intelligence-Platform/
├── frontend/
│   ├── src/
│   │   ├── Authentication/    # Login, Register, Profile, AuthContext, ProtectedRoute
│   │   ├── Home/              # LandingPage
│   │   ├── Inventory/         # InventoryDashboard, InventoryModal
│   │   └── Shared/            # Navbar, Footer, axiosInstance
├── backend/
│   ├── config/                # MongoDB connection (db.js)
│   ├── controllers/           # authController.js, inventoryController.js
│   ├── middleware/            # authMiddleware.js (JWT & RBAC)
│   ├── models/                # User.js, Inventory.js
│   ├── routes/                # authRoutes.js, inventoryRoutes.js
│   └── server.js              # Express Application Entrypoint
└── dataset/
    ├── raw/
    ├── processed/
    ├── metadata/
    └── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance running locally on `mongodb://127.0.0.1:27017/textile_waste_db` or via MongoDB Atlas.

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## ✔️ Verification Checklist

- ✔️ No compilation errors
- ✔️ Clean folder structure (`Authentication`, `Home`, `Inventory`, `Shared` in frontend; strict MVC in backend)
- ✔️ Authentication & Protected Routes verified
- ✔️ Full Inventory CRUD verified
- ✔️ Dataset structure documented
- ✔️ GitHub ready
