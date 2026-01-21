# Getting Started - Attend Ease

## Quick Start Guide

### Prerequisites Check ✅

You have:
- ✅ NestJS installed globally
- ✅ PostgreSQL with user: `seed`
- ✅ Database: `attendease` (empty)

### Step 1: Update Database Password

Edit `backend/.env` and update the database password:

```env
DATABASE_URL="postgresql://seed:YOUR_PASSWORD@localhost:5432/attendease?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password for the `seed` user.

### Step 2: Automated Setup (Recommended)

Run the automated setup script:

```bash
cd backend
./setup.sh
```

This will:
1. Install all dependencies
2. Generate Prisma Client
3. Run database migrations
4. Seed initial data (roles, admin user, settings)
5. Create storage directories

### Step 3: Manual Setup (Alternative)

If you prefer manual setup:

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations (creates all tables)
npx prisma migrate dev --name init

# 4. Seed database
npx ts-node prisma/seed.ts

# 5. Create storage directories
mkdir -p uploads storage/salary-slips backups
```

### Step 4: Start the Server

```bash
npm run start:dev
```

The server will start at `http://localhost:3000`

### Step 5: Access API Documentation

Open your browser and visit:

**Swagger UI**: http://localhost:3000/api/docs

### Step 6: Test the API

#### Login as Super Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@seedlab.com",
    "password": "admin123"
  }'
```

You'll receive an `access_token` - use this for authenticated requests.

#### Test Protected Endpoint

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Credentials

- **Email**: admin@seedlab.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately after first login!

## Database Schema

The setup created these tables:
- ✅ `users` - User accounts and authentication
- ✅ `roles` - RBAC roles (SUPER_ADMIN, LAB_ADMIN, LAB_MEMBER)
- ✅ `user_roles` - User-role assignments
- ✅ `lab_members` - Lab member profiles
- ✅ `payment_bands` - Salary structures
- ✅ `biometric_logs` - Append-only biometric data
- ✅ `attendance_records` - Derived attendance
- ✅ `attendance_exceptions` - Exception tracking
- ✅ `leave_requests` - Leave management
- ✅ `holidays` - Holiday calendar
- ✅ `attendance_freezes` - Monthly freeze records
- ✅ `monthly_salary_calculations` - Salary data
- ✅ `salary_adjustments` - Bonuses/deductions
- ✅ `salary_slips` - Generated slips
- ✅ `audit_logs` - Audit trail
- ✅ `system_settings` - Configurable settings

## Verify Setup

### Check Database

```bash
# Connect to database
psql -U seed -d attendease

# List all tables
\dt

# Check roles
SELECT * FROM roles;

# Check admin user
SELECT email, full_name, is_active FROM users;

# Exit psql
\q
```

### Check Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555 - browse your database visually.

## Next Steps

### 1. Create Lab Members

Use the API or Prisma Studio to:
1. Create users for lab members
2. Assign LAB_MEMBER role
3. Create lab member profiles with biometric IDs

### 2. Configure Payment Bands

Create or update payment bands with actual salary rates.

### 3. Add Holidays

Add institute and lab-specific holidays for the year.

### 4. Ingest Biometric Data

Start pushing biometric logs from your devices.

### 5. Run Attendance Derivation

Daily job to derive attendance from biometric logs.

## Troubleshooting

### Database Connection Failed

Check:
1. PostgreSQL is running: `sudo systemctl status postgresql`
2. Database exists: `psql -U seed -l | grep attendease`
3. Password in `.env` is correct
4. User has permissions: `psql -U seed -d attendease -c "SELECT 1"`

### Migration Failed

Reset and retry:
```bash
# Drop all tables (WARNING: deletes data)
npx prisma migrate reset

# Run migrations again
npx prisma migrate dev
```

### Port Already in Use

Change port in `.env`:
```env
PORT=3001
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

## Development Workflow

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Changes

When you modify `prisma/schema.prisma`:

```bash
# Create migration
npx prisma migrate dev --name description_of_change

# Apply to production
npx prisma migrate deploy
```

### Viewing Logs

Development mode shows detailed logs including SQL queries.

### Debugging

Set breakpoints in VS Code or use:

```bash
npm run start:debug
```

## Production Deployment

See `backend/README.md` for production deployment guide.

## Support

For issues:
1. Check logs in console
2. Verify database connection
3. Review API documentation at `/api/docs`
4. Check `backend/README.md` for detailed docs

---

**You're all set! 🎉**

Start building your attendance and salary management system!
