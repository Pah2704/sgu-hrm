import React, { useEffect, useState } from 'react';
import { Table, Button, message, Tag, Space, Card, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const LeaveApprovals: React.FC = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLeaves = async () => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            const res = await axios.get(`${apiUrl}/leaves?status=pending`);
            setLeaves(res.data);
        } catch (error) {
            message.error('Failed to load pending leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleApprove = async (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await axios.patch(`${apiUrl}/leaves/${id}/status`, { status: 'Đã duyệt', approverId: user?.id });
            message.success('Approved');
            fetchLeaves();
        } catch (error) {
            message.error('Failed');
        }
    };

    const handleReject = async (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await axios.patch(`${apiUrl}/leaves/${id}/status`, { status: 'Từ chối', approverId: user?.id });
            message.success('Rejected');
            fetchLeaves();
        } catch (error) {
            message.error('Failed');
        }
    };

    const columns = [
        { title: 'Nhân viên', dataIndex: ['employee', 'fullName'], key: 'employeeName' },
        { title: 'Loại nghỉ', dataIndex: 'type', key: 'type' },
        { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>Duyệt</Button>
                    <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record.id)}>Từ chối</Button>
                </Space>
            ),
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Duyệt đơn nghỉ phép (Chờ duyệt)">
                <Table
                    columns={columns}
                    dataSource={leaves}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default LeaveApprovals;
