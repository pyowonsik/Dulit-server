import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let user = await this.userRepository.findOne({
      where: { kakaoId: createUserDto.kakaoId },
    });

    if (!user) {
      user = await this.userRepository.save({
        kakaoId: createUserDto.kakaoId,
        email: createUserDto.email,
        name: createUserDto.name,
      });
    }

    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저의 ID 입니다.');
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async matchCouple(kakaoId1: string, kakaoId2: string) {
    const user1 = await this.userRepository.findOne({
      where: { kakaoId: kakaoId1 },
      relations: ['matchedUser'], // 'matchedUser' 관계를 포함
    });

    const user2 = await this.userRepository.findOne({
      where: { kakaoId: kakaoId2 },
      relations: ['matchedUser'], // 'matchedUser' 관계를 포함
    });

    if (!user1 || !user2) {
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    }

    if (user1.matchedUser || user2.matchedUser) {
      throw new BadRequestException('이미 매칭된 사용자입니다.');
    }

    user1.matchedUser = user2;
    user2.matchedUser = user1;

    await this.userRepository.save([user1, user2]);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.matchedUser', 'matchedUser')
      .where('user.kakaoId = :kakaoId', { kakaoId: kakaoId1 })
      .getOne();

    return user;
  }
}
