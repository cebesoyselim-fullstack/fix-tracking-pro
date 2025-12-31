import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role?: string; // User role for RBAC
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUserPayload> {
    // Return user payload that will be attached to req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

