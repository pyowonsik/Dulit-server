import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { Anniversary } from './entity/anniversary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoupleService } from '../couple.service';
import { GetAnniversaryDto } from './dto/get-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversariesDto } from './dto/get-anniversaries.dto';
import { PaginationService } from '@app/common';

@Injectable()
export class AnniversaryService {
  constructor(
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    private readonly coupleService: CoupleService,
    private readonly paginationService: PaginationService,
  ) {}

  async createAnniversary(createAnniversaryDto: CreateAnniversaryDto) {
    const { meta, title, date } = createAnniversaryDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    if (!coupleId) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = this.anniversaryRepository.create({
      title,
      date,
      coupleId,
    });

    await this.anniversaryRepository.save(anniversary);
    return anniversary;
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

  async updateAnniversary(updateAnniversaryDto: UpdateAnniversaryDto) {
    const { meta, title, date, anniversaryId } = updateAnniversaryDto;

    const coupleId = await this.coupleService.getCoupleByUserId(meta.user.sub);

    const anniversary = await this.anniversaryRepository.findOne({
      where: {
        id: anniversaryId,
      },
    });

    if (!anniversary) {
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의 ID 입니다.');
    }

    await this.anniversaryRepository.update(
      {
        id: anniversaryId,
      },
      {
        title,
        date,
      },
    );

    const newAnniversary = await this.anniversaryRepository.findOne({
      where: {
        id: anniversaryId,
      },
    });

    return newAnniversary;
  }

  async deleteAnniversary(getAnniversaryDto: GetAnniversaryDto) {
    const { meta, anniversaryId } = getAnniversaryDto;

    // 1) 커플 정보 메세지 패턴으로 가져오기
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

    await this.anniversaryRepository.delete({
      id: anniversaryId,
    });

    return anniversaryId;
  }
}
