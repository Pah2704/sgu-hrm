/**
 * JWT Payload Interface
 * Shape of data embedded in JWT token
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[]; // ['HR_ADMIN', 'MANAGER']
  permissions: string[]; // ['employees:read', 'leaves:approve']
  unitId?: string; // For Manager scope
  iat?: number;
  exp?: number;
}

/**
 * CurrentUser Payload
 * Mapped from JWT to request.user
 */
export interface CurrentUserPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  unitId?: string;
}
