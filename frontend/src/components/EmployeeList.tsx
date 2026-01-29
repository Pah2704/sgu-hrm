import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, FileWordOutlined, UserAddOutlined } from '@ant-design/icons';
import { Employee, EmployeeStatus } from '../types/employee';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeList: React.FC = () => {
    const [data, setData] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            // In production (Docker), nginx proxies /api to backend:3000 (configured in Dockerfile)
            // Use VITE_API_URL or default to localhost for dev
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${apiUrl}/employees`);
            setData(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách nhân sự');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await axios.delete(`${apiUrl}/employees/${id}`);
            message.success('Đã xóa nhân sự');
            fetchData();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleExport = (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        window.open(`${apiUrl}/employees/${id}/export`, '_blank');
    };

    const columns: ColumnsType<Employee> = [
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <b>{text.toUpperCase()}</b>,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'departmentIds', // Mock rendering
            key: 'departmentIds',
            render: () => 'Khoa CNTT', // Placeholder
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === EmployeeStatus.RESIGNED) color = 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => navigate(`/employees/edit/${record.id}`)} />
                    <Button icon={<FileWordOutlined />} onClick={() => handleExport(record.id)}>Xuất</Button>
                    <Button icon={<DeleteOutlined />} danger onClick={() => Modal.confirm({
                        title: 'Xóa nhân sự?',
                        onOk: () => handleDelete(record.id)
                    })} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Danh sách nhân sự</h2>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/employees/new')}>
                    Thêm mới
                </Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
        </div>
    );
};

export default EmployeeList;
