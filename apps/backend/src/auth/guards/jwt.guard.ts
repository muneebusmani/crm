import { type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      console.log('🔓 [JWT Guard] Route is public, allowing access');
      return true;
    }

    console.log(
      '🔒 [JWT Guard] Route is protected, checking authentication...',
    );
    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result
        .then((canActivate) => {
          if (canActivate) {
            console.log('✅ [JWT Guard] Authentication successful');
          } else {
            console.log('❌ [JWT Guard] Authentication failed');
          }
          return canActivate;
        })
        .catch((error) => {
          console.log('❌ [JWT Guard] Authentication error:', error.message);
          throw error;
        });
    }

    console.log('✅ [JWT Guard] Authentication result:', result);
    return result;
  }
}
