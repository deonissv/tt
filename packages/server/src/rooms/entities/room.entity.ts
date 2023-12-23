import { User } from 'server/src/users/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { RoomUser } from './roomUsers.entity';
import { RoomProgress } from './roomProgress.entity';
import { Message } from 'server/src/messages/entities/message.entity';

@Entity({ name: 'Rooms' })
export class Room extends BaseEntity {
  @PrimaryColumn({ type: 'integer' })
  roomId: number;

  @Column({ type: 'char', length: 32, unique: true })
  code: string;

  @Column({ type: 'integer' })
  type: number;

  @OneToMany(() => RoomUser, roomUser => roomUser.user, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  users: User[];

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => RoomProgress, roomProgress => roomProgress.room, { nullable: true })
  progresses: RoomProgress[];

  @OneToMany(() => Message, message => message.room, { nullable: true })
  messages: Message[];
}
