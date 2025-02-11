import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '게시글 제목',
    example: '1000일 기념 여행',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'POST 설명',
    example: '1000일 맞이 여행 다녀왔습니다. ~~~~',
  })
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    description: 'POST FILE PATHS',
    example: '[aPhoto.jpg,bPhoto.jpg]',
  })
  @IsString({ each: true })
  filePaths: string[];

}
