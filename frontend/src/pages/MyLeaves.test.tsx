import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import MyLeaves from './MyLeaves';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'user-1', employeeId: 'emp-123' },
        token: 'fake-token'
    }),
    AuthProvider: ({ children }: any) => <>{children}</>
}));

describe('MyLeaves', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders list of leaves fetched from API', async () => {
        const mockedAxios = axios as any;
        mockedAxios.get.mockResolvedValue({
            data: [
                { id: '1', type: 'Nghỉ phép năm', startDate: '2023-01-01', endDate: '2023-01-02', reason: 'Du lịch hè', status: 'Đã duyệt' }
            ]
        });

        render(<MyLeaves />);

        expect(screen.getByText('Quản lý Nghỉ phép cá nhân')).toBeInTheDocument();

        // Wait for data to appear
        await waitFor(() => {
            expect(screen.getByText('Du lịch hè')).toBeInTheDocument(); // Reason
            expect(screen.getByText('Nghỉ phép năm')).toBeInTheDocument(); // Type
            expect(screen.getByText('Đã duyệt')).toBeInTheDocument(); // Status
        });

        // Verify API was called with correct ID
        expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/leaves?employeeId=emp-123'));
    });
});
