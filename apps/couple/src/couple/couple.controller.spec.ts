import { Test, TestingModule } from '@nestjs/testing';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';

describe('CoupleController', () => {
  let coupleController: CoupleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoupleController],
      providers: [CoupleService],
    }).compile();

    coupleController = app.get<CoupleController>(CoupleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
    });
  });
});
