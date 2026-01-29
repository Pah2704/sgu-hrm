import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space, Popconfirm, Timeline, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { WorkHistoryService, WorkHistory } from '../services/work-history.service';
import dayjs from 'dayjs';

interface Props {
    employeeId: string;
}

const WorkHistoryTab: React.FC<Props> = ({ employeeId }) => {
    const [data, setData] = useState<WorkHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await WorkHistoryService.getAllByEmployee(employeeId);
            setData(res);
        } catch (error) {
            message.error('Không thể tải dữ liệu quá trình công tác');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) fetchData();
    }, [employeeId]);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: WorkHistory) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            fromDate: record.fromDate ? dayjs(record.fromDate) : null,
            toDate: record.toDate ? dayjs(record.toDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await WorkHistoryService.delete(id);
            message.success('Xóa thành công');
            fetchData();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                employeeId,
                fromDate: values.fromDate ? values.fromDate.format('YYYY-MM-DD') : null,
                toDate: values.toDate ? values.toDate.format('YYYY-MM-DD') : null,
            };

            if (editingId) {
                await WorkHistoryService.update(editingId, payload);
                message.success('Cập nhật thành công');
            } else {
                await WorkHistoryService.create(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            key: 'time',
            render: (_: any, record: WorkHistory) => (
                <Space>
                    <Tag color="blue">{dayjs(record.fromDate).format('MM/YYYY')}</Tag>
                    -
                    {record.toDate ? <Tag color="blue">{dayjs(record.toDate).format('MM/YYYY')}</Tag> : <Tag color="green">Hiện tại</Tag>}
                </Space>
            )
        },
        {
            title: 'Nơi công tác',
            dataIndex: 'workplace',
            key: 'workplace',
            render: (text: string, record: WorkHistory) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    {record.department && <div style={{ fontSize: '0.8em', color: 'gray' }}>{record.department}</div>}
                </div>
            )
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Số quyết định',
            dataIndex: 'referenceNumber',
            key: 'referenceNumber',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: WorkHistory) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa thông tin này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Quá trình công tác</Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingId ? 'Cập nhật Quá trình' : 'Thêm Quá trình công tác'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="fromDate" label="Từ ngày" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} picker="date" />
                        </Form.Item>
                        <Form.Item name="toDate" label="Đến ngày">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} picker="date" placeholder="Đang công tác" />
                        </Form.Item>
                    </div>

                    <Form.Item name="workplace" label="Nơi công tác (Cơ quan / Đơn vị)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="department" label="Phòng ban / Khoa (Chi tiết)">
                        <Input />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                        <Form.Item name="position" label="Chức vụ / Chức danh" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="referenceNumber" label="Số quyết định">
                            <Input />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default WorkHistoryTab;
