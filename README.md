# SmartGrow — Greenhouse Management & Agricultural Marketplaces

SmartGrow OS is a full-stack greenhouse automation, hydroponic telemetry, and dual agricultural marketplace platform built with **React + Vite + Tailwind CSS v4** on the frontend and **Node.js + Express + MongoDB (Mongoose)** on the backend.

---

## Core Modules

1. **Smart Greenhouse Module** — Real-time environmental monitoring, climate zone control, and automated actuator management.
2. **Crop Marketplace** — Direct farmer-to-customer fresh harvest marketplace with shopping cart, checkout, order history, and farmer fulfilment portal.
3. **Agricultural Suppliers Marketplace (B2B & Farmer Input Exchange)** — Complete e-commerce and inventory management platform for agricultural supplies across 10 configurable categories:
   - Seeds
   - Fertilizers
   - Crop Protection Products
   - Irrigation Equipment
   - Greenhouse Equipment
   - Smart Farming Devices
   - IoT Components
   - Farming Tools
   - Growing Supplies
   - Hydroponic Equipment
4. **SmartGrow ExpertConnect (Greenhouse Agricultural Consultation Platform)** — Professional consultation ecosystem connecting protected-culture farmers and hydroponic growers with certified agronomists, plant pathologists, and automation engineers.

---

## SmartGrow ExpertConnect Platform Features

### 1. Verified Expert Directory (`/api/experts`)
- Filter and search verified specialists by name, qualification (`PhD`, `MSc`, `BSc`), 14 agricultural specializations, consultation format, availability, and fee range.
- Real-time status badges, experience metrics, verified qualification cards, and modal deep-dives.

### 2. Expert Application & Administrator Verification (`/api/experts/apply`, `/api/experts/admin/applications`)
- Credentialed professionals apply with educational background, field experience, bio, and certificates.
- Administrators review, verify, approve, or reject applicants (`403 Forbidden` guard against unauthorized self-verification).

### 3. Greenhouse Problem Diagnostic Intake & Rule-Based Matching (`/api/problems`)
- Farmers describe symptoms, crop growth stages, environmental/telemetry readings (temperature, RH, VPD, EC, pH), and upload up to 5 photographs ($\le 2\text{ MB}$, JPEG/PNG/WebP).
- Automatic rule-based expert recommendation engine transparently matches relevant specialists based on domain tags and experience.

### 4. Appointment Booking & Conflict Prevention (`/api/consultations`)
- Calendar scheduling in Sri Lanka Standard Time (`UTC+5:30`) across 4 formats: **Video**, **Text Advisory**, **Phone Call**, and **Field Visit**.
- Server-side slot collision detection returning `409 Conflict` on overlapping bookings.
- Strict cross-farmer and cross-expert access controls (`403 Forbidden`).

### 5. Private Participant Messaging Thread (`/api/consultations/:id/messages`)
- Chronological in-consultation chat with role badges (**Verified Expert** vs. **Farmer**), high-priority diagnostic notes, and photo uploads ($\le 2\text{ MB}$).

### 6. Structured Expert Recommendations & History (`/api/consultations/:id/recommendation`)
- Assigned experts record observations, probable root causes, step-by-step treatment plans, preventive practices, and chemical safety precautions.
- Permanent preservation in farmer's consultation history with Section 19 Agricultural Advice Responsibility Notice.

### 7. Genuine Reviews & In-App Notifications (`/api/consultations/:id/review`, `/api/consultations/notifications`)
- Only farmers with completed consultations can review specialists (self-reviews and duplicate reviews blocked).
- Live notification drawer keeping users alerted about appointment bookings, chat messages, approvals, and reviews.

### 8. Platform Governance & Moderation (`/api/admin/expertconnect`)
- High-level platform analytics (throughput, lifecycle statuses, top problem categories).
- Full consultation search ledger, review moderation/removal, and account suspension controls.

---

## Agricultural Suppliers Marketplace Features

