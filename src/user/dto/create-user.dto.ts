import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    kakaoId: string;
  
    @IsString()
    email: string;

    @IsString()
    name: string;
}
