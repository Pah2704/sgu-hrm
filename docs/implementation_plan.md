# SGU-HRM Technical Architecture & Implementation Plan

> **Version:** 1.0 | **Date:** 09/02/2026 | **Author:** Tech Lead/Architect

---

## A. Project Plan

### A.1. System Overview

Hệ thống **HRM Trường Đại học Sài Gòn** là giải pháp số hóa toàn diện quy trình quản lý nhân sự theo chuẩn Thông tư 06/2023/TT-BNV. Hệ thống gồm 2 ứng dụng chính:

1. **HRM App (Internal):** Dành cho Phòng TCCB và lãnh đạo đơn vị - quản lý hồ sơ, hợp đồng, lương, tuyển dụng
2. **CMS Portal (Public):** Cổng thông tin điện tử công bố văn bản, tin tức, tuyển dụng

**Actors chính:**
| Actor | Trách nhiệm chính |
|-------|-------------------|
| HR Admin | Toàn quyền nghiệp vụ: CRUD hồ sơ, lương, hợp đồng, xuất báo cáo |
| Content Admin | Quản lý nội dung CMS: tin tức, văn bản, biểu mẫu |
| Manager | Duyệt đơn nghỉ phép, đánh giá nhân sự đơn vị |
| Employee | Self-service: xem hồ sơ, nộp đơn, upload văn bằng |
| Guest | Xem tin tuyển dụng, nộp hồ sơ ứng viên |

---

### A.2. Development Phases

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 (MVP - 8-10 weeks)                                              │
│ Core HR + Auth + RBAC + Organizations + Contracts + Recruitment + CMS   │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 2 (Enhancement - 6-8 weeks)                                       │
│ Reviews + Rewards/Discipline + Salary Auto-Scan + Advanced Reports      │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 3 (Portal Enhancement - 4-6 weeks)                                │
│ Employee Portal + Self-service + Mobile Responsive + Notifications      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### A.3. Phase 1 Backlog

| #   | Feature/Module             | Mô tả                                       | Priority | Type            |
| --- | -------------------------- | ------------------------------------------- | -------- | --------------- |
| 1   | **Auth Module**            | JWT login, refresh token, password reset    | High     | Backend         |
| 2   | **RBAC System**            | Roles, Permissions, Guards, Decorators      | High     | Backend         |
| 3   | **User Management**        | CRUD users, link to Employee                | High     | Backend + FE    |
| 4   | **Organization Tree**      | Unit hierarchy, tree view, history          | High     | Backend + FE    |
| 5   | **Employee Core**          | Hồ sơ nhân sự theo TT06, lifecycle          | High     | Backend + FE    |
| 6   | **Employee Relationships** | Quan hệ gia đình, phụ thuộc                 | Medium   | Backend + FE    |
| 7   | **Contract Management**    | HĐLĐ/HĐLV, phụ lục, export .docx            | High     | Backend + FE    |
| 8   | **Contract Alerts**        | Cảnh báo hết hạn 30/60/90 ngày              | Medium   | Backend (Job)   |
| 9   | **Recruitment Campaign**   | Tạo đợt tuyển dụng, đăng tin                | High     | Backend + FE    |
| 10  | **Candidate Portal**       | Form ứng tuyển public                       | High     | Frontend        |
| 11  | **Candidate→Employee**     | Convert flow + auto create account          | High     | Backend         |
| 12  | **Education/Degrees**      | Quản lý văn bằng, chứng chỉ                 | Medium   | Backend + FE    |
| 13  | **Highest Degree Compute** | Auto update từ Degrees                      | Medium   | Backend         |
| 14  | **Leave Types**            | Danh mục loại nghỉ phép                     | Medium   | Backend         |
| 15  | **Leave Requests**         | Tạo/duyệt đơn nghỉ phép                     | Medium   | Backend + FE    |
| 16  | **Salary Basic**           | Hồ sơ lương, ngạch bậc, expected_raise_date | High     | Backend + FE    |
| 17  | **CMS Posts**              | Tin tức, thông báo (CKEditor)               | Medium   | Backend + FE    |
| 18  | **CMS Documents**          | Văn bản, biểu mẫu public                    | Medium   | Backend + FE    |
| 19  | **File Upload**            | MinIO integration, avatar, attachments      | High     | Infra + Backend |
| 20  | **Export Service**         | BullMQ job export Excel/Docx                | Medium   | Backend         |

---

## B. Architecture Overview

