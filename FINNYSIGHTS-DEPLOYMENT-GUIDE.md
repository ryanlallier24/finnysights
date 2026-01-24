# finnysights Web Application - Production Deployment Guide

This guide will walk you through deploying your finnysights React application to production.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Install Dependencies](#3-install-dependencies)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Build for Production](#5-build-for-production)
6. [Deployment Options](#6-deployment-options)
7. [Domain & SSL Setup](#7-domain--ssl-setup)
8. [Post-Deployment Checklist](#8-post-deployment-checklist)

---

## 1. Prerequisites

Before starting, ensure you have:

- [ ] **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- [ ] **npm** or **yarn** package manager
- [ ] **Git** installed
- [ ] A code editor (VS Code recommended)
- [ ] A hosting account (Vercel, Netlify, or AWS)
- [ ] A domain name (optional but recommended)

Verify your installations:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
git --version
```

---

## 2. Project Setup

### Step 2.1: Create a New React Project

```bash
# Create a new Vite + React project (recommended for performance)
npm create vite@latest finnysights -- --template react

# Navigate to project directory
cd finnysights
```

### Step 2.2: Project Structure

Organize your project files like this:

```
finnysights/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   └── FinnysightsLanding.jsx
│   │   ├── app/
│   │   │   └── FinnysightsApp.jsx
│   │   ├── dashboard/
│   │   │   └── FinnysightsDashboard.jsx
│   │   ├── mobile/
│   │   │   └── FinnysightsMobileNav.jsx
│   │   ├── theme/
│   │   │   └── FinnysightsThemeSystem.jsx
│   │   ├── api-docs/
│   │   │   └── FinnysightsApiDocs.jsx
│   │   ├── stock-detail/
│   │   │   └── FinnysightsStockDetail.jsx
│   │   └── notifications/
│   │       └── FinnysightsNotifications.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

### Step 2.3: Copy Your Component Files

Copy each of your `.jsx` files into the appropriate folders:

```bash
# From your downloads, copy files to src/components/
# Rename files to match React component naming conventions

finnysights-landing.jsx      → src/components/landing/FinnysightsLanding.jsx
finnysights-app.jsx          → src/components/app/FinnysightsApp.jsx
finnysights-dashboard.jsx    → src/components/dashboard/FinnysightsDashboard.jsx
finnysights-mobile-nav.jsx   → src/components/mobile/FinnysightsMobileNav.jsx
finnysights-theme-system.jsx → src/components/theme/FinnysightsThemeSystem.jsx
finnysights-api-docs.jsx     → src/components/api-docs/FinnysightsApiDocs.jsx
finnysights-stock-detail.jsx → src/components/stock-detail/FinnysightsStockDetail.jsx
finnysights-notifications.jsx → src/components/notifications/FinnysightsNotifications.jsx
```

### Step 2.4: Create Main App Router

Create/update `src/App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinnysightsLanding from './components/landing/FinnysightsLanding';
import FinnysightsApp from './components/app/FinnysightsApp';
import FinnysightsDashboard from './components/dashboard/FinnysightsDashboard';
import FinnysightsApiDocs from './components/api-docs/FinnysightsApiDocs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FinnysightsLanding />} />
        <Route path="/app" element={<FinnysightsApp />} />
        <Route path="/dashboard" element={<FinnysightsDashboard />} />
        <Route path="/docs" element={<FinnysightsApiDocs />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Step 2.5: Update main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 3. Install Dependencies

### Step 3.1: Install Required Packages

```bash
# Core dependencies
npm install react-router-dom

# UI dependencies (used in your components)
npm install lucide-react

# Development dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Step 3.2: Configure Tailwind CSS

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### Step 3.3: Update index.css

Replace contents of `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  font-family: 'Outfit', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
```

---

## 4. Configure Environment Variables

### Step 4.1: Create Environment Files

Create `.env` file in project root:

```env
# API Configuration
VITE_API_URL=https://api.finnysights.io
VITE_API_VERSION=v1

# App Configuration
VITE_APP_NAME=finnysights
VITE_APP_URL=https://finnysights.io

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

Create `.env.example` (for documentation):

```env
VITE_API_URL=
VITE_API_VERSION=
VITE_APP_NAME=
VITE_APP_URL=
VITE_GA_TRACKING_ID=
```

### Step 4.2: Add .env to .gitignore

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## 5. Build for Production

### Step 5.1: Test Locally First

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
# Test all pages and functionality
```

### Step 5.2: Create Production Build

```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 5.3: Preview Production Build

```bash
# Preview the production build locally
npm run preview

# Open http://localhost:4173
```

---

## 6. Deployment Options

Choose one of these deployment methods:

### Option A: Vercel (Recommended - Easiest)

**Step 1:** Install Vercel CLI
```bash
npm install -g vercel
```

**Step 2:** Deploy
```bash
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? finnysights
# - Directory? ./
# - Override settings? No
```

**Step 3:** Set Environment Variables
```bash
# Add each environment variable
vercel env add VITE_API_URL
vercel env add VITE_APP_URL
```

**Step 4:** Deploy to Production
```bash
vercel --prod
```

---

### Option B: Netlify

**Step 1:** Install Netlify CLI
```bash
npm install -g netlify-cli
```

**Step 2:** Build and Deploy
```bash
# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod --dir=dist
```

**Step 3:** Configure in Netlify Dashboard
- Go to Site Settings → Build & Deploy
- Set Build command: `npm run build`
- Set Publish directory: `dist`

---

### Option C: AWS Amplify

**Step 1:** Install AWS Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

**Step 2:** Initialize Amplify
```bash
amplify init
```

**Step 3:** Add Hosting
```bash
amplify add hosting
# Select: Hosting with Amplify Console
# Select: Manual deployment
```

**Step 4:** Publish
```bash
amplify publish
```

---

### Option D: Traditional Server (Nginx)

**Step 1:** Build Your App
```bash
npm run build
```

**Step 2:** Upload `dist` folder to your server

**Step 3:** Configure Nginx
```nginx
server {
    listen 80;
    server_name finnysights.io www.finnysights.io;
    root /var/www/finnysights/dist;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

**Step 4:** Restart Nginx
```bash
sudo systemctl restart nginx
```

---

## 7. Domain & SSL Setup

### Step 7.1: Purchase Domain
- Recommended registrars: Namecheap, Google Domains, Cloudflare

### Step 7.2: Configure DNS

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your server IP or hosting provider's IP |
| CNAME | www | finnysights.io |

### Step 7.3: SSL Certificate

**For Vercel/Netlify:** SSL is automatic ✅

**For Custom Server:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d finnysights.io -d www.finnysights.io

# Auto-renewal is set up automatically
```

---

## 8. Post-Deployment Checklist

### Functionality Testing
- [ ] Landing page loads correctly
- [ ] All navigation links work
- [ ] Login/signup modal works
- [ ] Password reset flow works
- [ ] Dashboard loads (if authenticated)
- [ ] Mobile responsive design works
- [ ] All animations work smoothly

### Performance Testing
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test page load time (< 3 seconds)
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### Security Checklist
- [ ] HTTPS is enforced
- [ ] Environment variables are not exposed
- [ ] No sensitive data in client-side code
- [ ] CORS is properly configured
- [ ] Content Security Policy headers set

### SEO Checklist
- [ ] Add meta tags to index.html
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Add Open Graph tags for social sharing

### Monitoring Setup
- [ ] Set up error tracking (Sentry recommended)
- [ ] Set up analytics (Google Analytics or Plausible)
- [ ] Set up uptime monitoring (UptimeRobot)

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
vercel                   # Deploy to Vercel (staging)
vercel --prod            # Deploy to Vercel (production)
netlify deploy --prod    # Deploy to Netlify

# Useful
npm audit                # Check for vulnerabilities
npm update               # Update dependencies
```

---

## Troubleshooting

### Common Issues

**1. Blank page after deployment**
- Check browser console for errors
- Ensure `base` in `vite.config.js` matches your deployment path

**2. Routes not working (404 on refresh)**
- Configure your hosting to redirect all routes to index.html
- For Vercel, create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**3. Environment variables not working**
- Ensure variables start with `VITE_`
- Restart the build process after changing env vars

**4. Styles not loading**
- Check Tailwind CSS configuration
- Ensure PostCSS is properly configured

---

## Support Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

**Congratulations!** 🎉 Your finnysights web application is now live!

For questions or issues, refer to the documentation links above or reach out to your development team.
