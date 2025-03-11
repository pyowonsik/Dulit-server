import { COUPLE_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserPayloadDto } from '@app/common/dto';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AnniversaryService {
  constructor(
    @Inject(COUPLE_SERVICE)
    private readonly coupleMicroservice: ClientProxy,
  ) {}

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
  getAnniversary(userPayload: UserPayloadDto, anniversaryId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'get_anniversary',
      },
      {
        // ...getAnniversaryDto,
        anniversaryId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  updateAnniversary(
    updateAnniversaryDto: UpdateAnniversaryDto,
    userPayload: UserPayloadDto,
    anniversaryId: string,
  ) {
    return this.coupleMicroservice.send(
      {
        cmd: 'update_anniversary',
      },
      {
        ...updateAnniversaryDto,
        anniversaryId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  deleteAnniversary(userPayload: UserPayloadDto, anniversaryId: string) {
    return this.coupleMicroservice.send(
      {
        cmd: 'delete_anniversary',
      },
      {
        anniversaryId,
        meta: {
          user: userPayload,
        },
      },
    );
  }

  async isAnniversaryCoupleOrAdmin(
    userPayload: UserPayloadDto,
    anniversaryId: string,
  ) {
    return await lastValueFrom(
      this.coupleMicroservice.send(
        {
          cmd: 'is_anniversary_couple_or_admin',
        },
        {
          anniversaryId,
          meta: {
            user: userPayload,
          },
        },
      ),
    );
  }
}
