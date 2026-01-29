import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Tag, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, Role, Permission } from '../../services/roles.service';

const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<Record<string, Permission[]>>({});

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([getRoles(), getPermissions()]);
            setRoles(rolesData);

            // Group permissions
            const groups: Record<string, Permission[]> = {};
            permissionsData.forEach((p: Permission) => {
                const module = p.action.split(':')[0];
                if (!groups[module]) groups[module] = [];
                groups[module].push(p);
            });
            setPermissionGroups(groups);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRole(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        form.setFieldsValue({
            name: role.name,
            description: role.description,
            permissionIds: role.permissions.map(p => p.id)
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRole(id);
            message.success('Role deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete role');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingRole) {
                await updateRole(editingRole.id, values);
                message.success('Role updated');
            } else {
                await createRole(values);
                message.success('Role created');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (e) {
            // message.error('Failed to save role');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Permissions', dataIndex: 'permissions', key: 'permissions',
            render: (perms: Permission[]) => (
                <Space wrap>
                    {perms.length > 5 ? (
                        <>
                            {perms.slice(0, 5).map(p => <Tag key={p.id}>{p.action}</Tag>)}
                            <Tag>+{perms.length - 5} more</Tag>
                        </>
                    ) : (
                        perms.map(p => <Tag key={p.id}>{p.action}</Tag>)
                    )}
                </Space>
            )
        },
        {
            title: 'Action', key: 'action',
            render: (_: any, record: Role) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    {!record.isSystem && (
                        <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1>Quản lý Vai trò</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Thêm Vai trò
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={roles}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingRole ? "Sửa Vai trò" : "Thêm Vai trò"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên vai trò" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="permissionIds" label="Phân quyền">
                        <Checkbox.Group style={{ width: '100%' }}>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {Object.keys(permissionGroups).map(module => (
                                    <Card size="small" title={module.toUpperCase()} key={module} style={{ marginBottom: 10 }}>
                                        <Row>
                                            {permissionGroups[module].map(p => (
                                                <Col span={8} key={p.id}>
                                                    <Checkbox value={p.id}>{p.action}</Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolesPage;