### B.1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGINX (Reverse Proxy)                          │
│                          (SSL Termination, Routing)                         │
└─────────────────────┬──────────────────────┬────────────────────────────────┘
                      │                      │
         ┌────────────▼────────────┐  ┌──────▼──────────────┐
         │   Next.js HRM App       │  │  Next.js CMS Portal │
         │   (Internal Users)      │  │  (Public/Guest)     │
         │   - Tailwind + ShadcnUI │  │  - Tailwind + AntD  │
         │   - Auth Protected      │  │  - SEO Optimized    │
         └────────────┬────────────┘  └──────┬──────────────┘
                      │                      │
                      └──────────┬───────────┘
                                 │ HTTP/REST
                      ┌──────────▼───────────┐
                      │   NestJS API Server  │
                      │   (Modular Monolith) │
                      │   Port: 3001         │
                      └──────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼───────┐    ┌───────────▼───────────┐   ┌───────▼───────┐
│  PostgreSQL   │    │        Redis          │   │    MinIO      │
│  (Primary DB) │    │  (Cache + BullMQ)     │   │ (File Storage)│
│  Port: 5432   │    │  Port: 6379           │   │  Port: 9000   │
└───────────────┘    └───────────┬───────────┘   └───────────────┘
                                 │
                      ┌──────────▼───────────┐
                      │   BullMQ Workers     │
                      │   - Export Jobs      │
                      │   - Email Jobs       │
                      │   - Salary Scan      │
                      └──────────────────────┘
```

### B.2. Backend Module Structure

```
src/
├── app.module.ts                 # Root module
├── common/                       # Shared utilities
│   ├── guards/                   # Auth, RBAC guards
│   ├── decorators/               # @CurrentUser, @Roles, @Permissions
│   ├── filters/                  # Exception filters
│   ├── interceptors/             # Response transform
│   └── constants/                # Enums, constants
│
├── modules/
│   ├── auth/                     # 🔐 CORE - JWT, Login, Session
│   ├── users/                    # 🔐 CORE - User accounts
│   ├── rbac/                     # 🔐 CORE - Roles, Permissions
│   │
│   ├── organizations/            # 🏢 Unit tree, hierarchy
│   ├── employees/                # 👤 Core HR profiles
│   ├── relationships/            # 👥 Family relationships
│   │
│   ├── contracts/                # 📄 HĐLĐ, appendix
│   ├── recruitment/              # 📢 Campaigns, candidates
│   │
│   ├── education/                # 🎓 Degrees, certificates
│   ├── positions/                # 💼 Appointments, history
│   │
│   ├── leaves/                   # 🏖️ Leave requests
│   ├── salary/                   # 💰 Salary records
│   │
│   ├── reviews/                  # ⭐ Evaluations (Phase 2)
│   ├── rewards/                  # 🏆 Rewards/Discipline (Phase 2)
│   │
│   ├── party/                    # 🚩 Party cells (Chi bộ)
│   ├── unions/                   # 🤝 Unions (Công đoàn)
│   │
│   ├── cms/                      # 📰 Posts, Documents
│   ├── files/                    # 📁 MinIO upload
│   └── jobs/                     # ⚙️ BullMQ processors
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### B.3. Module Dependencies

| Module            | Depends On                      | Responsibility                              |
| ----------------- | ------------------------------- | ------------------------------------------- |
| **auth**          | users                           | JWT authentication, login/logout            |
| **users**         | rbac                            | User accounts, password management          |
| **rbac**          | -                               | Roles, permissions, access control policies |
| **organizations** | -                               | Unit tree, hierarchy management             |
| **employees**     | users, organizations, education | Core HR profile, lifecycle                  |
| **relationships** | employees                       | Family relationships per employee           |
| **contracts**     | employees, files                | Contract CRUD, export, alerts               |
| **recruitment**   | employees, users, files         | Campaign, candidates, conversion            |
| **education**     | employees, files                | Degrees, certificates, approval             |
| **positions**     | employees, organizations        | Appointment history                         |
| **leaves**        | employees, organizations        | Leave requests, approval flow               |
| **salary**        | employees, leaves, rewards      | Salary records, raise calculation           |
| **reviews**       | employees, organizations        | Periodic evaluations                        |
| **rewards**       | employees, files                | Rewards/Discipline records                  |
| **party**         | employees                       | Party cell membership                       |
| **unions**        | employees                       | Union membership                            |
| **cms**           | files, users                    | Posts, documents, banners                   |
| **files**         | -                               | MinIO upload/download                       |
| **jobs**          | contracts, salary, files        | Background processing                       |

