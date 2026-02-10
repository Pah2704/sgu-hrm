import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { RequirePermissions } from '../../rbac';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller()
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post('decisions')
  @RequirePermissions(PERMISSIONS.DECISIONS_WRITE)
  create(@Body() createDecisionDto: CreateDecisionDto) {
    return this.decisionsService.create(createDecisionDto);
  }

  @Get('employees/:employeeId/decisions')
  @RequirePermissions(PERMISSIONS.DECISIONS_READ)
  findAllByEmployee(@Param('employeeId') employeeId: string) {
    return this.decisionsService.findAllByEmployee(employeeId);
  }

  @Patch('decisions/:id')
  @RequirePermissions(PERMISSIONS.DECISIONS_WRITE)
  update(
    @Param('id') id: string,
    @Body() updateDecisionDto: UpdateDecisionDto,
  ) {
    return this.decisionsService.update(id, updateDecisionDto);
  }

  @Delete('decisions/:id')
  @RequirePermissions(PERMISSIONS.DECISIONS_WRITE)
  remove(@Param('id') id: string) {
    return this.decisionsService.remove(id);
  }
}
