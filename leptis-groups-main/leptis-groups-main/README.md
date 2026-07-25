# Leptis Group - Next.js Frontend App

This is the Next.js frontend application for **Leptis Group**, built with Next.js 15 (Turbopack), React 19, Tailwind CSS v4, Framer Motion, and GSAP.

---

## 📦 Package & Dependencies Overview

This frontend project relies on **13 npm packages**:

### Production Dependencies (8 Packages)
- **`next`** (`^15.5.19`): Framework for SSR, static generation, metadata & routing.
- **`react`** (`19.1.0`): Core React library.
- **`react-dom`** (`19.1.0`): DOM rendering engine.
- **`axios`** (`^1.13.2`): HTTP client for Django REST API calls.
- **`framer-motion`** (`^12.40.0`): Motion & animation library.
- **`gsap`** (`^3.15.0`): GreenSock timeline animations.
- **`react-icons`** (`^5.5.0`): Icon collection.
- **`@headlessui/react`** (`^2.2.9`): Accessible UI components.

### Development Dependencies (5 Packages)
- **`tailwindcss`** (`^4`): Utility-first CSS framework.
- **`@tailwindcss/postcss`** (`^4`): PostCSS plugin for Tailwind CSS v4.
- **`eslint`** (`^9`): Linter.
- **`eslint-config-next`** (`15.5.4`): Next.js ESLint rules.
- **`@eslint/eslintrc`** (`^3`): ESLint legacy configuration handler.

For complete root project dependencies (including Django Python packages and AWS infrastructure items), see the main [`README.md`](../README.md).

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Local & Production Build

To run a production build check locally:

```bash
npm run build
```

## AWS Deployment Configuration

In production (AWS EC2), Next.js proxies requests to the backend:

```env
BACKEND_URL=http://127.0.0.1:8001
```
