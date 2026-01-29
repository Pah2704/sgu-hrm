import React, { useEffect, useState } from 'react';
import { Badge, Popover, List, Button, Typography, Space, Tag, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { NotificationsService, Notification } from '../services/notifications.service';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            // Parallel fetch
            const [list, count] = await Promise.all([
                NotificationsService.getAll(),
                NotificationsService.getUnreadCount()
            ]);
            setNotifications(list);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await NotificationsService.markAsRead(id);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        await NotificationsService.markAllAsRead();
        fetchNotifications();
    };

    const handleItemClick = async (item: Notification) => {
        if (!item.isRead) {
            await handleMarkAsRead(item.id);
        }
        // Navigate logic
        if (item.title.includes('Hợp đồng')) {
            navigate('/reports'); // Ideally open specific tab
        } else if (item.title.includes('lương')) {
            navigate('/reports');
        } else {
            // Default
        }
        setVisible(false);
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>Thông báo</Text>
                <Button type="link" size="small" onClick={handleMarkAllRead}>Đánh dấu đã đọc tất cả</Button>
            </div>
            {notifications.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={notifications}
                    renderItem={item => (
                        <List.Item
                            onClick={() => handleItemClick(item)}
                            style={{
                                cursor: 'pointer',
                                background: item.isRead ? '#fff' : '#e6f7ff',
                                padding: '8px 12px',
                                transition: 'background 0.3s'
                            }}
                            className="notification-item"
                        >
                            <List.Item.Meta
                                avatar={
                                    item.type === 'WARNING' ? <BellOutlined style={{ color: 'red' }} /> :
                                        item.type === 'ALERT' ? <BellOutlined style={{ color: 'orange' }} /> :
                                            <BellOutlined style={{ color: '#1890ff' }} />
                                }
                                title={
                                    <Space>
                                        <Text strong={!item.isRead} style={{ fontSize: 13 }}>{item.title}</Text>
                                        {!item.isRead && <Badge status="processing" />}
                                    </Space>
                                }
                                description={
                                    <div>
                                        <div style={{ fontSize: 12 }}>{item.message}</div>
                                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            visible={visible}
            onVisibleChange={setVisible}
            placement="bottomRight"
        >
            <Badge count={unreadCount} overflowCount={99}>
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
        </Popover>
    );
};

export default NotificationCenter;
