import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AnniversaryService } from '../anniversary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Couple } from 'src/user/entity/couple.entity';
import { Repository } from 'typeorm';
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
      console.log('admin');
      return true;
    }
    const coupleId = req.params.coupleId;
    const anniversaryId = req.params.anniversaryId;

    if (!anniversaryId) {
      throw new BadRequestException('COMMENT ID가 파라미터로 제공 돼야합니다.');
    }

    // const isOk = await this.anniversaryService.isAnniversaryCouple(
    //   user.id,
    //   coupleId,
    //   anniversaryId,
    // );

    // return isOk;
  }
}
