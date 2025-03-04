import { Controller } from '@nestjs/common';
import { AnniversaryService } from './anniversary.service';

@Controller()
export class AnniversaryController {
  constructor(private readonly anniversaryService: AnniversaryService) {}
}
