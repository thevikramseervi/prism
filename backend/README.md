# Attend Ease - Backend

**Automated Invoice Billing Calculator for Samsung SEED Lab**

This is the backend API for the Attend Ease attendance and salary management system.

## 🚀 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-Based Access Control (RBAC)
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/attend_ease?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with default data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The server will start at `http://localhost:3000`

API documentation available at `http://localhost:3000/api/docs`

## 📁 Project Structure

```
src/
├── common/              # Shared utilities, decorators, guards
│   ├── decorators/     # Custom decorators (CurrentUser, Roles)
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards (JWT, Roles)
│   ├── interceptors/   # Logging interceptors
│   └── prisma/         # Prisma service
│
├── modules/            # Feature modules
│   ├── auth/          # Authentication (JWT)
│   ├── users/         # User management
│   ├── lab-members/   # Lab member management
│   ├── biometric/     # Biometric log ingestion
│   ├── attendance/    # Attendance derivation & management
│   ├── leave/         # Leave request workflow
│   ├── holiday/       # Holiday calendar
│   ├── salary/        # Salary calculation & slips
│   ├── audit/         # Audit logging
│   └── system-settings/ # Configurable settings
│
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## 🔑 Default Credentials

After seeding, use these credentials:

- **Email**: `admin@seedlab.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password in production!

## 🎯 Core Features

### 1. Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (SUPER_ADMIN, LAB_ADMIN, LAB_MEMBER)

### 2. Biometric Attendance
- **Append-only biometric logs** (NEVER updated or deleted)
- Bulk ingestion support
- Device time vs server time tracking

### 3. Attendance Derivation Engine
- **Deterministic derivation** from biometric logs
- Automatic exception detection (missing/inconsistent data)
- Re-derivation support before freeze
- Holiday override
- Leave override

### 4. Attendance Freeze
- Monthly attendance freeze mechanism
- **Immutable** after freeze
- Blocks freeze if pending exceptions exist

### 5. Leave Management
- Casual leave request workflow
- Balance tracking (12 units/year)
- Approval/rejection with audit trail
- Overrides biometric data when approved

### 6. Salary Calculation
- **Calculated ONLY after freeze**
- Transparent breakdown (JSONB)
- Support for monthly and hourly rates
- Manual adjustments (bonus/deduction)
- **Immutable** after calculation

### 7. Salary Slip Generation
- PDF, XLSX, and CSV formats
- Detailed breakdown included

### 8. Audit Logging
- All critical actions logged
- **Append-only** audit trail
- Actor tracking (user or system)

## 🔒 Critical Invariants

### 1. Append-Only Tables
- `biometric_logs` - NEVER updated or deleted
- `audit_logs` - NEVER updated or deleted

### 2. Immutability Boundaries
- After freeze: attendance records cannot be modified
- After calculation: salary records cannot be modified

### 3. Single Source of Truth
- Biometric logs = Raw input
- Attendance records = Derived truth (for salary)
- Frozen attendance = Final truth

### 4. Exception Handling
- Incomplete biometric data → PENDING_EXCEPTION
- Blocks freeze until resolved
- Manual resolution required

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

Once the server is running, visit:

**Swagger UI**: `http://localhost:3000/api/docs`

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

#### Biometric
- `POST /biometric/ingest` - Ingest single biometric log
- `POST /biometric/ingest/bulk` - Bulk ingest
- `GET /biometric/recent` - Get recent logs

#### Attendance
- `GET /attendance/member/:memberId` - Get attendance records
- `POST /attendance/derive/date` - Derive attendance for date
- `POST /attendance/freeze` - Freeze attendance for month
- `GET /attendance/exceptions/pending` - Get pending exceptions

#### Leave
- `POST /leave/request` - Create leave request
- `GET /leave/pending` - Get pending requests
- `POST /leave/:requestId/approve` - Approve leave
- `POST /leave/:requestId/reject` - Reject leave

#### Salary
- `POST /salary/calculate` - Calculate salary
- `POST /salary/calculate/all` - Calculate for all members
- `GET /salary/slip/:calculationId/pdf` - Download PDF slip

## 🔄 Typical Workflow

### Monthly Attendance & Salary Cycle

1. **Daily**: Biometric devices push attendance logs
   ```bash
   POST /biometric/ingest/bulk
   ```

2. **Daily**: System derives attendance from logs
   ```bash
   POST /attendance/derive/date
   ```

3. **As needed**: Admin resolves exceptions
   ```bash
   POST /attendance/exceptions/:id/resolve
   ```

4. **End of month**: Admin freezes attendance
   ```bash
   POST /attendance/freeze/all
   ```

5. **After freeze**: Admin calculates salary
   ```bash
   POST /salary/calculate/all
   ```

6. **After calculation**: Generate salary slips
   ```bash
   GET /salary/slip/:id/pdf
   ```

## 🛡️ Security Best Practices

1. **Never commit `.env` file**
2. **Change default credentials in production**
3. **Use strong JWT secrets (min 32 characters)**
4. **Enable HTTPS in production**
5. **Implement rate limiting (configured via env)**
6. **Regular database backups** (see backup script)

## 📦 Database Backups

```bash
# Manual backup
pg_dump -U username attend_ease > backup_$(date +%Y%m%d).sql

# Restore
psql -U username attend_ease < backup_20240115.sql
```

**Automated backups**: Set up cron job for daily backups.

## 🐛 Debugging

Enable query logging in development:

```env
NODE_ENV=development
```

Prisma will log all SQL queries to console.

## 🚀 Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Start production server**
   ```bash
   npm run start:prod
   ```

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

Proprietary - Samsung SEED Lab Internal Use Only
