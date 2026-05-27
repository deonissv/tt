import { Injectable } from '@nestjs/common';
import { SimulationRoom } from './simulation-room';

export abstract class RoomRegistry {
  abstract get(code: string): SimulationRoom | undefined;
  abstract set(room: SimulationRoom): void;
  abstract delete(code: string): void;
  abstract has(code: string): boolean;
}

@Injectable()
export class InMemoryRoomRegistry extends RoomRegistry {
  private readonly rooms = new Map<string, SimulationRoom>();

  get(code: string): SimulationRoom | undefined {
    return this.rooms.get(code);
  }

  set(room: SimulationRoom): void {
    this.rooms.set(room.room.code, room);
  }

  delete(code: string): void {
    this.rooms.delete(code);
  }

  has(code: string): boolean {
    return this.rooms.has(code);
  }
}
