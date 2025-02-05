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
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   authorId: number;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   coupleId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photoFilePath: string[];
}
