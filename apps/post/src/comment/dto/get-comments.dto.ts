import { PagePaginationDto, UserPayloadDto } from '@app/common/dto';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class GetCommentsDto extends PagePaginationDto {
  @ValidateNested()
  @IsNotEmpty()
  meta: { user: UserPayloadDto };

  @IsNotEmpty()
  @IsString()
  postId: string;
}
