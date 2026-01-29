import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, WarningOutlined } from '@ant-design/icons';
import { RewardDisciplineService, RewardDiscipline, RewardDisciplineType } from '../services/reward-discipline.service';
import dayjs from 'dayjs';

interface Props {
    employeeId: string;
    type?: RewardDisciplineType; // Optional: If provided, this component manages only this type
}

const { Option } = Select;

const RewardDisciplineTab: React.FC<Props> = ({ employeeId, type }) => {
    const [data, setData] = useState<RewardDiscipline[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await RewardDisciplineService.getAllByEmployee(employeeId, type);
            setData(res);
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchData();
        }
    }, [employeeId, type]);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        if (type) {
            form.setFieldsValue({ type });
        }
        setIsModalVisible(true);
    };

    const handleEdit = (record: RewardDiscipline) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            decisionDate: record.decisionDate ? dayjs(record.decisionDate) : null,
            signDate: record.signDate ? dayjs(record.signDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await RewardDisciplineService.delete(id);
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
                decisionDate: values.decisionDate ? values.decisionDate.format('YYYY-MM-DD') : null,
                signDate: values.signDate ? values.signDate.format('YYYY-MM-DD') : null,
            };

            if (editingId) {
                await RewardDisciplineService.update(editingId, payload);
                message.success('Cập nhật thành công');
            } else {
                await RewardDisciplineService.create(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        // Only show Type column if not filtering by specific type
        ...(!type ? [{
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (t: string) => (
                <Tag color={t === RewardDisciplineType.REWARD ? 'green' : 'red'}>
                    {t === RewardDisciplineType.REWARD ? 'Khen thưởng' : 'Kỷ luật'}
                </Tag>
            ),
        }] : []),
        {
            title: 'Số quyết định',
            dataIndex: 'decisionNumber',
            key: 'decisionNumber',
        },
        {
            title: 'Ngày quyết định',
            dataIndex: 'decisionDate',
            key: 'decisionDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Nội dung / Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Hình thức',
            dataIndex: 'form',
            key: 'form',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: RewardDiscipline) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getTitle = () => {
        if (type === RewardDisciplineType.REWARD) return 'Khen thưởng';
        if (type === RewardDisciplineType.DISCIPLINE) return 'Kỷ luật';
        return 'Quyết định';
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm {getTitle()}
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingId ? `Cập nhật ${getTitle()}` : `Thêm mới ${getTitle()}`}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    {!type && (
                        <Form.Item name="type" label="Loại quyết định" rules={[{ required: true }]}>
                            <Select>
                                <Option value={RewardDisciplineType.REWARD}>Khen thưởng</Option>
                                <Option value={RewardDisciplineType.DISCIPLINE}>Kỷ luật</Option>
                            </Select>
                        </Form.Item>
                    )}
                    {/* Hidden field for type if fixed */}
                    {type && <Form.Item name="type" hidden><Input /></Form.Item>}

                    <Form.Item name="decisionNumber" label="Số quyết định" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="decisionDate" label="Ngày quyết định" rules={[{ required: true }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="reason" label="Nội dung / Lý do" rules={[{ required: true }]}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="form" label="Hình thức (VD: Giấy khen, Tiền mặt / Khiển trách)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="signer" label="Người ký">
                        <Input />
                    </Form.Item>
                    <Form.Item name="signDate" label="Ngày ký">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RewardDisciplineTab;
