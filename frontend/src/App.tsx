import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { UserOutlined, TeamOutlined, LogoutOutlined, ApartmentOutlined, CheckOutlined, FileExcelOutlined } from '@ant-design/icons';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import LoginPage from './pages/LoginPage';
import UnitManager from './pages/UnitManager';
import MyLeaves from './pages/MyLeaves';
import LeaveApprovals from './pages/LeaveApprovals';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NotificationCenter from './components/NotificationCenter';
import AuditLogs from './pages/AuditLogs';
import RolesPage from './pages/admin/RolesPage';
import UsersPage from './pages/admin/UsersPage';
import AccountPage from './pages/AccountPage';
import { SettingOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Navigation Component
const Navigation: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const getSelectedKey = (pathname: string) => {
        if (pathname === '/') return '0';
        if (pathname.startsWith('/employees')) return '1';
        if (pathname.startsWith('/units')) return '2';
        if (pathname.startsWith('/my-leaves')) return '3';
        if (pathname.startsWith('/leave-approvals')) return '4';
        if (pathname.startsWith('/reports')) return '5';
        if (pathname.startsWith('/audit-logs')) return '6';
        if (pathname.startsWith('/admin/roles')) return 'admin-roles';
        if (pathname.startsWith('/admin/users')) return 'admin-users';
        if (pathname.startsWith('/account')) return '7';
        return '0';
    };

    return (
        <Menu theme="dark" selectedKeys={[getSelectedKey(location.pathname)]} mode="inline">
            <Menu.Item key="0" icon={<ApartmentOutlined />}>
                <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="1" icon={<TeamOutlined />}>
                <Link to="/employees">Hồ sơ nhân sự</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ApartmentOutlined />}>
                <Link to="/units">Đơn vị</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<UserOutlined />}>
                <Link to="/my-leaves">Nghỉ phép của tôi</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<CheckOutlined />}>
                <Link to="/leave-approvals">Duyệt đơn</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<FileExcelOutlined />}>
                <Link to="/reports">Báo cáo</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<CheckOutlined />}>
                <Link to="/audit-logs">Nhật ký</Link>
            </Menu.Item>
            <Menu.SubMenu key="admin" icon={<SettingOutlined />} title="Quản trị">
                <Menu.Item key="admin-roles">
                    <Link to="/admin/roles">Vai trò</Link>
                </Menu.Item>
                <Menu.Item key="admin-users">
                    <Link to="/admin/users">Tài khoản</Link>
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="7" icon={<UserOutlined />}>
                <Link to="/account">Tài khoản</Link>
            </Menu.Item>
            <Menu.Item key="8" icon={<LogoutOutlined />} onClick={logout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );
};

// Main App Component
const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={
                        <Layout style={{ minHeight: '100vh' }}>
                            <Sider collapsible>
                                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                                <Navigation />
                            </Sider>
                            <Layout>
                                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <NotificationCenter />
                                </Header>
                                <Content style={{ margin: '0 16px' }}>
                                    <ProtectedRoute>
                                        <Routes>
                                            <Route path="/employees" element={<EmployeeList />} />
                                            <Route path="/employees/new" element={<EmployeeForm />} />
                                            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
                                            <Route path="/units" element={<UnitManager />} />
                                            <Route path="/my-leaves" element={<MyLeaves />} />
                                            <Route path="/leave-approvals" element={<LeaveApprovals />} />
                                            <Route path="/leave-approvals" element={<LeaveApprovals />} />
                                            <Route path="/reports" element={<Reports />} />
                                            <Route path="/audit-logs" element={<AuditLogs />} />
                                            <Route path="/admin/roles" element={<RolesPage />} />
                                            <Route path="/admin/users" element={<UsersPage />} />
                                            <Route path="/account" element={<AccountPage />} />
                                            <Route path="/" element={<Dashboard />} />
                                        </Routes>
                                    </ProtectedRoute>
                                </Content>
                                <Footer style={{ textAlign: 'center' }}>SGU HRM ©{new Date().getFullYear()}</Footer>
                            </Layout>
                        </Layout>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
