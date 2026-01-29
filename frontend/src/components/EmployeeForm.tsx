import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Upload, Tabs, message, Card } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { EmployeeType, Gender, EmployeeStatus } from '../types/employee';
import { RewardDisciplineType } from '../services/reward-discipline.service';
import ContractManager from './ContractManager';
import SalaryTab from './SalaryTab';
import RewardDisciplineTab from './RewardDisciplineTab';
import DegreeTab from './DegreeTab';
import CertificateTab from './CertificateTab';
import WorkHistoryTab from './WorkHistoryTab';
import FamilyTab from './FamilyTab';

const { TabPane } = Tabs;
const { Option } = Select;

const EmployeeForm: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Fetch Units
        axios.get(`${apiUrl}/units`).then(res => {
            setUnits(res.data);
        }).catch(err => console.error(err));

        if (isEdit) {
            axios.get(`${apiUrl}/employees/${id}`).then(res => {
                const data = res.data;
                if (data.dob) data.dob = dayjs(data.dob);
                // Handle unitId if it comes nested in unit object
                if (data.unit) data.unitId = data.unit.id;
                form.setFieldsValue(data);
            });
        }
    }, [id, isEdit, form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            // Format date for backend
            const payload = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
            };

            if (isEdit) {
                await axios.patch(`${apiUrl}/employees/${id}`, payload);
                message.success('Cập nhật thành công');
                navigate('/employees');
            } else {
                const res = await axios.post(`${apiUrl}/employees`, payload);
                if (values.avatarFile && values.avatarFile.length > 0) {
                    const formData = new FormData();
                    formData.append('file', values.avatarFile[0].originFileObj);
                    await axios.post(`${apiUrl}/employees/${res.data.id}/upload-avatar`, formData);
                }
                message.success('Thêm mới thành công');
                navigate('/employees');
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title={isEdit ? 'Cập nhật hồ sơ' : 'Thêm mới nhân sự'}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="A. Thông tin chung" key="1">
                            <Form.Item name="fullName" label="1. Họ và tên khai sinh (IN HOA)" rules={[{ required: true }]}>
                                <Input style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                            <Form.Item name="unitId" label="Đơn vị công tác" rules={[{ required: true }]}>
                                <Select showSearch optionFilterProp="children">
                                    {units.map((u: any) => (
                                        <Option key={u.id} value={u.id}>{u.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="citizenId" label="Mã định danh (CCCD)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="employeeCode" label="Mã nhân sự" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="dob" label="4. Ngày sinh" rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="gender" label="2. Giới tính" rules={[{ required: true }]}>
                                <Select>
                                    <Option value={Gender.MALE}>Nam</Option>
                                    <Option value={Gender.FEMALE}>Nữ</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="avatarFile"
                                label="Ảnh 4x6"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
                                <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                                    <Button icon={<UploadOutlined />}>Đính kèm ảnh</Button>
                                </Upload>
                            </Form.Item>
                        </TabPane>
                        <TabPane tab="B. Thông tin cá nhân" key="2">
                            <Form.Item name="birthPlace" label="5. Nơi sinh">
                                <Input />
                            </Form.Item>
                            <Form.Item name="hometown" label="7. Quê quán">
                                <Input />
                            </Form.Item>
                            <Form.Item name="currentAddress" label="16. Nơi ở hiện nay">
                                <Input />
                            </Form.Item>
                            {/* Add other fields here */}
                        </TabPane>
                        {isEdit && (
                            <TabPane tab="C. Quản lý Hợp đồng" key="3">
                                <ContractManager employeeId={id || ''} />
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="D. Lương & Phụ cấp" key="4">
                                <SalaryTab employeeId={id || ''} />
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="E. Khen thưởng" key="5">
                                <RewardDisciplineTab employeeId={id || ''} type={RewardDisciplineType.REWARD} />
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="F. Kỷ luật" key="6">
                                <RewardDisciplineTab employeeId={id || ''} type={RewardDisciplineType.DISCIPLINE} />
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="G. Đào tạo" key="7">
                                <Tabs defaultActiveKey="degree" type="card">
                                    <TabPane tab="1. Văn bằng" key="degree">
                                        <DegreeTab employeeId={id || ''} />
                                    </TabPane>
                                    <TabPane tab="2. Chứng chỉ" key="certificate">
                                        <CertificateTab employeeId={id || ''} />
                                    </TabPane>
                                </Tabs>
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="H. Quá trình công tác" key="8">
                                <WorkHistoryTab employeeId={id || ''} />
                            </TabPane>
                        )}
                        {isEdit && (
                            <TabPane tab="I. Quan hệ gia đình" key="9">
                                <FamilyTab employeeId={id || ''} />
                            </TabPane>
                        )}
                    </Tabs>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Lưu hồ sơ
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EmployeeForm;
