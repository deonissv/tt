import { Game } from 'server/src/games/entities/game.entity';
import { Room } from 'server/src/rooms/entities/room.entity';
import { RoomUser } from 'server/src/rooms/entities/roomUsers.entity';
import { BaseEntity, Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ length: 72 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255 })
  avatarUrl?: string;

  @DeleteDateColumn()
  deletedAt?: boolean;

  @OneToMany(() => Game, game => game.author, { nullable: true })
  games: Game[];

  @OneToMany(() => Room, room => room.creator, { nullable: true })
  createdRooms: Room[];

  @OneToMany(() => RoomUser, roomUser => roomUser.room, { nullable: true })
  participantRooms: Room[];
}
