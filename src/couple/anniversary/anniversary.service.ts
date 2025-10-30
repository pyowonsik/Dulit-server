import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Anniversary } from './entity/anniversary.entity';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { Couple } from 'src/couple/entity/couple.entity';
import { AnniversaryResponseDto } from './dto/anniversary-response.dto';
import { CoupleService } from '../couple.service';

@Injectable()
export class AnniversaryService {
  constructor(
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    private readonly commonService: CommonService,
    private readonly coupleService: CoupleService,
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

    const savedAnniversary = await qr.manager.save(Anniversary, anniversary);

    return new AnniversaryResponseDto(savedAnniversary);
  }

  async findAll(userId: number, dto: GetAnniversaryDto) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'anniversaries',
    ]);

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const qb = await this.findMyCoupleAnniversary(couple.id);

    // 제목 검색 (선택사항)
    if (dto.title) {
      qb.andWhere('anniversary.title LIKE :title', {
        title: `%${dto.title}%`,
      });
    }

    // 날짜순 정렬 (오름차순: 가까운 기념일이 먼저)
    qb.orderBy('anniversary.date', 'ASC');

    const anniversaries = await qb.getMany();

    return anniversaries;
  }

  async findOne(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'anniversaries',
    ]);

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

    return new AnniversaryResponseDto(newAnniversary);
  }

  async remove(userId: number, id: number) {
    const couple = await this.coupleService.findCoupleRelationChild(userId, [
      'anniversaries',
    ]);

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
    const couple = await this.findMyCouple(userId);

    if (!couple) {
      return false;
    }

    const exists = await this.isExistsAnniversary(anniversaryId, couple.id);

    return exists;
  }

  /* istanbul ignore next */
  async findMyCoupleAnniversary(coupleId: number) {
    return this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.coupleId = :coupleId', { coupleId });
  }

  /* istanbul ignore next */
  async findMyCouple(userId: number) {
    return this.coupleRepository
      .createQueryBuilder('couple')
      .leftJoin('couple.users', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  /* istanbul ignore next */
  async isExistsAnniversary(anniversaryId: number, coupleId: number) {
    return await this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.id = :anniversaryId', { anniversaryId })
      .andWhere('anniversary.coupleId = :coupleId', { coupleId })
      .getExists();
  }
}
