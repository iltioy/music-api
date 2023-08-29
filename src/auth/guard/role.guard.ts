import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { applyDecorators } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    // console.log(roles, user);

    if (!roles) return true;
    if (roles.length === 0 || roles.includes(user.role)) return true;
    if (roles.length === 1 && roles[0] === 'user') return true;
    if (user.role === 'admin') return true;

    throw new ForbiddenException();
  }
}

export const Roles = (roles: string[]) =>
  applyDecorators(SetMetadata('roles', roles), UseGuards(RoleGuard));

export const SkipRoles = () => applyDecorators(SetMetadata('roles', []));
