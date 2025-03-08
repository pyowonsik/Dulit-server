import { COUPLE_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';

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

  createAnniversary(
    createAnniversaryDto: CreateAnniversaryDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'create_anniversary',
      },
      {
        ...createAnniversaryDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  getAnniversaries(
    getAnniversariesDto: GetAnniversariesDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_anniversaries',
      },
      {
        ...getAnniversariesDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }
  getAnniversary(
    getAnniversaryDto: GetAnniversaryDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_anniversary',
      },
      {
        ...getAnniversaryDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updateAnniversary(
    updateAnniversaryDto: UpdateAnniversaryDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'update_anniversary',
      },
      {
        ...updateAnniversaryDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deleteAnniversary(
    getAnniversaryDto: GetAnniversaryDto,
    userPayload: UserPayloadDto,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'delete_anniversary',
      },
      {
        ...getAnniversaryDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }
}
