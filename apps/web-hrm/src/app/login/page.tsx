'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

type LoginFormValues = {
  email: string;
  password: string;
};

const getLoginErrorMessage = (error: unknown) => {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return 'Không kết nối được tới API. Kiểm tra backend đang chạy ở cổng 3001.';
    }

    return error.response?.data?.message || error.message || 'Đăng nhập thất bại';
  }

  if (error instanceof Error) {
    return error.message || 'Đăng nhập thất bại';
  }

  return 'Vui lòng kiểm tra lại thông tin';
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user)); // assuming API returns user info
      toast.success('Đăng nhập thành công');
      router.push('/organizations'); // Redirect to Org page for Slice 2
    } catch (error: unknown) {
      console.error(error);
      toast.error('Đăng nhập thất bại', {
        description: getLoginErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập hệ thống HRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sgu.edu.vn"
                required
                {...register('email')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                required
                {...register('password')}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          SGU HRM System v1.0
        </CardFooter>
      </Card>
    </div>
  );
}
