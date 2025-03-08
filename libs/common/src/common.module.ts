import { Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';
@Module({
  imports: [CommonModule],
  controllers: [],
  providers: [PaginationService],
  exports: [PaginationService],
})
export class CommonModule {}
