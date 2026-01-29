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

export interface Employee {
    id: string;
    type: EmployeeType;
    managingAgency: string;
    employingUnit: string;
    citizenId: string;
    officialCode?: string;
    employeeCode: string;
    avatar?: string;
    username?: string;
    email?: string;
    secondaryEmails?: string[];
    phoneNumbers?: string[];
    departmentIds?: string[];
    partyCellId?: string;
    tradeUnionId?: string;
    status: EmployeeStatus;
    fullName: string;
    gender: Gender;
    otherName?: string;
    dob: string; // ISO Date string
    birthPlace?: string;
    birthPlaceOld?: string;
    hometown?: string;
    hometownOld?: string;
    ethnicity?: string;
    religion?: string;
    citizenIdIssueDate?: string;
    citizenIdIssuePlace?: string;
    socialInsuranceNumber?: string;
    healthInsuranceNumber?: string;
    currentAddress?: string;
    currentWard?: string;
    currentProvince?: string;
    familyBackground?: string;
    jobBeforeRecruitment?: string;
    firstRecruitmentDate?: string;
    firstRecruitmentAgency?: string;
    currentAgencyDate?: string;
    partyJoinDate?: string;
    partyOfficialDate?: string;
    socialOrgJoinDate?: string;
    socialOrgName?: string;
    enlistmentDate?: string;
    demobilizationDate?: string;
    highestRank?: string;
    policySubject?: string;
    generalEducation?: string;
    highestProfessionalLevel?: string;
    academicRank?: string;
    academicRankYear?: number;
    stateTitle?: string;
    currentPosition?: string;
    planningPosition?: string;
    concurrentPosition?: string;
    mainDuty?: string;
    strength?: string;
    healthStatus?: string;
    height?: number;
    weight?: number;
    bloodType?: string;
    createdAt: string;
    updatedAt: string;
}
