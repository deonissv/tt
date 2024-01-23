import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [MessagesService, PrismaService],
})
export class MessagesModule {}
