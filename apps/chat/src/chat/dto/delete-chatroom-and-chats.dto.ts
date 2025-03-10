import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class DeleteChatroomAndChatsDto {
  @IsString()
  coupleId: string;
}
