# User Account & Password Policy Conventions

## Auto-Provisioning (Employees Core)

When creating a new Employee profile (`POST /employees`), the system automatically provisions or links a User account based on the provided `email`.

### 1. New User Creation

If no User exists with the provided `email`:

- A new `User` record is created.
- **Username**: The email address.
- **Default Password**: The employee's **Citizen ID (CCCD/CMND)**.
- **Roles**: Assigned the `EMPLOYEE` role by default.
- **Status**: Active immediately.

### 2. Linking Existing User

If a User already exists with the provided `email`:

- Check if the User is already linked to another Employee.
  - **If YES**: Throw `ConflictException` (One user cannot be linked to multiple active employee profiles).
  - **If NO**: Link the existing User to the new Employee profile.
  - Password remains unchanged.

### 3. Future Improvements (Roadmap)

- **Force Password Change**: Upon first login with the default password, require the user to change it.
  - _Implementation Check_: Store `isTemporaryPassword: boolean` or check against `citizenId` hash on login.
- **Email Notification**: Send a welcome email with credentials or a secure set-password link instead of using a predictable default password.

## Security Note for Developers

- The default password logic relies on `citizenId`. Ensure `citizenId` is always required and validated (9-12 digits) before creating an employee.
- This convention is for initial rollout/migration convenience. Security hardening should be prioritized for external-facing deployments.
