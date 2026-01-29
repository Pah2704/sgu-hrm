import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Employee, EmployeeStatus, Gender } from '../employees/entities/employee.entity';
import { Contract, ContractStatus } from '../contracts/entities/contract.entity';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Unit } from '../units/entities/unit.entity';
import { Degree } from '../training/entities/degree.entity';
import { RewardDiscipline, RewardDisciplineType } from '../reward-discipline/entities/reward-discipline.entity';
import { SalaryProfile } from '../salaries/entities/salary-profile.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepo: Repository<Employee>,
        @InjectRepository(Contract)
        private contractRepo: Repository<Contract>,
        @InjectRepository(LeaveRequest)
        private leaveRepo: Repository<LeaveRequest>,
        @InjectRepository(Unit)
        private unitRepo: Repository<Unit>,
        @InjectRepository(Degree)
        private degreeRepo: Repository<Degree>,
        @InjectRepository(RewardDiscipline)
        private rewardRepo: Repository<RewardDiscipline>,
        @InjectRepository(SalaryProfile)
        private salaryRepo: Repository<SalaryProfile>,
    ) { }

    async getDashboardStats() {
        const totalEmployees = await this.employeeRepo.count({ where: { status: EmployeeStatus.ACTIVE } });
        const totalUnits = await this.unitRepo.count();

        // --- Personnel Structure by Degree ---
        const degreeStats = await this.degreeRepo
            .createQueryBuilder('degree')
            .leftJoin('degree.level', 'level')
            .select('level.name', 'name')
            .addSelect('COUNT(degree.id)', 'value')
            .groupBy('level.name')
            .getRawMany();

        // --- Age & Gender Distribution ---
        const employees = await this.employeeRepo.find({
            where: { status: EmployeeStatus.ACTIVE },
            select: ['dob', 'gender']
        });

        const ageGroups = { '< 30': 0, '30-40': 0, '40-50': 0, '> 50': 0 };
        const genderStats = { 'Nam': 0, 'Nữ': 0 };

        const now = new Date();
        employees.forEach(emp => {
            if (emp.gender) genderStats[emp.gender === 'Nam' ? 'Nam' : 'Nữ']++;
            if (emp.dob) {
                const age = now.getFullYear() - new Date(emp.dob).getFullYear();
                if (age < 30) ageGroups['< 30']++;
                else if (age < 40) ageGroups['30-40']++;
                else if (age < 50) ageGroups['40-50']++;
                else ageGroups['> 50']++;
            }
        });

        // --- Party Members ---
        const partyMemberCount = await this.employeeRepo.count({
            where: { partyJoinDate: Not(IsNull()), status: EmployeeStatus.ACTIVE }
        });

        // --- Reward / Discipline (Current Year) ---
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const rewardCount = await this.rewardRepo.count({
            where: {
                type: RewardDisciplineType.REWARD,
                decisionDate: Between(startOfYear, endOfYear)
            }
        });
        const disciplineCount = await this.rewardRepo.count({
            where: {
                type: RewardDisciplineType.DISCIPLINE,
                decisionDate: Between(startOfYear, endOfYear)
            }
        });

        return {
            counts: {
                employees: totalEmployees,
                units: totalUnits,
                partyMembers: partyMemberCount,
                rewardsYear: rewardCount,
                disciplinesYear: disciplineCount
            },
            degreeStats: degreeStats.map(d => ({ name: d.name, value: Number(d.value) })),
            ageStats: Object.keys(ageGroups).map(key => ({ name: key, value: ageGroups[key] })),
            genderStats: Object.keys(genderStats).map(key => ({ name: key, value: genderStats[key] })),
        };
    }

    // --- Detailed Reports ---

    // 1. Party Members List
    async getPartyMembersList() {
        return this.employeeRepo.find({
            where: { partyJoinDate: Not(IsNull()) },
            relations: ['unit'],
            select: ['id', 'employeeCode', 'fullName', 'dob', 'gender', 'partyJoinDate', 'partyOfficialDate', 'currentPosition'] as any,
            order: { partyJoinDate: 'ASC' }
        });
    }

    // 2. Contracts
    async getExpiringContracts(days: number) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        const todayStr = today.toISOString().split('T')[0];
        const futureStr = futureDate.toISOString().split('T')[0];

        return this.contractRepo.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.employee', 'employee')
            .where('contract.endDate BETWEEN :today AND :future', { today: todayStr, future: futureStr })
            .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
            .getMany();
    }

    async getAllContractsReport() {
        return this.contractRepo.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }

    // 3. Salaries
    async getAllSalariesReport() {
        const profiles = await this.salaryRepo.find({
            relations: ['employee', 'employee.unit'],
        });
        return profiles.map(p => ({
            id: p.id,
            employeeName: p.employee?.fullName,
            employeeCode: p.employee?.employeeCode,
            unitName: p.employee?.unit?.name,
            currentGrade: p.salaryGrade,
            coefficient: p.coefficient,
            startDate: p.startDate,
        }));
    }

    async getSalaryIncreaseDueList() {
        const profiles = await this.salaryRepo.find({
            relations: ['employee', 'employee.unit'],
        });

        const now = new Date();
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(now.getFullYear() - 3);

        return profiles
            .filter(p => new Date(p.startDate) <= threeYearsAgo)
            .map(p => ({
                id: p.id,
                employeeName: p.employee?.fullName,
                employeeCode: p.employee?.employeeCode,
                unitName: p.employee?.unit?.name,
                currentGrade: p.salaryGrade,
                startDate: p.startDate,
            }));
    }

    // 4. Employees General
    async getEmployeeReport() {
        const employees = await this.employeeRepo.find({
            relations: ['unit'],
            order: { createdAt: 'DESC' }
        });

        return employees.map(emp => ({
            code: emp.employeeCode,
            fullName: emp.fullName,
            gender: emp.gender,
            email: emp.email,
            phone: emp.phoneNumbers ? emp.phoneNumbers[0] : '',
            unitName: emp.unit ? emp.unit.name : 'N/A',
            position: emp.currentPosition,
            status: emp.status,
            type: emp.type, // Added type for filtering
            partyJoinDate: emp.partyJoinDate
        }));
    }

    async getEmployeesByUnitList(unitId?: string) {
        const where: any = { status: EmployeeStatus.ACTIVE };
        if (unitId && unitId !== 'all') where.unitId = unitId;

        return this.employeeRepo.find({
            where,
            relations: ['unit'],
            order: { unitId: 'ASC', fullName: 'ASC' }
        });
    }
}
