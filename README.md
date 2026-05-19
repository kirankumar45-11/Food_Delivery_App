# 🍔 BiteSwift — Food Delivery App

A full-stack food delivery web application built with **React + Vite** (frontend) and **Python FastAPI + SQLite** (backend).

## ✨ Features

- 🏠 **Landing Page** — Beautiful hero section with featured restaurants
- 🔐 **Authentication** — User registration & login (Customer / Restaurant roles)
- 🍽️ **Restaurant Dashboard** — Manage menu items, view & process incoming orders
- 🛒 **Cart System** — Add items, adjust quantities, real-time cart drawer
- 📦 **Order Tracking** — Live order status tracker with step-by-step updates
- 💳 **Checkout Flow** — Smooth multi-step checkout with order confirmation
- 👤 **Customer Dashboard** — View order history and track active orders

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router        |
| Styling   | Vanilla CSS (custom design system)  |
| Backend   | Python FastAPI, SQLAlchemy, SQLite  |
| Auth      | JWT Tokens                          |

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📁 Project Structure

```
Food_Delivery_App/
├── backend/                 # FastAPI backend
│   ├── main.py              # API routes & app entry point
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # DB connection & session management
│   └── requirements.txt     # Python dependencies
├── src/                     # React frontend
│   ├── pages/               # Route-level page components
│   ├── components/          # Reusable UI components
│   ├── context/             # React context (Cart, Auth)
│   ├── App.jsx              # App router setup
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
└── package.json             # Node dependencies
```

## 📄 License

MIT License — feel free to use and modify.
