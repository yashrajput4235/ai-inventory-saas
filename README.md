# 📦 InventoryAI SaaS

An enterprise-grade Inventory Management platform that leverages **Google Cloud BigQuery** and **Vertex AI** to provide predictive inventory forecasting, smart reordering recommendations, and multi-tenant organization management.

## 🌟 Key Features

- **Multi-Tenant SaaS**: Complete organization hierarchy (Admins ➔ Managers) with Role-Based Access Control (RBAC).
- **AI Demand Forecasting**: Native integration with Google Cloud BigQuery ML to predict future product demand based on historical sales data.
- **Smart Reordering Engine**: Automatically calculates reorder points, required quantities, and safety buffers to prevent stockouts while minimizing overstocking costs.
- **Real-Time Dashboard**: KPIs for Total Revenue, Profit, Sales Count, and active AI-forecasted SKUs.
- **Point of Sale (POS)**: Dedicated checkout view for ringing up sales. Instantly decrements stock and calculates profit margins.
- **Multi-Store Management**: Track inventory and sales across multiple physical or digital storefronts independently.
- **Premium Dark Industrial UI**: Built with React, Tailwind CSS, Shadcn, and Framer Motion for a stunning, developer-focused aesthetic.

---

## 🛠️ Tech Stack 

### Frontend (`/frontend`)
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Dark Industrial System
- **Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest) + Axios
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Charts / Animation**: [Recharts](https://recharts.org/) + [Framer Motion](https://www.framer.com/motion/)

### Backend (`/backend`)
- **Server**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/) (Connecting to PostgreSQL)
- **AI/ML**: Google Cloud Platform ([BigQuery](https://cloud.google.com/bigquery) & [Vertex AI](https://cloud.google.com/vertex-ai))
- **Auth**: JWT (Cookies) + bcrypt
- **Email**: Nodemailer (OTP-based invitations)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Cloud Service Account JSON (for BigQuery/Vertex AI connection)

### 1. Database & Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up your `.env` file (see `.env.example` if available, or use the following):
```env
PORT=5001
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_saas"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
GCP_PROJECT_ID="your_google_cloud_project_id"
GOOGLE_APPLICATION_CREDENTIALS="./your-gcp-service-account.json"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

Initialize Prisma and seed the database:
```bash
npx prisma generate
npx prisma db push
npm run seed     # If you have seed scripts configured
```

Start the backend:
```bash
npm start
# or npm run dev for nodemon
```

### 2. Frontend Setup

In a new terminal, navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the fast Vite development server:
```bash
npm run dev
```

Visit the app at `http://localhost:5173`.

---

## 🤖 AI Retraining Pipeline

The application relies on GCP BigQuery ML for predictions. To keep predictions accurate, you should schedule a CRON job to retrain your models using your actual accumulated sales data.

The backend exposes a secure endpoint to trigger retraining:
`POST /api/retrain-model`

**Recommended Setup (Render / Cloud Scheduler):**
Configure a daily/weekly CRON job hitting this endpoint (e.g., at 3:00 AM UTC). 

---

## 🔒 Security & Architecture Notes
- Passwords are natively hashed with `bcrypt`.
- Sessions utilize `httpOnly` JWT cookies to prevent XSS.
- The Organization/Store relationships use multi-tenant row-level boundaries inside Prisma to prevent data leakage between companies.
- Access to stores by `Manager` accounts is isolated using `UserStore` assignments.

---

## 📄 License
This project is licensed under the MIT License.
