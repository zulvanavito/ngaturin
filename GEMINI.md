# Ngaturin Project Instructions & Conventions

## State Management Architecture

### Zustand
Zustand is the designated library for managing global UI state and frequently accessed filters across components.

**✅ DO USE Zustand for:**
- **Filters:** Text search queries, selected wallets, selected categories, transaction types, date ranges, sorting, and nominal limits.
- **Global UI State:** Sidebar open/close toggle, mobile navigation state, transaction modal visibility (add/edit), transaction detail drawer, and command palette state.
- **Active Selections:** Active wallet ID, active category ID, selected transaction ID, or ID of the transaction being edited. *(Note: Store only IDs or statuses, not full data objects).*
- **Complex Forms:** Transaction form state *only if* it becomes complex (e.g., accessed from multiple places, draft modes). If simple, stick to local state or `react-hook-form`.
- **Insights Filters:** Analytics filters like view period, date range, selected wallet/category, chart type, and comparison mode.

**❌ DO NOT USE Zustand for:**
- Storing full domain entities fetched from the database (e.g., all user transactions, all budgets, all goals, investment records).
- Auth state or permanent Supabase data. Data fetching layers (DAL) and Server Components should handle this.

### Fuse.js
Fuse.js is designated for typo-tolerant, client-side fuzzy searching exclusively on *small, bounded datasets* that are safely loaded in the client.

**✅ DO USE Fuse.js for:**
- **Category Search:** Searching through categories in the transaction form (e.g., "makn" -> "Makanan").
- **Wallet Search:** Searching through available wallets in the transaction form.
- **Command Palette:** Searching static commands ("Tambah Transaksi", "Buka Settings") since the dataset is small and predefined.
- **Small Lookups:** Settings search, transaction templates, or recurring bills.

**❌ DO NOT USE Fuse.js for:**
- **Historical Transaction Search:** Do not load all historical transactions into the client just to use Fuse.js. This bloats memory, slows initial load, and negates the performance benefits of Next.js Server Components.

### Large Data Search
For searching large datasets like historical transactions:
- Use **Server-Side Search** via Supabase (e.g., `ilike`, full-text search, or `pg_trgm`).
- **Pattern:** Store the user's search query string in Zustand, but execute the actual search processing on the server via `lib/dal.ts` or Server Actions.

---

### 🛡️ Development Standards

#### 🟦 TypeScript & Type Safety
To maintain high code quality and prevent runtime errors, follow these strict rules:
1. **No Escape Hatches:** NEVER use `as any`, `as unknown as ...`, or `@ts-ignore`. If a type is difficult, solve it; don't bypass it.
2. **Explicit Definitions:** Always define interfaces or types for data shapes that are not immediately clear or are coming from outside the immediate scope.
3. **Narrowing & Guards:** Use type guards (`typeof`, `instanceof`, or custom predicates) and type narrowing to handle runtime checks and satisfy the compiler.
4. **Validation over Assertion:** Prefer the `satisfies` operator over type assertions (`as`) for validating object literals against a type.
5. **External Data:** For data from external sources (APIs, user input), use a validation library like **Zod** to ensure type safety at the boundary.
6. **Documentation:** Briefly explain complex type choices or why a specific interface structure was chosen.

#### 🎨 UI/UX (The "Wise" Aesthetic)
- **Border Radius:** Mandatory `rounded-[2rem]` or `rounded-[2.5rem]` for main containers, cards, and sections.
- **Buttons:** Prefer pill-style buttons (`rounded-full`) or `wise-button-pill` class for primary actions.
- **Headings:** Use `font-black` and `tracking-tight` for a bold, modern look (aligned with Wise style).
- **Icons:** Use `lucide-react` as the standard icon library.

### 🏗️ Data Architecture (DAL)
- **Centralized Fetching:** All server-side data fetching must reside in `lib/dal.ts`.
- **Deduplication:** Wrap DAL functions in React `cache()` to prevent redundant database hits within a single render cycle.
- **Logic Isolation:** Components should remain "dumb" regarding fetching logic; they should consume data via props or clean DAL function calls.

### 🔒 Security & Supabase
- **RLS First:** Every new table must have Row Level Security (RLS) enabled immediately.
- **Policy Standard:** Always use `auth.uid() = user_id` for ownership-based access control.
- **Service Role:** Use `SUPABASE_SERVICE_ROLE_KEY` only in backend-only logic (webhooks, automation) and never expose it to the client.

### 📡 API & Responses
- **Response Format:** All API routes must return a consistent JSON structure. Errors should follow `{ error: string }`.
- **CamelCase:** Use camelCase for all JSON keys in requests and responses.
- **Status Codes:** Use appropriate HTTP status codes (200 for OK, 201 for Created, 401 for Unauthorized, 400 for Bad Request).
