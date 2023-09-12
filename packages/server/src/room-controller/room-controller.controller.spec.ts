import { Test, TestingModule } from '@nestjs/testing';
import { RoomControllerController } from './room-controller.controller';

describe('RoomControllerController', () => {
  let controller: RoomControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomControllerController],
    }).compile();

    controller = module.get<RoomControllerController>(RoomControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
