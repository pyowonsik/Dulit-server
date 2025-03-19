import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'src/user/entity/user.entity';
import { CalendarService } from '../calendar.service';

@Injectable()
export class IsCalendarCoupleOrAdmin implements CanActivate {
  constructor(private readonly calendarService: CalendarService) {}

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
    const calendarId = req.params.calendarId;

    if (!calendarId) {
      throw new BadRequestException('COMMENT ID가 파라미터로 제공 돼야합니다.');
    }

    const isOk = await this.calendarService.isCalendarCouple(
      userId,
      calendarId,
    );

    return isOk;
  }
}
