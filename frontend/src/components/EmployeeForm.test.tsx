import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import { vi } from 'vitest';
import axios from 'axios';

// Mock axios and window.matchMedia for Ant Design
vi.mock('axios');
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('EmployeeForm', () => {
    it('renders form fields', async () => {
        // Mock units and employee calls to avoid errors
        const mockedAxios = axios as any;
        mockedAxios.get.mockResolvedValue({ data: [] });

        render(
            <BrowserRouter>
                <EmployeeForm />
            </BrowserRouter>
        );

        // Check for tabs
        expect(screen.getByText('A. Thông tin chung')).toBeInTheDocument();
        // Check for fields (Labels might need exact match or regex)
        expect(screen.getByLabelText(/1. Họ và tên khai sinh/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/4. Ngày sinh/i)).toBeInTheDocument();
    });
});
