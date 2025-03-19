import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TestBed } from '@automock/jest';
import { User } from './entity/user.entity';
import { QueryRunner } from 'typeorm';

// auto mock 테스트

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UserController).compile();

    userController = unit;
    userService = unitRef.get(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        {
          id: 1,
          email: 'test1@codefactory.ai',
        },
        {
          id: 2,
          email: 'test2@codefactory.ai',
        },
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User[]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findAll', () => {
    it('should return me as user', async () => {
      const users = [
        {
          id: 1,
          email: 'test1@codefactory.ai',
        },
        {
          id: 2,
          email: 'test2@codefactory.ai',
        },
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User[]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getMe', () => {
    it('should return the current user data', async () => {
      const user = { id: 1, email: 'test1@codefactory.ai' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);

      const req = { user: { sub: 1 } };
      const result = await userController.getMe(req);

      expect(userService.findOne).toHaveBeenCalledWith(req.user.sub);
      expect(result).toEqual(user);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = {
        id: 1,
        email: 'test1@codefactory.ai',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);

      const result = await userController.findOne(user.id);
      expect(userService.findOne).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(user);
    });
  });

  describe('findPartnerById', () => {
    it('should return the partner user data by partnerId', async () => {
      const partnerId = 1;
      const partner = { id: partnerId, email: 'partner@codefactory.ai' };

      jest
        .spyOn(userService, 'findPartnerById')
        .mockResolvedValue(partner as User);

      const result = await userController.findPartnerById(partnerId);

      expect(userService.findPartnerById).toHaveBeenCalledWith(partnerId);

      expect(result).toEqual(partner);
    });
  });

  describe('removeMe', () => {
    it('should delete the user based on userId', async () => {
      const myId = 1;
      const queryRunner = {};

      jest.spyOn(userService, 'remove').mockResolvedValue(myId);

      const result = await userController.removeMe(
        myId,
        queryRunner as QueryRunner,
      );

      expect(userService.remove).toHaveBeenCalledWith(
        myId,
        queryRunner as QueryRunner,
      );
      // 반환값이 true인지 확인 (삭제 성공)
      expect(result).toBe(myId);
    });
  });

  describe('remove', () => {
    it('should delete the user based on userId', async () => {
      const id = 1;
      const queryRunner = {};

      jest.spyOn(userService, 'remove').mockResolvedValue(id);

      const result = await userController.remove(
        id,
        queryRunner as QueryRunner,
      );

      expect(userService.remove).toHaveBeenCalledWith(
        id,
        queryRunner as QueryRunner,
      );
      expect(result).toBe(id);
    });
  });
});
