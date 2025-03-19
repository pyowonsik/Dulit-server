import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AnniversaryService } from '../anniversary.service';
import { Role } from 'src/user/entity/user.entity';

@Injectable()
export class IsAnniversaryCoupleOrAdmin implements CanActivate {
  constructor(private readonly anniversaryService: AnniversaryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    // /**
    //  * Admin일 경우 그냥 패스
    //  */
    if (user.role === Role.admin) {
      return true;
    }
    const userId = user.sub;
    const anniversaryId = req.params.anniversaryId;

    if (!anniversaryId) {
      throw new BadRequestException('COMMENT ID가 파라미터로 제공 돼야합니다.');
    }

    const isOk = await this.anniversaryService.isAnniversaryCouple(
      userId,
      anniversaryId,
    );

    return isOk;
  }
}
