# Health Concierge

A React + TypeScript + Vite web application for a health concierge service.

## Features

- **Public site**: Home, Services, About, Contact
- **Client dashboard**: Overview, Profile, Appointments, Settings (requires sign-in)
- **Authentication**: Mock login/register with localStorage persistence
- **i18n**: English and Arabic with RTL support
- **Styling**: Tailwind CSS with logical properties for RTL

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Project structure

- `src/components` — shared UI (e.g. LanguageSwitcher)
- `src/contexts` — AuthContext
- `src/i18n` — i18next config and locales (en, ar)
- `src/layouts` — PublicLayout, DashboardLayout
- `src/pages` — public and dashboard pages
- `src/routes` — router config and ProtectedRoute
