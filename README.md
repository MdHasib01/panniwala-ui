<div align="center">
  <img src="src/assets/logo.png" alt="Paniwala logo" width="92" />
  <h1>Paniwala · পানি ওয়ালা</h1>
  <p><strong>Water delivery, made simple.</strong></p>
  <p>A Bangla-first water delivery experience for homes and offices in Khulna, Bangladesh.</p>
  <p>
    <a href="https://panniwala.vercel.app">Live demo</a> ·
    <a href="#features">Features</a> ·
    <a href="#screenshots">Screenshots</a> ·
    <a href="#getting-started">Getting started</a> ·
    <a href="#contributing">Contributing</a>
  </p>
  <p><strong>Frontend</strong><br />
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&amp;logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&amp;logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&amp;logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Contributions-welcome-0891B2" alt="Contributions welcome" />
  </p>
  <p><strong>Backend</strong><br />
    <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&amp;logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?logo=express&amp;logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB_+_Mongoose-47A248?logo=mongodb&amp;logoColor=white" alt="MongoDB and Mongoose" />
    <img src="https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&amp;logoColor=white" alt="Socket.IO" />
  </p>
</div>

![Paniwala homepage with Bangla service information, delivery area search and water jar ordering](docs/images/paniwala-homepage.jpg)

## Overview

Paniwala brings package discovery, delivery area checks and water ordering into one approachable interface. Customers can find a package, follow an order and reach support; suppliers have a focused delivery view; administrators can manage the day-to-day service from a dedicated workspace.

This repository contains the frontend application. It is built around a Bangla-first customer journey, responsive layouts and reusable interface components.

## Features

| Experience | Highlights |
| --- | --- |
| **Discover and order** | Water jar packages, dispenser bundles, office options and a quick-order dialog. |
| **Check local coverage** | Search delivery areas and explore the locations served in Khulna. |
| **Follow an order** | Order history, status filters, progress stages and assigned supplier details. |
| **Customer support** | Support conversations, call actions and WhatsApp access from the landing page. |
| **Supplier workspace** | Assigned deliveries, customer contact actions, map links and delivery progress controls. |
| **Admin workspace** | Overview charts, order review, supplier assignment, packages, users, suppliers and service areas. |
| **Mobile experience** | Bottom navigation, a More drawer and layouts designed for ordering from a phone. |

## Screenshots

### Mobile experience

<table>
  <tr>
    <td width="50%"><img src="docs/images/paniwala-mobile-home.webp" alt="Paniwala mobile homepage in a tilted phone mockup" width="100%" /></td>
    <td width="50%"><img src="docs/images/paniwala-mobile-order-tracking.webp" alt="Paniwala mobile order tracking in a tilted phone mockup" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Find your area and place an order</strong></td>
    <td align="center"><strong>Follow delivery progress</strong></td>
  </tr>
</table>

### Management workspace

<table>
  <tr>
    <td width="50%"><img src="docs/images/paniwala-admin-dashboard.webp" alt="Paniwala overview dashboard with order activity and status charts" width="100%" /></td>
    <td width="50%"><img src="docs/images/paniwala-order-management.webp" alt="Paniwala order management and supplier assignment with customer details obscured" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Operations at a glance</strong></td>
    <td align="center"><strong>Orders and supplier assignment</strong></td>
  </tr>
</table>

## Frontend stack

| Technology | Purpose |
| --- | --- |
| Next.js App Router | Application routes, layouts and page metadata. |
| React + TypeScript | Interactive screens and typed components. |
| Tailwind CSS | Responsive styling and interface design. |
| shadcn/ui + Radix UI | Reusable controls, dialogs, navigation and dashboard components. |
| Recharts | Overview charts and activity visualizations. |
| Lucide React + Sonner | Interface icons and feedback notifications. |

## Backend stack

| Technology | Purpose |
| --- | --- |
| Node.js | Backend runtime. |
| Express | Web application framework. |
| MongoDB + Mongoose | Data storage and modeling. |
| Socket.IO | Real-time messaging and live updates. |

## Getting started

### Requirements

- Node.js **20.9 or newer**.
- pnpm; the repository includes a <code>pnpm-lock.yaml</code> file.

### Run the frontend

~~~bash
git clone https://github.com/MdHasib01/panniwala-ui.git
cd panniwala-ui
pnpm install
pnpm dev
~~~

Open [localhost:3000](http://localhost:3000) in your browser.

These commands start the frontend development workspace. Account-based and live-data workflows require a maintainer-prepared development environment; the live demo is available for exploring the deployed experience.

### Available commands

| Command | Description |
| --- | --- |
| <code>pnpm dev</code> | Start the frontend development server. |
| <code>pnpm build</code> | Create a production build. |
| <code>pnpm start</code> | Serve an existing production build. |
| <code>pnpm lint</code> | Run the TypeScript check (<code>tsc --noEmit</code>). |
| <code>pnpm og:image</code> | Regenerate the social preview image. |

To preview a production build locally:

~~~bash
pnpm build
pnpm start
~~~

## Explore the interface

| Page | Frontend route |
| --- | --- |
| Homepage and package discovery | <code>/</code> |
| Sign in and registration | <code>/login</code>, <code>/register</code> |
| Customer orders | <code>/orders</code> |
| Assigned supplier deliveries | <code>/deliveries</code> |
| Support conversations | <code>/chat</code> |
| Account profile | <code>/profile</code> |
| Admin workspace | <code>/admin</code> |

Account pages and workspace actions are available according to the signed-in user's role.

## Project structure

~~~text
src/
├── app/          # App Router pages, layouts and metadata
├── views/        # Landing page composition
├── components/   # Storefront sections and shared UI
├── account/      # Orders, deliveries, profile and support screens
├── admin/        # Dashboard screens and interface components
├── site/         # Shared website shell and navigation state
├── assets/       # Brand artwork and product images
└── data/         # Package and location presentation data
docs/
└── images/       # README screenshots and mobile mockups
~~~

## Contributing

Contributions to the frontend are welcome, especially improvements to accessibility, mobile usability, Bangla copy, component consistency and documentation.

1. Open an issue to describe a bug or discuss a larger change.
2. Fork the repository and create a focused branch.
3. Follow the existing component patterns and keep layouts responsive.
4. Run <code>pnpm lint</code> and <code>pnpm build</code> before submitting your change.
5. Open a pull request with a clear description and screenshots for visual changes.

Use fictional or redacted personal details in screenshots and examples. Keep credentials and private operational data out of commits and issue reports.

## License

A license has not yet been specified in this repository.

---

<div align="center">
  <strong>Built for everyday water delivery in Khulna.</strong><br />
  <a href="https://panniwala.vercel.app">Explore Paniwala</a>
</div>
