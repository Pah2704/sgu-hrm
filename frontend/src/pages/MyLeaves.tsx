import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Tag, Space, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MyLeaves: React.FC = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchLeaves = async () => {
        if (!user?.employeeId) return;
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            const res = await axios.get(`${apiUrl}/leaves?employeeId=${user.employeeId}`);
            setLeaves(res.data);
        } catch (error) {
            message.error('Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [user]);

    const handleOk = async () => {
        const values = await form.validateFields();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const payload = {
            ...values,
            startDate: values.dates[0].format('YYYY-MM-DD'),
            endDate: values.dates[1].format('YYYY-MM-DD'),
            employeeId: user?.employeeId,
        };
        try {
            await axios.post(`${apiUrl}/leaves`, payload);
            message.success('Submitted leave request');
            setIsModalVisible(false);
            fetchLeaves();
        } catch (error) {
            message.error('Failed to submit');
        }
    };

    const columns = [
        { title: 'Loại nghỉ', dataIndex: 'type', key: 'type' },
        { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'gold';
                if (status === 'Đã duyệt') color = 'green';
                if (status === 'Từ chối') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Quản lý Nghỉ phép cá nhân" extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalVisible(true); }}>Tạo đơn xin nghỉ</Button>
            }>
                <Table
                    columns={columns}
                    dataSource={leaves}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title="Tạo đơn xin nghỉ phép"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="type" label="Loại nghỉ" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Nghỉ phép năm">Nghỉ phép năm</Option>
                            <Option value="Nghỉ ốm">Nghỉ ốm</Option>
                            <Option value="Nghỉ không lương">Nghỉ không lương</Option>
                            <Option value="Khác">Khác</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dates" label="Thời gian" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="reason" label="Lý do" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyLeaves;
