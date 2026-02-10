import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RequirePermissions } from '../../rbac';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.POSITIONS_WRITE)
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.POSITIONS_READ)
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.POSITIONS_READ)
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.POSITIONS_WRITE)
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.POSITIONS_WRITE)
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
