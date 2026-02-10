# Slice 3: Employee Core Module Implementation

> **Objective:** Implement the core Employee management module compliant with TT06/2023/TT-BNV, including Profile CRUD, Lifecycle management, and Relationship tracking.

## 1. Database Schema (Prisma)

### 1.1. Enums

```prisma
enum Gender {
  MALE
  FEMALE
}

enum EmployeeStatus {
  WORKING
  ON_LEAVE
  LONG_LEAVE
  RESIGNED
  RETIRED
}

enum SalaryType {
  NGACH_BAC
  VI_TRI_VIEC_LAM
}
```

### 1.2. Employee Model

```prisma
model Employee {
  id                    String    @id @default(uuid())
  // Link to System User (1-1)
  userId                String?   @unique
  user                  User?     @relation(fields: [userId], references: [id])

  // Identification
  employeeCode          String    @unique // Mã viên chức
  citizenId             String    @unique // CCCD
  fullName              String
  aliasName             String?
  gender                Gender
  dob                   DateTime

  // Contact & Location (JSONB for flexibility)
  placeOfBirth          Json?     // { provinceCode, districtCode, wardCode, detail }
  hometown              Json?     // { provinceCode, districtCode, wardCode, detail }
  currentAddress        Json?     // { provinceCode, districtCode, wardCode, detail }
  phone                 String?
  email                 String?   @unique // Official email

  // Organization Link
  unitId                String
  unit                  Unit      @relation(fields: [unitId], references: [id])

  // Professional Info
  positionId            String?   // Chức vụ hiện tại (link to latest position record)
  // ... relationships to Position history via unrelated table if needed, or computed

  // Dates
  initialRecruitmentDate DateTime? // Ngày tuyển dụng lần đầu
  currentOrgJoinDate     DateTime? // Ngày về cơ quan hiện tại
  officialDate           DateTime? // Ngày vào biên chế chính thức

  // Party & Union
  partyJoinDate          DateTime?
  partyOfficialDate      DateTime?

  // Social Insurance
  socialInsuranceNo      String?
  healthInsuranceNo      String?

  // Status
  status                 EmployeeStatus @default(WORKING)

  // Relations
  relationships          EmployeeRelationship[]
  contracts              Contract[]
  degrees                Degree[]
  certificates           Certificate[]
  salaryRecords          SalaryRecord[]
  leaveRequests          LeaveRequest[]

  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt

  @@index([unitId])
  @@index([fullName])
  @@index([status])
  @@map("employees")
}
```

### 1.3. EmployeeRelationship Model

```prisma
model EmployeeRelationship {
  id           String   @id @default(uuid())
  employeeId   String
  employee     Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  fullName     String
  relationship String   // Vợ, Chồng, Con, Cha, Mẹ...
  dob          DateTime?
  job          String?
  isDependent  Boolean  @default(false)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("employee_relationships")
}
```

## 2. API Endpoints (EmployeesModule)

| Method   | Endpoint                       | Description                                       | Permissions                            |
| :------- | :----------------------------- | :------------------------------------------------ | :------------------------------------- |
| `GET`    | `/employees`                   | List employees (filter by unit, search name/code) | `employees:read`                       |
| `GET`    | `/employees/:id`               | Get employee detail (with relations option)       | `employees:read` (or `own/unit` scope) |
| `POST`   | `/employees`                   | Create new employee (Auto-create User optional)   | `employees:write`                      |
| `PATCH`  | `/employees/:id`               | Update employee profile                           | `employees:write`                      |
| `PATCH`  | `/employees/:id/status`        | Update lifecycle status (Resign/Retire)           | `employees:write`                      |
| `GET`    | `/employees/:id/relationships` | Get family relationships                          | `employees:read`                       |
| `POST`   | `/employees/:id/relationships` | Add relationship                                  | `employees:write`                      |
| `DELETE` | `/employees/:id`               | Soft delete (set status RESIGNED/ARCHIVED)        | `employees:delete`                     |

## 3. Implementation Steps

### Backend

1.  **Prisma Schema:** Update `schema.prisma` with `Employee` and `EmployeeRelationship`.
2.  **Migration:** Run `prisma migrate dev --name add_employees`.
3.  **Module Setup:** Generate `EmployeesModule`, `EmployeesService`, `EmployeesController`.
4.  **CRUD Logic:** Implement `create`, `findAll` (with pagination & filter), `findOne`, `update`.
5.  **User Linking:** Implement logic to auto-create `User` account when `Employee` is created (or manual link).

### Frontend

1.  **Types:** Generate TypeScript interfaces from Backend DTOs.
2.  **Service:** Create `services/employees.service.ts`.
3.  **List Page:** `app/(dashboard)/employees/page.tsx` using `DataTable` + `Filter`.
4.  **Create Modal:** `UnitFormModal` equivalent -> `EmployeeFormModal`.
5.  **Detail Page:** `app/(dashboard)/employees/[id]/page.tsx` with Tabs (Info, Relationships, Contracts, etc.).

## 4. Key Considerations

- **RBAC Scope:** `employees:read` needs to check `user.unitId` if role is MANAGER.
- **Date Handling:** Ensure strict ISO-8601 for dates (DOB, join dates).
- **Unit Tree:** Filtering by unit should include _sub-units_ (using `path` query from Slice 2).
