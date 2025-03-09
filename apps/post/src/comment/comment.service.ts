import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@app/common';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  //   constructor(
  //     @InjectRepository(CommentModel)
  //     private readonly commentRepository: Repository<CommentModel>,
  //     private readonly paginationService: PaginationService,
  //   ) {}
}
