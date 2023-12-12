import { BaseEntity, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
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
}
