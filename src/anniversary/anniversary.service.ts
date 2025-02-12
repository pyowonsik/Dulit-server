import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnniversaryDto } from './dto/create-anniversary.dto';
import { UpdateAnniversaryDto } from './dto/update-anniversary.dto';
import { GetAnniversaryDto } from './dto/get-anniverasry.dto';
import { Couple } from 'src/user/entity/couple.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Anniversary } from './entity/anniversary.entity';

@Injectable()
export class AnniversaryService {
  isAnniversaryCouple(id: any, coupleId: any, anniversaryId: any) {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(Anniversary)
    private readonly anniversaryRepository: Repository<Anniversary>,
    private readonly commonService: CommonService,
  ) {}

  async create(coupleId: number, createAnniversaryDto: CreateAnniversaryDto) {
    const couple = await this.coupleRepository.findOne({
      where: {
        id: coupleId,
      },
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의 ID 입니다.');
    }

    const anniversary = await this.anniversaryRepository.create({
      ...createAnniversaryDto,
      couple,
    });

    await this.anniversaryRepository.save(anniversary);
    return anniversary;
  }

  async findAll(dto: GetAnniversaryDto, coupleId: number) {
    const couple = await this.coupleRepository.findOne({
      where: { id: coupleId },
      relations: ['anniversaries'],
    });

    if (!couple) {
      throw new NotFoundException('존재하지 않는 COUPLE의의 ID 입니다.');
    }

    const qb = this.anniversaryRepository
      .createQueryBuilder('anniversary')
      .where('anniversary.coupleId = :coupleId', { coupleId })
      .select();

    this.commonService.applyPagePaginationParamsToQb(qb, dto);

    const anniversaries = await qb.getMany();

    return anniversaries;
  }

  async findOne(coupleId: number, id: number) {
    const couple = await this.coupleRepository.findOne({
      where: { id: coupleId },
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
      throw new NotFoundException('존재하지 않는 ANNIVERSARY의의 ID 입니다.');
    }

    return anniversary;
  }

  async update(
    coupleId: number,
    id: number,
    updateAnniversaryDto: UpdateAnniversaryDto,
  ) {
    const couple = await this.coupleRepository.findOne({
      where: { id: coupleId },
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

    await this.anniversaryRepository.update(
      { id: anniversary.id },
      updateAnniversaryDto,
    );

    const newAnniversary = await this.anniversaryRepository.findOne({
      where: {
        id,
      },
    });

    return newAnniversary;
  }

  async remove(coupleId: number, id: number) {
    const couple = await this.coupleRepository.findOne({
      where: { id: coupleId },
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

  // async isAnniversaryCouple(userId : number,coupleId: number, anniversaryId: number) {

  //   const anniversary = await this.anniversaryRepository.findOne({
  //     where: {
  //       id: anniversaryId,
  //       couple: {
  //         id: coupleId,
  //       },
  //     },
  //     relations: {
  //       couple: true,
  //     },
  //   });

  //   return false;
  // }
}
