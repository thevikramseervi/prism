# Attend Ease - Database Design Document

## Design Principles

### 1. Single Source of Truth
- **Biometric logs**: Raw input, append-only, never updated
- **Attendance records**: Derived from biometric logs, frozen monthly
- **Salary calculations**: Derived from frozen attendance, immutable

### 2. Data Integrity Guarantees
- Foreign key constraints enforce referential integrity
- CHECK constraints enforce business rules
- UNIQUE constraints prevent duplicates where required
- NOT NULL constraints prevent missing critical data

### 3. Auditability
- All critical mutations logged in `audit_logs`
- Timestamps on all entities (created_at, updated_at)
- Soft deletes where applicable (deleted_at)
- Actor tracking for all manual actions

### 4. Immutability Zones
- Biometric logs: NEVER updated or deleted
- Frozen attendance: NEVER changed after freeze
- Calculated salary: NEVER changed after calculation
- Audit logs: NEVER updated or deleted

## Entity Relationship Overview

### Core Entities
1. **User Management**: users, roles, user_roles
2. **Lab Member Data**: lab_members, payment_bands, lab_member_payment_bands
3. **Attendance Pipeline**: biometric_logs → attendance_records → attendance_exceptions
4. **Leave Management**: leave_requests
5. **Calendar**: holidays
6. **Freeze & Salary**: attendance_freezes, monthly_salary_calculations, salary_adjustments, salary_slips
7. **System**: audit_logs, system_settings

### Data Flow
```
Biometric Device
    ↓
biometric_logs (append-only)
    ↓
[Derivation Engine]
    ↓
attendance_records (source: BIOMETRIC or MANUAL)
    ↓
[Exception Detection]
    ↓
attendance_exceptions (if inconsistent data)
    ↓
[Admin Resolution] ← leave_requests (if approved)
    ↓
attendance_records (updated with source: MANUAL or LEAVE_OVERRIDE)
    ↓
[Freeze] → attendance_freezes
    ↓
monthly_salary_calculations
    ↓
salary_slips (PDF/XLSX/CSV)
```

## Key Design Decisions

### 1. Biometric Logs: Append-Only
- **Rationale**: Device data is unreliable but must be preserved for audit
- **Implementation**: No update/delete methods in DAO layer
- **Constraint**: created_at is immutable

### 2. Attendance Source Tracking
- **BIOMETRIC**: Derived from biometric logs
- **MANUAL**: Admin override with mandatory reason
- **LEAVE_OVERRIDE**: Approved leave application
- **HOLIDAY**: System-generated for holidays

### 3. Attendance Status Enum
- **FULL_DAY**: ≥8 hours worked, paid 1.0
- **HALF_DAY**: ≥4 hours worked, paid 0.5
- **LOP**: <4 hours worked, paid 0.0 (Loss of Pay)
- **CASUAL_LEAVE_FULL**: Approved full-day CL, paid 1.0
- **CASUAL_LEAVE_HALF**: Approved half-day CL, paid 0.5
- **HOLIDAY**: Non-working day, paid 1.0
- **PENDING_EXCEPTION**: Inconsistent data, blocks freeze

### 4. Exception Handling
- Attendance with incomplete/inconsistent biometric data marked as PENDING_EXCEPTION
- Blocks monthly freeze until resolved
- Admin must explicitly resolve with reason
- Original biometric data remains untouched

### 5. Freeze Mechanism
- One freeze record per month per lab member
- After freeze: attendance_records become immutable
- Enforced at application layer and DB triggers (if needed)
- Freeze unblocks salary calculation

### 6. Salary Calculation
- Strictly based on frozen attendance
- Transparent breakdown stored
- Immutable after generation
- Supports manual adjustments (audited)

### 7. Audit Logging
- Actor: user_id or 'SYSTEM'
- Action: CREATED, UPDATED, DELETED, APPROVED, REJECTED, FROZEN, etc.
- Entity: table name and ID
- Before/after values (JSONB for flexibility)
- Timestamp for time-series analysis

