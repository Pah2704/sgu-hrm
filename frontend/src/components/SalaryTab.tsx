import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, DatePicker, message, Spin, Card, Row, Col } from 'antd';
import { SalaryService, SalaryProfile } from '../services/salary.service';
import dayjs from 'dayjs';

interface SalaryTabProps {
    employeeId: string;
}

const SalaryTab: React.FC<SalaryTabProps> = ({ employeeId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employeeId) {
            fetchSalaryProfile();
        }
    }, [employeeId]);

    const fetchSalaryProfile = async () => {
        setLoading(true);
        try {
            const data = await SalaryService.getProfile(employeeId);
            if (data) {
                form.setFieldsValue({
                    ...data,
                    startDate: data.startDate ? dayjs(data.startDate) : null,
                });
            }
        } catch (error) {
            // Ignore 404
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await SalaryService.updateProfile(employeeId, {
                ...values,
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
            });
            message.success('Cập nhật thông tin lương thành công');
        } catch (error) {
            message.error('Lỗi cập nhật lương');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Thông tin Lương & Phụ cấp" bordered={false}>
            {loading ? <Spin /> : (
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="civilServantGrade" label="Mã ngạch (Viên chức)">
                                <Input placeholder="Ví dụ: V.07.01.03" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="salaryGrade" label="Bậc lương">
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="coefficient" label="Hệ số lương" rules={[{ required: true }]}>
                                <InputNumber step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="positionAllowance" label="Hệ số Phụ cấp chức vụ">
                                <InputNumber step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="otherAllowance" label="Hệ số Phụ cấp khác">
                                <InputNumber step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="startDate" label="Ngày hưởng">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default SalaryTab;
