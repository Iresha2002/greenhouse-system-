# SmartGrow OS — Greenhouse Management & Agricultural Marketplaces

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
4. **Hydroponic Bay** — Closed-loop NFT/drip nutrient reservoir monitoring, pH/EC dosing targets, and pump automation.

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
Seed the initial 10 agricultural supply products and verified supplier accounts (safe and idempotent):
```bash
node utils/seedSupplies.js
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

## Demo Supplier Accounts (Created by `seedSupplies.js`)
- **Hardware & IoT Supplier:** `supplier@smartgrow.lk` / `supplier123` (*SmartGrow Automation Supplies*)
- **Nutrients & Seeds Supplier:** `nutrients@ceylonagritech.lk` / `supplier123` (*Ceylon AgriTech Nutrients*)
