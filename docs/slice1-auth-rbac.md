# Slice 1: Auth + RBAC - Technical Design

## 1. Plan

### 1.1 Endpoints

| Method | Endpoint                | Description                                              | Auth                  |
| ------ | ----------------------- | -------------------------------------------------------- | --------------------- |
| POST   | `/auth/login`           | Login với email/password, trả về access + refresh tokens | Public                |
| POST   | `/auth/refresh`         | Đổi refresh token lấy access token mới                   | Refresh Token         |
| POST   | `/auth/logout`          | Revoke refresh token                                     | JWT                   |
| POST   | `/auth/forgot-password` | Gửi email reset password (Phase 2)                       | Public                |
| GET    | `/users`                | Danh sách users                                          | `system:users_manage` |
| GET    | `/users/me`             | Profile user hiện tại                                    | JWT                   |
| GET    | `/users/:id`            | Xem user                                                 | `system:users_manage` |
| PATCH  | `/users/:id`            | Cập nhật user                                            | `system:users_manage` |
| DELETE | `/users/:id`            | Xóa user                                                 | `system:users_manage` |

### 1.2 Auth Flow

```
┌─────────────┐     POST /auth/login       ┌─────────────┐
│   Client    │ ────────────────────────► │  AuthService │
│             │  { email, password }       │             │
└─────────────┘                            └──────┬──────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │ Validate creds  │
                                        │ Load user+roles │
                                        │ +permissions    │
                                        └────────┬────────┘
                                                 │
         ┌───────────────────────────────────────┴────────────────────┐
         ▼                                                            ▼
┌─────────────────┐                                        ┌─────────────────┐
│  Access Token   │                                        │  Refresh Token  │
│  (15min, JWT)   │                                        │  (7d, DB/Redis) │
│  Contains:      │                                        │  Store in DB    │
│  - userId       │                                        │  - userId       │
│  - email        │                                        │  - tokenHash    │
│  - roles[]      │                                        │  - expiresAt    │
│  - permissions[]│                                        └─────────────────┘
└─────────────────┘
```

**Token Refresh:**

1. Client gửi refresh token → `/auth/refresh`
2. Server verify token exists in DB, chưa expire
3. Issue new access token (không đổi refresh token)

**Logout:**

1. Delete refresh token from DB

### 1.3 RBAC Loading Strategy

Permissions được load **lúc login** và embed vào JWT payload:

- Giảm DB queries trên mỗi request
- Trade-off: Thay đổi permission cần re-login

---

## 2. Design

### 2.1 Module/Folder Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── refresh.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── interfaces/
│       └── jwt-payload.interface.ts
├── rbac/
│   ├── rbac.module.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── rbac.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       ├── roles.decorator.ts
│       ├── require-permissions.decorator.ts
│       └── public.decorator.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
└── common/
    └── constants/
        ├── enums.ts        # (existing)
        └── permissions.ts  # (existing)
```

### 2.2 CurrentUser Payload Shape

```typescript
// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[]; // ['HR_ADMIN', 'MANAGER']
  permissions: string[]; // ['employees:read', 'leaves:approve']
  unitId?: string; // For Manager scope
  iat?: number;
  exp?: number;
}

// Mapped to request.user
export interface CurrentUserPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  unitId?: string;
}
```

### 2.3 RBAC Strategy

**Guard Stack (order matters):**

```
Request → JwtAuthGuard → RbacGuard → Controller
              │              │
              ▼              ▼
         Verify JWT     Check roles/permissions
         Attach user    from decorators
```

**Decorators:**

- `@Public()` - Bypass JwtAuthGuard
- `@Roles('HR_ADMIN', 'SUPER_ADMIN')` - Require ANY of the roles
- `@RequirePermissions('employees:read')` - Require ALL permissions
- `@CurrentUser()` - Extract user from request

**Permission Check Logic:**

```typescript
// RbacGuard checks:
// 1. If @Roles() → user.roles must include ANY of the roles
// 2. If @RequirePermissions() → user.permissions must include ALL

