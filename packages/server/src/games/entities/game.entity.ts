import { RoomProgress } from 'server/src/rooms/entities/roomProgress.entity';
import { User } from 'server/src/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Games' })
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  gameId: number;

  @Column({ unique: true, type: 'char', length: 32 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  bannerUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToMany(() => RoomProgress, roomProgress => roomProgress.game, { cascade: true, nullable: true })
  @JoinColumn()
  roomProgresses: RoomProgress[];
}
