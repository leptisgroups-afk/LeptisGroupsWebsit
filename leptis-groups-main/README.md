# Leptis Group - Corporate Website & Management Portal

A multi-sector corporate web application and content management system for **Leptis Group**, built with a **Next.js 15 (Turbopack)** frontend and a **Django 5 REST Framework** backend.

---

## 📦 Package & Third-Party Dependencies Summary

The project utilizes a total of **27 Packages and Third-Party Items** across frontend development, backend API execution, security, database management, and cloud deployment:

- **Frontend Production Packages:** 8
- **Frontend Developer Tools:** 5
- **Backend Python Packages:** 8
- **Third-Party Services, Fonts & Infrastructure Tools:** 6
- **Total Project Items:** **27**

---

### 1. Frontend Production Dependencies (8 Packages)

Located in `leptis-groups-main/package.json`:

| Package Name | Version | Purpose & Usage |
| :--- | :--- | :--- |
| **`next`** | `^15.5.19` | React framework handling SSR, static generation, App Router, metadata, and API proxies via Turbopack. |
| **`react`** | `19.1.0` | Core UI JavaScript rendering library. |
| **`react-dom`** | `19.1.0` | React DOM rendering engine for web interface components. |
| **`axios`** | `^1.13.2` | Promise-based HTTP client for asynchronous requests to the Django REST API. |
| **`framer-motion`** | `^12.40.0` | Production animation library powering smooth scroll effects, hover states, and UI transitions. |
| **`gsap`** | `^3.15.0` | GreenSock Animation Platform for high-performance timeline and web animations. |
| **`react-icons`** | `^5.5.0` | Icon set providing FontAwesome icons (`FaTruck`, `FaShip`, `FaStore`, `FaEnvelope`, `FaPhone`, `FaUser`, `FaFilePdf`, etc.). |
| **`@headlessui/react`** | `^2.2.9` | Accessible, unstyled React UI components for interactive dropdowns, popovers, and modals. |

---

### 2. Frontend Developer & Styling Dependencies (5 Packages)

Located in `leptis-groups-main/package.json`:

| Package Name | Version | Purpose & Usage |
| :--- | :--- | :--- |
| **`tailwindcss`** | `^4` | Utility-first CSS framework powering design tokens, glassmorphic themes, and responsive layouts. |
| **`@tailwindcss/postcss`** | `^4` | PostCSS plugin for compiling and optimizing Tailwind CSS v4 styling directives. |
| **`eslint`** | `^9` | JavaScript and JSX code quality checker and linter. |
| **`eslint-config-next`** | `15.5.4` | Official Next.js rule configurations for ESLint. |
| **`@eslint/eslintrc`** | `^3` | Configuration compatibility utility for ESLint v9+. |

---

### 3. Backend Python Packages (8 Packages)

Located in `backend/requirements.txt`:

| Package Name | Version | Purpose & Usage |
| :--- | :--- | :--- |
| **`Django`** | `5.2.8` | High-level Python web framework providing ORM models, database engine, authentication, and security middleware. |
| **`djangorestframework`** | `3.16.1` | REST API toolkit providing model serializers, viewsets, token authentication, and response handlers. |
| **`django-cors-headers`** | `4.9.0` | Middleware managing Cross-Origin Resource Sharing (CORS) headers for Next.js frontend requests. |
| **`pillow`** | `12.0.0` | Python Imaging Library (PIL) for image upload processing, thumbnail generation, dynamic dimensions, and format checks. |
| **`python-dotenv`** | `1.2.1` | Environment variable loader reading backend configuration parameters from `.env` files. |
| **`asgiref`** | `3.10.0` | Asynchronous Server Gateway Interface (ASGI) specs adapter for Django compatibility. |
| **`sqlparse`** | `0.5.3` | Non-validating SQL statement formatter and parser used by Django ORM query engines. |
| **`tzdata`** | `2025.2` | Timezone database definition package supporting global UTC/local timestamp operations. |

---

### 4. Third-Party Services, Fonts & Infrastructure Tools (6 Items)

| Item / Tool Name | Category | Description & Usage |
| :--- | :--- | :--- |
| **Google Fonts (`Poppins`)** | Typography | High-performance typography loaded dynamically via `next/font/google` for layout rendering without layout shifts. |
| **Gmail SMTP (`smtp.gmail.com`)** | Email Service | Mail Transport Protocol service sending contact form messages, career application notifications, and admin OTP security codes. |
| **PM2 Process Manager** | Process Daemon | Production Node.js daemon tool managing continuous execution, auto-restarts, and monitoring for `nextjs-frontend`. |
| **Linux Systemd (`django.service`)** | Service Daemon | System service manager maintaining the background Django Gunicorn/WSGI backend process. |
| **AWS EC2 (`16.171.11.162`)** | Cloud Hosting | Amazon Web Services virtual instance running production frontend, backend API, and SQLite database. |
| **OpenSSH & SCP** | Deployment Pipeline | Secure key-authenticated (`landingweb.pem`) pipeline powering automated code tarball archiving and EC2 remote deployments. |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- Python 3.10+
- Git

### 1. Launch Both Frontend & Backend (LAN / Local)
You can launch both servers simultaneously using the provided automated launcher:
```cmd
run_lan.bat
```

### 2. Manual Frontend Setup
```bash
cd leptis-groups-main
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 3. Manual Backend Setup
```bash
cd backend
..\env\Scripts\python.exe manage.py migrate
..\env\Scripts\python.exe manage.py runserver 0.0.0.0:8001
```
Backend API runs on: `http://localhost:8001`

---

## 🛠 AWS Deployment

Automated remote build and deployment script:
```cmd
push_aws.bat
```
- Option `[1]`: Deploy Code Tarball to AWS via SCP & SSH.
- Option `[4]`: Full Deployment (Code + Database + Media Uploads + Service Restarts).
- Option `[5]`: Push Code to GitHub.
