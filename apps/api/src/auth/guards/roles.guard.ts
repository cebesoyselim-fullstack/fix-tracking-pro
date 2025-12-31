import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@fix-tracking-pro/interfaces';
import { JwtUserPayload } from '../strategies/jwt.strategy';

export const ROLES_KEY = 'roles';

// Decorator to specify required roles
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      // No roles specified, allow access (authentication still required)
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload;

    if (!user || !user.role) {
      return false;
    }

    // Check if user's role matches any of the required roles
    return requiredRoles.some((role) => role === user.role);
  }
}

