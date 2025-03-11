import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlanService } from '../plan.service';
import { Role } from 'apps/user/src/user/entity/user.entity';
import { UserPayloadDto } from '@app/common/dto';

@Injectable()
export class IsPlanCoupleOrAdminGuard implements CanActivate {
  constructor(private readonly planService: PlanService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    /**
     * Admin일 경우 그냥 패스
     */
    if (user.role === Role.admin) {
      return true;
    }

    const planId = req.params.planId;
    const userPayload: UserPayloadDto = {
      sub: user.sub,
    };

    if (!planId) {
      throw new BadRequestException('PLAN ID가 파라미터로 제공 돼야합니다.');
    }

    const isOk = await this.planService.isPlanCoupleOrAdmin(
      userPayload,
      planId,
    );

    if (!isOk.data) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
