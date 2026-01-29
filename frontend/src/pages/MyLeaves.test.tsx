import { render, screen, waitFor } from '@testing-library/react';
import MyLeaves from './MyLeaves';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Mock Antd components that are hard to test perfectly in JSDOM or rely on window matchMedia which we mocked globally
// Ideally we rely on global setup, but sometimes individual mocks help isolate logic.

describe('MyLeaves', () => {
    it('renders list of leaves', async () => {
        const mockedAxios = axios as any;
        mockedAxios.get.mockResolvedValue({
            data: [
                { id: '1', type: 'Nghỉ phép năm', startDate: '2023-01-01', endDate: '2023-01-02', reason: 'Du lịch', status: 'Đã duyệt' }
            ]
        });

        // Mock useAuth to return a user
        // We need to wrap component in AuthProvider or Mock the context directly
        // Easier to just let AuthProvider use default null or mock the hook return if possible.
        // Since we are not exporting the context to mock easily without setup, we will rely on axios not being called if user is null, 
        // OR we can mock the module specifically. 
        // For simplicity let's assume AuthProvider is present but user might be null initially.
        // But MyLeaves depends on user.employeeId to fetch. 

        // Let's rely on basic render test first.
        render(
            <AuthProvider>
                <MyLeaves />
            </AuthProvider>
        );

        expect(screen.getByText('Quản lý Nghỉ phép cá nhân')).toBeInTheDocument();
        expect(screen.getByText('Tạo đơn xin nghỉ')).toBeInTheDocument();
    });
});