### B.4. RBAC Strategy

**Roles Hierarchy:**

```
Super Admin (IT/Dev)
    └── HR Admin (Phòng TCCB)
         ├── Content Admin (Ban biên tập)
         ├── Manager (Trưởng đơn vị)
         │    └── Party Secretary (Bí thư chi bộ)
         └── Employee (Nhân sự)
              └── Guest (Public)
```

**Permission Format:** `module:action` hoặc `module:action_scope`

> **Quy tắc đặt tên:**
>
> - Dùng `:` để ngăn cách module và action
> - Dùng `_` để ngăn cách action và scope (không dùng thêm `:`)
> - CRUD permissions tách biệt với Job/System permissions

```typescript
// src/common/constants/permissions.ts

// ═══════════════════════════════════════════════════════════════════
// CRUD PERMISSIONS (Data operations)
// ═══════════════════════════════════════════════════════════════════

// Employees
"employees:read"; // Read any employee (HR Admin)
"employees:read_own"; // Read own profile only (Employee)
"employees:read_unit"; // Read employees in own unit (Manager)
"employees:write"; // Create/Update employees (HR Admin)
"employees:delete"; // Soft delete employees (HR Admin)
"employees:export"; // Export employee list (HR Admin)

// Contracts
"contracts:read"; // Read contracts
"contracts:write"; // Create/Update contracts
"contracts:export"; // Export contract .docx

// Salary
"salary:read"; // Read salary records (HR Admin, Manager for reports)
"salary:read_own"; // Read own salary (Employee)
"salary:write"; // Create/Update salary records (HR Admin)

// Leaves
"leaves:read"; // Read all leave requests (HR Admin)
"leaves:read_unit"; // Read unit leave requests (Manager)
"leaves:read_own"; // Read own leave requests (Employee)
"leaves:write"; // Submit leave request (Employee)
"leaves:approve"; // Approve leave requests (Manager, HR Admin)

// Recruitment
"recruitment:read"; // View campaigns and candidates
"recruitment:write"; // Create/manage campaigns
"recruitment:convert"; // Convert candidate to employee

// Education
"education:read"; // View degrees/certificates
"education:write"; // Add degrees (Employee self-upload)
"education:approve"; // Approve degrees (HR Admin)

// ═══════════════════════════════════════════════════════════════════
// CMS PERMISSIONS (Content management)
// ═══════════════════════════════════════════════════════════════════

"cms:posts_manage"; // CRUD posts (Content Admin)
"cms:posts_publish"; // Publish/unpublish posts (HR Admin, Content Admin cấp cao)
"cms:documents_manage"; // CRUD documents (Content Admin)
"cms:categories_manage"; // Manage categories (Content Admin)

// ═══════════════════════════════════════════════════════════════════
// JOB/SYSTEM PERMISSIONS (Background operations - Super Admin/HR Admin only)
// ═══════════════════════════════════════════════════════════════════

"jobs:salary_scan"; // Run salary auto-scan cronjob
"jobs:contract_alert"; // Trigger contract expiry alerts
"jobs:export_bulk"; // Run bulk export jobs
"system:users_manage"; // Manage user accounts
"system:roles_manage"; // Manage roles and permissions
```

**Permission Matrix by Role:**

| Permission            | Super Admin | HR Admin | Content Admin | Manager | Employee |
| --------------------- | :---------: | :------: | :-----------: | :-----: | :------: |
| `employees:read`      |      ✓      |    ✓     |               |         |          |
| `employees:read_unit` |      ✓      |    ✓     |               |    ✓    |          |
| `employees:read_own`  |      ✓      |    ✓     |               |    ✓    |    ✓     |
| `employees:write`     |      ✓      |    ✓     |               |         |          |
| `salary:read`         |      ✓      |    ✓     |               |   ✓\*   |          |
| `salary:read_own`     |      ✓      |    ✓     |               |    ✓    |    ✓     |
| `leaves:approve`      |      ✓      |    ✓     |               |    ✓    |          |
| `cms:posts_manage`    |      ✓      |    ✓     |       ✓       |         |          |
| `cms:posts_publish`   |      ✓      |    ✓     |               |         |          |
| `jobs:salary_scan`    |      ✓      |    ✓     |               |         |          |
| `system:roles_manage` |      ✓      |          |               |         |          |

\*Manager: chỉ xem report tổng hợp, không xem chi tiết lương từng người

**Implementation Pattern:**

