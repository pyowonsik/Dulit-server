import { Test, TestingModule } from '@nestjs/testing';
import { AnniversaryService } from './anniversary.service';

describe('AnniversaryService', () => {
  let service: AnniversaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnniversaryService],
    }).compile();

    service = module.get<AnniversaryService>(AnniversaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
