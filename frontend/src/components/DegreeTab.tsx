import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Upload, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { TrainingService, Degree } from '../services/training.service';
import dayjs from 'dayjs';

interface Props {
    employeeId: string;
}

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DegreeTab: React.FC<Props> = ({ employeeId }) => {
    const [data, setData] = useState<Degree[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [degrees, lvls, flds] = await Promise.all([
                TrainingService.getDegrees(employeeId),
                TrainingService.getLevels(),
                TrainingService.getFields(),
            ]);
            setData(degrees);
            setLevels(lvls);
            setFields(flds);
        } catch (error) {
            message.error('Không thể tải dữ liệu văn bằng');
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

    const handleEdit = (record: Degree) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            levelId: record.level?.id,
            fieldId: record.field?.id,
            signDate: record.signDate ? dayjs(record.signDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await TrainingService.deleteDegree(id);
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
                signDate: values.signDate ? values.signDate.format('YYYY-MM-DD') : null,
            };

            if (editingId) {
                await TrainingService.updateDegree(editingId, payload);
                message.success('Cập nhật thành công');
            } else {
                await TrainingService.createDegree(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
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
            title: 'Trình độ',
            dataIndex: ['level', 'name'],
            key: 'level',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'major',
            key: 'major',
        },
        {
            title: 'Cơ sở đào tạo',
            dataIndex: 'institution',
            key: 'institution',
        },
        {
            title: 'Năm TN',
            dataIndex: 'year',
            key: 'year',
        },
        {
            title: 'Xếp loại',
            dataIndex: 'ranking',
            key: 'ranking',
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
            render: (_: any, record: Degree) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa văn bằng này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Văn bằng</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />

            <Modal
                title={editingId ? 'Cập nhật Văn bằng' : 'Thêm mới Văn bằng'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="classification" label="Phân loại" initialValue="Trong nước">
                            <Select>
                                <Option value="Trong nước">Trong nước</Option>
                                <Option value="Nước ngoài">Nước ngoài</Option>
                                <Option value="Liên kết">Liên kết</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="levelId" label="Trình độ" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="children">
                                {levels.map(l => <Option key={l.id} value={l.id}>{l.name} ({l.code})</Option>)}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="fieldId" label="Ngành đào tạo (Bậc cao)">
                            <Select showSearch optionFilterProp="children" allowClear>
                                {fields.map(f => <Option key={f.id} value={f.id}>{f.name} - {f.code}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="major" label="Chuyên ngành" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item name="institution" label="Cơ sở đào tạo" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item name="mode" label="Hình thức" initialValue="Chính quy">
                            <Select>
                                <Option value="Chính quy">Chính quy</Option>
                                <Option value="Tại chức">Tại chức</Option>
                                <Option value="Từ xa">Từ xa</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="year" label="Năm TN">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="ranking" label="Xếp loại">
                            <Select>
                                <Option value="Xuất sắc">Xuất sắc</Option>
                                <Option value="Giỏi">Giỏi</Option>
                                <Option value="Khá">Khá</Option>
                                <Option value="Trung bình">Trung bình</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="degreeNumber" label="Số hiệu văn bằng">
                            <Input />
                        </Form.Item>
                        <Form.Item name="signDate" label="Ngày ký">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="country" label="Quốc gia (nếu nước ngoài)">
                        <Input />
                    </Form.Item>

                    <Form.Item name="scanUrl" label="File Scan Văn bằng" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tải lên Scan" getValueFromEvent={normFile}>
                        <Upload customRequest={handleUpload} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Đính kèm file</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DegreeTab;
