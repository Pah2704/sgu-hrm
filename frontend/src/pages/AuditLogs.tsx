import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Typography } from 'antd';
import { AuditLogsService, AuditLog } from '../services/audit-logs.service';
import dayjs from 'dayjs';

const { Title } = Typography;

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await AuditLogsService.getLogs(100);
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm:ss'),
            width: 180,
        },
        {
            title: 'Người dùng',
            dataIndex: ['user', 'username'],
            key: 'username',
            render: (text: string) => text || 'Unknown',
            width: 120,
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (action: string) => {
                let color = 'blue';
                if (action === 'DELETE') color = 'red';
                if (action === 'POST' || action === 'CREATE') color = 'green';
                return <Tag color={color}>{action}</Tag>;
            },
            width: 100,
        },
        {
            title: 'Resource',
            dataIndex: 'resource',
            key: 'resource',
            width: 120,
        },
        {
            title: 'ID',
            dataIndex: 'resourceId',
            key: 'resourceId',
            width: 100,
            ellipsis: true,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'details',
            key: 'details',
            ellipsis: true,
            render: (text: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
        },
    ];

    return (
        <Card style={{ margin: 24 }}>
            <Title level={4}>Nhật ký Hệ thống</Title>
            <Table
                dataSource={logs}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
            />
        </Card>
    );
};

export default AuditLogs;
