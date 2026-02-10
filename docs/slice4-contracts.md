# Slice 4: Labor Contracts & Decisions

## Overview

This slice implements the management of **Labor Contracts** (Hợp đồng lao động) and **Official Decisions/Positions** (Quyết định/Quá trình công tác) for employees.

## 1. Database Schema (Existing)

### Contract (`contracts`)

- **employeeId**: Link to Employee.
- **contractNumber**: Unique contract number.
- **contractType**: `HDLD_XAC_DINH`, `HDLD_KHONG_XAC_DINH`, `HDLV`, `THU_VIEC`.
- **time**: `startDate`, `endDate`, `signedDate`.
- **files**: `originalFileUrl`, `signedFileUrl`.
- **status**: `DRAFT`, `ACTIVE`, `EXPIRED`, `TERMINATED`.

### Contract Appendix (`contract_appendices`)

- **contractId**: Link to Contract.
- **appendixNumber**: Unique appendix number.
- **content**: JSONB for flexible field updates (e.g., salary change, title change).

### Employee Position (`employee_positions`)

- **employeeId**: Link to Employee.
- **positionId**: Link to Position (Master Data).
- **isPrimary**: Boolean (Main job vs Concurrent).
- **decision**: `decisionNo`, `decisionDate`.

## 2. Backend Design (`apps/api`)

### Module: `ContractsModule`

- **Service**: `ContractsService`
- **Controller**: `ContractsController`
- **DTOs**:
  - `CreateContractDto`: `contractNumber`, `contractType`, `startDate`, `endDate`, `employeeId`.
  - `CreateAppendixDto`: `appendixNumber`, `content`, `effectiveDate`.

### Permissions

| Permission Code    | Description                    | Scope |
| :----------------- | :----------------------------- | :---- |
| `contracts:read`   | View contract list/details     | All   |
| `contracts:write`  | Create/Update/Delete contracts | All   |
| `contracts:export` | Export contract list           | All   |

### Endpoints

- `POST /employees/:employeeId/contracts`: Create contract for employee.
- `GET /employees/:employeeId/contracts`: Get all contracts for employee.
- `GET /contracts/:id`: Get detail.
- `PATCH /contracts/:id`: Update.
- `POST /contracts/:id/appendices`: Add appendix.

## 3. Frontend Design (`apps/web-hrm`)

### Employee Detail Page > Tab "Hợp đồng"

- **List View**: Table of contracts (descending by `startDate`).
- **Status Badge**: Green (Active), Red (Expired), Gray (Draft).
- **Actions**: "Thêm hợp đồng", "Sửa", "Thêm phụ lục".

### Employee Detail Page > Tab "Quá trình công tác"

- **Timeline View**: Visual timeline of positions held.
- **Data**: `appointments` (Decisions) sorted chronological.

## 4. Dependencies

- RBAC System (Slice 1).
- Employees Core (Slice 3).
