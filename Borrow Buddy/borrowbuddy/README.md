# BorrowBuddy

Peer-to-peer community lending for Chennai: list things you rarely use, borrow what you need from neighbours. Borrowing is free by default, with optional daily rent.

**Stack** — React 18 + Vite + Tailwind CSS + React Router + Axios + Lucide · Spring Boot 3.3 (Java 17+) + Spring Security + JWT + JPA/Hibernate + Bean Validation · MySQL 8/9 · Maven.

```
borrowbuddy/
  backend/    Spring Boot API (controller / service / repository / entity / dto / security layers)
  frontend/   React SPA
  database/   borrowbuddy_backup.sql (schema + demo data), api_smoke_test.ps1, fetch_seed_images.ps1
```

## Prerequisites
Java 17+, Maven 3.9+, Node 18+, a running MySQL server.

## 1. Database
MySQL is the only data store (no mock data, nothing in localStorage except the JWT).

**Option A – let Hibernate create the schema and seed automatically (default).**
Just start the backend; it creates the `borrowbuddy` database/tables and seeds demo data on first run (when `users` is empty).

**Option B – restore the SQL backup** (schema + demo data):
```bash
mysql -u root -p < database/borrowbuddy_backup.sql
```
Then start the backend with `SEED_ENABLED=false` (or leave it on; seeding is skipped when users exist).

## 2. Configure the backend
```bash
cd backend
cp .env.example .env      # Windows: copy .env.example .env
```
Edit `backend/.env`: set `DB_PASSWORD` and a `JWT_SECRET` (32+ chars). `.env` is git-ignored; nothing secret is in source control. Values may also be supplied as real environment variables.

## 3. Run
```bash
# terminal 1 – API on http://localhost:8080
cd backend
mvn spring-boot:run

# terminal 2 – UI on http://localhost:5173
cd frontend
npm install
npm run dev
```
Frontend API URL is configurable via `frontend/.env` (`VITE_API_URL`, default `http://localhost:8080`; see `.env.example`).

## Demo credentials
| Role  | Email                    | Password       |
|-------|--------------------------|----------------|
| Admin | admin@borrowbuddy.in     | Admin@123      |
| User  | demo@borrowbuddy.in      | Password@123   |
| User  | arjun.v@example.in       | Password@123 (owns the drill, has incoming requests) |

Other seeded users (all `Password@123`): priya.raman@, divya.n@, rohit.s@, fatima.s@, suresh.b@, ananya.i@, vikram.r@ `example.in`.

Seed: 10 users, 9 categories, 18 items, 16 requests across every status (pending, approved, active, rejected, returned, cancelled).

## Business rules (enforced in the backend)
- Owners cannot borrow their own items (403); unavailable items cannot be requested (409).
- Requests/approvals that overlap an APPROVED or ACTIVE booking of the same item are rejected (409).
- Status flow: `PENDING → APPROVED | REJECTED | CANCELLED`, `APPROVED → ACTIVE (handover) | CANCELLED (owner)`, `ACTIVE → RETURNED`. Anything else is 409.
- Only the owner approves/rejects/hands over/marks returned; only the borrower cancels a pending request.
- Handover sets the item `BORROWED`; return sets it back to `AVAILABLE`.
- Listings can only be edited/deleted by their owner; `/api/admin/**` requires ADMIN. Suspended users are rejected on every request.
- Passwords are BCrypt-hashed; DTOs never expose hashes.

## API overview (`/api`)
| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /users/me` |
| Catalogue (public) | `GET /categories`, `GET /items?q=&categoryId=&location=&priceType=ALL\|FREE\|PAID`, `GET /items/featured`, `GET /items/locations`, `GET /items/{id}`, `GET /items/{id}/bookings`, `GET /stats/public` |
| Listings (auth) | `GET /my/items`, `POST /items`, `PUT /items/{id}`, `DELETE /items/{id}`, `POST /uploads` (multipart `file`, images ≤5 MB) |
| Borrowing (auth) | `POST /requests`, `GET /requests/incoming`, `GET /requests/outgoing`, `PATCH /requests/{id}/approve｜reject｜handover｜return｜cancel` |
| Dashboard | `GET /dashboard/stats` |
| Admin | `GET /admin/stats｜users｜items｜requests`, `PATCH /admin/users/{id}/enabled｜role`, `PATCH /admin/items/{id}/status`, `DELETE /admin/items/{id}`, `PATCH /admin/requests/{id}/cancel` |

Errors are JSON: `{timestamp,status,error,message,path,fieldErrors?}`.

## Tests
With the backend running: `powershell -ExecutionPolicy Bypass -File database/api_smoke_test.ps1` — 69 checks covering auth, validation, authorization, search/filters, CRUD, overlap prevention, every status transition and admin moderation, against live MySQL.

## Images
Item photos are bundled in `backend/src/main/resources/static/seed` (Wikimedia Commons, freely licensed) and served by the backend; uploads go to `backend/uploads/`. The UI falls back to a tinted category tile if any image fails to load.
