import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  
  @IsOptional() // 필수값 아님
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'POST FILE PATHS (선택값)',
    example: ['aPhoto.jpg', 'bPhoto.jpg'],
  })
  filePaths?: string[];
}
