# AffiSmart Mall — Frontend

> **A production-minded e-commerce and affiliate platform frontend built for portfolio.**
> Designed to demonstrate full-stack thinking and real-world React/Next.js engineering for a fresher role.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-State-orange)](https://zustand-demo.pmnd.rs/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Portfolio-lightgrey)](./LICENSE)

---

## 🔗 Live Demo & Access

- **Storefront:** [avt-affismart-mall.vercel.app](https://avt-affismart-mall.vercel.app)
- **Backend API (Swagger):** [affismart-core-api.onrender.com/swagger-ui.html](https://affismart-core-api.onrender.com/swagger-ui.html)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `12345678A` |
| **Customer** | `binhvt@gmail.com` | `12345678b` |
| **Affiliate** | `anhvt@gmail.com` | `12345678a` |

> [!NOTE]
> **Cold Start:** This project is hosted on Render's free tier. Services may sleep after 15 minutes of inactivity. A monitor is configured to keep it awake during business hours (**8:00 AM – 5:00 PM GMT+7**). Outside this window, please allow up to **5 minutes** for the backend to wake up.

---

## 📸 Screenshots

### 1. Storefront — Homepage
The homepage introduces the platform with a hero section, featured products loaded on the client-side (no SSR block), and AI-powered recommendations.

<img width="100%" alt="Storefront Homepage" src="https://github.com/user-attachments/assets/efa11fa6-8ce9-4944-a8d7-6abb3cd3944f" />

### 2. Product Catalog & Cart
Product catalog with search and filters, alongside the slide-out shopping cart for quick access to added items.

<img width="100%" alt="Product Catalog and Cart" src="https://github.com/user-attachments/assets/460615e8-33c5-444d-b69b-b2d653bb07ac" />

### 3. Product Detail
Product detail page with image, price, stock status, add-to-cart functionality, and AI-generated related products.

<img width="100%" alt="Product Detail" src="https://github.com/user-attachments/assets/bd73b253-b5cd-4597-a7ef-980fabca3434" />

### 4. Checkout Flow
Customer fills in shipping address, reviews the order summary from the cart, and is redirected to Stripe for secure payment.

<img width="100%" alt="Checkout Flow" src="https://github.com/user-attachments/assets/781ffe4e-3d7c-477d-9b90-6487bf5b6523" />

### 5. Affiliate Portal
Affiliate partners can view their performance metrics, manage referral links with a searchable product picker, and request payouts.

<img width="100%" alt="Affiliate Dashboard" src="https://github.com/user-attachments/assets/7947dedc-3771-45df-9891-464481c1ec7a" />

### 6. Admin Panel
Admin dashboard with analytics charts, low-stock alerts, and full management control over products, orders, users, and affiliates.

<img width="100%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/252ba629-f3de-48cd-9dd9-eb61db83603e" />

### 7. AI Shopping Assistant
Floating chatbot widget for shopping support with guardrails, providing personalized responses and product suggestions.

<img width="100%" alt="https://github.com/user-attachments/assets/66d13544-2ff5-4ba5-9a40-f570a3cb72cb" />

---

## ✨ Key Highlights

| Capability | Details |
|---|---|
| 🛒 **Full Storefront** | Product browsing, search, filters, cart, Stripe checkout, order tracking |
| 🔐 **Secure Auth** | JWT in memory (Zustand), HttpOnly refresh cookie, silent token refresh via Axios interceptor |
| 🤝 **Affiliate Portal** | Referral link management, commission tracking, payout request, fraud-aware tracking |
| ⚙️ **Admin Panel** | Full product, order, user, affiliate, and analytics management |
| 🤖 **AI Features** | Client-side recommendations, floating chatbot, personalized AI responses |
| ⚡ **Performance** | ISR, Client-side hydration for cold-start resilience, React `cache()` deduplication |
| 🚀 **Production Deploy** | Vercel + Render + Neon PostgreSQL + Redis Cloud + Cloudinary + Stripe |

---

## Why This Project Fits a Fresher Java Role

This frontend was built to complement a full Spring Boot backend, demonstrating full-stack understanding beyond just writing UI code.

| JD Requirement | How This Project Addresses It |
|---|---|
| **Java backend integration** | All features consume REST APIs from a Spring Boot backend (auth, products, orders, affiliate, admin, AI) |
| **Responsive front-end (React)** | Built with Next.js 14 App Router + React 18; responsive across mobile, tablet, desktop |
| **OOP & design principles** | Code organized by feature boundary: service → hook → component; single responsibility, reusable patterns |
| **Unit of work & Definition of Done** | Each feature is self-contained with error handling, loading states, toast feedback, and validation |
| **Scrum & Agile readiness** | Phased implementation plan, incremental feature delivery, clean commit history |
| **AI tool experience** | Built with Gemini and Claude for research, debugging, code generation, and documentation |
| **Responsible AI use** | Client-side guards strip internal user IDs from AI responses before display |

> **AI-assisted development:** This project was built with the support of AI coding assistants (Gemini, Claude, Codex) for code generation and documentation — with full understanding, review, and ownership of all code by the developer.

---

## Tech Stack

| Area | Technology |
| :--- | :--- |
| Framework | Next.js 14 App Router |
| UI | React 18, TypeScript, Tailwind CSS |
| Server State | TanStack React Query |
| Client State | Zustand |
| Forms | React Hook Form, Zod |
| HTTP Client | Axios with credentials and token refresh |
| Charts | Recharts |
| UI Base | Base UI, custom reusable components |
| Icons | Lucide React |
| Notifications | Sonner |
| Deployment | Vercel |

---

## Main Features

### Storefront

- Homepage with hero section, featured products (client-side), and AI recommendations.
- Product catalog with search, category filter, price filter, sorting, and SEO-friendly URLs.
- Product detail page with image, stock status, description, add-to-cart, and related recommendations.
- Affiliate tracking through `?ref=` links without blocking SSR.

### Authentication and Identity

- Login and register pages.
- Access token stored in memory through Zustand.
- Refresh token handled by HttpOnly cookie from backend.
- Axios interceptor refreshes access token when needed.
- UI role cookie supports middleware routing.
- Profile page calls `GET /users/me` and supports profile update.

### Cart and Checkout

- Persistent cart store (Zustand + LocalStorage).
- Checkout page with customer shipping information.
- Stripe payment session integration through backend.
- Payment success and cancel pages.
- Success page clears cart and tracks purchase events.

### Affiliate Portal

- Affiliate registration dialog for logged-in users.
- Dashboard with clicks, conversions, balance, and recent commission activity.
- Referral link management with searchable product picker.
- Commission list with pagination.
- Payout page with balance, request button, guidelines, and payout history.

### Admin Panel

- Admin dashboard with analytics, charts, and low-stock products alert.
- Product management with create, edit, status toggle, image upload, and validation.
- Category management.
- Order list and order detail review.
- User account management.
- Affiliate account approval, commission rate update, and payout request handling.
- Blocked IP management for affiliate click abuse.

### AI Features

- AI recommendation section for homepage and product detail pages.
- Floating chatbot widget for shopping-related support.
- Admin analytics widgets for business overview.
- Client-side guards to avoid exposing internal user IDs in AI responses.

---

## Architecture Overview

```text
src/
  app/                 Next.js routes and layouts
  components/          Reusable UI and feature components
  hooks/               React Query hooks and feature hooks
  lib/                 Utilities, SEO helpers, validators
  services/            API clients and backend integration
  store/               Zustand stores
  types/               Shared TypeScript types
```

### Route Groups

```text
(auth)          Login and register pages
(storefront)    Public shopping pages
(customer)      Customer checkout, orders, and profile pages
admin           Admin management panel
affiliate       Affiliate partner portal
payment         Stripe payment result pages
```

---

## Backend Integration

This frontend is designed to work with the AffiSmart Mall Spring Boot backend.

Expected backend base URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Production:

```env
NEXT_PUBLIC_API_URL=https://affismart-core-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

Key integrated APIs:

- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /products`, `GET /products/{slug}`
- `POST /orders`, `POST /payment/create-session`
- `GET /users/me`, `PUT /users/me`
- `GET /affiliate/me/dashboard`, `GET /affiliate/me/links`
- `GET /admin/analytics/dashboard`

---

## Getting Started

### Requirements

- Node.js 20+
- npm
- Running backend API

### Install & Run

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Open `http://localhost:3000`

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Build and Production Notes

The app avoids heavy backend calls during the static build phase to prevent timeouts when the free Render backend is sleeping.

| Page | Rendering Strategy |
|---|---|
| Home (`/`) | Static shell + client-side featured products |
| Product catalog (`/products`) | Dynamic (reads URL filters via `searchParams`) |
| Product detail (`/products/[slug]`) | ISR — `revalidate = 300`, React `cache()` for request dedup |
| Payment success | Dynamic (reads `orderId` from query params) |
| All other pages | Static pre-rendered |

Axios is configured with a `15s` timeout to avoid infinite hangs during backend cold start.

---

## Deployment

| Part | Platform |
| :--- | :--- |
| Frontend | Vercel Hobby |
| Backend | Render Free |
| Database | Neon PostgreSQL Free |
| Redis | Redis Cloud Free |
| Image Storage | Cloudinary Free |
| Payment | Stripe Test Mode |

Vercel environment variables:

```env
NEXT_PUBLIC_API_URL=https://affismart-core-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

Backend must also allow the Vercel domain in CORS and Stripe redirect URLs:

```env
FRONTEND_URL=https://your-vercel-domain.vercel.app
STRIPE_SUCCESS_URL=https://your-vercel-domain.vercel.app/payment/success
STRIPE_CANCEL_URL=https://your-vercel-domain.vercel.app/payment/cancel
```

---

## Quality Checklist

- TypeScript types for all API payloads and UI data.
- Zod validation on all forms with inline error display.
- Role-aware navigation and middleware route protection.
- Responsive layouts for mobile (375px), tablet (768px), and desktop (1280px).
- SEO metadata for all public pages.
- Toast feedback and loading states on all mutations.
- Clear separation between services, hooks, stores, and components.

---

## License

This project is built for learning, portfolio, and recruitment preparation.
