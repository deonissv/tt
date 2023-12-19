import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { PlaygroundStateUpdate } from '@shared/PlaygroundState';
import { GameVersion } from 'server/src/games/entities/gameVersion.entity';

@Entity({ name: 'RoomProgress' })
export class RoomProgress extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 32 })
  roomId: string;

  @PrimaryGeneratedColumn()
  order: number;

  @Column()
  turn: number;

  @Column({ type: 'jsonb' })
  stateDelta: PlaygroundStateUpdate;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Room, room => room.roomId, { cascade: true })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @ManyToOne(() => GameVersion)
  @JoinColumn([
    { name: 'gameId', referencedColumnName: 'gameId' },
    { name: 'gameVersion', referencedColumnName: 'version' },
  ])
  game: GameVersion;
}
