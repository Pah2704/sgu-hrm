import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileWordOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

interface Contract {
    id: string;
    contractNumber: string;
    type: string;
    status: string;
    startDate: string;
    endDate?: string;
    employeeId: string;
}

interface Props {
    employeeId: string;
}

const ContractManager: React.FC<Props> = ({ employeeId }) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [form] = Form.useForm();

    const fetchContracts = async () => {
        if (!employeeId) return;
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            const res = await axios.get(`${apiUrl}/contracts?employeeId=${employeeId}`);
            setContracts(res.data);
        } catch (error) {
            message.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, [employeeId]);

    const handleAdd = () => {
        setEditingContract(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Contract) => {
        setEditingContract(record);
        form.setFieldsValue({
            ...record,
            startDate: dayjs(record.startDate),
            endDate: record.endDate ? dayjs(record.endDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await axios.delete(`${apiUrl}/contracts/${id}`);
            message.success('Deleted contract');
            fetchContracts();
        } catch (error) {
            message.error('Delete failed');
        }
    };

    const handleExport = (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        window.open(`${apiUrl}/contracts/${id}/export`, '_blank');
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        const payload = {
            ...values,
            employeeId,
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            if (editingContract) {
                await axios.patch(`${apiUrl}/contracts/${editingContract.id}`, payload);
                message.success('Updated contract');
            } else {
                await axios.post(`${apiUrl}/contracts`, payload);
                message.success('Created contract');
            }
            setIsModalVisible(false);
            fetchContracts();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        { title: 'Số HĐ', dataIndex: 'contractNumber', key: 'contractNumber' },
        { title: 'Loại HĐ', dataIndex: 'type', key: 'type' },
        { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={status === 'Hết hạn' ? 'red' : 'green'}>{status}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Contract) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Button icon={<FileWordOutlined />} size="small" onClick={() => handleExport(record.id)}>In</Button>
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => Modal.confirm({
                        title: 'Xóa hợp đồng?',
                        onOk: () => handleDelete(record.id)
                    })} />
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Hợp đồng</Button>
            </div>
            <Table
                columns={columns}
                dataSource={contracts}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingContract ? "Cập nhật Hợp đồng" : "Thêm Hợp đồng"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="contractNumber" label="Số Hợp đồng" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Loại Hợp đồng" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Thử việc">Thử việc</Option>
                            <Option value="Có thời hạn 12 tháng">Có thời hạn 12 tháng</Option>
                            <Option value="Có thời hạn 36 tháng">Có thời hạn 36 tháng</Option>
                            <Option value="Không xác định thời hạn">Không xác định thời hạn</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Ngày kết thúc">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" initialValue="Đang hiệu lực">
                        <Select>
                            <Option value="Đang hiệu lực">Đang hiệu lực</Option>
                            <Option value="Hết hạn">Hết hạn</Option>
                            <Option value="Đã chấm dứt">Đã chấm dứt</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ContractManager;
