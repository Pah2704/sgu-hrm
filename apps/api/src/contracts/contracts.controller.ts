import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../rbac/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CONTRACTS_WRITE)
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.CONTRACTS_READ)
  findAll(@Query('employeeId') employeeId?: string) {
    return this.contractsService.findAll(employeeId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CONTRACTS_READ)
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CONTRACTS_WRITE)
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CONTRACTS_WRITE)
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
