Copy everything below this line:

🌡️ Climexia — HVAC Service & Marketplace Platform

India's smart HVAC service platform. Book AC repair, installation, deep cleaning & AMC. Buy spare parts & equipment. Built with the MERN stack.


📋 Table of Contents

What is Climexia?
Tech Stack
Project Structure
Features
Prerequisites
Installation & Setup
Environment Variables
Running the Project
Database Seeding
API Reference
User Roles & Permissions
Authentication Flow
Default Login Credentials
Key Concepts
Troubleshooting
npm Scripts


What is Climexia?
Climexia is a full-stack HVAC (Heating, Ventilation & Air Conditioning) service marketplace — similar to Urban Company — built specifically for the Indian market. It connects:

Customers who need AC services (repair, installation, gas refill, AMC contracts)
Partners (Technicians / Dealers) who provide those services
Admins who manage the entire platform with fine-grained role-based access

The platform also has an e-commerce store for AC equipment and spare parts.

Tech Stack
LayerTechnologyFrontendReact 18, plain CSS-in-JS (no UI library)BackendNode.js, Express.jsDatabaseMongoDB with Mongoose ODMAuthenticationJWT (access + refresh tokens), bcryptjsFile UploadsMulter (local disk storage)EmailNodemailer (SMTP)SecurityHelmet, express-rate-limit, mongo-sanitize, CORS

Project Structure
climexia/
│
├── climexia-backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                       ← MongoDB connection
│   │   │   └── roles.js                    ← All roles & permissions definitions
│   │   ├── controllers/
│   │   │   ├── adminAuth.controller.js     ← Admin login, staff management
│   │   │   ├── customerAuth.controller.js  ← Customer register/login/profile
│   │   │   ├── partnerAuth.controller.js   ← Partner register/login/docs
│   │   │   ├── catalog.controller.js       ← Products, spare parts, services CRUD
│   │   │   ├── booking.controller.js       ← Booking creation, assignment, status
│   │   │   ├── admin.controller.js         ← AMC, orders, partner/user management
│   │   │   ├── dashboard.controller.js     ← Stats, charts, recent activity
│   │   │   └── support.controller.js       ← Support tickets
│   │   ├── middleware/
│   │   │   └── index.js                    ← Auth guards, file uploads, error handler
│   │   ├── models/
│   │   │   ├── Admin.js                    ← Admin staff schema
│   │   │   ├── User.js                     ← Customer schema
│   │   │   ├── Partner.js                  ← Technician/dealer schema
│   │   │   └── index.js                    ← Product, SparePart, Service, Booking,
│   │   │                                     AMC, Order, AuditLog, Notification,
│   │   │                                     Ticket, City schemas
│   │   ├── routes/
│   │   │   └── index.js                    ← All API routes in one file
│   │   ├── utils/
│   │   │   ├── jwt.js                      ← Token generation, verification, cookies
│   │   │   ├── response.js                 ← Standardised API response helpers
│   │   │   ├── mailer.js                   ← Email templates
│   │   │   └── seeder.js                   ← Populate DB with sample data
│   │   └── server.js                       ← Express app entry point
│   ├── uploads/                            ← Auto-created on first file upload
│   ├── .env
│   └── package.json
│
└── climexia-frontend/
    ├── src/
    │   └── Climexia_Redesign.jsx           ← Entire frontend in one file
    ├── public/
    │   └── index.html
    ├── .env
    └── package.json

Features
Customer Features

Register and login with phone number + password
OTP verification via SMS (SMS provider integration ready)
Browse AC services, equipment, and spare parts
Book a service — select AC type → select issue → pick date and time → confirm
Track booking status in real time
AMC (Annual Maintenance Contract) proposal submission
E-commerce order placement for equipment and spare parts
Address book management
Support ticket creation and replies
In-app notifications
Wallet balance and loyalty points

Partner (Technician / Dealer) Features

Register with document upload (Aadhaar, PAN, HVAC certification)
Pending approval workflow — admin must approve before login is allowed
Accept or reject assigned jobs
Mark jobs as complete with service report
Toggle online / offline availability
Earnings wallet

Admin Features

