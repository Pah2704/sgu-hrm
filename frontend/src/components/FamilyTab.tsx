import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm, Select, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FamilyService, FamilyMember } from '../services/family.service';

interface Props {
    employeeId: string;
}

const { Option } = Select;

const FamilyTab: React.FC<Props> = ({ employeeId }) => {
    const [data, setData] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [isOtherOrg, setIsOtherOrg] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await FamilyService.getAllByEmployee(employeeId);
            setData(res);
        } catch (error) {
            message.error('Không thể tải dữ liệu gia đình');
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
        setIsOtherOrg(false);
        setIsModalVisible(true);
    };

    const handleEdit = (record: FamilyMember) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
        });

        // Check if political org is custom
        const commonOrgs = ['Đảng Cộng sản Việt Nam', 'Đoàn TNCS Hồ Chí Minh', 'Công đoàn', 'Hội Cựu chiến binh', 'Hội Phụ nữ', 'Không'];
        if (record.politicalOrganization && !commonOrgs.includes(record.politicalOrganization)) {
            form.setFieldsValue({ orgSelect: 'Khác', politicalOrganization: record.politicalOrganization });
            setIsOtherOrg(true);
        } else {
            form.setFieldsValue({ orgSelect: record.politicalOrganization || 'Không' });
            setIsOtherOrg(false);
        }

        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await FamilyService.delete(id);
            message.success('Xóa thành công');
            fetchData();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            let finalOrg = values.orgSelect;
            if (values.orgSelect === 'Khác') {
                finalOrg = values.politicalOrganization;
            }

            const payload = {
                ...values,
                employeeId,
                politicalOrganization: finalOrg,
            };

            if (editingId) {
                await FamilyService.update(editingId, payload);
                message.success('Cập nhật thành công');
            } else {
                await FamilyService.create(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const onOrgChange = (value: string) => {
        setIsOtherOrg(value === 'Khác');
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text: string) => <b>{text}</b>
        },
        {
            title: 'Quan hệ',
            dataIndex: 'relation',
            key: 'relation',
        },
        {
            title: 'Năm sinh',
            dataIndex: 'birthYear',
            key: 'birthYear',
        },
        {
            title: 'Nghề nghiệp / Nơi làm',
            dataIndex: 'job',
            key: 'job',
        },
        {
            title: 'Địa chỉ & Quê quán',
            key: 'address',
            render: (_: any, record: FamilyMember) => (
                <div>
                    {record.address && <div>ĐC: {record.address}</div>}
                    {record.hometown && <div style={{ color: 'gray' }}>Quê: {record.hometown}</div>}
                </div>
            )
        },
        {
            title: 'Tổ chức CT-XH',
            key: 'political',
            render: (_: any, record: FamilyMember) => (
                <div>
                    {record.politicalOrganization && record.politicalOrganization !== 'Không' && (
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{record.politicalOrganization}</div>
                            {record.politicalPosition && <div>({record.politicalPosition})</div>}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: FamilyMember) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa người này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Người thân</Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingId ? 'Cập nhật Người thân' : 'Thêm Người thân'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="relation" label="Mối quan hệ" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children">
                                    <Option value="Vợ (chồng)">Vợ (chồng)</Option>
                                    <Option value="Con">Con</Option>
                                    <Option value="Cha đẻ">Cha đẻ</Option>
                                    <Option value="Mẹ đẻ">Mẹ đẻ</Option>
                                    <Option value="Cha vợ (chồng)">Cha vợ (chồng)</Option>
                                    <Option value="Mẹ vợ (chồng)">Mẹ vợ (chồng)</Option>
                                    <Option value="Anh ruột">Anh ruột</Option>
                                    <Option value="Chị ruột">Chị ruột</Option>
                                    <Option value="Em ruột">Em ruột</Option>
                                    <Option value="Anh ruột bên vợ (chồng)">Anh ruột bên vợ (chồng)</Option>
                                    <Option value="Chị ruột bên vợ (chồng)">Chị ruột bên vợ (chồng)</Option>
                                    <Option value="Em ruột bên vợ (chồng)">Em ruột bên vợ (chồng)</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="birthYear" label="Năm sinh">
                                <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="job" label="Nghề nghiệp / Nơi làm việc">
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="address" label="Nơi ở hiện nay">
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="hometown" label="Quê quán">
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
                        <span style={{ fontWeight: 'bold' }}>Tham gia Tổ chức Chính trị - Xã hội</span>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={12}>
                                <Form.Item name="orgSelect" label="Tên tổ chức" initialValue="Không">
                                    <Select onChange={onOrgChange}>
                                        <Option value="Không">Không</Option>
                                        <Option value="Đảng Cộng sản Việt Nam">Đảng Cộng sản Việt Nam</Option>
                                        <Option value="Đoàn TNCS Hồ Chí Minh">Đoàn TNCS Hồ Chí Minh</Option>
                                        <Option value="Công đoàn">Công đoàn</Option>
                                        <Option value="Hội Cựu chiến binh">Hội Cựu chiến binh</Option>
                                        <Option value="Hội Phụ nữ">Hội Phụ nữ</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            {isOtherOrg && (
                                <Col span={12}>
                                    <Form.Item name="politicalOrganization" label="Nhập tên tổ chức">
                                        <Input />
                                    </Form.Item>
                                </Col>
                            )}
                            <Col span={12}>
                                <Form.Item name="politicalPosition" label="Chức vụ (nếu có)">
                                    <Input placeholder="Ví dụ: Đảng viên, Bí thư..." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default FamilyTab;
