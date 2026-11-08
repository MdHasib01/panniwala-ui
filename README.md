<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4019b3b3-bfcc-4f58-b52b-0af1eb616379

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend & admin dashboard

The API lives in [server/](server/) (Express + MongoDB + Socket.IO) — see [server/README.md](server/README.md).

```bash
npm run server:install   # once
npm run seed             # admin account + default packages
npm run server           # API on http://localhost:5000
npm run dev              # site on http://localhost:3000, dashboard on /admin
```

- `/admin/login`, `/admin/register` (customers and suppliers can sign up; suppliers need admin approval)
- `/admin` — role-based dashboard: overview & charts, orders, realtime support chat, profile;
  admins also manage packages, users and suppliers.
- Landing-page orders are saved to the database and show up in the dashboard instantly.
