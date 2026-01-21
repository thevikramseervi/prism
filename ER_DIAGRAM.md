# Attend Ease - Entity Relationship Diagram

## ER Diagram (Mermaid)

```mermaid
erDiagram
    %% User Management
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : "assigned to"
    User ||--o| LabMember : "may be"
    
    %% Lab Member & Payment
    LabMember ||--o{ LabMemberPaymentBand : "assigned to"
    PaymentBand ||--o{ LabMemberPaymentBand : "has"
    
    %% Biometric & Attendance Pipeline
    LabMember ||--o{ AttendanceRecord : "has"
    AttendanceRecord ||--o| AttendanceException : "may have"
    
    %% Leave Management
    LabMember ||--o{ LeaveRequest : "requests"
    
    %% Freeze & Salary
    LabMember ||--o{ AttendanceFreeze : "has"
    LabMember ||--o{ MonthlySalaryCalculation : "receives"
    MonthlySalaryCalculation ||--o{ SalaryAdjustment : "may have"
    MonthlySalaryCalculation ||--o{ SalarySlip : "generates"
    
    %% Audit
    User ||--o{ AuditLog : "creates"
    
    %% User Actions
    User ||--o{ AttendanceException : "creates/resolves"
    User ||--o{ AttendanceFreeze : "performs"
    User ||--o{ MonthlySalaryCalculation : "calculates"
    User ||--o{ SalaryAdjustment : "creates"
    
    User {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        boolean is_active
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }
    
    Role {
        uuid id PK
        string name UK
        string description
    }
    
    UserRole {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
    }
    
    LabMember {
        uuid id PK
        uuid user_id FK
        string biometric_user_id UK
        string enrollment_number UK
        string department
        int year_of_study
        date joining_date
        date exit_date
        boolean is_active
        float casual_leave_balance
        int leave_balance_year
    }
    
    PaymentBand {
        uuid id PK
        string name UK
        string description
        float hourly_rate
        float monthly_base_salary
        datetime effective_from
        datetime effective_to
        boolean is_active
    }
    
    LabMemberPaymentBand {
        uuid id PK
        uuid lab_member_id FK
        uuid payment_band_id FK
        datetime assigned_from
        datetime assigned_to
    }
    
    BiometricLog {
        uuid id PK
        string device_id
        string biometric_user_id
        datetime timestamp
        string event_type
        json raw_data
        datetime server_received_at
    }
    
    AttendanceRecord {
        uuid id PK
        uuid lab_member_id FK
        date date
        enum status
        enum source
        float hours_worked
        datetime first_in
        datetime last_out
        string manual_reason
        boolean is_frozen
        datetime frozen_at
    }
    
    AttendanceException {
        uuid id PK
        uuid attendance_record_id FK
        uuid lab_member_id FK
        date date
        enum exception_type
        string description
        enum status
        string resolution_note
        datetime resolved_at
        uuid resolved_by_id FK
    }
    
    LeaveRequest {
        uuid id PK
        uuid lab_member_id FK
        enum leave_type
        date start_date
        date end_date
        enum duration
        enum half_day_period
        string reason
        enum status
        uuid approved_by_id FK
        datetime approved_at
        string rejection_reason
        float units_consumed
    }
    
    Holiday {
        uuid id PK
        string name
        date date
        enum holiday_type
        string description
    }
    
    AttendanceFreeze {
        uuid id PK
        uuid lab_member_id FK
        int year
        int month
        datetime freeze_date
        uuid frozen_by_id FK
    }
    
    MonthlySalaryCalculation {
        uuid id PK
        uuid lab_member_id FK
        int year
        int month
        float total_days_worked
        float total_hours_worked
        float gross_salary
        json breakdown
        datetime calculated_at
        uuid calculated_by_id FK
    }
    
    SalaryAdjustment {
        uuid id PK
        uuid salary_calculation_id FK
        uuid lab_member_id FK
        enum adjustment_type
        float amount
        string reason
        uuid created_by_id FK
    }
    
    SalarySlip {
        uuid id PK
        uuid salary_calculation_id FK
        uuid lab_member_id FK
        string file_path
        enum format
        int file_size_bytes
        datetime generated_at
    }
    
    AuditLog {
        uuid id PK
        uuid actor_user_id FK
        string actor_type
        string action_type
        string entity_type
        string entity_id
        json before_value
        json after_value
        string ip_address
        string user_agent
        datetime created_at
    }
    
    SystemSetting {
        uuid id PK
        string key UK
        string value
        string data_type
        string description
        datetime effective_from
        datetime effective_to
    }
```

## Critical Relationships Explained

### 1. User → Lab Member (0..1)
- A User may or may not be a Lab Member
- All Lab Members must have a User account
- Admins are Users but not Lab Members

