import { PartialType } from '@nestjs/mapped-types';
import { CreateDecisionDto } from './create-decision.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateDecisionDto extends PartialType(CreateDecisionDto) {
  @IsDateString()
  @IsOptional()
  endDate?: string; // Allow manually closing the term
}