```typescript
// Guard + Decorator approach
@Controller("employees")
@UseGuards(JwtAuthGuard, RbacGuard)
export class EmployeesController {
  @Get()
  @RequirePermissions("employees:read")
  findAll() {}

  @Get(":id")
  @RequirePermissions(
    "employees:read_own",
    "employees:read_unit",
    "employees:read",
  )
  findOne(@Param("id") id: string, @CurrentUser() user: User) {}

  @Post()
  @RequirePermissions("employees:write")
  @Roles("HR_ADMIN", "SUPER_ADMIN")
  create(@Body() dto: CreateEmployeeDto) {}
}

// CMS Controller with granular permissions
@Controller("cms/posts")
@UseGuards(JwtAuthGuard, RbacGuard)
export class CmsPostsController {
  @Post()
  @RequirePermissions("cms:posts_manage")
  create(@Body() dto: CreatePostDto) {}

  @Patch(":id/publish")
  @RequirePermissions("cms:posts_publish")
  publish(@Param("id") id: string) {}
}

// Job trigger endpoint (admin only)
@Controller("admin/jobs")
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles("SUPER_ADMIN", "HR_ADMIN")
export class AdminJobsController {
  @Post("salary-scan")
  @RequirePermissions("jobs:salary_scan")
  triggerSalaryScan() {}
}
```

---

## C. Database Design (Logical)

### C.1. Entity Overview

| Entity                   | Role                | Key Relations                          |
| ------------------------ | ------------------- | -------------------------------------- |
| **User**                 | System account      | 1-1 Employee, n-n Roles                |
| **Role**                 | RBAC role           | n-n Users, n-n Permissions             |
| **Permission**           | Granular permission | n-n Roles                              |
| **Unit**                 | Organization unit   | Self-ref (tree), 1-n Employees         |
| **Employee**             | Core HR profile     | 1-1 User, n-1 Unit, 1-n Relationships  |
| **EmployeeRelationship** | Family members      | n-1 Employee                           |
| **Contract**             | Employment contract | n-1 Employee, 1-n ContractAppendix     |
| **ContractAppendix**     | Contract amendment  | n-1 Contract                           |
| **RecruitmentCampaign**  | Hiring campaign     | 1-n Candidates, 1-n Positions          |
| **Candidate**            | Job applicant       | n-1 Campaign, 0-1 Employee (converted) |
| **Degree**               | Academic degree     | n-1 Employee                           |
| **Certificate**          | Professional cert   | n-1 Employee                           |
| **Position**             | Job position master | 1-n EmployeePositions                  |
| **EmployeePosition**     | Position assignment | n-1 Employee, n-1 Position             |
| **LeaveType**            | Leave category      | 1-n LeaveRequests                      |
| **LeaveRequest**         | Leave application   | n-1 Employee, n-1 LeaveType            |
| **SalaryRecord**         | Salary history      | n-1 Employee, n-1 CivilServantRank     |
| **CivilServantRank**     | Salary grade master | 1-n SalaryRecords                      |
| **Review**               | Performance eval    | n-1 Employee (Phase 2)                 |
| **RewardDiscipline**     | Reward/Penalty      | n-1 Employee (Phase 2)                 |
| **PartyCell**            | Party organization  | 1-n Members                            |
| **Union**                | Union organization  | 1-n Members                            |
| **Post**                 | CMS article         | n-1 Author, n-n Categories             |
| **Document**             | CMS document        | n-1 Category                           |
| **Category**             | Content category    | 1-n Posts, 1-n Documents               |

### C.2. Key Entity Details

#### User & Employee (1-1 Relationship)

```
User                          Employee
├── id (UUID)                 ├── id (UUID)
├── email (unique)            ├── userId (FK, unique) ─────────┐
├── passwordHash              ├── employeeCode (unique)        │
├── isActive                  ├── citizenId (unique)           │
├── lastLoginAt               ├── fullName                     │
└── roles[] ──┐               ├── unitId (FK) ─────────────────┤
              │               ├── ...profile fields...         │
              └───────────────┴────────────────────────────────┘
```

> **Note:** Tách User và Employee vì:
>
> - Guest/Candidate có User nhưng chưa có Employee
> - Employee có thể soft-delete mà User vẫn tồn tại (audit)

#### Organization Tree (Self-referencing)

```
Unit
├── id (UUID)
├── name
├── code (unique)
├── parentId (FK → Unit) ─── Self-reference for tree
├── unitType (ENUM: TRUONG, KHOA, PHONG, BAN, TRUNG_TAM, TO_BO_MON)
├── status (ENUM: ACTIVE, INACTIVE, MERGED)
├── path (LTREE) ─── Materialized path for fast queries
└── level (INT) ─── Depth in tree
```