### 2. Lab Member → Biometric Logs (via biometric_user_id)
- No direct FK relationship (biometric logs are raw, unmapped initially)
- Mapping happens via `biometric_user_id` field
- Allows for delayed/manual mapping of biometric identifiers

### 3. Attendance Record ← Biometric Logs (implicit)
- Attendance is DERIVED from biometric logs
- No direct FK to preserve biometric log immutability
- Derivation engine queries biometric logs by date range

### 4. Attendance Record ↔ Leave Request (override)
- Approved leave OVERRIDES biometric-derived attendance
- Source changes to LEAVE_OVERRIDE
- Original biometric data remains untouched

### 5. Attendance Record ↔ Attendance Exception (1:1)
- If attendance derivation fails, exception is created
- Blocks freeze until resolved
- Resolution updates attendance record with MANUAL source

### 6. Attendance Freeze → Salary Calculation (enables)
- Freeze creates immutability boundary
- Salary calculation requires freeze to exist
- Both are immutable after creation

### 7. Audit Log → All Entities (tracks)
- No FK constraints (to prevent cascade issues)
- Stores entity_type and entity_id as strings
- Supports historical queries even if entity is deleted

## Data Flow Diagram

```
┌─────────────────┐
│ Biometric Device│
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ BiometricLog (raw)  │ ◄─── APPEND-ONLY, NEVER UPDATED
└────────┬────────────┘
         │
         │ [Derivation Engine runs daily]
         │
         ▼
┌─────────────────────────────┐
│ AttendanceRecord (derived)  │
│ source: BIOMETRIC           │
│ status: FULL_DAY / HALF_DAY │
│         LOP / PENDING_EXC   │
└────────┬────────────────────┘
         │
         ├──────► [Exception detected?] ──► AttendanceException (PENDING)
         │                                          │
         │                                          │ [Admin resolves]
         │                                          │
         │        ◄─────────────────────────────────┘
         │        AttendanceRecord updated
         │        source: MANUAL, manual_reason required
         │
         ├──────► [Leave approved?] ──────────────► LeaveRequest (APPROVED)
         │                                                 │
         │        ◄────────────────────────────────────────┘
         │        AttendanceRecord updated
         │        source: LEAVE_OVERRIDE
         │        status: CASUAL_LEAVE_FULL/HALF
         │
         ▼
    [End of month]
         │
         ▼
┌─────────────────────┐
│ Freeze Check        │ ◄─── Blocks if any PENDING_EXCEPTION exists
└────────┬────────────┘
         │
         │ [All exceptions resolved]
         │
         ▼
┌─────────────────────┐
│ AttendanceFreeze    │ ◄─── IMMUTABLE, one per member per month
└────────┬────────────┘
         │
         │ [Freeze exists]
         │
         ▼
┌──────────────────────────────┐
│ MonthlySalaryCalculation     │ ◄─── DERIVED, IMMUTABLE
│ - Reads frozen attendance    │
│ - Applies payment band       │
│ - Stores breakdown (JSONB)   │
└────────┬─────────────────────┘
         │
         ├──────► SalaryAdjustment (optional, audited)
         │
         ▼
┌─────────────────────┐
│ SalarySlip          │ ◄─── Generated (PDF/XLSX/CSV)
│ (PDF/XLSX/CSV)      │
└─────────────────────┘
         │
         ▼
    [Lab member downloads]
```

## Append-Only Tables (CRITICAL)

These tables MUST NEVER be updated or deleted:
1. `BiometricLog` - Raw device data
2. `AuditLog` - Audit trail
3. `AttendanceFreeze` - Freeze boundary (after creation)
4. `MonthlySalaryCalculation` - Calculated salary (after creation)
5. `SalarySlip` - Generated slips

## Immutability Enforcement

### Database Level
- Use CHECK constraints for status transitions
- Use triggers to prevent updates on frozen attendance
- Use row-level security (RLS) if needed

### Application Level
- DAO layer prevents update/delete on append-only tables
- Service layer enforces freeze checks before mutations
- Transaction boundaries ensure atomicity

## Indexing Strategy

### High-Volume Tables
- `biometric_logs`: 300+ members × 4 scans/day × 365 days = ~438K records/year
  - Index: (biometric_user_id, timestamp)
  - Index: (server_received_at)

- `attendance_records`: 300+ members × 365 days = ~109K records/year
  - Index: (lab_member_id, date) [UNIQUE]
  - Index: (is_frozen, date)

- `audit_logs`: High volume, time-series queries
  - Index: (created_at DESC)
  - Index: (entity_type, entity_id)
  - Index: (actor_user_id, created_at)

### Performance Considerations
- Partition `biometric_logs` by month/year (future optimization)
- Partition `audit_logs` by month (for compliance retention)
- Archive old salary slips to cold storage after 3+ years
