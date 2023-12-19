import { PlaygroundStateSave } from '@shared/PlaygroundState';
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
import { Game } from './game.entity';

@Entity({ name: 'GameVersions' })
export class GameVersion extends BaseEntity {
  @PrimaryColumn()
  gameId: number;

  @PrimaryGeneratedColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb' })
  content: PlaygroundStateSave;

  @ManyToOne(() => Game, game => game.gameId, { cascade: true })
  @JoinColumn({ name: 'gameId' })
  game: Game;
}