#### Employee Profile (Core Fields)

```
Employee
├── id, userId, employeeCode, citizenId
├── avatarUrl
├── fullName, aliasName, dob, gender
├── placeOfBirth (JSONB) ─────────┐
├── hometown (JSONB) ─────────────┤ { province, ward, detail }
├── currentAddress (JSONB) ───────┘
├── ethnicityId, religionId (FK → master tables)
├── citizenCardDate, citizenCardPlace
├── phone, socialInsuranceNo, healthInsuranceNo
├── familyBackground, jobBeforeRecruitment
├── initialRecruitmentDate, initialRecruitmentAgency
├── currentOrgJoinDate
├── partyJoinDate, partyOfficialDate
├── generalEducation, academicRank, academicRankYear
├── stateTitles, currentPosition, appointDate
├── highestDegree (computed from Degrees)
├── historicalFeatures (JSONB) ─── Flexible structured data
├── healthStatus, height, weight, bloodType
├── salaryType (ENUM), ...salary fields...
├── status (ENUM: WORKING, ON_LEAVE, RESIGNED, RETIRED)
└── timestamps
```

> **JSONB vs Table Decision:**
>
> - **JSONB:** placeOfBirth, hometown, currentAddress, historicalFeatures, assets (ít query, flexible)
> - **Table:** Relationships, Degrees, Certificates, Positions, Contracts (cần query, join, report)

#### Contract & Appendix

```
Contract                      ContractAppendix
├── id                        ├── id
├── employeeId (FK)           ├── contractId (FK)
├── contractNumber            ├── appendixNumber
├── contractType (ENUM)       ├── content (JSONB)
├── startDate, endDate        ├── effectiveDate
├── signedDate                ├── signedFileUrl
├── status (ENUM)             └── createdAt
├── originalFileUrl
├── signedFileUrl
└── alertSent (JSONB)
```

#### Salary Record

```
SalaryRecord
├── id
├── employeeId (FK)
├── civilServantRankId (FK)
├── salaryLevel (bậc)
├── coefficient (hệ số)
├── currentLevelDate (ngày hưởng bậc hiện tại)
├── expectedRaiseDate (ngày dự kiến nâng lương) ─── CRITICAL FIELD
├── percentEnjoy
├── seniorityAllowance
├── positionAllowance, concurrentAllowance, otherAllowance
├── warningFlag (blocked by discipline/leave)
├── warningReason
└── effectiveFrom, effectiveTo (history tracking)
```

### C.3. Enum Definitions

```typescript
// src/common/constants/enums.ts

export enum Gender {
  MALE = "Nam",
  FEMALE = "Nữ",
}

export enum UnitType {
  TRUONG,
  KHOA,
  PHONG,
  BAN,
  TRUNG_TAM,
  TO_BO_MON,
}

export enum EmployeeStatus {
  WORKING,
  ON_LEAVE,
  LONG_LEAVE,
  RESIGNED,
  RETIRED,
}

export enum ContractType {
  HDLD_XAC_DINH, // Xác định thời hạn
  HDLD_KHONG_XAC_DINH, // Không xác định thời hạn
  HDLV, // Hợp đồng làm việc
  THU_VIEC, // Thử việc
}

export enum ContractStatus {
  DRAFT,
  ACTIVE,
  EXPIRED,
  TERMINATED,
}

export enum SalaryType {
  NGACH_BAC,
  VI_TRI_VIEC_LAM,
}

export enum RankGroup {
  A0,
  A1,
  A2,
  A3,
  B,
  C,
}

export enum LeaveCategory {
  PAID_SCHOOL, // Hưởng lương trường
  PAID_BHXH, // Hưởng BHXH
  UNPAID, // Không lương
}

export enum ApprovalStatus {
  PENDING,
  APPROVED,
  REJECTED,
}

export enum CandidateStatus {
  APPLIED,
  REVIEWING,
  INTERVIEWED,
  ACCEPTED,
  REJECTED,
  CONVERTED,
}

export enum PostStatus {
  DRAFT,
  PUBLISHED,
  ARCHIVED,
}
```

---

## D. Technical Design - Phase 1

### D.1. Vertical Slices

