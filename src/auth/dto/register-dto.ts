import { IsNotEmpty, isNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterDto {  
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