hasRole = requiredRoles.some((role) => user.roles.includes(role));
hasPermission = requiredPermissions.every((perm) =>
  user.permissions.includes(perm),
);
```

---

## 2.4 Security Conventions

### 2.4.1 @Public() Decorator

- **Constraint**: All endpoints are **PRIVATE by default** due to the global `JwtAuthGuard`.
- **Requirement**: The `@Public()` decorator MUST be used explicitly to bypass authentication.
- **Usage**: Only for authentication endpoints (`/auth/login`, `/auth/refresh`) and public metadata/health-checks.
- **Warning**: Do NOT use `@Public()` for any business logic or employee data endpoints. If an endpoint depends on `request.user` or `@CurrentUser()`, it CANNOT be public.

---

## 3. Code Skeletons

### 3.1 AuthModule

```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: config.get("JWT_ACCESS_EXPIRES_IN", "15m") },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

### 3.2 AuthService Skeleton

```typescript
// src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    // TODO: 1. Find user by email
    // TODO: 2. Verify password with bcrypt
    // TODO: 3. Load roles + permissions
    // TODO: 4. Generate access token with payload
    // TODO: 5. Generate & store refresh token
    // TODO: 6. Update lastLoginAt
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    // TODO: 1. Find token in DB
    // TODO: 2. Verify not expired
    // TODO: 3. Load user + roles + permissions
    // TODO: 4. Generate new access token
  }

  async logout(userId: string): Promise<void> {
    // TODO: Delete refresh token(s) for user
  }

  private async loadUserPermissions(userId: string): Promise<string[]> {
    // TODO: Query UserRole → Role → RolePermission → Permission
    // Return flat array of permission codes
  }
}
```

### 3.3 RbacGuard

```typescript
// src/rbac/guards/rbac.guard.ts
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No decorators = allow
    if (!requiredRoles && !requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload = request.user;

    // Check roles (ANY match)
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => user.roles.includes(role));
      if (!hasRole) throw new ForbiddenException("Insufficient role");
    }

    // Check permissions (ALL match)
    if (requiredPermissions?.length) {
      const hasAllPermissions = requiredPermissions.every((perm) =>
        user.permissions.includes(perm),
      );
      if (!hasAllPermissions)
        throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
```

### 3.4 Decorators

```typescript
// @RequirePermissions()
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// @Roles()
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// @CurrentUser()
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    return data ? user?.[data] : user;
  },
);

// @Public()
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 3.5 UsersController Example

```typescript
// src/users/users.controller.ts
@Controller("users")
@UseGuards(JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.SYSTEM_USERS_MANAGE)
  findAll() {
    return this.usersService.findAll();
  }

  @Get("me")
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findOne(user.userId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.SYSTEM_USERS_MANAGE)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.SYSTEM_USERS_MANAGE)
  @Roles(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
```

### 3.6 CmsPostsController Example

```typescript
// src/cms/posts.controller.ts
@Controller("cms/posts")
@UseGuards(JwtAuthGuard, RbacGuard)
export class CmsPostsController {
  @Post()
  @RequirePermissions(PERMISSIONS.CMS_POSTS_MANAGE)
  create(@Body() dto: CreatePostDto) {}

  @Patch(":id/publish")
  @RequirePermissions(PERMISSIONS.CMS_POSTS_PUBLISH)
  publish(@Param("id") id: string) {}
}
```

### 3.7 AdminJobsController Example

```typescript
// src/admin/jobs.controller.ts
@Controller("admin/jobs")
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN)
export class AdminJobsController {
  @Post("salary-scan")
  @RequirePermissions(PERMISSIONS.JOBS_SALARY_SCAN)
  triggerSalaryScan() {}

  @Post("contract-alert")
  @RequirePermissions(PERMISSIONS.JOBS_CONTRACT_ALERT)
  triggerContractAlert() {}
}
```

---

## 4. Implementation Order

1. **RbacModule** - Decorators + Guards (no dependencies)
2. **AuthModule** - JWT strategy, login, refresh, logout
3. **UsersModule** - Basic CRUD to test RBAC
4. **Test flows** - Login → Protected routes → Permission denied
