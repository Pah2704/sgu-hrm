import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Unit } from '../types/unit';

const { Option } = Select;

const UnitManager: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [form] = Form.useForm();

    const fetchUnits = async () => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            const res = await axios.get(`${apiUrl}/units`);
            // Tree data might need processing if backend returns flat. 
            // If backend returns tree (findTrees), Antd Table supports 'children' prop automatically.
            setUnits(res.data);
        } catch (error) {
            message.error('Failed to fetch units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleAdd = () => {
        setEditingUnit(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Unit) => {
        setEditingUnit(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await axios.delete(`${apiUrl}/units/${id}`);
            message.success('Deleted unit');
            fetchUnits();
        } catch (error) {
            message.error('Failed to delete');
        }
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            if (editingUnit) {
                await axios.patch(`${apiUrl}/units/${editingUnit.id}`, values);
                message.success('Updated unit');
            } else {
                await axios.post(`${apiUrl}/units`, values);
                message.success('Created unit');
            }
            setIsModalVisible(false);
            fetchUnits();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        { title: 'Mã số', dataIndex: 'code', key: 'code' },
        { title: 'Tên đơn vị', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Unit) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => Modal.confirm({
                        title: 'Xóa đơn vị?',
                        onOk: () => handleDelete(record.id)
                    })} />
                </Space>
            ),
        }
    ];

    // Flatten tree to get options for Parent Select? 
    // Or just use the units list if top-level structure is enough for now.
    // For simplicity, we just dump `units` into select, which works if it's flat or tree (but tree needs nested rendering in select).
    // Let's assume a simplified flat select for parent for now.

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Quản lý Đơn vị (Phòng/Ban/Khoa)</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
            </div>
            <Table
                columns={columns}
                dataSource={units}
                rowKey="id"
                loading={loading}
            // defaultExpandAllRows={true}
            />

            <Modal
                title={editingUnit ? "Cập nhật đơn vị" : "Thêm đơn vị mới"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã đơn vị" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="Tên đơn vị" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                    {/* Parent ID selection could be added here */}
                </Form>
            </Modal>
        </div>
    );
};

export default UnitManager;
