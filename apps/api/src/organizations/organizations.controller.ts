import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrganizationsService, TreeUnitDto } from './organizations.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';
import { RequirePermissions, Roles } from '../rbac';
import { PERMISSIONS } from '../common/constants/permissions';
import { ROLES } from '../common/constants/enums';

@Controller('units')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  /**
   * GET /units
   * Return the full organization tree (nested structure)
   */
  @Get()
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_READ)
  getTree(): Promise<TreeUnitDto[]> {
    return this.orgService.getTree();
  }

  /**
   * GET /units/:id
   * Get single unit detail with parent + children
   */
  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgService.findOne(id);
  }

  /**
   * POST /units
   * Create a new unit with auto-computed path and level
   */
  @Post()
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_WRITE)
  @Roles(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN)
  create(@Body() dto: CreateUnitDto) {
    return this.orgService.create(dto);
  }

  /**
   * PATCH /units/:id
   * Update unit, recalculate path if parent changed
   */
  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_WRITE)
  @Roles(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUnitDto) {
    return this.orgService.update(id, dto);
  }

  /**
   * DELETE /units/:id
   * Soft-delete a unit (set status = INACTIVE)
   */
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_WRITE)
  @Roles(ROLES.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgService.remove(id);
  }

  /**
   * GET /units/:id/employees
   * List employees in a unit (placeholder until Slice 3)
   */
  @Get(':id/employees')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_READ)
  getEmployees(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgService.getEmployees(id);
  }
}
