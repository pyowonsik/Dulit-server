import {
    createParamDecorator,
    ExecutionContext,
  } from '@nestjs/common';
  
  export const UserId = createParamDecorator(
    (data: undefined, context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
  
      return request?.user?.sub;
    },
  );