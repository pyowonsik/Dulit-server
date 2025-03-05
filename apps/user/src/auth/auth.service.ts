import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, SocialProvider, User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register-dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(rawToken: string, registerDto: RegisterDto) {
    // @Headers에서 넘어온 rawToken(Basic $token)에서 email,password 추출
    const { email, password } = this.parserBasicToken(rawToken);

    return this.userService.create({
      ...registerDto,
      email,
      password,
      socialProvider: SocialProvider.common,
    });
  }

  async login(rawToken: string) {
    // @Headers에서 넘어온 rawToken(Basic $token)에서 email,password 추출
    const { email, password } = this.parserBasicToken(rawToken);

    // user 인증
    const user = await this.authenticate(email, password);

    // 로그인 정보가 인증이 되면(로그인 성공시) accessToken,refreshToken 발급
    return {
      accessToken: await this.issueToken(user, false),
      refreshToken: await this.issueToken(user, true),
    };
  }

  parserBasicToken(rawToken: string) {
    // ['Basic','$token']
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length != 2) {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLocaleLowerCase() !== 'basic') {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }

    // 추출한 토큰을 base64 디코딩 'email:password'
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // email:password 를  ':' 기준으로 split
    const tokenSplit = decoded.split(':');

    // [email,password]
    if (tokenSplit.length != 2) {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }

    const [email, password] = tokenSplit;
    return { email, password };
  }

  // ${Bearer token} -> Bearer 토큰 분리해서 검증후 payload 반환
  async parseBearerToken(rawToken: string, isRefresh: boolean) {
    // (1) Bearer 토큰 분리
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length != 2) {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }
    const [bearer, token] = basicSplit;

    if (bearer.toLocaleLowerCase() !== 'bearer') {
      throw new BadRequestException('잘못된 형식의 토큰입니다.');
    }
    try {
      // (2) 디코딩 + 토큰 검증후 payload 반환
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          isRefresh ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET',
        ),
      });

      if (isRefresh) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh 토큰을 입력해주세요.');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access 토큰을 입력해주세요.');
        }
      }

      return payload;
    } catch {
      throw new UnauthorizedException('토큰이 만료 되었습니다.');
    }
  }

  async authenticate(email: string, password: string) {
    // email 인증
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    // 비밀번호 인증
    const passOk = bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    return user;
  }

  // user 정보를 통해 accessToken , refreshToken 발급
  async issueToken(
    user: { id: string; role: Role; },
    isRefresh: boolean,
  ) {
    // 환경변수(.env) ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET 저장
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefresh ? 'refresh' : 'access',
      },
      {
        secret: isRefresh ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefresh ? '24h' : 300,
      },
    );
  }
}
