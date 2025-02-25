import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, QueryRunner, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Anniversary } from './entity/anniversary.entity';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { Couple } from 'src/couple/entity/couple.entity';

@Injectable()
export class AnniversaryService {
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    private readonly commonService: CommonService,
  ) {}

  async create(
    userId: number,
    createAnniversaryDto: CreateAnniversaryDto,
    qr: QueryRunner,
  ) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['anniversaries'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = await qr.manager.create(Anniversary, {
      ...createAnniversaryDto,
      couple,
    });

    await qr.manager.save(Anniversary, anniversary);

    const newAnniversary = await qr.manager.findOne(Anniversary, {
      where: {
        id: anniversary.id,
      },
    });

    return newAnniversary;
  }

  async findAll(userId: number, dto: GetAnniversaryDto) {
    const couple = await this.coupleRepository.findOne({
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['anniversaries'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const qb = this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.coupleId = :coupleId', { coupleId: couple.id })
      .select();

    this.commonService.applyPagePaginationParamsToQb(qb, dto);

    const anniversaries = await qb.getMany();

    return anniversaries;
  }

  async findOne(userId: number, id: number) {
    const couple = await this.coupleRepository.findOne({
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['anniversaries'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = await this.anniversaryRepository.findOne({
      where: {
        id,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    return anniversary;
  }

  async update(
    userId: number,
    id: number,
    updateAnniversaryDto: UpdateAnniversaryDto,
    qr: QueryRunner,
  ) {
    const couple = await qr.manager.findOne(Couple, {
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['anniversaries'],
    });
    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = await qr.manager.findOne(Anniversary, {
      where: {
        id,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    await qr.manager.update(
      Anniversary,
      { id: anniversary.id },
      updateAnniversaryDto,
    );

    const newAnniversary = await qr.manager.findOne(Anniversary, {
      where: {
        id,
      },
    });

    return newAnniversary;
  }

  async remove(userId: number, id: number) {
    const couple = await this.coupleRepository.findOne({
      where: {
        users: {
          id: In([userId]),
        },
      },

      relations: ['anniversaries'],
    });
    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const anniversary = await this.anniversaryRepository.findOne({
      where: {
        id,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    await this.anniversaryRepository.delete(id);
    return id;
  }

  async isAnniversaryCouple(userId: number, anniversaryId: number) {
    const couple = await this.coupleRepository
      .createQueryBuilder('couple')
      .leftJoin('couple.users', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!couple) {
      return false; // 사용자가 커플에 속하지 않음
    }

    const exists = await this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.id = :anniversaryId', { anniversaryId })
      .andWhere('anniversary.coupleId = :coupleId', { coupleId: couple.id })
      .getExists();

    return exists;
  }
}
