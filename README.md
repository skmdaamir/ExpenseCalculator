# 🪙 PoolSplit — Group Event & Trip Pool Expense Manager

> A modern, full-stack collaborative expense pooling and debt simplification web app built for group trips (friends pooling money with designated Pool Managers) and collaborative events (such as pooling money for wedding registry gifts).

---

## 🌟 Key Features

1. **Multi-Event & Trip Management:**
   - Create, edit, archive, and revisit past events (e.g., *"Goa Trip 2026"*, *"Rahul's Wedding Gift Pool"*).
   - Pre-populated with rich demo data for instant out-of-the-box exploration.
2. **Roles & Pool Managers:**
   - Designate one or more **Pool Managers** who collect and hold physical/UPI pool cash.
   - Distinct **Participants (Friends)** with customizable avatars and UPI IDs.
3. **Three Distinct Financial Transaction Types:**
   - 🪙 **1. Pool Deposit (Friend → Manager):** Friend contributes money into Manager's pool. Increases Manager's cash-in-hand and that friend's total contributed amount.
   - 🛍️ **2. Pool Expense / Item Purchase (Paid by Manager from Pool):** Manager spends from the collected pool on stay, food, or wedding gifts. Deducts from remaining pool cash and splits cost equally or customly among members.
   - 💳 **3. Direct / Out-of-Pocket Expense (Paid by Friend):** A friend pays directly from their personal wallet for a group item. Credits that friend's contribution and splits the cost among selected members.
4. **Automated Settlement & Debt Simplification (`settlementEngine.js`):**
   - Calculates **Total Contributed** (`Pool Deposits + Direct Spends`), **Fair Expense Share**, and **Net Balance** (`Contributed - Share`).
   - Reconciles **Unspent Pool Cash** physically held in the Manager's hands so that the pool money is returned fairly.
   - Runs a greedy **minimum-transaction settlement algorithm** to output exact payment instructions (`Aman pays ₹650 to Rohan`).
   - One-click **WhatsApp / Share summary** generator and **UPI copy** button.
5. **Visual & Diagrammatic UI:**
   - **Interactive Money-Flow Graph:**
     - **Flow 1 (Pool & Expense Outflow):** Friends ──deposits──▶ Pool Manager ──expenditures──▶ Expense Categories.
     - **Flow 2 (Settlement Network):** Animated directional arrows indicating who owes whom.
   - **Analytics Cards & Charts:** Lightweight **Recharts** donut chart for category breakdowns and bar chart comparing contributions vs fair share.
   - Clean modern glassmorphic UI with **Dark / Light mode** toggle and responsive mobile-first drawer modals.
6. **100% Free Cloud Database + Offline Fallback:**
   - **Supabase (Free Tier PostgreSQL)** integration via `@supabase/supabase-js`.
   - Complete `schema.sql` included for 1-click database setup.
   - **Automatic `localStorage` fallback:** Works seamlessly offline or out-of-the-box before cloud credentials are provided.

---

## 📐 Mathematical Settlement Engine

Let each participant $i$ have:
- Total pool deposits made: $D_i$
- Total direct out-of-pocket expenses paid: $E^{\text{direct}}_i$
- Total fair expense share of items consumed: $S_i$

$$\text{TotalContributed}_i = D_i + E^{\text{direct}}_i$$
$$\text{NetBalance}_i = \text{TotalContributed}_i - S_i$$

### Accounting for Unspent Pool Cash held by Manager $M$:
The Manager holds physical pool cash in hand:
$$\text{CashInHand}_M = \sum D_{\text{received}} - \sum \text{PoolExpenses}$$

Because Manager $M$ physically holds this unspent cash, Manager's net settlement balance is:
$$\text{SettlementBalance}_M = \text{NetBalance}_M - \text{CashInHand}_M$$

For non-managers (who hold 0 pool cash):
$$\text{SettlementBalance}_j = \text{NetBalance}_j$$

**Invariant:**
$$\sum_{\text{all participants}} \text{SettlementBalance}_i = 0$$

All settlement debts balance to **exactly zero**, and the debt simplification algorithm outputs the minimum number of payouts needed!

---

