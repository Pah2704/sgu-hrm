import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { JwtAuthGuard } from '../rbac/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CurrentUser } from '../rbac/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/interfaces';
import { PERMISSIONS } from '../common/constants';
import { EmployeeStatus } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.EMPLOYEES_WRITE)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.EMPLOYEES_READ)
  findAll(
    @Query() query: EmployeeQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    void user;
    // TODO: Pass user context for restricted scopes (e.g. Unit Manager)
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_READ_OWN,
    PERMISSIONS.EMPLOYEES_READ_UNIT,
  )
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.EMPLOYEES_WRITE)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.EMPLOYEES_WRITE)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: EmployeeStatus,
  ) {
    return this.employeesService.updateStatus(id, status);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.EMPLOYEES_DELETE)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
