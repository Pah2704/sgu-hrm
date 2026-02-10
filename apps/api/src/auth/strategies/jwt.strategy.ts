import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, CurrentUserPayload } from '../interfaces';

/**
 * JWT Strategy for Passport
 * Validates JWT token and maps payload to request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Called after JWT is validated
   * Maps JWT payload to CurrentUserPayload attached to request.user
   */
  validate(payload: JwtPayload): CurrentUserPayload {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
      unitId: payload.unitId,
    };
  }
}
