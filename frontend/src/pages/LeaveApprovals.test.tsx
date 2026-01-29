import { render, screen } from '@testing-library/react';
import LeaveApprovals from './LeaveApprovals';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('LeaveApprovals', () => {
    it('renders pending leaves table', () => {
        const mockedAxios = axios as any;
        mockedAxios.get.mockResolvedValue({
            data: []
        });

        render(
            <AuthProvider>
                <LeaveApprovals />
            </AuthProvider>
        );

        expect(screen.getByText('Duyệt đơn nghỉ phép (Chờ duyệt)')).toBeInTheDocument();
        expect(screen.getByText('Nhân viên')).toBeInTheDocument();
        expect(screen.getByText('Lý do')).toBeInTheDocument();
    });
});