Role-based access control with 9 staff roles
Super Admin can create and manage all staff
Dashboard with live stats — bookings, revenue, active partners
City-scoped access for city managers
Partner KYC document verification
Booking assignment to partners
AMC activation and renewal
Order fulfilment and tracking
Support ticket management and assignment
Full audit log of every admin action


Prerequisites
ToolMinimum VersionDownloadNode.jsv18https://nodejs.orgnpmv9Comes with Node.jsMongoDBv6https://www.mongodb.com/try/download/community
Verify your installations:
bashnode -v
npm -v
mongod --version

Installation & Setup
Step 1 — Install backend dependencies
bashcd climexia-backend
npm install
Step 2 — Install frontend dependencies
bashcd climexia-frontend
npm install
Step 3 — Set up MongoDB
Option A — Local MongoDB:
bash# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu / Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows
# Download and run the installer from mongodb.com
# MongoDB runs as a Windows Service automatically after install
Option B — MongoDB Atlas (free cloud):

Go to https://cloud.mongodb.com and create a free account
Create a free M0 cluster
Click Connect → Drivers → copy the connection string
Paste it as MONGO_URI in your backend .env file
Under Network Access → Add 0.0.0.0/0 to allow all connections


Environment Variables
The backend .env file is at climexia-backend/.env:
env# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/climexia_db

# JWT — change these to long random strings in production
JWT_SECRET=climexia_access_secret_change_in_production_2026!
JWT_REFRESH_SECRET=climexia_refresh_secret_change_in_production_2026!
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001

# Email — leave blank in development, emails will log to console instead
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=noreply@climexia.in
FROM_NAME=Climexia

# File uploads
MAX_FILE_SIZE_MB=5

# Rate limiting
AUTH_RATE_LIMIT_MAX=10

# Super Admin
SUPER_ADMIN_EMAIL=superadmin@climexia.in
SUPER_ADMIN_PASSWORD=Climexia@Super2026!
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_PHONE=9999999999
Frontend .env at climexia-frontend/.env:
envREACT_APP_API_URL=http://localhost:5000/api

Running the Project
Open three separate terminal windows.
Terminal 1 — Backend:
bashcd climexia-backend
npm run dev
Terminal 2 — Seed the database (run only once):
bashcd climexia-backend
npm run seed
Terminal 3 — Frontend:
bashcd climexia-frontend
npm start
```

Browser opens at http://localhost:3000

---

## Database Seeding

The seeder is safe to run multiple times — it checks for existing data before inserting.

| What gets created | Details |
|-------------------|---------|
| Super Admin | `superadmin@climexia.in` / `Climexia@Super2026!` |
| 6 Staff accounts | All use password `Climexia@Staff2026!` |
| Sample Customer | Phone `9876543210` / `Customer@123` |
| Sample Partner | Phone `9765432109` / `Partner@123` |
| 5 Products | Daikin Split, LG Split, Carrier Cassette, Daikin VRV, Carrier Chiller |
| 6 Spare Parts | Compressor, PCB board, fan motor, expansion valve, HEPA filter, capacitor |
| 8 Services | Deep service, gas refill, installation, water leakage fix, cassette service, AHU PPM, chiller audit |
| 8 Cities | Pune, Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Ahmedabad, Kolkata |

---

## API Reference

All endpoints are prefixed with `/api`. Backend runs at `http://localhost:5000`.

🔒 means the endpoint requires `Authorization: Bearer <token>` in the request header.

### Health Check
```
GET  /api/health
```

### Customer Auth
```
POST   /api/auth/register            { firstName, lastName, phone, password, city }
POST   /api/auth/login               { phone, password }
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/send-otp            { phone }
POST   /api/auth/verify-otp          { phone, otp }
GET    /api/auth/me                  🔒
PUT    /api/auth/profile             🔒
POST   /api/auth/address             🔒
PUT    /api/auth/address/:id         🔒
DELETE /api/auth/address/:id         🔒
```

### Catalog — no login needed
```
GET  /api/services                   ?category=domestic&isFeatured=true&page=1&limit=10
GET  /api/services/:id
GET  /api/products                   ?category=split_ac&brand=Daikin&minPrice=30000
GET  /api/products/:id
GET  /api/parts                      ?category=compressor&search=LG
GET  /api/parts/:id
```

