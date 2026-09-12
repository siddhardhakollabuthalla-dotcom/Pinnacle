# 📖 Pinnacle: Full-Stack System Architecture & Technical Documentation

This document provides a comprehensive, end-to-end explanation of the **Pinnacle** Life RPG Engine across both the **Backend** and **Frontend** systems.

---

## Table of Contents
1. [System Overview & Core Philosophy](#1-system-overview--core-philosophy)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Backend Architecture Deep Dive](#3-backend-architecture-deep-dive)
   - [3.1 Entry Point & Lifespan (`app/main.py`)](#31-entry-point--lifespan-appmainpy)
   - [3.2 Core Configuration & Database (`app/core/`)](#32-core-configuration--database-appcore)
   - [3.3 Security & Authentication (`app/core/security.py`)](#33-security--authentication-appcoresecuritypy)
   - [3.4 Database Models & Entity Relations (`app/models/models.py`)](#34-database-models--entity-relations-appmodelsmodelspy)
   - [3.5 Pydantic Schemas & Data Contracts (`app/schemas/schemas.py`)](#35-pydantic-schemas--data-contracts-appschemasschemaspy)
   - [3.6 Game Progression & Anti-Cheat Engine (`app/services/progression.py`)](#36-game-progression--anti-cheat-engine-appservicesprogressionpy)
   - [3.7 API Routers (`app/api/`)](#37-api-routers-appapi)
   - [3.8 Database Seeder (`seed.py`)](#38-database-seeder-seedpy)
   - [3.9 Automated Test Suite (`tests/test_backend.py`)](#39-automated-test-suite-teststest_backendpy)
4. [Frontend Architecture Deep Dive](#4-frontend-architecture-deep-dive)
   - [4.1 Application Lifecycle & Shell (`App.tsx`, `main.tsx`)](#41-application-lifecycle--shell-apptsx-maintsx)
   - [4.2 API Client & Network Layer (`api/client.ts`)](#42-api-client--network-layer-apiclientts)
   - [4.3 State Management (`store/useUIStore.ts` & React Query)](#43-state-management-storeuseuistorets--react-query)
   - [4.4 Procedural Audio Synthesis (`utils/soundEngine.ts`)](#44-procedural-audio-synthesis-utilssoundenginets)
   - [4.5 Global Game HUD & Navigation (`components/game/`)](#45-global-game-hud--navigation-componentsgame)
   - [4.6 Feature Modules (`features/`)](#46-feature-modules-features)
     - [Quest Board & Proof Verification Modal](#quest-board--proof-verification-modal)
     - [Game Lobby & 3D Character Viewport](#game-lobby--3d-character-viewport)
     - [Character Dashboard & Stat Tree](#character-dashboard--stat-tree)
     - [Armory & Cosmetic Shop](#armory--cosmetic-shop)
     - [Battle Pass Season Track](#battle-pass-season-track)
     - [Global Competitive Leaderboard](#global-competitive-leaderboard)
     - [Authentication Modal](#authentication-modal)
5. [Key Lifecycle & Data Flows](#5-key-lifecycle--data-flows)
   - [Flow 1: User Registration & Character Initialization](#flow-1-user-registration--character-initialization)
   - [Flow 2: Mission Acceptance, Proof Verification & Completion](#flow-2-mission-acceptance-proof-verification--completion)
   - [Flow 3: Currency Earning, Shop Purchase & Dynamic Theme Switching](#flow-3-currency-earning-shop-purchase--dynamic-theme-switching)
6. [Anti-Cheat & Security Design](#6-anti-cheat--security-design)
7. [Environment & Deployment Guide](#7-environment--deployment-guide)

---

## 1. System Overview & Core Philosophy

**Pinnacle** transforms personal habit tracking, education, physical training, and task management into an authentic **Role-Playing Game (RPG)**. Unlike traditional to-do lists, Pinnacle treats the user as an evolving player character:

- **Server-Authoritative Progression**: The client never calculates XP, Gold, or Levels. All math, multipliers, and streak bonuses are verified and executed by the backend API.
- **Anti-Cheat Verification**: Quests cannot be marked completed by simply clicking a checkbox for unearned rank inflation. Completing a quest requires providing concrete proof tailored to the quest's category (e.g., workout metrics, code commits, study summaries).
- **Attribute-Bound Skill Trees**: Quests map to core real-world attributes (*Strength*, *Intelligence*, *Discipline*, *Creativity*, *Vitality*, *Focus*, *Confidence*) which level up independently alongside overall character levels.
- **Zero-Latency Optimistic UI**: User interactions trigger immediate visual responses (floating XP, state updates, procedural sound synthesis), backed by transactional reconciliation.

---

## 2. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph Browser ["Frontend (React 19 + TypeScript + Vite)"]
        UI[User Interface / Game HUD]
        RQ[TanStack React Query Cache]
        ZUSTAND[Zustand UI Store]
        AUDIO[Web Audio API Sound Engine]
        CLIENT[API Client /api]
    end

    subgraph Server ["Backend (FastAPI + Python 3.12)"]
        PROXY[Vite Reverse Proxy :5173]
        FASTAPI[FastAPI Application :8000]
        AUTH[JWT & Cookie Authentication]
        ENGINE[Progression & Anti-Cheat Engine]
        ROUTERS[API Routers: quests, character, shop, history]
    end

    subgraph Database ["Persistence Layer (PostgreSQL - Neon Serverless)"]
        SA[SQLAlchemy 2.0 Async + asyncpg]
        TABLES[(PostgreSQL Relational DB)]
    end

    UI -->|Triggers sound| AUDIO
    UI -->|Updates transient state| ZUSTAND
    UI -->|Mutations & Queries| RQ
    RQ --> CLIENT
    CLIENT -->|Fetch with Bearer/Cookie| PROXY
    PROXY --> FASTAPI
    FASTAPI --> AUTH
    AUTH --> ROUTERS
    ROUTERS --> ENGINE
    ROUTERS --> SA
    ENGINE --> SA
    SA --> TABLES
```

---

## 3. Backend Architecture Deep Dive

### 3.1 Entry Point & Lifespan (`app/main.py`)
- **FastAPI Lifespan Context Manager**:
  - Automatically invokes `init_db()` upon startup to ensure all PostgreSQL tables, indexes, and column migrations exist.
  - Runs `seed_data()` to ensure core RPG attributes and store items are populated without manual administrative intervention.
- **CORS Middleware**:
  - Configured with `allow_origin_regex=r"https?://.*"` and `allow_credentials=True`. This allows seamless development across `localhost`, local IP addresses, and secure tunnels without browser CORS rejections.
- **Router Registration**:
  - Modularly binds sub-routers: `/auth`, `/character`, `/quests`, `/shop`, and `/history`.
- **Health Check Endpoint**:
  - `GET /health` returns JSON `{"status": "ok", "app": "Pinnacle API"}` for monitoring and liveness probes.

---

### 3.2 Core Configuration & Database (`app/core/`)
- **`app/core/config.py`**:
  - Inherits from Pydantic `BaseSettings`.
  - Reads `DATABASE_URL` from the environment or defaults to the managed Neon PostgreSQL pooler URL with SSL enabled.
  - Centralizes JWT secret keys, cryptographic algorithm (`HS256`), and session lifetimes (`ACCESS_TOKEN_EXPIRE_MINUTES = 10080` / 7 days).
- **`app/core/database.py`**:
  - Creates the asynchronous SQLAlchemy engine via `create_async_engine(settings.DATABASE_URL)`.
  - Utilizes `NullPool` to prevent stale connection leaks when integrating with Neon's serverless autoscaling PostgreSQL proxy.
  - `AsyncSessionLocal`: Asynchronous session factory (`expire_on_commit=False`).
  - `get_db()`: Async dependency generator yielding isolated transactions per HTTP request with automatic cleanup.
  - `init_db()`: Executes table creation and database schema migrations (e.g., `ALTER TABLE quest_completions ADD COLUMN IF NOT EXISTS proof_text TEXT`).

---

### 3.3 Security & Authentication (`app/core/security.py`)
- **Password Hashing**: Utilizes `passlib` with `bcrypt` algorithms for salting and hashing credentials before database storage.
- **JWT Token Handling**:
  - `create_access_token(data, expires_delta)` generates signed tokens containing user ID subject claims (`sub`) and expiration dates.
  - `decode_access_token(token)` validates signatures and unpacks payloads.
- **Dual Authentication Support**:
  - The `get_current_user` dependency checks for authentication in **two** places:
    1. HTTP-Only `access_token` cookie (standard web browser session).
    2. HTTP `Authorization: Bearer <token>` header (API clients and mobile/cross-origin calls).

---

### 3.4 Database Models & Entity Relations (`app/models/models.py`)

```mermaid
erDiagram
    User ||--|| Character : "owns (1:1)"
    User ||--o{ Quest : "creates (1:N)"
    User ||--o{ QuestCompletion : "logs (1:N)"
    User ||--o{ Inventory : "owns items (1:N)"
    User ||--o{ GoldTransaction : "transacts (1:N)"
    Character ||--o{ CharacterAttribute : "tracks (1:N)"
    Attribute ||--o{ CharacterAttribute : "defines (1:N)"
    Attribute ||--o{ Quest : "categorizes (1:N)"
    Quest ||--o{ QuestCompletion : "records (1:N)"
    Item ||--o{ Inventory : "stored in (1:N)"
```

- **`User`**: Account identity containing `id` (UUID), `email`, `username`, `password_hash`, and timestamps.
- **`Character`**: RPG avatar state containing `level`, `current_xp`, `total_xp`, `gold`, `gems`, `current_streak`, `longest_streak`, and `last_completion_date`.
- **`Attribute`**: System-defined RPG stats (*Strength*, *Intelligence*, *Discipline*, *Creativity*, *Vitality*, *Focus*, *Confidence*) with display names and icons.
- **`CharacterAttribute`**: User-specific progress for a specific attribute (`level`, `xp`).
- **`Quest`**: Tasks created by users containing `title`, `description`, `difficulty` (*trivial, easy, medium, hard, epic, legendary*), `is_recurring`, `attribute_id`, and `status` (*active, completed, archived*).
- **`QuestCompletion`**: Immutable audit record for completed quests. Records `completed_at`, `xp_awarded`, `gold_awarded`, `streak_at_completion`, `proof_text`, and `proof_link`.
- **`Item`**: Shop items with `cost`, `type` (*theme, badge, avatar_item, consumable*), and `metadata_json`.
- **`Inventory`**: Cross-reference table linking users to purchased items with `equipped` status.
- **`GoldTransaction`**: Transaction ledger tracking every gold addition or deduction with reference IDs and reasons.

---

### 3.5 Pydantic Schemas & Data Contracts (`app/schemas/schemas.py`)
- **`UserCreate` & `UserLogin`**: Strict input validation for credentials.
- **`CharacterOut` & `CharacterAttributeOut`**: Serializes character level, XP, next-level XP thresholds, currencies, streaks, and sub-attributes.
- **`QuestCreate` & `QuestUpdate`**: Validates quest title, description, difficulty constraints via regex patterns (`trivial|easy|medium|hard|epic|legendary`), and optional attribute associations.
- **`QuestCompleteRequest`**:
  - `proof_text`: Required string with minimum 5 characters and maximum 1000 characters.
  - `proof_link`: Optional string (URL) with maximum 500 characters.
- **`QuestCompletionResult`**: Detailed response returning `xp_awarded`, `gold_awarded`, `leveled_up`, `new_level`, `current_streak`, `attribute_leveled_up`, `new_attribute_level`, `proof_text`, and `proof_link`.
- **`LeaderboardUserOut`**: Real-time rank listing containing `rank`, `name`, `level`, `xp`, `streak`, and `is_current`.

---

### 3.6 Game Progression & Anti-Cheat Engine (`app/services/progression.py`)
All mathematical formulas for player progression reside here:

1. **Reward Computation**:
   $$\text{XP Base}: \{\text{trivial}: 5, \text{easy}: 15, \text{medium}: 30, \text{hard}: 60, \text{epic}: 120, \text{legendary}: 250\}$$
   $$\text{Streak Bonus} = \min(\text{streak} \times 0.05, 1.0) \quad (\text{up to } +100\%)$$
   $$\text{Final XP} = \lfloor\text{Base XP} \times (1 + \text{Streak Bonus})\rfloor$$
   $$\text{Final Gold} = \lfloor\text{Base Gold} \times (1 + \text{Streak Bonus})\rfloor$$

2. **Exponential Character Level Curve**:
   $$\text{XP to Level Up}(L) = \lfloor 100 \times L^{1.5} \rfloor$$
   *Example*: Level 1 requires 100 XP; Level 2 requires 282 XP; Level 5 requires 1,118 XP.

3. **Attribute Level Curve**:
   $$\text{Attribute XP to Level Up}(L) = 50 \times L$$

4. **Streak Calculation**:
   - Compares current UTC date against `last_completion_date`:
     - If same day: maintains current streak without duplicate increment.
     - If consecutive day (difference = 1 day): increments streak by 1 and updates `longest_streak`.
     - If missed day (difference > 1 day): resets streak back to 1.

---

### 3.7 API Routers (`app/api/`)
- **`auth.py`**:
  - `POST /auth/signup`: Registers user, hashes password, initializes `Character` record, and binds all default `CharacterAttribute` records. Sets HTTP-Only cookie and returns JWT.
  - `POST /auth/login`: Authenticates username/email and password. Returns token.
  - `POST /auth/logout`: Clears the session cookie.
  - `GET /auth/me`: Returns profile of the authenticated user.
- **`character.py`**:
  - `GET /character`: Returns detailed character state, currency, XP progression, and calculated next-level thresholds.
  - `GET /character/leaderboard`: Queries all live users from the database, joins character data, sorts descending by XP/level/streak, assigns sequential ranks 1..N, and flags `is_current`.
- **`quests.py`**:
  - `GET /quests?status_filter=active|completed|all`: Lists user quests with optional status filtering.
  - `POST /quests`: Creates a new quest.
  - `PATCH /quests/{id}`: Modifies an existing quest.
  - `DELETE /quests/{id}`: Deletes a quest (idempotent).
  - `POST /quests/{id}/complete`:
    - Validates presence and length of `proof_text` ($\ge$ 5 characters).
    - Checks ownership and completion status.
    - Updates character streak.
    - Calculates server-authoritative XP and Gold rewards.
    - Increments character XP/Gold, triggering character level-up check.
    - Increments attribute XP, triggering attribute level-up check.
    - Writes immutable `QuestCompletion` record with verification proof.
    - Records entry in `GoldTransaction` ledger.
    - Marks quest as `completed` (or keeps `active` if recurring).
- **`shop.py`**:
  - `GET /shop/items`: Retrieves cosmetic items available in the armory.
  - `GET /shop/inventory`: Retrieves items owned by the authenticated user.
  - `POST /shop/purchase/{item_id}`: Verifies gold balance, deducts gold, records transaction in ledger, and adds item to inventory.
  - `POST /shop/equip/{item_id}`: Unequips other items of the same type and sets the selected item as equipped.
- **`history.py`**:
  - `GET /history`: Returns completion audit trail including completion timestamp, awarded XP/Gold, streak, quest title, `proof_text`, and `proof_link`.

---

### 3.8 Database Seeder (`seed.py`)
- Populates standard RPG attributes (`strength`, `intelligence`, `discipline`, `creativity`, `vitality`, `focus`, `confidence`).
- Populates the catalog of themes (*Cyberpunk Neon*, *16-Bit Dungeon*, *Cozy Lo-Fi*) and badges (*Flame Master*, *Scholar Crown*).
- Idempotent: checks for existence before inserting; contains zero mock users or fake bots.

---

### 3.9 Automated Test Suite (`tests/test_backend.py`)
- Uses `pytest` with `pytest-asyncio` and `httpx.AsyncClient`.
- Configured with an in-memory SQLite database (`sqlite+aiosqlite:///:memory:`) using dependency overrides for total isolation.
- Fully tests:
  1. Authentication flows (invalid logins, valid signups, duplicate user rejection).
  2. Character attribute auto-seeding.
  3. Quest creation, patching, and status filtering.
  4. Anti-cheat proof verification (rejecting missing proof, rejecting short proof, accepting valid proof).
  5. Shop purchasing, insufficient funds handling, inventory equipping, and duplicate purchase prevention.
  6. Real-user leaderboard ordering and ranking logic.

---

## 4. Frontend Architecture Deep Dive

### 4.1 Application Lifecycle & Shell (`App.tsx`, `main.tsx`)
- **`src/main.tsx`**: Bootstraps React 19 root with `QueryClientProvider`.
- **`src/App.tsx`**: Central coordinator:
  - Queries `me`, `character`, `quests`, `inventory`, and `shopItems`.
  - **Dynamic Theme Syncing**: Automatically reads the equipped `theme` item from the user's inventory and updates the DOM `data-theme` attribute.
  - **Optimistic Mutations**: Executes React Query cache updates on mutations (`completeMutation`, `createMutation`, `deleteMutation`, `equipMutation`) with automatic rollback on server error.
  - **Screen Router**: Renders the active tab: `lobby`, `quests`, `character`, `shop`, `battlepass`, or `leaderboard`.

---

### 4.2 API Client & Network Layer (`api/client.ts`)
- Configured with relative base URL `const API_BASE = '/api'`.
- Proxied by Vite (`vite.config.ts`) directly to `http://127.0.0.1:8000`. Resolves browser mixed-content and HTTPS-to-HTTP restrictions.
- `getHeaders()` automatically includes `Authorization: Bearer <token>` from `localStorage` and sets `Content-Type: application/json`.
- Standardized error parser extracts error details from FastAPI `HTTPException` responses.

---

### 4.3 State Management (`store/useUIStore.ts` & React Query)
- **TanStack React Query v5**: Manages asynchronous server state, caching, background invalidation, and optimistic updates.
- **Zustand (`useUIStore.ts`)**: Manages high-frequency, transient UI state:
  - `floatingXps`: Array of floating XP popups with coordinates `(x, y)`.
  - `levelUpModal`: Triggers full-screen RPG level-up celebration overlays.
  - `activeTheme`: Active CSS color theme.

---

### 4.4 Procedural Audio Synthesis (`utils/soundEngine.ts`)
Pinnacle generates arcade SFX procedurally using the browser's native **Web Audio API** (`AudioContext`), requiring zero external MP3 assets:
- `click`: Short 800Hz sine burst.
- `quest_accept`: Ascending 400Hz $\rightarrow$ 600Hz square wave transition.
- `quest_complete`: 3-note major chord arpeggio (C5 $\rightarrow$ E5 $\rightarrow$ G5).
- `level_up`: Multi-stage fanfare with sawtooth vibrato.
- `reward_claim`: High-pitch chime (987Hz $\rightarrow$ 1318Hz).
- `streak_fire`: Low resonant sweep (150Hz $\rightarrow$ 450Hz).
- Persistent mute toggle saved in `localStorage`.

---

### 4.5 Global Game HUD & Navigation (`components/game/`)
- **`GameHUD.tsx`**:
  - Sticky cybernetic glass header.
  - Displays user avatar, dynamic rank badge (*Bronze, Silver, Gold, Platinum, Diamond*), and animated XP progress bar.
  - Live counters for Gold 🪙, Gems 💎, and Streak 🔥.
  - Sound effect toggle and notification controls.
- **`BottomNavigation.tsx`**:
  - Chamfered cyberpunk navigation bar supporting 6 main tabs: Lobby, Quests, Character, Shop, Battle Pass, and Leaderboard.
- **`GameBackground.tsx`**:
  - Hardware-accelerated Canvas rendering floating cybernetic ambient particles.
- **`GamificationEffects.tsx`**:
  - Canvas Confetti explosion upon level up.
  - Floating `+XP` numbers that rise and fade at the exact cursor click coordinates.

---

### 4.6 Feature Modules (`features/`)

#### Quest Board & Proof Verification Modal
- Located in `src/features/Quests/QuestBoard.tsx`.
- **Mission Progress Bar**: Visualizes daily completion ratio (`completed / total`).
- **Tab Filtering**: Switches seamlessly between active quests and completed history.
- **Anti-Cheat Proof Modal**:
  - Clicking complete opens a modal that prevents instant completion.
  - Dynamically customizes instructions and placeholders by attribute:
    - *Strength*: Workout metrics, sets, reps, Strava link.
    - *Intelligence*: Concepts mastered, notes summary, GitHub PR link.
    - *Discipline*: Time logged, routine checklist adherence notes.
    - *Creativity*: Artifact description, Figma/Dribbble link.
    - *Vitality*: Sleep metrics, hydration score, nutrition log.
    - *Focus*: Uninterrupted deep work blocks, deliverables shipped.
    - *Confidence*: Public speaking reflection, challenge overcome.
    - *General*: Concrete completion evidence.
  - Live character validation ($\ge$ 5 characters required).
- **Verified Proof Inspection**: Completed quest cards in the **Completed Tasks** tab render the verified proof notes and links.

#### Game Lobby & 3D Character Viewport
- Located in `src/features/Lobby/GameLobby.tsx`.
- Free-Fire / Battle-Royale inspired hero viewport.
- Floating character emblem, level badge, streak counter, and rapid-action launch buttons.

#### Character Dashboard & Stat Tree
- Located in `src/features/CharacterDashboard.tsx`.
- Displays total lifetime XP, longest streak, and gold wallet.
- Renders individual stat tree cards for all 7 attributes, each displaying level, current XP, next-level XP, and percentage bar.

#### Armory & Cosmetic Shop
- Located in `src/features/ShopView.tsx`.
- Displays purchasable themes and badges with gold cost.
- Instant equipping mechanism that automatically updates the entire app's visual styling.

#### Battle Pass Season Track
- Located in `src/features/BattlePass/BattlePass.tsx`.
- Horizontal seasonal progression track (*Season 01: "Rise of the Grind"*).
- Displays free and premium reward milestones unlocked as the character reaches higher levels.

#### Global Competitive Leaderboard
- Located in `src/features/Leaderboard/Leaderboard.tsx`.
- Podium displaying Top 3 players with gold, silver, and bronze crowns.
- Ranks live registered players by lifetime XP, level, and streak consistency.
- Features resilient empty states and dynamic current-user highlighting.

#### Authentication Modal
- Located in `src/features/AuthModal.tsx`.
- Cybernetic modal for Login and Signup.
- Handles form validation, error banners, and automatic token storage.

---

## 5. Key Lifecycle & Data Flows

### Flow 1: User Registration & Character Initialization

```mermaid
sequenceDiagram
    autonumber
    actor User as Player
    participant UI as Frontend (AuthModal)
    participant API as FastAPI (/auth/signup)
    participant DB as Neon PostgreSQL

    User->>UI: Enters email, username, password
    UI->>API: POST /auth/signup {email, username, password}
    API->>DB: Check if username/email exists
    API->>DB: INSERT INTO users (hashed_password)
    API->>DB: INSERT INTO characters (level=1, gold=100)
    API->>DB: INSERT INTO character_attributes (bind all 7 attributes)
    API-->>UI: 200 OK + JWT Token + Set-Cookie
    UI->>UI: Save token to localStorage & reload session
    UI-->>User: Render Pinnacle Game Lobby
```

---

### Flow 2: Mission Acceptance, Proof Verification & Completion

```mermaid
sequenceDiagram
    autonumber
    actor User as Player
    participant Board as QuestBoard UI
    participant Sound as Sound Engine
    participant API as FastAPI (/quests/{id}/complete)
    participant Engine as Progression Engine
    participant DB as Neon PostgreSQL

    User->>Board: Clicks [✓ COMPLETE MISSION]
    Board->>Board: Opens Proof Verification Modal (tailored to attribute)
    User->>Board: Enters proof text (>= 5 chars) & optional link
    User->>Board: Clicks [VERIFY & COMPLETE]
    Board->>Sound: play('quest_complete')
    Board->>API: POST /quests/{id}/complete {proof_text, proof_link}
    
    rect rgb(20, 30, 40)
        Note over API,Engine: Server-Side Anti-Cheat Processing
        API->>API: Validate proof_text >= 5 characters
        API->>DB: Verify quest ownership & status == 'active'
        API->>Engine: update_streak(character)
        API->>Engine: calculate_rewards(difficulty, streak)
        API->>Engine: award_xp_and_gold(character, xp, gold)
        API->>Engine: award_attribute_xp(character_attribute, xp)
        API->>DB: INSERT INTO quest_completions (with proof)
        API->>DB: INSERT INTO gold_transactions
        API->>DB: UPDATE quest status = 'completed'
    end

    API-->>Board: 200 OK (XP awarded, leveled_up, new_level)
    Board->>Board: Show floating XP toast at cursor & update UI
```

---

### Flow 3: Currency Earning, Shop Purchase & Dynamic Theme Switching

```mermaid
sequenceDiagram
    autonumber
    actor User as Player
    participant Shop as ShopView UI
    participant API as FastAPI (/shop)
    participant DB as Neon PostgreSQL
    participant DOM as Document Root

    User->>Shop: Clicks [BUY FOR 50 GOLD] on Cyberpunk Theme
    Shop->>API: POST /shop/purchase/{item_id}
    API->>DB: Check character gold >= cost
    API->>DB: Deduct gold & record gold_transaction
    API->>DB: INSERT INTO inventory (user_id, item_id, equipped=false)
    API-->>Shop: 200 OK (remaining_gold)
    
    User->>Shop: Clicks [EQUIP ITEM]
    Shop->>API: POST /shop/equip/{item_id}
    API->>DB: UPDATE inventory set equipped=true
    API-->>Shop: 200 OK
    Shop->>DOM: Set attribute data-theme="cyberpunk"
    DOM-->>User: Immediate color palette & styling transformation
```

---

## 6. Anti-Cheat & Security Design

1. **Client Trust Boundaries**:
   - The frontend **never** dictates rewards. It sends the `quest_id` and the verifiable `proof_text`.
   - XP amounts, Gold amounts, and Level increments are computed purely on the server inside `progression.py`.
2. **Minimum Proof Requirements**:
   - Empty or trivial completions are rejected with `HTTP 400 Bad Request` or `HTTP 422 Unprocessable Entity`.
   - Every completion is permanently audited with its proof in `quest_completions`.
3. **Idempotency & Replay Prevention**:
   - Non-recurring quests cannot be completed more than once (`HTTP 400: Quest already completed`).
   - Recurring quests update their timestamp and reset streak flags without duplicating rewards.
4. **Database-Level Cascading & Isolation**:
   - Deleting a user or quest cascades cleanly to avoid orphaned completion or inventory records.
   - User transactions are strictly scoped by `current_user.id`.

---

## 7. Environment & Deployment Guide

### Backend Configuration (`.env`)
```bash
# Database connection string (PostgreSQL with SSL)
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_lwc0WFNbvtV6@ep-tiny-recipe-aypngxwk-pooler.c-5.us-east-2.aws.neon.tech/neondb?ssl=require

# Application settings
PROJECT_NAME="Pinnacle API"
SECRET_KEY="super-secret-life-rpg-key-change-in-production-2026"
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Starting the Services
```bash
# 1. Start Backend Server (Port 8000)
cd backend
source venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000

# 2. Start Frontend Dev Server (Port 5173)
cd frontend
npm run dev

# 3. Build Frontend for Production
cd frontend
npm run build
```

---
*Documentation maintained for Pinnacle Life RPG Engine.*