### Customer & Farmer Storefront
- **Live MongoDB Catalog (`/api/supplies`)** with dynamic category, supplier, brand, availability, and min/max price range filtering.
- **Deep Technical & Composition Search** across product names, brands, models, SKUs, chemical formulas (`NPK`, `EC`, `pH`), and communication protocols (`RS485`, `LoRaWAN`, `Wi-Fi MQTT`).
- **Order-Backed Best-Selling Ranking** computed directly from real `SupplyOrder` records in MongoDB without fabricated reviews or ratings.
- **Dedicated Product Datasheet Modal** displaying electrical/IoT specifications, chemical composition, safety precautions, warranty, and delivery options.
- **Server-Verified Supplies Basket (`/api/cart/calculate-supplies`)** that recalculates unit prices, supplier subtotals, and delivery fees from trusted database records.
- **Atomic Checkout & Order Tracking (`/api/supply-orders`)** supporting Islandwide Delivery (`Cash on Delivery`) and Warehouse Pickup (`Pay on Collection`), duplicate submission protection, and customer order cancellation with automatic stock restoration.
- **Customer Account Profile (`/api/auth/profile`)** for managing permitted contact and default farm delivery details without exposing passwords or tokens.

### Authorized Supplier Portal (`role: 'supplier'`)
- **8-Card Live KPI Dashboard** tracking Total Listed Supplies, Active Listings, Low-Stock Alerts, Out-of-Stock Items, Pending Orders, Active Fulfilment, Completed Orders, and Verified Delivered Revenue ($).
- **Full Product & Specification Studio** to create, edit, toggle visibility, and delete supply products with strict supplier ownership verification.
- **Real-Time Inline Inventory Controls** (`-1`, `+1`, `+10`, `Set Exact Qty & Alert Threshold`, `Mark Out of Stock`) with automatic low-stock alert banners.
- **Supplier Order Fulfilment Workflow** supporting status transitions (`Pending` $\rightarrow$ `Accepted` $\rightarrow$ `Preparing` $\rightarrow$ `Ready for Dispatch` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`, or `Rejected` with automatic warehouse stock restoration).

---

## Quick Start & Local Development

### 1. Backend Setup (`backend/`)
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` with:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```
Seed initial supply catalog and verified agricultural experts (safe and idempotent):
```bash
node utils/seedSupplies.js
node utils/seedExperts.js
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
Production build verification:
```bash
npm run build
```

---

## Seeded Demo Accounts (for Testing & Grading)
- **Platform Administrator:** `admin@smartgrow.lk` / `admin123`
- **Verified Expert (Hydroponics & Automation):** `kavinda.expert@smartgrow.lk` / `expert123` (*Dr. Kavinda Perera, PhD*)
- **Verified Expert (Pathology & Diseases):** `tharushi.expert@smartgrow.lk` / `expert123` (*Dr. Tharushi Alwis, PhD*)
- **Verified Expert (Nutrient Management):** `roshan.expert@smartgrow.lk` / `expert123` (*Eng. Roshan Gunasekara, MSc*)
- **Verified Expert (Protected Agriculture):** `nadeesha.expert@smartgrow.lk` / `expert123` (*Nadeesha Wickramasinghe, MSc*)
- **Hardware & IoT Supplier / Farmer:** `supplier@smartgrow.lk` / `supplier123` (*SmartGrow Automation Supplies*)
---

## System Architecture & Technologies

```mermaid
graph TD
    subgraph CLIENT_LAYER["1. Client Presentation Layer (Frontend)"]
        UI["React 18 SPA (Vite)"]
        TW["Tailwind CSS v4 & Lucide Icons"]
        AXIOS["Axios Client (with 401 JWT Interceptor)"]
        CANVAS["HTML5 Canvas Image Compressor"]
    end

    subgraph API_GATEWAY["2. Application & API Layer (Backend)"]
        EXPRESS["Express.js REST API Server (Node.js)"]
        AUTH_MW["JWT Auth & RBAC Middleware\n(Farmer | Supplier | Customer | Expert | Admin)"]
        
        subgraph ROUTERS["API Service Routes"]
            R_AUTH["/api/auth (Login, Register, Profile)"]
            R_PROD["/api/products (Crop CRUD & Studio)"]
            R_SUPP["/api/supplies (Agri Supplies CRUD)"]
            R_ORDER["/api/orders & /api/supply-orders (Cart & Checkout)"]
            R_EXP["/api/experts & /api/consultations (Agronomist Desk)"]
            R_DEV["/api/devices & /api/sensors (IoT Monitoring)"]
        end
        
        SIM["Live IoT Background Sensor Simulator"]
    end

    subgraph DATA_LAYER["3. Data Persistence Layer (Database)"]
        MONGO[("MongoDB NoSQL Database\n(greenhouse_db)")]
        MONGOOSE["Mongoose ODM (Schemas, Types, Validation & Indexing)"]
    end

    subgraph EXTERNAL["4. External Actors & Physical Devices"]
        FARMER["👨‍🌾 Farmer Device (Mobile / Desktop)"]
        SUPPLIER["📦 Supplier Portal User"]
        CUSTOMER["🛒 Consumer / Buyer"]
        EXPERT["🔬 Certified Agronomist"]
        IOT_GATEWAY["📡 ESP32 / DHT22 / Soil Sensor Nodes"]
    end

    EXTERNAL --> UI
    UI --> AXIOS
    AXIOS -->|HTTPS / REST API| EXPRESS
    EXPRESS --> AUTH_MW
    AUTH_MW --> ROUTERS
    SIM -->|Simulated Telemetry| R_DEV
    ROUTERS --> MONGOOSE
    MONGOOSE --> MONGO
```

---

## Database Design & Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "farmers create/manage"
    USER ||--o{ SUPPLY_PRODUCT : "suppliers list"
    USER ||--o{ ORDER : "customers place"
    USER ||--o{ SUPPLY_ORDER : "farmers/customers place"
    USER ||--o{ DEVICE : "farmers monitor"
    USER ||--o{ CONSULTATION : "farmers book"
    USER ||--o{ EXPERT_PROFILE : "experts hold"
    
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    ORDER ||--|{ ORDER_ITEM : "contains"
    
    SUPPLY_PRODUCT ||--o{ SUPPLY_ORDER_ITEM : "included in"
    SUPPLY_ORDER ||--|{ SUPPLY_ORDER_ITEM : "contains"
    
    CONSULTATION ||--o{ CONSULTATION_MESSAGE : "contains chat"
    CONSULTATION ||--o| EXPERT_REVIEW : "receives rating"
    EXPERT_PROFILE ||--o{ CONSULTATION : "assigned to"

    USER {
        ObjectId _id PK
        string username "Unique"
        string email "Unique, Lowercase"
        string password "Bcrypt Hashed"
        string role "farmer | supplier | customer | expert | admin"
        string phoneNumber
        string location
        boolean isSuspended
        date createdAt
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId farmerId FK "Ref: User"
        string name "Required"
        string category "Vegetables | Fruits | Leafy greens | Herbs | Other"
        number price "Unit Price (USD)"
        string unit "kg | g | bundle | piece"
        number quantity "Available Inventory"
        string status "active | inactive"
        string image "Base64 or Image URL"
        string location "Farm Location"
        date createdAt
    }

    SUPPLY_PRODUCT {
        ObjectId _id PK
        ObjectId supplierId FK "Ref: User"
        string name "Product Name"
        string category "10 Configurable Categories"
        string brand "Manufacturer"
        string model "Model Number"
        string sku "Stock Keeping Unit"
        number price "Unit Price"
        string unit "piece | bag | liter | pack"
        number quantity "Stock on hand"
        number lowStockThreshold "Alert trigger"
        string status "active | inactive"
        string image "Base64 photo"
        object specifications "Chemical & IoT Specs"
        date createdAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId customerId FK "Ref: User"
        array items "List of OrderItems"
        number totalAmount "Verified Subtotal + Delivery"
        string status "pending | confirmed | dispatched | delivered | cancelled"
        string deliveryAddress "Shipping location"
        string paymentMethod "Escrow | COD"
        date createdAt
    }

    SUPPLY_ORDER {
        ObjectId _id PK
        ObjectId buyerId FK "Ref: User"
        ObjectId supplierId FK "Ref: User"
        array items "List of SupplyOrderItems"
        number totalAmount "Server verified price"
        string deliveryMethod "islandwide | pickup"
        string status "pending | accepted | preparing | dispatched | delivered | rejected"
        date createdAt
    }

    DEVICE {
        ObjectId _id PK
        string name "Fan 1 | Pump 2 | Fogger"
        string type "fan | pump | light | heater"
        string status "on | off"
        string mode "auto | manual"
        date lastActive
    }

    CONSULTATION {
        ObjectId _id PK
        ObjectId farmerId FK "Ref: User"
        ObjectId expertId FK "Ref: User"
        date scheduledDate "UTC+5:30"
        string format "video | text | phone | field_visit"
        string status "Pending | Accepted | Completed | Cancelled"
        string problemDescription
        object recommendation "Digital Prescription"
        date createdAt
    }

    EXPERT_PROFILE {
        ObjectId _id PK
        ObjectId userId FK "Ref: User"
        string qualification "PhD | MSc | BSc"
        array specializations "14 Agronomy Fields"
        number consultationFee "Hourly rate"
        string verificationStatus "verified | pending | rejected"
    }
```