### Bookings
```
POST /api/bookings                       🔒 customer
GET  /api/bookings/my                    🔒 customer
GET  /api/bookings/:id                   🔒 customer / partner / admin
PUT  /api/bookings/:id/cancel            🔒 customer
POST /api/bookings/:id/review            🔒 customer
GET  /api/bookings/partner/jobs          🔒 partner
PUT  /api/bookings/:id/accept            🔒 partner
PUT  /api/bookings/:id/complete          🔒 partner
GET  /api/bookings/admin/all             🔒 admin
PUT  /api/bookings/admin/:id/assign      🔒 admin
PUT  /api/bookings/admin/:id/status      🔒 admin
```

### AMC Contracts
```
POST /api/amc                            🔒 customer
GET  /api/amc/my                         🔒 customer
GET  /api/amc/:id                        🔒 customer / admin
GET  /api/amc/admin/all                  🔒 admin
PUT  /api/amc/admin/:id/activate         🔒 admin
PUT  /api/amc/admin/:id/renew            🔒 admin
```

### Orders
```
POST /api/orders                         🔒 customer
GET  /api/orders/my                      🔒 customer
GET  /api/orders/admin/all               🔒 admin
PUT  /api/orders/admin/:id/status        🔒 admin
```

### Support Tickets
```
POST /api/support/tickets                          🔒 customer
GET  /api/support/tickets/my                       🔒 customer
GET  /api/support/tickets/:id                      🔒 customer / admin
POST /api/support/tickets/:id/reply                🔒 customer / admin
GET  /api/admin/support/tickets                    🔒 admin
PUT  /api/admin/support/tickets/:id/assign         🔒 admin
PUT  /api/admin/support/tickets/:id/close          🔒 admin
```

### Admin Auth & Staff
```
POST   /api/admin/auth/login
GET    /api/admin/auth/me                          🔒 admin
PUT    /api/admin/auth/change-password             🔒 admin
POST   /api/admin/auth/forgot-password
POST   /api/admin/auth/reset-password/:token
GET    /api/admin/auth/staff                       🔒 super admin
POST   /api/admin/auth/staff                       🔒 super admin
GET    /api/admin/auth/staff/:id                   🔒 super admin
PUT    /api/admin/auth/staff/:id                   🔒 super admin
DELETE /api/admin/auth/staff/:id                   🔒 super admin
PUT    /api/admin/auth/staff/:id/permissions       🔒 super admin
```

### Admin — Users, Partners, Dashboard
```
GET /api/admin/users                               🔒 admin
GET /api/admin/users/:id                           🔒 admin
PUT /api/admin/users/:id/block                     🔒 admin
GET /api/admin/partners                            🔒 admin
GET /api/admin/partners/:id                        🔒 admin
PUT /api/admin/partners/:id/approve                🔒 admin
PUT /api/admin/partners/:id/reject                 🔒 admin
PUT /api/admin/partners/:id/block                  🔒 admin
PUT /api/admin/partners/:id/kyc                    🔒 admin
GET /api/admin/dashboard                           🔒 admin
GET /api/admin/dashboard/recent                    🔒 admin
GET /api/admin/dashboard/stats/bookings            🔒 admin
GET /api/admin/audit                               🔒 admin
GET /api/notifications                             🔒 customer / partner
PUT /api/notifications/:id/read                    🔒 customer / partner
```

---

## User Roles & Permissions

| Role | Description |
|------|-------------|
| `super_admin` | Full access to everything. Created by seeder only. Cannot be created via API. |
| `sub_admin` | Created by super admin. Can be given any combination of permissions. |
| `city_manager` | Sees only data from their assigned cities. |
| `technician_manager` | Manages partner onboarding, KYC, and job routing. |
| `catalog_manager` | Manages products, spare parts, and services. |
| `amc_manager` | Manages AMC contracts, activation, and renewals. |
| `finance_manager` | Views earnings, invoices, payouts, and financial reports. |
| `support_agent` | Handles customer support tickets. |
| `viewer` | Read-only dashboard access. No write permissions. |
| `customer` | End users — book services, place orders, raise tickets. |
| `partner` | Technicians, dealers, contractors — accept and complete jobs. |

