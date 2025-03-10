import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class DeleteChatroomAndChatsDto {
  @IsString()
  coupleId: string;

  @IsString()
  user1Id: string;

  @IsString()
  user2Id: string;
}
