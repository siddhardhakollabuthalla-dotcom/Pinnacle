# ⚔️ Pinnacle — Life RPG Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **Gamify your real-world tasks, build consistency, and level up your life.**

**Pinnacle** is a full-stack, cyberpunk-themed Life RPG application that turns daily habits, study routines, and personal goals into an engaging role-playing experience. Earn XP, accumulate Gold, maintain streak multipliers, unlock custom themes/badges, and level up real-world attributes like *Strength*, *Intelligence*, *Discipline*, and *Focus*.

---

## ✨ Key Features

- ⚔️ **Dynamic Quest Log**: Accept, complete, and track real-world quests across difficulty ranks (*Easy*, *Medium*, *Hard*, *Epic*, *Legendary*).
- 🏆 **Active & Completed Tabs**: Separate views for active missions and completed tasks with live quest counter badges.
- ⚡ **Anti-Cheat RPG Progression**: Server-side XP & Gold reward calculations with exponential level scaling curves.
- 🔥 **Streak Multipliers**: Maintain daily completion streaks to multiply earned XP and Gold bonuses.
- 📊 **Attribute Mastery**: Bind quests to specific real-life RPG attributes (*Strength*, *Intelligence*, *Creativity*, *Vitality*, *Focus*, *Discipline*) to level up individual stats.
- 🛍️ **Item Shop & Inventory**: Purchase custom themes (*Cyberpunk*, *16-Bit Dungeon*, *Cozy Lo-Fi*) and cosmetic badges using in-game gold.
- 🚀 **Optimistic UI Engine**: Zero UI delay powered by React Query optimistic state updates and Web Audio API SFX synthesis.
- 🔒 **Cookie & Bearer Auth**: Secure JWT session management supporting both HTTP-Only cookies and Authorization headers.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Python FastAPI
- **Database / ORM**: SQLAlchemy 2.0 (Async Engine) + SQLite / PostgreSQL (Neon)
- **Security**: Pydantic v2, Passlib (Bcrypt), PyJWT
- **Testing**: Pytest & Async Httpx

### **Frontend**
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS + TailwindCSS v4 + Framer Motion
- **State Management**: TanStack React Query v5 & Zustand
- **Audio Synthesis**: Web Audio API Sound Engine

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Seed database with default attributes, shop items & demo user
python seed.py

# Run FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> 🔑 **Default Demo Credentials**:
> - **Username**: `hero123`
> - **Password**: `password123`

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser!

---

## 🧪 Running Automated Tests

Run backend unit tests with Pytest:

```bash
cd backend
python -m pytest
```

---

## 📁 Directory Structure

```text
Pinnacle/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI APIRouter endpoints (auth, character, quests, shop, history)
│   │   ├── core/         # DB connection, security, config settings
│   │   ├── models/       # SQLAlchemy ORM models (User, Character, Quest, Item, Inventory, etc.)
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── services/     # Progression calculation & streak algorithms
│   ├── tests/            # Pytest test suite
│   ├── seed.py           # Database seeder script
│   └── requirements.txt  # Python package requirements
├── frontend/
│   ├── src/
│   │   ├── api/          # API client & error handling
│   │   ├── components/   # Game HUD, bottom navigation, FX modals
│   │   ├── features/     # QuestBoard, AuthModal, CharacterDashboard, ShopView, Leaderboard
│   │   ├── store/        # Zustand state store
│   │   └── utils/        # Web Audio SFX sound engine
│   ├── package.json      # Node package manifest
│   └── vite.config.ts    # Vite dev server & proxy configuration
└── README.md             # Project documentation
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
