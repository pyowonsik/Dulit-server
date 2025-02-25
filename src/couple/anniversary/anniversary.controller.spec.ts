import { Test, TestingModule } from '@nestjs/testing';
import { AnniversaryController } from './anniversary.controller';
import { AnniversaryService } from './anniversary.service';

describe('AnniversaryController', () => {
  let controller: AnniversaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnniversaryController],
      providers: [AnniversaryService],
    }).compile();

    controller = module.get<AnniversaryController>(AnniversaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
