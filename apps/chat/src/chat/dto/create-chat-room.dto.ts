import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  user1Id: string;

  @IsString()
  user2Id: string;

  @IsString()
  coupleId: string;
}
