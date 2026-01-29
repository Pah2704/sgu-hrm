import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RolesPage from './RolesPage';
import { getRoles, getPermissions } from '../../services/roles.service';
import { vi } from 'vitest';
import React from 'react';

// Mock the services
vi.mock('../../services/roles.service', () => ({
    getRoles: vi.fn(),
    getPermissions: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
}));

// Mock Ant Design components to avoid complex DOM structure issues if needed
// For now, let's try testing with real Antd components but mindful of async behavior.
// Ideally usage of `window.matchMedia` mock is needed for Antd.

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

describe('RolesPage', () => {
    const mockRoles = [
        { id: '1', name: 'Admin', description: 'System Admin', permissions: [], isSystem: true },
        { id: '2', name: 'Editor', description: 'Editor Role', permissions: [], isSystem: false },
    ];

    const mockPermissions = [
        { id: 'p1', action: 'user:view', description: 'View User' },
        { id: 'p2', action: 'user:edit', description: 'Edit User' },
    ];

    beforeEach(() => {
        (getRoles as any).mockResolvedValue(mockRoles);
        (getPermissions as any).mockResolvedValue(mockPermissions);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders list of roles', async () => {
        render(<RolesPage />);

        expect(screen.getByText('Quản lý Vai trò')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('System Admin')).toBeInTheDocument();
            expect(screen.getByText('Editor Role')).toBeInTheDocument();
        });
    });

    it('opens modal on create button click', async () => {
        render(<RolesPage />);

        const createBtn = screen.getByText('Thêm Vai trò');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getByText('Tên vai trò')).toBeInTheDocument(); // Form label
        });
    });
});