| Slice | Name                     | Scope                                      | Duration |
| ----- | ------------------------ | ------------------------------------------ | -------- |
| 0     | **Infrastructure Setup** | Docker, DB, Redis, MinIO, project scaffold | 2 days   |
| 1     | **Auth + RBAC**          | Login, JWT, roles, permissions, guards     | 3 days   |
| 2     | **Organizations**        | Unit tree CRUD, tree view UI               | 2 days   |
| 3     | **Employees Core**       | Profile CRUD, lifecycle, search, list      | 5 days   |
| 4     | **Contracts**            | Contract CRUD, appendix, export .docx      | 4 days   |
| 5     | **Recruitment**          | Campaign, candidate, convert flow          | 4 days   |
| 6     | **Education**            | Degrees, certificates, highest_degree      | 2 days   |
| 7     | **Leaves**               | Leave types, requests, approval            | 3 days   |
| 8     | **Salary Basic**         | Salary records, expected_raise_date v1     | 3 days   |
| 9     | **CMS Core**             | Posts, documents, public portal            | 3 days   |
| 10    | **Integration & Polish** | E2E testing, bug fixes, deploy             | 3 days   |

**Total: ~34 days (~7 weeks)**

### D.2. Implementation Plan

| Task ID        | Slice | Module        | Technical Description                                          |
| -------------- | ----- | ------------- | -------------------------------------------------------------- |
| **INFRA-01**   | 0     | Infra         | Docker Compose: postgres, redis, minio, api, web               |
| **INFRA-02**   | 0     | Infra         | NestJS project scaffold, Prisma setup                          |
| **INFRA-03**   | 0     | Infra         | Next.js HRM app + CMS portal setup                             |
| **INFRA-04**   | 0     | Infra         | Common modules: guards, decorators, filters                    |
|                |       |               |                                                                |
| **AUTH-01**    | 1     | Auth          | `POST /auth/login` - JWT access + refresh tokens               |
| **AUTH-02**    | 1     | Auth          | `POST /auth/refresh` - Token refresh                           |
| **AUTH-03**    | 1     | Auth          | `POST /auth/logout` - Invalidate session                       |
| **AUTH-04**    | 1     | Auth          | `POST /auth/forgot-password` - Email reset link                |
| **AUTH-05**    | 1     | Users         | `GET/POST/PATCH /users` - User CRUD                            |
| **RBAC-01**    | 1     | RBAC          | Prisma schema: Role, Permission, UserRole                      |
| **RBAC-02**    | 1     | RBAC          | `RbacGuard` + `@RequirePermissions()` decorator                |
| **RBAC-03**    | 1     | RBAC          | `GET/POST /roles`, `POST /roles/:id/permissions`               |
| **RBAC-04**    | 1     | RBAC          | Seed default roles: SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE   |
| **FE-AUTH-01** | 1     | Frontend      | Login page, auth context, protected routes                     |
|                |       |               |                                                                |
| **ORG-01**     | 2     | Organizations | Prisma schema: Unit with parentId, path (ltree)                |
| **ORG-02**     | 2     | Organizations | `GET /units` - Tree structure response                         |
| **ORG-03**     | 2     | Organizations | `POST/PATCH/DELETE /units` - CRUD with path recalc             |
| **ORG-04**     | 2     | Organizations | `GET /units/:id/employees` - Employees in unit                 |
| **FE-ORG-01**  | 2     | Frontend      | Organization tree view component (collapsible)                 |
| **FE-ORG-02**  | 2     | Frontend      | Unit management page (add/edit modal)                          |
|                |       |               |                                                                |
| **EMP-01**     | 3     | Employees     | Prisma schema: Employee với full TT06 fields                   |
| **EMP-02**     | 3     | Employees     | `GET /employees` - Paginated list, search, filter by unit      |
| **EMP-03**     | 3     | Employees     | `GET /employees/:id` - Full profile with relations             |
| **EMP-04**     | 3     | Employees     | `POST /employees` - Create + auto-create User                  |
| **EMP-05**     | 3     | Employees     | `PATCH /employees/:id` - Update profile                        |
| **EMP-06**     | 3     | Employees     | `PATCH /employees/:id/status` - Lifecycle transitions          |
| **EMP-07**     | 3     | Relationships | `GET/POST/PATCH/DELETE /employees/:id/relationships`           |
| **EMP-08**     | 3     | Employees     | `GET /employees/export` - BullMQ job → Excel HS02-VC           |
| **FE-EMP-01**  | 3     | Frontend      | Employee list page (table, search, filters)                    |
| **FE-EMP-02**  | 3     | Frontend      | Employee detail page (tabs: info, family, history)             |
| **FE-EMP-03**  | 3     | Frontend      | Employee form (create/edit modal or page)                      |
|                |       |               |                                                                |
| **CTR-01**     | 4     | Contracts     | Prisma schema: Contract, ContractAppendix                      |
| **CTR-02**     | 4     | Contracts     | `GET/POST /employees/:id/contracts`                            |
| **CTR-03**     | 4     | Contracts     | `PATCH /contracts/:id` - Update, upload signed PDF             |
| **CTR-04**     | 4     | Contracts     | `POST /contracts/:id/appendices` - Add appendix                |
| **CTR-05**     | 4     | Contracts     | `GET /contracts/:id/export` - Export .docx template            |
| **CTR-06**     | 4     | Jobs          | Contract expiry alert job (30/60/90 days)                      |
| **FE-CTR-01**  | 4     | Frontend      | Contract list in employee detail                               |
| **FE-CTR-02**  | 4     | Frontend      | Contract form (create/edit), file upload                       |
|                |       |               |                                                                |
| **REC-01**     | 5     | Recruitment   | Prisma schema: RecruitmentCampaign, Candidate                  |
| **REC-02**     | 5     | Recruitment   | `GET/POST /recruitment/campaigns` - CRUD campaigns             |
| **REC-03**     | 5     | Recruitment   | `GET/POST /campaigns/:id/candidates` - Manage candidates       |
| **REC-04**     | 5     | Recruitment   | `POST /candidates/:id/convert` - Convert to Employee           |
| **REC-05**     | 5     | Recruitment   | Public: `POST /apply/:campaignId` - Submit application         |
| **FE-REC-01**  | 5     | Frontend      | Campaign management page                                       |
| **FE-REC-02**  | 5     | Frontend      | Candidate list + status pipeline                               |
| **FE-REC-03**  | 5     | CMS Portal    | Public job listing + apply form                                |
|                |       |               |                                                                |
| **EDU-01**     | 6     | Education     | Prisma schema: Degree, Certificate                             |
| **EDU-02**     | 6     | Education     | `GET/POST /employees/:id/degrees`                              |
| **EDU-03**     | 6     | Education     | `PATCH /degrees/:id/approve` - HR approval                     |
| **EDU-04**     | 6     | Education     | Trigger: Update employee.highestDegree on approve              |
| **FE-EDU-01**  | 6     | Frontend      | Education tab in employee detail                               |
|                |       |               |                                                                |
| **LV-01**      | 7     | Leaves        | Prisma schema: LeaveType, LeaveRequest                         |
| **LV-02**      | 7     | Leaves        | `GET/POST /leave-types` - Manage leave categories              |
| **LV-03**      | 7     | Leaves        | `POST /employees/:id/leave-requests` - Submit                  |
| **LV-04**      | 7     | Leaves        | `PATCH /leave-requests/:id/approve` - Approval flow            |
| **LV-05**      | 7     | Leaves        | Event: UNPAID leave → trigger salary recalc                    |
| **FE-LV-01**   | 7     | Frontend      | My leave requests (Employee)                                   |
| **FE-LV-02**   | 7     | Frontend      | Leave approval queue (Manager)                                 |
|                |       |               |                                                                |
| **SAL-01**     | 8     | Salary        | Prisma schema: CivilServantRank, SalaryRecord                  |
| **SAL-02**     | 8     | Salary        | `GET/POST /employees/:id/salary-records`                       |
| **SAL-03**     | 8     | Salary        | Logic: Calculate expectedRaiseDate based on rank group         |
| **SAL-04**     | 8     | Salary        | Service: recalcExpectedRaiseDate (discipline/leave adjustment) |
| **FE-SAL-01**  | 8     | Frontend      | Salary history tab in employee detail                          |
|                |       |               |                                                                |
| **CMS-01**     | 9     | CMS           | Prisma schema: Post, Document, Category                        |
| **CMS-02**     | 9     | CMS           | `GET/POST /cms/posts` - CRUD with CKEditor content             |
| **CMS-03**     | 9     | CMS           | `GET/POST /cms/documents` - File upload/download               |
| **CMS-04**     | 9     | CMS           | Public: `GET /public/posts`, `GET /public/documents`           |
| **FE-CMS-01**  | 9     | CMS Portal    | Homepage, news list, document list                             |
| **FE-CMS-02**  | 9     | HRM App       | CMS admin: post editor, document upload                        |
|                |       |               |                                                                |
| **FILE-01**    | Cross | Files         | MinIO service: upload, getSignedUrl, delete                    |
| **FILE-02**    | Cross | Files         | `POST /files/upload` - Multipart upload                        |
| **FILE-03**    | Cross | Files         | Avatar upload integration                                      |

