import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { FamilyMember } from './entities/family-member.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FamilyMember])],
    controllers: [FamilyController],
    providers: [FamilyService],
    exports: [FamilyService],
})
export class FamilyModule { }
