import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Form, Input, message, Modal } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AccountPage: React.FC = () => {
    const { user } = useAuth(); // Assuming useAuth provides user info? 
    // Actually AuthContext might only provide token/login/logout.
    // I might need to fetch user profile. 
    // JwtStrategy returns user object, so `user` in context *should* be populated if I updated AuthProvider.
    // I'll check AuthContext later. For now assume I need to fetch "me".

    const [profile, setProfile] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // I don't have a /auth/profile endpoint.
            // But I have /users/:username (if I know username).
            // Or I can add /auth/profile to Backend.
            // For now, let's try to decode token client side or use a new endpoint.
            // Best practice: GET /auth/profile
            // I'll implement GET /auth/profile in Backend AuthController.
            const response = await axios.get(`${API_URL}/auth/profile`, { headers: getAuthHeader() });
            setProfile(response.data);
        } catch (error) {
            // message.error('Failed to load profile');
        }
    };

    const handleChangePassword = async (values: any) => {
        try {
            await axios.post(`${API_URL}/auth/change-password`, values, { headers: getAuthHeader() });
            message.success('Password changed successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to change password');
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Tài khoản của tôi</h1>
            <Card title="Thông tin cá nhân" extra={<Button onClick={() => setIsModalVisible(true)}>Đổi mật khẩu</Button>}>
                {profile ? (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên đăng nhập">{profile.username}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{profile.roles?.map((r: any) => r.name).join(', ') || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Nhân viên liên kết">{profile.employee?.fullName || 'Chưa liên kết'}</Descriptions.Item>
                    </Descriptions>
                ) : (
                    <p>Loading...</p>
                )}
            </Card>

            <Modal
                title="Đổi mật khẩu"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountPage;