---

## E. Solo Dev Workflow

### E.1. Coding Guidelines

**Naming Conventions:**

```
Module:     employees/          (plural, lowercase)
Service:    employees.service.ts
Controller: employees.controller.ts
DTO:        dto/create-employee.dto.ts
Entity:     (Prisma model name: Employee)
```

**Folder Structure:**

```
src/modules/employees/
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
├── dto/
│   ├── create-employee.dto.ts
│   ├── update-employee.dto.ts
│   └── employee-query.dto.ts
├── entities/               # (Optional: response types)
└── tests/
    ├── employees.service.spec.ts
    └── employees.controller.spec.ts
```

**Enum/Constants:**

```
src/common/constants/
├── enums.ts              # All enums
├── permissions.ts        # Permission constants
└── messages.ts           # Error/success messages
```

### E.2. Test Strategy

**Must-have Unit Tests:**
| Function | Reason |
|----------|--------|
| `SalaryService.calculateExpectedRaiseDate()` | Core business logic, complex rules |
| `SalaryService.recalcForDiscipline()` | +3/6/12 months logic |
| `SalaryService.recalcForUnpaidLeave()` | Subtract days logic |
| `CandidateService.convertToEmployee()` | Critical flow, auto-create user |
| `EducationService.updateHighestDegree()` | Computed field update |
| `ContractService.checkExpiryAlerts()` | Alert trigger logic |

