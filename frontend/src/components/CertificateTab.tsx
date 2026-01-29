import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Upload, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { TrainingService, Certificate } from '../services/training.service';
import dayjs from 'dayjs';

interface Props {
    employeeId: string;
}

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CertificateTab: React.FC<Props> = ({ employeeId }) => {
    const [data, setData] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await TrainingService.getCertificates(employeeId);
            setData(res);
        } catch (error) {
            message.error('Không thể tải dữ liệu chứng chỉ');
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

    const handleEdit = (record: Certificate) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            issueDate: record.issueDate ? dayjs(record.issueDate) : null,
            expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await TrainingService.deleteCertificate(id);
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
                issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : null,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
            };

            if (editingId) {
                await TrainingService.updateCertificate(editingId, payload);
                message.success('Cập nhật thành công');
            } else {
                await TrainingService.createCertificate(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const url = await TrainingService.uploadFile(file);
            onSuccess(url);
            form.setFieldsValue({ scanUrl: url });
        } catch (err) {
            onError(err);
            message.error('Upload thất bại');
        }
    };

    const columns = [
        {
            title: 'Tên chứng chỉ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag color={type === 'Quốc tế' ? 'blue' : 'green'}>{type}</Tag>
        },
        {
            title: 'Đơn vị cấp',
            dataIndex: 'issuer',
            key: 'issuer',
        },
        {
            title: 'Ngày cấp',
            dataIndex: 'issueDate',
            key: 'issueDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : <span style={{ color: 'green' }}>Vô thời hạn</span>,
        },
        {
            title: 'File',
            dataIndex: 'scanUrl',
            key: 'scanUrl',
            render: (url: string) => url ? <a href={`${API_URL}${url}`} target="_blank" rel="noopener noreferrer"><LinkOutlined /> Xem</a> : '',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Certificate) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa chứng chỉ này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Chứng chỉ</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />

            <Modal
                title={editingId ? 'Cập nhật Chứng chỉ' : 'Thêm mới Chứng chỉ'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="type" label="Phân loại" initialValue="Trong nước">
                        <Select>
                            <Option value="Trong nước">Trong nước</Option>
                            <Option value="Quốc tế">Quốc tế</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="Tên chứng chỉ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="issuer" label="Đơn vị cấp" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="issueDate" label="Ngày cấp">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="expiryDate" label="Ngày hết hạn">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="certificateNumber" label="Số hiệu">
                            <Input />
                        </Form.Item>
                        <Form.Item name="result" label="Kết quả">
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item name="scanUrl" label="File Scan" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tải lên Scan">
                        <Upload customRequest={handleUpload} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Đính kèm file</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CertificateTab;
