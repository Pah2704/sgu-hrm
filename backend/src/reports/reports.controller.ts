import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('expiring-contracts')
    async getExpiringContracts(@Query('days') days: number) {
        return this.reportsService.getExpiringContracts(days || 30);
    }

    @Get('employee-list')
    async getEmployeeReport() {
        return this.reportsService.getEmployeeReport();
    }

    @Get('party-members')
    async getPartyMembers() {
        return this.reportsService.getPartyMembersList();
    }

    @Get('salary-increase-due')
    async getSalaryIncreaseDue() {
        return this.reportsService.getSalaryIncreaseDueList();
    }

    @Get('employees-by-unit')
    async getEmployeesByUnit(@Query('unitId') unitId: string) {
        return this.reportsService.getEmployeesByUnitList(unitId);
    }

    @Get('all-contracts')
    async getAllContracts() {
        return this.reportsService.getAllContractsReport();
    }

    @Get('all-salaries')
    async getAllSalaries() {
        return this.reportsService.getAllSalariesReport();
    }
}