**Integration Tests:**

- Auth flow: login → access protected route → refresh → logout
- Employee lifecycle: create → update → resign
- Candidate conversion: apply → accept → convert → verify employee created

### E.3. Vibe Coding Workflow

**Daily Rhythm:**

```
Morning (2-3h):  1 vertical slice - Backend (API + Service + Prisma)
Afternoon (2h):  Same slice - Frontend (Pages + Components)
Evening (1h):    Review, test, commit
```

**AI Pair-Programming Prompts:**

```markdown
# Generate CRUD Controller

Dựa trên Prisma model `Contract` và DTO patterns trong dự án,
generate ContractsController với:

- GET /employees/:employeeId/contracts (list)
- POST /employees/:employeeId/contracts (create)
- PATCH /contracts/:id (update)
- DELETE /contracts/:id (soft delete)
  Sử dụng guards: JwtAuthGuard, RbacGuard
  Required permissions: contracts:read, contracts:write
```

```markdown
# Generate Service with Business Logic

Tạo SalaryService.calculateExpectedRaiseDate() với logic:

- Input: currentLevelDate, rankGroup (A0-A3 hoặc B/C)
- A0-A3: +36 tháng
- B/C: +24 tháng
- Return: Date
  Viết kèm unit test với các cases: A1, B, C ranks
```

```markdown
# Generate React Component

Tạo EmployeeList component với:

- Fetch từ GET /employees với pagination
- Search by name, employee code
- Filter by unit (tree select)
- Table columns: avatar, code, name, unit, position, status
- Actions: view detail, edit
- Sử dụng ShadcnUI DataTable
```

**Commit Convention:**

```
feat(employees): add employee CRUD endpoints
fix(salary): correct expected raise date calculation
chore(prisma): add Contract and Appendix models
docs(api): update Swagger for recruitment module
```

**Git Flow:**

```
main ─────────────────────────────────────────►
       │
       └── develop ──────────────────────────►
              │
              ├── feature/auth-rbac ──────►
              │
              ├── feature/employees ──────►
              │
              └── feature/contracts ──────►
```

---

## Summary Checklist

- [ ] **Slice 0:** Infra ready (Docker, DB, scaffold)
- [ ] **Slice 1:** Can login, roles assigned, guards working
- [ ] **Slice 2:** Unit tree displays, CRUD works
- [ ] **Slice 3:** Employee CRUD, search, export
- [ ] **Slice 4:** Contracts CRUD, export .docx, alerts job
- [ ] **Slice 5:** Recruitment flow, candidate conversion
- [ ] **Slice 6:** Degrees/Certs with approval
- [ ] **Slice 7:** Leave requests with approval
- [ ] **Slice 8:** Salary records, expectedRaiseDate v1
- [ ] **Slice 9:** CMS posts, documents, public portal
- [ ] **Slice 10:** E2E test, deploy to staging
