import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Public } from '../decorator/public.decorator';

// isPublic 데코레이터 endPoint일 경우 guard pass -> 공개 가능한 API 요청
// Bearer토큰의 값을 refreshToken으로 던질경우 막아야함. 
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();


    if (!request.user || request.user.type !== 'access') {
      return false;
    }

    return true;
  }
}
