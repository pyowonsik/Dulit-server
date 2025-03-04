import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // private readonly configService: ConfigService,
    // @Inject(forwardRef(() => AuthService)) // 순환 종속성 문제 해결을 위한 지연 주입
    // private readonly authService: AuthService,
  ) {}

  async getUserBySocialId(userSocialId: string) {
    const user = await this.userRepository.findOneBy({
      socialId: userSocialId,
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 사용자입니다!');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다.');
    }

    // 환경변수(.env) HASH_ROUNDS 값 저장
    // const hashRounds = this.configService.get<number>(
    //   envVariableKeys.hashRounds,
    // );

    // password 암호화
    const hash = await bcrypt.hash(password, 10);

    await this.userRepository.save({
      ...createUserDto,
      password: hash,
    });

    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
}
