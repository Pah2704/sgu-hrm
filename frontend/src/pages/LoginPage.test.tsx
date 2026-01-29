import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import { vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('LoginPage', () => {
    it('renders login form', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText('Tên đăng nhập')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
    });

    it('submits login form', async () => {
        const mockedAxios = axios as any;
        mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } });

        render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Tên đăng nhập'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), {
                username: 'admin',
                password: 'password'
            });
        });
    });
});
