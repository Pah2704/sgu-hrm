import { Module } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { DecisionsController } from './decisions.controller';
import { PrismaModule } from '../../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [DecisionsController],
  providers: [DecisionsService],
  exports: [DecisionsService],
})
export class DecisionsModule {}