## Table Details

### users
- Primary authentication entity
- Stores credentials (hashed password)
- Links to roles via user_roles
- Separate from lab_members (a user may not be a lab member)

### roles
- SUPER_ADMIN, LAB_ADMIN, LAB_MEMBER
- Permissions managed via RBAC logic in application

### lab_members
- Students working in Samsung SEED Lab
- Links to users for authentication
- Links to payment_bands for salary calculation
- Biometric identifier mapping

### payment_bands
- Defines salary structure (e.g., hourly rate or monthly base)
- Versioned (start_date, end_date)
- Supports salary revisions over time

### biometric_logs
- Raw input from biometric devices
- device_id: identifier of the biometric device
- biometric_user_id: device-specific user identifier
- timestamp: device time (NOT trusted for salary logic)
- event_type: IN, OUT, or UNKNOWN
- Append-only: no updates, no deletes

### attendance_records
- One record per lab member per day
- Derived from biometric_logs or set manually
- source: BIOMETRIC, MANUAL, LEAVE_OVERRIDE, HOLIDAY
- status: FULL_DAY, HALF_DAY, LOP, CASUAL_LEAVE_FULL, etc.
- hours_worked: calculated from biometric logs
- is_frozen: true after monthly freeze (immutable)
- manual_reason: mandatory if source is MANUAL

### attendance_exceptions
- Tracks unresolved attendance issues
- exception_type: MISSING_DATA, INCONSISTENT_LOGS, etc.
- status: PENDING, RESOLVED
- resolution_note: admin's explanation
- Blocks freeze until resolved

### leave_requests
- Lab member applies for casual leave
- leave_type: CASUAL_LEAVE (future: SICK_LEAVE, etc.)
- duration: FULL_DAY, HALF_DAY
- status: PENDING, APPROVED, REJECTED
- Approved leave overrides biometric data

### holidays
- Institute and lab-specific holidays
- holiday_type: INSTITUTE, LAB
- No attendance marking on holidays
- Biometric logs ignored

### attendance_freezes
- One record per lab member per month
- freeze_date: when freeze was performed
- frozen_by: admin user who froze
- Immutable after creation

### monthly_salary_calculations
- Calculated after freeze
- total_days_worked: sum of paid days
- gross_salary: calculated amount
- breakdown: JSONB storing transparent calculation details
- Immutable after creation

### salary_adjustments
- Manual corrections to salary (bonuses, deductions)
- adjustment_type: BONUS, DEDUCTION, CORRECTION
- Reason mandatory
- Audited

### salary_slips
- Generated salary slips
- file_path: PDF/XLSX/CSV storage location
- format: PDF, XLSX, CSV
- Immutable

### audit_logs
- Append-only
- Tracks all critical actions
- Supports compliance and debugging

### system_settings
- Configurable thresholds (e.g., FULL_DAY_MIN_HOURS=8)
- Versioned settings
- Changes are audited

## Constraints & Invariants

1. **Biometric logs**: No FK to lab_members initially (mapping happens via biometric_user_id)
2. **Attendance records**: Cannot be created without either biometric data OR admin action
3. **Freeze**: Cannot freeze if any PENDING_EXCEPTION exists for that month
4. **Leave**: Cannot apply leave for a holiday
5. **Salary**: Cannot calculate without freeze
6. **Audit**: All critical actions MUST create audit log entry

## Indexes

Performance-critical indexes:
- `biometric_logs`: (biometric_user_id, timestamp)
- `attendance_records`: (lab_member_id, date), (is_frozen)
- `attendance_exceptions`: (status)
- `leave_requests`: (lab_member_id, status)
- `audit_logs`: (entity_type, entity_id, created_at)

## Migrations Strategy

- Use Prisma migrations
- Always backup before migration
- Never drop tables in production
- Use schema versioning
