import { User } from 'server/src/users/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { RoomUser } from './roomUsers.entity';
import { RoomProgress } from './roomProgress.entity';

@Entity({ name: 'Rooms' })
export class Room extends BaseEntity {
  @PrimaryColumn({ type: 'char', length: 32 })
  roomId: string;

  @Column({ type: 'integer' })
  type: number;

  @OneToMany(() => RoomUser, roomUser => roomUser.user, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  users: User[];

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => RoomProgress, roomProgress => roomProgress.roomId, { nullable: true })
  progresses: RoomProgress[];
}
