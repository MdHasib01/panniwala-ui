# Pani Wala — website & admin dashboard

Next.js (App Router) front end for Pani Wala. Pages live in [src/app/](src/app/):
`(site)/` is the public website (landing page, login, orders, chat, …) and `admin/` is the dashboard.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev` → http://localhost:3000

In development `/api` and `/socket.io` are proxied to the API on http://localhost:5000
(override with `API_PROXY_TARGET`). To talk to an API on another origin instead, set
`NEXT_PUBLIC_API_URL` (see [.env.example](.env.example)) — it is inlined at build time.

Production: `npm run build && npm start`, or deploy to Netlify (see [netlify.toml](netlify.toml)).

## Backend & admin dashboard

The API lives in [server/](server/) (Express + MongoDB + Socket.IO) — see [server/README.md](server/README.md).

```bash
npm run server:install   # once
npm run seed             # admin account + default packages
npm run server           # API on http://localhost:5000
npm run dev              # site on http://localhost:3000, dashboard on /admin
```

- **`/admin` — admins only.** Overview & charts, orders, supplier assignment, packages, users,
  supplier approvals and the realtime support inbox. Anyone else is sent back to the website.
- **Website pages for customers & suppliers** (one login at `/login`, sign-up at `/register`;
  suppliers need admin approval):
  - customers: `/orders` (live order tracking, cancel), `/chat` (support chat), `/profile`
  - suppliers: `/deliveries` (assigned jobs: call, navigate, start → delivered), `/chat`, `/profile`
  - guests: `/orders` tracks an order by number + phone
- On phones the site works like an app: a bottom tab bar (with the Order button in the middle)
  and a **More** drawer replace the top hamburger menu.
- Landing-page orders are saved to the database and show up in the dashboard instantly.
