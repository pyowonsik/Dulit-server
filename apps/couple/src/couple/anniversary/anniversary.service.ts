import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { Anniversary } from './entity/anniversary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CoupleService } from '../couple.service';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';
import { PaginationService } from '@app/common';

@Injectable()
export class AnniversaryService {
  constructor(
    private readonly dataSource: DataSource, // DataSource 추가
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    private readonly coupleService: CoupleService,
    private readonly paginationService: PaginationService,
  ) {}

  async createAnniversary(createAnniversaryDto: CreateAnniversaryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, date } = createAnniversaryDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const anniversary = queryRunner.manager.create(Anniversary, {
        title,
        date,
        coupleId,
      });

      await queryRunner.manager.save(anniversary);
      await queryRunner.commitTransaction();

      return anniversary;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateAnniversary(updateAnniversaryDto: UpdateAnniversaryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, title, date, anniversaryId } = updateAnniversaryDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const anniversary = await queryRunner.manager.findOne(Anniversary, {
        where: { id: anniversaryId },
      });

      if (!anniversary) {
        throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
      }

      await queryRunner.manager.update(
        Anniversary,
        { id: anniversaryId },
        {
          title,
          date,
        },
      );

      const updatedAnniversary = await queryRunner.manager.findOne(Anniversary, {
        where: { id: anniversaryId },
      });

      await queryRunner.commitTransaction();

      return updatedAnniversary;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAnniversary(getAnniversaryDto: GetAnniversaryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, anniversaryId } = getAnniversaryDto;

      const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

      if (!coupleId) {
        throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
      }

      const anniversary = await queryRunner.manager.findOne(Anniversary, {
        where: { id: anniversaryId },
      });

      if (!anniversary) {
        throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
      }

      await queryRunner.manager.delete(Anniversary, { id: anniversaryId });

      await queryRunner.commitTransaction();

      return anniversaryId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAnniversaries(getAnniversariesDto: GetAnniversariesDto) {
    const { meta } = getAnniversariesDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const qb = await this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.coupleId = :coupleId', { coupleId })
      .select();

    this.paginationService.applyPagePaginationParamsToQb(
      qb,
      getAnniversariesDto,
    );

    const anniversaries = await qb.getMany();

    return anniversaries;
  }

  async getAnniversary(getAnniversaryDto: GetAnniversaryDto) {
    const { meta, anniversaryId } = getAnniversaryDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = await this.anniversaryRepository.findOne({
      where: {
        id: anniversaryId,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    return anniversary;
  }

  async isAnniversaryCoupleOrAdmin(getAnniversaryDto: GetAnniversaryDto) {
    const { meta, anniversaryId } = getAnniversaryDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      return false; // 사용자가 커플에 속하지 않음
    }

    const exists = await this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.id = :anniversaryId', { anniversaryId })
      .andWhere('anniversary.coupleId = :coupleId', { coupleId })
      .getExists();

    return exists;
  }
}
