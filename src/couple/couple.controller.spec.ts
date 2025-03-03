import { TestBed } from '@automock/jest';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';
import { CreateCoupleDto } from './dto/create-couple.dto';

describe('CoupleController', () => {
  let coupleController: CoupleController;
  let coupleService: jest.Mocked<CoupleService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(CoupleController).compile();

    coupleController = unit;
    coupleService = unitRef.get(CoupleService);
  });

  it('should be defined', () => {
    expect(coupleController).toBeDefined();
  });

  describe('connectCouple', () => {
    it('should call coupleService.connectCouple with correct arguments', async () => {
      const req = { user: { socialId: 'mySocialId' } };
      const partnerId = 2;
      const createCoupleDto: CreateCoupleDto = {
        myId: 'mySocialId',
        partnerId: '2',
      };
      const queryRunner = {} as any;

      coupleService.connectCouple.mockResolvedValue(true);

      const result = await coupleController.connectCouple(
        req,
        partnerId,
        queryRunner,
      );

      expect(coupleService.connectCouple).toHaveBeenCalledWith(
        createCoupleDto,
        queryRunner,
      );
      expect(result).toBe(true);
    });
  });

  describe('disconnectCouple', () => {
    it('should call coupleService.disConnectCouple with correct arguments', async () => {
      const req = { user: { socialId: 'mySocialId' } };
      const partnerId = 2;
      const createCoupleDto: CreateCoupleDto = {
        myId: 'mySocialId',
        partnerId: '2',
      };
      const queryRunner = {} as any;

      coupleService.disConnectCouple.mockResolvedValue(1);

      const result = await coupleController.disconnectCouple(
        req,
        partnerId,
        queryRunner,
      );

      expect(coupleService.disConnectCouple).toHaveBeenCalledWith(
        createCoupleDto,
        queryRunner,
      );
      expect(result).toBe(1);
    });
  });
});
