import React, { useEffect, useState } from 'react';
import { Table, Tabs, Button, Card, Select, Space, Tag, message } from 'antd';
import { FileExcelOutlined, TeamOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { ReportsService } from '../services/reports.service';

const { TabPane } = Tabs;
const { Option } = Select;

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);

    // Data States
    const [employees, setEmployees] = useState<any[]>([]); // Base list
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]); // Display list
    const [contracts, setContracts] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);

    // Filters
    const [personnelFilter, setPersonnelFilter] = useState('all'); // all, official, contract, party
    const [contractFilter, setContractFilter] = useState('all'); // all, expiring
    const [salaryFilter, setSalaryFilter] = useState('all'); // all, due

    useEffect(() => {
        // Fetch base data initially or lazily? 
        // Let's fetch base lists when Tab changes or initially if manageable.
        // For simplicity, fetch Employee list on mount. Contracts/Salaries when tab active (can optimize later).
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await ReportsService.getEmployeeReport();
            setEmployees(data);
            applyPersonnelFilter(data, personnelFilter);
        } catch (error) {
            message.error('Lỗi tải dữ liệu nhân sự');
        } finally {
            setLoading(false);
        }
    };

    const fetchContracts = async () => {
        setLoading(true);
        try {
            if (contractFilter === 'expiring') {
                const data = await ReportsService.getExpiringContracts(60);
                setContracts(data);
            } else {
                const data = await ReportsService.getAllContracts();
                setContracts(data);
            }
        } catch (error) {
            message.error('Lỗi tải dữ liệu hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            if (salaryFilter === 'due') {
                const data = await ReportsService.getSalaryIncreaseDue();
                setSalaries(data);
            } else {
                const data = await ReportsService.getAllSalaries();
                setSalaries(data);
            }
        } catch (error) {
            message.error('Lỗi tải dữ liệu lương');
        } finally {
            setLoading(false);
        }
    };

    // Effects for filters
    useEffect(() => {
        applyPersonnelFilter(employees, personnelFilter);
    }, [personnelFilter]);

    useEffect(() => {
        fetchContracts();
    }, [contractFilter]);

    useEffect(() => {
        fetchSalaries();
    }, [salaryFilter]);

    const applyPersonnelFilter = (data: any[], filter: string) => {
        if (!data) return;
        let res = [...data];
        if (filter === 'official') {
            res = res.filter(e => e.type === 'Viên chức');
        } else if (filter === 'contract') {
            res = res.filter(e => e.type === 'Người lao động');
        } else if (filter === 'party') {
            res = res.filter(e => e.partyJoinDate);
        }
        setFilteredEmployees(res);
    };

    const exportToExcel = (data: any[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, `${fileName}_${dayjs().format('DDMMYYYY')}.xlsx`);
    };

    // Columns Definitions
    const getEmployeeColumns = () => [
        { title: 'Mã NV', dataIndex: 'code', key: 'code' },
        { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Đơn vị', dataIndex: 'unitName', key: 'unitName' },
        { title: 'Chức vụ', dataIndex: 'position', key: 'position' },
        { title: 'Loại hình', dataIndex: 'type', key: 'type' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        ...(personnelFilter === 'party' ? [{ title: 'Ngày vào Đảng', dataIndex: 'partyJoinDate', render: (val: any) => val ? dayjs(val).format('DD/MM/YYYY') : '' }] : [])
    ];

    const getContractColumns = () => [
        { title: 'Số HĐ', dataIndex: 'contractNumber', key: 'contractNumber' },
        { title: 'Nhân viên', dataIndex: ['employee', 'fullName'], key: 'employeeName' },
        { title: 'Loại HĐ', dataIndex: 'type', key: 'type' },
        { title: 'Ngày hết hạn', dataIndex: 'endDate', key: 'endDate', render: (text: string) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color={text === 'Active' ? 'green' : 'red'}>{text}</Tag> },
    ];

    const getSalaryColumns = () => [
        { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode' },
        { title: 'Họ và tên', dataIndex: 'employeeName', key: 'employeeName' },
        { title: 'Đơn vị', dataIndex: 'unitName', key: 'unitName' },
        { title: 'Bậc lương', dataIndex: 'currentGrade', key: 'currentGrade' },
        { title: 'Mốc hưởng', dataIndex: 'startDate', key: 'startDate', render: (val: any) => val ? dayjs(val).format('DD/MM/YYYY') : '' },
        ...(salaryFilter === 'all' ? [{ title: 'Hệ số', dataIndex: 'coefficient', key: 'coefficient' }] : [])
    ];

    return (
        <Card title="Nghiệp vụ Báo cáo" bordered={false} style={{ margin: 24 }}>
            <Tabs defaultActiveKey="1" centered type="card">

                {/* 1. PERSONNEL */}
                <TabPane tab={<span><TeamOutlined />Danh sách Nhân sự</span>} key="1">
                    <Space style={{ marginBottom: 16 }}>
                        <Select value={personnelFilter} onChange={setPersonnelFilter} style={{ width: 220 }}>
                            <Option value="all">Danh sách Nhân sự (Toàn bộ)</Option>
                            <Option value="official">Danh sách Viên chức</Option>
                            <Option value="contract">Danh sách Người lao động</Option>
                            <Option value="party">Danh sách Đảng viên</Option>
                        </Select>
                        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => exportToExcel(filteredEmployees, `NhanSu_${personnelFilter}`)}>
                            Xuất Excel
                        </Button>
                    </Space>
                    <Table
                        dataSource={filteredEmployees}
                        columns={getEmployeeColumns()}
                        rowKey="code"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>

                {/* 2. CONTRACTS */}
                <TabPane tab={<span><FileTextOutlined />Quản lý Hợp đồng</span>} key="2">
                    <Space style={{ marginBottom: 16 }}>
                        <Select value={contractFilter} onChange={setContractFilter} style={{ width: 250 }}>
                            <Option value="all">Danh sách Hợp đồng (Tất cả)</Option>
                            <Option value="expiring">Sắp hết hạn (60 ngày)</Option>
                        </Select>
                        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => exportToExcel(contracts, `HopDong_${contractFilter}`)}>
                            Xuất Excel
                        </Button>
                    </Space>
                    <Table
                        dataSource={contracts}
                        columns={getContractColumns()}
                        rowKey="id"
                        loading={loading}
                    />
                </TabPane>

                {/* 3. SALARY */}
                <TabPane tab={<span><DollarOutlined />Quản lý Lương</span>} key="3">
                    <Space style={{ marginBottom: 16 }}>
                        <Select value={salaryFilter} onChange={setSalaryFilter} style={{ width: 250 }}>
                            <Option value="all">Danh sách Lương (Toàn trường)</Option>
                            <Option value="due">Danh sách Đến hạn nâng lương</Option>
                        </Select>
                        <Button type="primary" icon={<FileExcelOutlined />} onClick={() => exportToExcel(salaries, `Luong_${salaryFilter}`)}>
                            Xuất Excel
                        </Button>
                    </Space>
                    <Table
                        dataSource={salaries}
                        columns={getSalaryColumns()}
                        rowKey="id"
                        loading={loading}
                    />
                </TabPane>

            </Tabs>
        </Card>
    );
};

export default Reports;
