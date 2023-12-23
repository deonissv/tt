import { Room } from 'server/src/rooms/entities/room.entity';
import { User } from 'server/src/users/entities/user.entity';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Messages' })
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  messageId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb' })
  style: object;

  @ManyToOne(() => User, { cascade: true, nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Room, { cascade: true, nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room[];
}
