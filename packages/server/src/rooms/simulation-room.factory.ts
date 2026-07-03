import { Injectable } from '@nestjs/common';
import { WebSocketServer } from 'ws';
import type { Room } from '@prisma/client';
import { ActionHandler } from '../simulation/action-handler';
import { SimulationFactory } from '../simulation/simulation.factory';
import { AssetUrlService } from './asset-url.service';
import { RoomRegistry } from './room-registry';
import { SimulationRoom } from './simulation-room';
import type { RoomsService } from './rooms.service';

@Injectable()
export class SimulationRoomFactory {
  constructor(
    private readonly actionHandler: ActionHandler,
    private readonly assetUrlService: AssetUrlService,
    private readonly simulationFactory: SimulationFactory,
    private readonly roomRegistry: RoomRegistry,
  ) {}

  create(roomsService: RoomsService, room: Room): SimulationRoom {
    const wss = new WebSocketServer({ noServer: true });
    const simulationRoom = new SimulationRoom(
      roomsService,
      this.assetUrlService,
      this.actionHandler,
      this.simulationFactory,
      wss,
      room,
    );
    simulationRoom.listen();
    this.roomRegistry.set(simulationRoom);
    wss.once('close', () => {
      this.roomRegistry.delete(room.code);
    });
    return simulationRoom;
  }
}
