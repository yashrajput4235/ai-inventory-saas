# 🚀 InventoryAI – AI Powered Inventory Management System

InventoryAI is a **Multi-Tenant AI-Powered Inventory Management Platform** designed to help businesses **predict stock shortages before they happen**.

Unlike traditional inventory systems that only track stock levels, InventoryAI uses **machine learning to forecast product demand and generate intelligent reorder recommendations.**

---

# 🧠 Key Features

### 📦 Smart Inventory Management

* Real-time inventory tracking
* Multi-store product management
* POS transaction handling

### 🤖 AI Demand Prediction

* Forecasts product demand using historical sales data
* Identifies potential stock shortages
* Generates intelligent reorder recommendations

### ⚠️ Automated Stock Alerts

* Detects **Critical Stock Shortfalls**
* Alerts managers when predicted demand exceeds available stock

### 🏪 Multi-Tenant Architecture

Supports multiple organizations and stores with strict data isolation.

### 🔐 Role Based Access Control (RBAC)

**Admins**

* Organization-wide inventory visibility
* Cross-store analytics

**Managers**

* Store-level inventory access
* Local stock alerts

---

# 🏗️ System Architecture

```
Frontend (React + Vite)
        │
        ▼
Backend APIs (Node.js)
        │
        ▼
PostgreSQL Database
        │
        ▼
Data Pipeline
(PostgreSQL → BigQuery)
        │
        ▼
AI Forecast Model (Vertex AI)
        │
        ▼
Smart Reorder Engine
        │
        ▼
Critical Stock Alerts
```

---

# ⚙️ Tech Stack

### Frontend

* React
* Vite

### Backend

* Node.js
* REST APIs

### Database

* PostgreSQL

### Data Engineering

* Google BigQuery

### Machine Learning

* Google Vertex AI Forecasting

### Cloud Automation

* Google Cloud Scheduler

---

# 🔄 AI Prediction Workflow

1️⃣ Sales data is stored in **PostgreSQL**

2️⃣ Historical sales data is synced to **BigQuery**

3️⃣ **Vertex AI Forecast Model** analyzes:

* Sales velocity
* Historical demand
* Seasonal trends

4️⃣ Predicted demand is generated for each product.

5️⃣ If:

```
Predicted Demand > Current Stock
```

System triggers:

* ⚠️ Critical Stock Alert
* 📦 Reorder Recommendation

---

# 🔐 Security

* JWT Authentication
* Role Based Access Control
* Store-level data isolation
* Secure API access

---

# 📊 Live Demo

Demo Link:

```
https://ai-inventory-saas.vercel.app/auth/login
```

Admin Login:

```
Email: vaibhavyash001@gmail.com
Password: #Yash4235
```

Manger Login:

```
Email: yashrajput97241@gmail.com
Password: #Yash4235
```
---

# 📚 Key Learnings

Building this system involved working with:

* Multi-tenant SaaS architecture
* Data pipelines for machine learning
* Cloud-based AI services
* Role-based access control systems
* Scalable backend architecture

---

# 🚀 Future Improvements

* Real-time demand forecasting
* AI-driven price optimization
* Sales trend analytics dashboard
* Supplier integration for automated reordering

---

# 📬 Connect With Me

If you're interested in **AI systems, data pipelines, or scalable SaaS architecture**, feel free to connect!

LinkedIn: *(www.linkedin.com/in/yash-rajput-ab811a258)*


