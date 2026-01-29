import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';

export enum Gender {
    MALE = 'Nam',
    FEMALE = 'Nữ',
}

export enum EmployeeStatus {
    ACTIVE = 'Đang công tác',
    RESIGNED = 'Đã nghỉ việc',
    TRANSFERRED = 'Chuyển công tác',
}

export enum EmployeeType {
    OFFICIAL = 'Viên chức',
    CONTRACT = 'Người lao động',
}

@Entity()
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // --- A. THÔNG TIN CHUNG (TRANG ĐẦU) ---

    @Column({ type: 'enum', enum: EmployeeType, default: EmployeeType.OFFICIAL })
    type: EmployeeType;

    @Column({ default: 'Trường Đại học Sài Gòn' })
    managingAgency: string;

    @Column({ default: 'Trường Đại học Sài Gòn' })
    employingUnit: string;

    @ManyToOne(() => Unit, (unit) => unit.employees, { nullable: true })
    @JoinColumn({ name: 'unitId' })
    unit: Unit;

    @Column({ nullable: true })
    unitId: string;

    @Column({ unique: true })
    citizenId: string; // Mã số định danh (CCCD)

    @Column({ nullable: true })
    officialCode: string; // Mã Viên chức (Sở Nội vụ cấp)

    @Column({ unique: true })
    employeeCode: string; // Mã Nhân sự (Trường cấp)

    @Column({ nullable: true })
    avatar: string; // URL/Path to 4x6 image

    @Column({ nullable: true })
    username: string; // Default email

    @Column({ nullable: true })
    email: string; // Email chính

    @Column('simple-array', { nullable: true })
    secondaryEmails: string[];

    @Column('simple-array', { nullable: true })
    phoneNumbers: string[];

    // Relationships (represented as strings/IDs for now until other modules exist)
    @Column('simple-array', { nullable: true })
    departmentIds: string[]; // Đơn vị công tác (Many-to-Many logic later)

    @Column({ nullable: true })
    partyCellId: string; // Chi bộ

    @Column({ nullable: true })
    tradeUnionId: string; // Công đoàn bộ phận

    @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
    status: EmployeeStatus;

    // --- B. THÔNG TIN CÁ NHÂN (Mục 1-46) ---

    @Column()
    fullName: string; // 1. Họ và tên khai sinh

    @Column({ type: 'enum', enum: Gender })
    gender: Gender; // 2. Giới tính

    @Column({ nullable: true })
    otherName: string; // 3. Tên gọi khác

    @Column({ type: 'date' })
    dob: Date; // 4. Ngày sinh

    @Column({ nullable: true })
    birthPlace: string; // 5. Nơi sinh

    @Column({ nullable: true })
    birthPlaceOld: string; // 6. Nơi sinh (địa danh cũ)

    @Column({ nullable: true })
    hometown: string; // 7. Quê quán

    @Column({ nullable: true })
    hometownOld: string; // 8. Quê quán (địa danh cũ)

    @Column({ nullable: true })
    ethnicity: string; // 9. Dân tộc

    @Column({ nullable: true })
    religion: string; // 10. Tôn giáo

    // 11. Số CCCD (duplicate of citizenId, can just use getter)

    @Column({ type: 'date', nullable: true })
    citizenIdIssueDate: Date; // 12. Ngày cấp CCCD

    @Column({ nullable: true })
    citizenIdIssuePlace: string; // 13. Nơi cấp CCCD

    @Column({ nullable: true })
    socialInsuranceNumber: string; // 14. Số sổ BHXH

    @Column({ nullable: true })
    healthInsuranceNumber: string; // 15. Số thẻ BHYT

    @Column({ nullable: true })
    currentAddress: string; // 16. Nơi ở hiện nay (Địa chỉ)

    @Column({ nullable: true })
    currentWard: string; // 17. Xã/Phường

    @Column({ nullable: true })
    currentProvince: string; // 18. Tỉnh/Thành phố

    @Column({ nullable: true })
    familyBackground: string; // 19. Thành phần gia đình xuất thân

    @Column({ nullable: true })
    jobBeforeRecruitment: string; // 20. Nghề nghiệp trước khi tuyển dụng

    @Column({ type: 'date', nullable: true })
    firstRecruitmentDate: Date; // 21. Ngày tuyển dụng lần đầu

    @Column({ nullable: true })
    firstRecruitmentAgency: string; // 22. Cơ quan tuyển dụng lần đầu

    @Column({ type: 'date', nullable: true })
    currentAgencyDate: Date; // 23. Ngày vào cơ quan hiện tại

    @Column({ type: 'date', nullable: true })
    partyJoinDate: Date; // 24. Ngày vào Đảng

    @Column({ type: 'date', nullable: true })
    partyOfficialDate: Date; // 25. Ngày chính thức (Đảng)

    @Column({ type: 'date', nullable: true })
    socialOrgJoinDate: Date; // 26. Ngày tham gia tổ chức CT-XH đầu tiên

    @Column({ nullable: true })
    socialOrgName: string; // 27. Tên tổ chức CT-XH

    @Column({ type: 'date', nullable: true })
    enlistmentDate: Date; // 28. Ngày nhập ngũ

    @Column({ type: 'date', nullable: true })
    demobilizationDate: Date; // 29. Ngày xuất ngũ

    @Column({ nullable: true })
    highestRank: string; // 30. Quân hàm cao nhất

    @Column({ nullable: true })
    policySubject: string; // 31. Đối tượng chính sách

    @Column({ nullable: true })
    generalEducation: string; // 32. Trình độ giáo dục phổ thông (12/12)

    @Column({ nullable: true })
    highestProfessionalLevel: string; // 33. Trình độ chuyên môn cao nhất (Derived in future)

    @Column({ nullable: true })
    academicRank: string; // 34. Học hàm (GS/PGS)

    @Column({ nullable: true })
    academicRankYear: number; // 35. Năm phong học hàm

    @Column({ nullable: true })
    stateTitle: string; // 36. Danh hiệu nhà nước

    @Column({ nullable: true })
    currentPosition: string; // 37. Chức vụ hiện tại (Derived)

    @Column({ nullable: true })
    planningPosition: string; // 38. Quy hoạch chức danh (Derived)

    @Column({ nullable: true })
    concurrentPosition: string; // 39. Chức vụ kiêm nhiệm (Derived)

    @Column({ nullable: true })
    mainDuty: string; // 40. Công việc chính được giao

    @Column({ nullable: true })
    strength: string; // 41. Sở trường công tác

    @Column({ nullable: true })
    healthStatus: string; // 43. Tình trạng sức khỏe

    @Column({ type: 'float', nullable: true })
    height: number; // 44. Chiều cao (cm)

    @Column({ type: 'float', nullable: true })
    weight: number; // 45. Cân nặng (kg)

    @Column({ nullable: true })
    bloodType: string; // 46. Nhóm máu

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
