import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, message, Tag, Space } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { getUsers, assignRoles, User } from '../../services/users.service';
import { getRoles, Role } from '../../services/roles.service';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRoles = (user: User) => {
        setSelectedUser(user);
        form.setFieldsValue({
            roleIds: user.roles?.map(r => r.id) || []
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (selectedUser) {
                await assignRoles(selectedUser.id, values.roleIds);
                message.success('Roles assigned successfully');
                setIsModalVisible(false);
                fetchData();
            }
        } catch (e) {
            message.error('Failed to assign roles');
        }
    };

    const columns = [
        { title: 'Username', dataIndex: 'username', key: 'username' },
        {
            title: 'Employee',
            key: 'employee',
            render: (user: User) => (user.employeeId ? 'Linked' : 'Not Linked') // Should show Name if populated
        },
        {
            title: 'Roles',
            key: 'roles',
            render: (user: User) => (
                <Space>
                    {user.roles && user.roles.map(r => <Tag color="blue" key={r.id}>{r.name}</Tag>)}
                </Space>
            )
        },
        {
            title: 'Action', key: 'action',
            render: (_: any, record: User) => (
                <Button icon={<EditOutlined />} onClick={() => handleAssignRoles(record)}>
                    Assign Roles
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <h1>Quản lý Tài khoản & Phân quyền</h1>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={`Phân quyền cho ${selectedUser?.username}`}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="roleIds" label="Vai trò">
                        <Select mode="multiple" placeholder="Chọn vai trò">
                            {roles.map(r => (
                                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UsersPage;
