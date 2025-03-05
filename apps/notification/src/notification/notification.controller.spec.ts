import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let notificationController: NotificationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    notificationController = app.get<NotificationController>(NotificationController);
  });

});
