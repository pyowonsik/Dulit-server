import { COUPLE_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';

@Injectable()
export class CoupleService {
  constructor(
    @Inject(COUPLE_SERVICE)
    private readonly coupleMicroservice: ClientProxy,
  ) {}

  connectCouple(
    connectCoupleDto: ConnectCoupleDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'connect_couple',
      },
      {
        ...connectCoupleDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }
}
