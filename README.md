<div align="center">

```
  ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗███╗   ███╗██╗███╗   ██╗██████╗
 ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝████╗ ████║██║████╗  ██║██╔══██╗
 ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝ ██╔████╔██║██║██╔██╗ ██║██║  ██║
 ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝  ██║╚██╔╝██║██║██║╚██╗██║██║  ██║
 ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║   ██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝
```

**Ask questions. Get dashboards. No SQL required.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-00a86b?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-2DD4BF?style=flat-square)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## What is QueryMind?

QueryMind is a **natural-language BI platform** — type a question in plain English and get an instant interactive multi-chart dashboard backed by your own data.

```
"Show me quarterly revenue by region for the last 2 years"
        ↓  LLM generates correct MySQL
        ↓  MySQL executes against your schema
        ↓  Data shapes into 3–4 Recharts visualisations
        ↓  AI writes bullet-point insights + follow-up questions
```

No SQL knowledge required. Upload a CSV or point it at your database and start asking.

---

## Features

| Feature | Details |
|---|---|
| **Natural language → SQL** | DeepSeek / any OpenRouter model turns questions into MySQL queries |
| **Auto-dashboard generation** | 3–4 charts per query: line, bar, area, pie — chosen by the LLM |
| **CSV upload** | Drag-and-drop any CSV; it's instantly queryable as a MySQL table |
| **Smart insights** | AI-written bullet points with specific numbers after every query |
| **Follow-up suggestions** | 3 next-step questions generated after each result |
| **Chart export** | Download any chart as a PNG in one click |
| **Session history** | Last 20 queries auto-saved to localStorage with timestamps |
| **Sound feedback** | Web Audio API tones — chime on success, buzz on error |
| **JWT auth** | Bcrypt passwords, signed JWT tokens, protected routes |
| **Teal dark theme** | `#2DD4BF` accent · `#080B0E` void bg · JetBrains Mono throughout |

---

## Tech Stack

### Backend
```
FastAPI  ·  aiomysql  ·  pandas  ·  numpy
bcrypt 4.x  ·  python-jose  ·  httpx
OpenRouter API (DeepSeek / GPT-4o / any model)
```

### Frontend
```
React 18 + TypeScript + Vite
Tailwind CSS  ·  shadcn/ui  ·  Radix UI
Recharts  ·  React Router v6
TanStack Query  ·  Web Audio API
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0 running locally (or remote)
- An [OpenRouter](https://openrouter.ai/) API key (free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-org/querymind.git
cd querymind
```

---

### 2. Backend setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=querymind

# JWT
SECRET_KEY=your_super_secret_key_at_least_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=deepseek/deepseek-chat:free
```

Seed the database and create an admin user:

```bash
python seed_data.py          # creates tables + NexaMart demo data
python create_user.py        # interactive CLI to create your first user
```

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Interactive docs at `/docs`.

---

### 3. Frontend setup

```bash
# from project root
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Project Structure

```
querymind/
├── backend/
│   ├── main.py                # FastAPI app + router registration
│   ├── auth.py                # JWT creation + bcrypt verification
│   ├── config.py              # Settings via pydantic-settings
│   ├── database.py            # aiomysql connection pool + helpers
│   ├── models.py              # Pydantic request/response models
│   ├── prompts.py             # LLM system prompts (SQL + insights)
│   ├── llm_pipeline.py        # Multi-step query → chart pipeline
│   ├── chart_logic.py         # Rule-based chart builder
│   ├── schema_cache.py        # NexaMart schema string for LLM
│   ├── seed_data.py           # Demo data seeder
│   ├── create_user.py         # Interactive user creation CLI
│   └── routers/
│       ├── auth_router.py     # /api/auth/* endpoints
│       ├── query_router.py    # /api/query endpoint
│       └── upload_router.py   # /api/upload-csv endpoint
│
└── src/
    ├── pages/
    │   ├── LandingPage.tsx    # Marketing homepage
    │   ├── LoginPage.tsx      # Auth — email/password
    │   ├── SignupPage.tsx     # Auth — registration
    │   ├── DashboardPage.tsx  # Main query interface
    │   └── HistoryPage.tsx    # Query history viewer
    ├── components/
    │   ├── dashboard/
    │   │   ├── ChartCard.tsx      # Recharts wrapper + PNG export
    │   │   ├── QueryInput.tsx     # Query textarea + submit
    │   │   ├── CSVUploadModal.tsx # Drag-drop CSV uploader
    │   │   ├── InsightsPanel.tsx  # AI insight bullets
    │   │   ├── LoadingState.tsx   # Animated skeleton
    │   │   └── SQLBlock.tsx       # Syntax-highlighted SQL block
    │   └── layout/
    │       └── ProtectedRoute.tsx # Auth guard with redirect save
    ├── lib/
    │   ├── api.ts             # Typed fetch wrappers
    │   ├── sounds.ts          # Web Audio API tones
    │   └── utils.ts           # Helpers (truncate, timeAgo…)
    ├── contexts/
    │   └── AuthContext.tsx    # JWT auth state + login/signup/logout
    └── types/
        └── index.ts           # Shared TypeScript interfaces
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | — | Email + password → JWT token |
| `POST` | `/api/auth/signup` | — | Create account → JWT token |
| `GET`  | `/api/auth/me` | ✓ | Get current user profile |
| `POST` | `/api/query` | ✓ | Natural language → charts + insights |
| `POST` | `/api/upload-csv` | ✓ | Upload CSV → queryable MySQL table |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MYSQL_HOST` | ✓ | — | MySQL hostname |
| `MYSQL_PORT` | — | `3306` | MySQL port |
| `MYSQL_USER` | ✓ | — | MySQL username |
| `MYSQL_PASSWORD` | ✓ | — | MySQL password |
| `MYSQL_DB` | ✓ | — | Database name |
| `SECRET_KEY` | ✓ | — | JWT signing secret |
| `OPENROUTER_API_KEY` | ✓ | — | OpenRouter API key |
| `OPENROUTER_BASE_URL` | — | `https://openrouter.ai/api/v1` | OpenRouter base URL |
| `OPENROUTER_MODEL` | — | `deepseek/deepseek-chat:free` | Model identifier |

---

## Free Models on OpenRouter

QueryMind works with any OpenRouter model. Free options that work well:

```env
OPENROUTER_MODEL=deepseek/deepseek-chat:free
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

---

## Redirect Flow

1. Unauthenticated user visits `/dashboard` → `ProtectedRoute` saves the URL to `querymind_redirect_url` and redirects to `/login`
2. User logs in (or signs up) → app reads saved URL and navigates there
3. Already-authenticated users who visit `/login` or `/signup` are automatically redirected to dashboard

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">
  Built with teal and caffeine.
</div>
