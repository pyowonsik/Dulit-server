import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class GetCalendarDto {
  

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: '검색 월',
    example: '3',
  })
  month? : number;
}