## 🚀 Step-by-Step GitHub Repository & Free Hosting Setup

### 1. Initialize Git & Push to GitHub

Open your terminal in the project directory (`ExpenseCalculator`) and run:

```bash
# 1. Initialize local git repository
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Group Event & Trip Pool Expense Manager"

# 4. Set main branch
git branch -M main

# 5. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 6. Push code to GitHub
git push -u origin main
```

---

### 2. Free Hosting Option A: Automated GitHub Actions (Recommended)

This repository includes `.github/workflows/deploy.yml` for automated GitHub Pages builds.

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (under "Code and automation" in the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and deploy your app to:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/
   ```

---

### 3. Free Hosting Option B: One-Command CLI Deploy (`gh-pages`)

If you prefer to deploy directly from your local terminal:

```bash
# 1. Install dependencies
npm install

# 2. Build and deploy to GitHub Pages
npm run deploy
```

In GitHub **Settings** → **Pages**, set **Source** to `Deploy from a branch` and select `gh-pages` / `/(root)`.

---

## 🗄️ Supabase Cloud Database Setup (100% Free)

You can run this app completely with **LocalStorage** (zero config), or connect a free **Supabase PostgreSQL** cloud database to share live updates across friends' devices:

### Step 1: Create a Free Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose a project name (e.g. `poolsplit`), and set a database password.

### Step 2: Run the SQL Schema
1. In your Supabase dashboard, click **SQL Editor** from the left navigation.
2. Open `schema.sql` from this project, copy its contents, paste them into the SQL Editor, and click **Run**.
3. All tables (`events`, `participants`, `transactions`, `transaction_splits`), indexes, and RLS policies are created in seconds!

### Step 3: Connect Credentials
You have two easy ways to connect:

- **Option A (Directly in the Web UI - No code change):**
  Click the **Local Mode** button in the top navbar of the app, paste your **Project URL** and **Anon Key**, and click **Connect Supabase**.

- **Option B (Environment file):**
  Copy `.env.example` to `.env` and fill in your keys:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in your browser (default http://localhost:5173)
```

---

## 📁 Project Architecture

```
ExpenseCalculator/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD
├── src/
│   ├── components/
│   │   ├── UI/                   # Reusable Button, Card, Badge, Modal
│   │   ├── AnalyticsCards.jsx    # Metric summaries (Total pool, spent, remaining cash)
│   │   ├── AnalyticsCharts.jsx   # Recharts Donut & Bar charts
│   │   ├── EventHeader.jsx       # Event titles, Manager tags, Tab bar
│   │   ├── EventListModal.jsx    # Multi-event switcher, archive & create modal
│   │   ├── ExpenseTracker.jsx    # Itemized ledger with search & category filters
│   │   ├── MoneyFlowGraph.jsx    # Interactive 2-mode visual money flow visualizer
│   │   ├── Navbar.jsx            # Brand, cloud status, theme toggle, reset demo
│   │   ├── ParticipantsModal.jsx # Roles, manager toggle, UPI management
│   │   ├── SettlementView.jsx    # Min-cash-flow instructions, UPI copy, WhatsApp text
│   │   └── SupabaseConfigModal.jsx# On-the-fly Supabase cloud database config
│   ├── services/
│   │   ├── dataService.js        # Unified CRUD with Supabase + LocalStorage fallback
│   │   ├── mockData.js           # Realistic Goa trip & Wedding Gift demo datasets
│   │   └── supabaseClient.js     # Supabase client initializer & storage manager
│   ├── utils/
│   │   ├── formatters.js         # Currency (INR ₹), dates, categories
│   │   └── settlementEngine.js   # Mathematical pooling engine & Min Cash Flow algorithm
│   ├── App.jsx                   # Top-level state & layout orchestration
│   ├── index.css                 # Tailwind CSS styles
│   └── main.jsx                  # React 18 DOM mount
├── schema.sql                    # Production Supabase PostgreSQL schema
├── vite.config.js                # Configured with base: './' for GitHub Pages
├── tailwind.config.js            # Custom colors, theme & dark mode config
├── package.json
└── README.md
```

---

## 📜 License
MIT © 2026 PoolSplit
