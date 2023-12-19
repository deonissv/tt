import { User } from 'server/src/users/entities/user.entity';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity({ name: 'RoomUsers' })
export class RoomUser extends BaseEntity {
  @PrimaryColumn({ name: 'userId', type: 'integer' })
  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({ name: 'roomId', type: 'char', length: 32 })
  @ManyToOne(() => Room, room => room.roomId)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @PrimaryColumn()
  seatId: number;
}
