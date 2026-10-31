# Vexo Cart E-Commerce (Internship Project)

Full-stack e-commerce solution: **React Native (Expo + TypeScript) mobile app for Android and iOS only**, **Django REST** backend, **MySQL-ready** database, and a separate **Django web admin panel** for staff (not a shopper website).

## Project structure

| Folder | Purpose |
|--------|---------|
| `backend/` | Django 5 + DRF API, JWT auth, admin portal at `/portal/` |
| `mobile/` | Expo **mobile-only** client — Android & iOS (Expo Go or dev build) |

## Architecture (how it is implemented)

### Database relationships

- `User` → `Address`, `WishlistItem`, `Cart`, `Order`, `Notification`
- `Category` → `Product` → `ProductImage`
- `Cart` → `CartItem` → `Product`
- `Order` → `OrderItem` → `Product`, `OrderStatusHistory`
- `Banner` optionally links to `Category`

### Mobile app

- **Reusable UI**: `Button`, `Input`, `ProductCard`, `BannerCarousel`, `StateViews`
- **State**: Zustand + AsyncStorage (auth tokens, user profile, **persisted cart snapshot**)
- **API**: Axios client with JWT refresh interceptor; all product data from REST API
- **Navigation**: Bottom tabs (Home, Shop, Wishlist, Cart, Profile) + stack for details/checkout/auth
- **Animations**: Reanimated (`FadeInDown`, `FadeInUp`, spring press on buttons), gradient banners, haptic feedback

### Backend API (prefix `/api/`)

| Area | Endpoints |
|------|-----------|
| Auth | `POST auth/register/send-otp/`, `POST auth/register/` (email OTP required), JWT login/logout, forgot/reset password, profile |
| Catalog | `GET catalog/home/`, products (filter/sort/search), categories, banners |
| Cart/Orders | Cart CRUD, `POST orders/checkout/` (sends **order confirmation email**), mock payment gateway, orders list/detail |
| Wishlist/Address | `auth/wishlist/`, `auth/addresses/` |
| Notifications | `notifications/` |

### Admin panel (`http://127.0.0.1:8000/portal/`)

Staff login, dashboard (sales/orders/customers/low stock), manage products & categories, update order status (creates customer notifications), customers, sales report.

Default admin user (after seed): **admin / Admin@12345**

## Quick start (development)

### Backend

```powershell
cd backend
copy .env.example .env
..\venv\Scripts\pip install -r requirements.txt
..\venv\Scripts\python manage.py migrate
..\venv\Scripts\python manage.py seed_demo
..\venv\Scripts\python manage.py runserver 0.0.0.0:8000
```

**MySQL**: set `USE_MYSQL=true` in `.env` and create database `ecommerce_db`. SQLite is used by default for easy local setup.

**Email (OTP + order confirmations)**  
By default emails print in the **Django runserver console** (good for dev). For a real inbox, set SMTP in `backend/.env` (see `.env.example`). Registration sends a **6-digit OTP** to the email; checkout sends an **order summary** to the customer’s registered email.

### Mobile

```powershell
cd mobile
npm install
# Optional: set API for physical device → your PC LAN IP
# set EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api
npm start
```

This is **not** a browser storefront. Run on device or emulator:

- **Android emulator** → API defaults to `http://10.0.2.2:8000/api` (press `a` in the Expo terminal).
- **iOS simulator** (Mac) → press `i` in the Expo terminal.
- **Expo Go on a physical phone** → same Wi‑Fi as your PC; set `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api` if needed.

Optional: from repo root, `.\start-dev.ps1` starts the API and Expo together.

### Deploy backend (Render) + Android APK (Expo EAS)

1. **Render:** connect this repo → Blueprint uses root `render.yaml` → set `RESEND_*` and `RAZORPAY_*` in the service Environment → Shell: `python manage.py seed_demo`.
2. **APK:** see [mobile/MOBILE_RUN.md](mobile/MOBILE_RUN.md). From `mobile/`:
   ```powershell
   npx eas-cli login
   npm run build:apk
   ```
   First build asks to **generate an Android keystore** — choose Yes (Expo stores it). When finished, download the `.apk` from [Expo builds](https://expo.dev/accounts/poonghuzhalis-team/projects/luxecart-ecommerce/builds).

   Default API in release builds: `https://vexo-cart-api.onrender.com/api` (edit `eas.json` if your Render URL differs).

## Demo flow

1. Register in the app: enter email → **Send OTP** → enter code from email (or console) → complete signup.
2. Browse home → product detail → add to cart (requires login).
3. Add address → checkout → COD or mock gateway (card not ending in `0000`).
4. View order tracking timeline; admin updates status in `/portal/` → notification in app.

## Git workflow (for submission)

Make small, meaningful commits, for example:

- `feat(backend): add product and order models`
- `feat(mobile): implement cart and checkout screens`
- `feat(admin): dashboard and order status updates`

## Validation & states

- Server-side validation (password rules, stock checks, address fields, checkout).
- Mobile loading / empty / error states on all major screens.
- Cart persisted via API + AsyncStorage cache when authenticated.
