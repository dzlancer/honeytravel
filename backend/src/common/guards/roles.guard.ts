import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ROLE_HIERARCHY: Record<string, string[]> = {
  super_admin: ['super_admin', 'admin', 'supplier_manager', 'customer'],
  admin: ['admin', 'customer'],
  supplier_manager: ['supplier_manager', 'customer'],
  customer: ['customer'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Insufficient permissions');

    // Get all roles this user's role grants access to
    const grantedRoles = ROLE_HIERARCHY[user.role] || [user.role];

    // Check if any required role is in the user's granted roles
    if (!requiredRoles.some((r) => grantedRoles.includes(r))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
