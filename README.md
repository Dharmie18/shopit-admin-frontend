# ShopIt — Admin Control Room

> **Executive Operations & Inventory Management Console**  
> High-performance Next.js dashboard for inventory, order fulfillment, financial oversight, user access, and newsletter subscribers.

---

##  Overview

The **ShopIt Admin Frontend** is the private management interface for store administrators and operations managers. It communicates directly with the PHP MySQL backend via JWT/Bearer authentication, allowing real-time oversight of products, categories, orders, payments, customers, and subscribers.

---

##  Modules & Capabilities

- ** Executive Analytics Dashboard**: Real-time gross settled revenue in Naira (`₦`), monthly momentum, low stock alerts, revenue pulse bar chart, and Top 5 B2B Customer leaderboard.
- ** Inventory & Product Manager**: Complete CRUD operations for products (SKU ID, category assignment, stock levels, unit pricing in `₦ NGN`, and descriptions).
- ** Category Taxonomy Manager**: Manage parent and child product categories.
- ** Order Fulfillment Queue**: Track incoming customer orders, shipping destinations, invoice totals, and update statuses (`Pending` $\to$ `Shipped` $\to$ `Delivered` $\to$ `Cancelled`).
- ** Financial Payment Oversight**: Audit transaction IDs, gateways (Bank Transfer, Card, Invoice), settlement timestamps, and manual status overrides.
- ** User & Role Access Control**: Manage customer and admin accounts. The root superadmin account is shielded from accidental deletion.
- ** Newsletter Subscriber Management**: Live tracking of trade dispatch subscribers with search, status filtering, and removal actions.

---

##  Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend API**: PHP 8.x + MySQL via XAMPP 

---

##  Getting Started

### 1. Prerequisites
- **Node.js**: v18+ installed
- **XAMPP**: Apache & MySQL services running
- **Backend API**: Deployed at `C:\xampp\htdocs\ecommerce-api`

### 2. Installation & Setup
```bash
cd "Admin Frontend"
npm install
```

### 3. Running the Dev Server
```bash
npm run dev -- -p 3001
```
The admin console will start on **[http://localhost:3001](http://localhost:3001)**.

### 4. Production Build & Validation
```bash
npx tsc --noEmit     # Verify TypeScript types (0 errors)
npm run build        # Build optimized production bundle
npm run start        # Start production server
```

---

##  Project Structure

```
Admin Frontend/
├── app/
│   ├── globals.css              # Global admin theme styles
│   ├── layout.tsx               # Root layout, metadata, and favicon configuration
│   ├── page.tsx                 # Main admin controller, auth check, view switching
│   └── icon.svg                 # Admin shield vector favicon
├── components/
│   ├── CategoriesManager.tsx    # Category CRUD table and modal forms
│   ├── Dashboard.tsx            # Executive KPI cards, sales chart, and alerts
│   ├── Login.tsx                # Secure admin authentication form
│   ├── Navbar.tsx               # Top administrative header and user badge
│   ├── OrdersManager.tsx        # Fulfillment queue and status updates
│   ├── PaymentsManager.tsx      # Payment transactions and audit logs
│   ├── ProductsManager.tsx      # Product catalog manager and Naira pricing
│   ├── Sidebar.tsx              # Adaptive navigation sidebar / tab bar
│   ├── SubscribersManager.tsx   # Newsletter subscriber audience manager
│   ├── UsersManager.tsx         # User and role administration
│   └── ui/                      # Reusable UI primitives (Button, Modal, Badge, Skeleton)
├── lib/
│   ├── api.ts                   # Authenticated API request client
│   ├── auth.ts                  # Admin token session storage
│   ├── types.ts                 # TypeScript type contracts
│   └── utils.ts                 # Naira currency formatting (`money()`) and helpers
├── public/
│   └── icon.svg                 # Branded admin favicon asset
├── package.json
└── tsconfig.json
```

---

##  Protected Admin API Endpoints Used

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/reports.php/monthly-sales` | `GET` | Fetch sales revenue by month |
| `/api/admin/reports.php/top-customers` | `GET` | Fetch leaderboard of top buyers |
| `/api/admin/reports.php/low-stock` | `GET` | Fetch items with stock < 10 |
| `/api/admin/product.php` | `POST, PUT, DELETE` | Product CRUD operations |
| `/api/admin/category.php` | `POST, PUT, DELETE` | Category CRUD operations |
| `/api/admin/orders.php` | `GET, PUT` | List and update order status |
| `/api/admin/payments.php` | `GET, PUT` | Audit and update payment status |
| `/api/admin/users.php` | `GET, POST, PUT, DELETE` | User account administration |
| `/api/admin/subscribers.php` | `GET, DELETE` | List and manage subscribers |