---

## Authentication Flow
```
1. POST /api/auth/login  { phone, password }
2. Server returns accessToken in response body
3. Server sets refreshToken as httpOnly cookie
4. Frontend stores accessToken in localStorage as "clx_token"
5. Every protected request sends: Authorization: Bearer <accessToken>
6. When accessToken expires → POST /api/auth/refresh
7. Server reads cookie and returns a new accessToken
```

| Token | Lifetime | Storage |
|-------|---------|---------|
| Access Token | 7 days | localStorage |
| Refresh Token | 30 days | httpOnly cookie |

- Passwords hashed with bcrypt — 12 rounds
- Admin accounts lock for 15 minutes after 5 failed login attempts
- Tokens carry a `userType` claim — a customer token cannot access admin endpoints

---

## Default Login Credentials

After running `npm run seed`:

| Role | Login | Password |
|------|-------|---------|
| Super Admin | Email: `superadmin@climexia.in` | `Climexia@Super2026!` |
| Customer | Phone: `9876543210` | `Customer@123` |
| Partner | Phone: `9765432109` | `Partner@123` |
| Catalog Manager | Email: `catalog@climexia.in` | `Climexia@Staff2026!` |
| AMC Manager | Email: `amc@climexia.in` | `Climexia@Staff2026!` |
| Finance Manager | Email: `finance@climexia.in` | `Climexia@Staff2026!` |
| Support Agent | Email: `support@climexia.in` | `Climexia@Staff2026!` |
| City Manager | Email: `pune@climexia.in` | `Climexia@Staff2026!` |
| Sub Admin | Email: `subadmin1@climexia.in` | `Climexia@Staff2026!` |

> ⚠️ Customer and Partner login uses **phone number**. Admin login uses **email**.

---

## Key Concepts

### Auto-generated IDs

| Model | Format | Example |
|-------|--------|---------|
| Booking | `CLX-BK-000001` | Increments with every booking |
| AMC Contract | `CLX-AMC-000001` | Increments with every contract |
| Order | `CLX-ORD-000001` | Increments with every order |
| Support Ticket | `CLX-TKT-00001` | Increments with every ticket |

### City Scope
When a `city_manager` calls any list endpoint, the middleware automatically adds a MongoDB filter for their assigned cities. Controllers do not need to handle this — it works transparently.

### Audit Log
Every write action by an admin is automatically logged to the `AuditLog` collection — who did it, what they did, which record was affected, and from which IP. View at `GET /api/admin/audit`.

### Partner Approval Flow
```
Partner registers → approvalStatus: pending, isActive: false, cannot login
Admin approves   → approvalStatus: approved, isActive: true, can login and receive jobs
```

### AMC Contract Flow
```
Customer submits → status: draft
Admin activates  → status: active, customer notified
PPM visits tracked inside the contract (ppmDone / ppmTotal)
Admin renews     → old contract marked renewed, new contract created

Troubleshooting
Cannot connect to MongoDB
Make sure MongoDB is running. On Mac: brew services start mongodb-community. Check MONGO_URI in .env.
Token expired on every request
Open browser DevTools → Application → Local Storage → delete clx_token. Log in again.
File uploads failing
The uploads/ subfolders are created automatically on first upload. Make sure the Node process has write permission in climexia-backend/.
CORS errors in the browser
Confirm backend runs on port 5000. Confirm FRONTEND_URL=http://localhost:3000 is in backend .env. Restart both servers after any .env change.
Partner login returns 403
The partner is still pending approval. Call PUT /api/admin/partners/:id/approve as admin. Or use the pre-seeded partner: phone 9765432109 / Partner@123 — already approved.
Emails not sending
Expected in development. The server logs emails to console instead. To enable real emails set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env. For Gmail use an App Password.

npm Scripts
Backend — run from climexia-backend/
bashnpm run dev     # Start with nodemon, auto-restarts on file save
npm start       # Start without nodemon, use in production
npm run seed    # Populate database with sample data
Frontend — run from climexia-frontend/
bashnpm start       # Start dev server at http://localhost:3000
npm run build   # Create production build in /build folder

License
This project is proprietary. All rights reserved © Climexia 2026.
