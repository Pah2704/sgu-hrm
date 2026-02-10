'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Eye, RefreshCw } from 'lucide-react';
import { employeesService } from '@/services/employees.service';
import { EmployeeStatus, type Employee } from '@/types/employee';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getStatusBadge = (status: EmployeeStatus) => {
  switch (status) {
    case EmployeeStatus.WORKING:
      return <Badge>Đang công tác</Badge>;
    case EmployeeStatus.ON_LEAVE:
      return <Badge variant="secondary">Nghỉ phép</Badge>;
    case EmployeeStatus.LONG_LEAVE:
      return <Badge variant="secondary">Nghỉ dài hạn</Badge>;
    case EmployeeStatus.RESIGNED:
      return <Badge variant="destructive">Đã nghỉ việc</Badge>;
    case EmployeeStatus.RETIRED:
      return <Badge variant="outline">Đã nghỉ hưu</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getGenderLabel = (gender: Employee['gender']) => {
  if (gender === 'NAM') {
    return 'Nam';
  }

  if (gender === 'NU') {
    return 'Nữ';
  }

  return gender;
};

export default function EmployeesPage() {
  const [search, setSearch] = useState('');

  const query = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
    }),
    [search],
  );

  const { data, error, isLoading, mutate } = useSWR(
    ['employees', query],
    () => employeesService.getAll(query),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh sách nhân sự</h1>
          <p className="text-muted-foreground">Quản lý hồ sơ nhân sự trong hệ thống.</p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tải lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm theo mã viên chức hoặc họ tên.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nhập mã viên chức hoặc họ tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
          <CardDescription>Tổng số: {data?.total ?? 0}</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Không thể tải dữ liệu nhân sự.
            </div>
          ) : null}

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Mã VC</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px] text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length ? (
                  data.data.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.unit?.name ?? '-'}</TableCell>
                      <TableCell>{getGenderLabel(employee.gender)}</TableCell>
                      <TableCell>{new Date(employee.dob).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/employees/${employee.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
