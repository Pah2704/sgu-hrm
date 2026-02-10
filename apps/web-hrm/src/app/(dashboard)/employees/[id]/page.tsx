'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { employeesService } from '@/services/employees.service'; // Ensure this service has getOne method
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ContractsTab } from '@/components/employees/contracts-tab';
import { HistoryTab } from '@/components/employees/history-tab';

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeesService.getOne(employeeId),
    enabled: !!employeeId,
  });

  if (isLoading) {
    return <div className="p-8">Đang tải thông tin nhân sự...</div>;
  }

  if (!employee) {
    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">Không tìm thấy nhân sự</h2>
        <Button variant="outline" asChild>
          <Link href="/employees">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 p-8">
      {/* Header / Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{employee.fullName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{employee.employeeCode}</span>
            <span>•</span>
            <span>{employee.unit?.name}</span>
          </div>
        </div>
        <div className="ml-auto">
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Cập nhật hồ sơ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.avatarUrl || undefined} alt={employee.fullName} />
              <AvatarFallback>{employee.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{employee.fullName}</CardTitle>
            <CardDescription>{employee.jobTitle || 'Chưa định danh'}</CardDescription>
            <Badge variant="outline" className="mt-2">{employee.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span className="text-sm truncate">{employee.email || 'Chưa cập nhật'}</span>
            </div>
            <Separator />
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Điện thoại</span>
              <span className="text-sm">{employee.phone || 'Chưa cập nhật'}</span>
            </div>
            <Separator />
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Ngày sinh</span>
              <span className="text-sm">{new Date(employee.dob).toLocaleDateString('vi-VN')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <div className="md:col-span-3">
          <Tabs defaultValue="overview" className="space-y-4">

            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
              <TabsTrigger value="relationships">Quan hệ gia đình</TabsTrigger>
              <TabsTrigger value="education">Đào tạo & Bồi dưỡng</TabsTrigger>
              <TabsTrigger value="process">Quá trình công tác</TabsTrigger>
              <TabsTrigger value="history">Lịch sử công tác</TabsTrigger>
              <TabsTrigger value="salary">Lương & Phụ cấp</TabsTrigger>
            </TabsList>

            <TabsContent value="contracts" className="mt-6">
              <ContractsTab employeeId={employee.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <HistoryTab employeeId={employee.id} /> {/* Assuming HistoryTab also needs employeeId */}
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">CCCD/CMND</span>
                    <span>{employee.citizenId}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Ngày cấp</span>
                    <span>{employee.citizenCardDate ? new Date(employee.citizenCardDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Nơi cấp</span>
                    <span>{employee.citizenCardPlace || '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Giới tính</span>
                    <span>{employee.gender === 'NAM' ? 'Nam' : 'Nữ'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Dân tộc</span>
                    <span>{employee.ethnicityId || '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Tôn giáo</span>
                    <span>{employee.religionId || '---'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tuyển dụng</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Ngày tuyển dụng lần đầu</span>
                    <span>{employee.initialRecruitmentDate ? new Date(employee.initialRecruitmentDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Cơ quan tuyển dụng</span>
                    <span>{employee.initialRecruitmentAgency || '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Ngày về cơ quan hiện tại</span>
                    <span>{employee.currentOrgJoinDate ? new Date(employee.currentOrgJoinDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Ngày vào biên chế chính thức</span>
                    <span>{employee.officialDate ? new Date(employee.officialDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relationships">
              <Card>
                <CardHeader>
                  <CardTitle>Quan hệ gia đình</CardTitle>
                  <CardDescription>Danh sách người phụ thuộc và quan hệ thân nhân</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Đào tạo & Bồi dưỡng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                </CardContent>
              </Card>
            </TabsContent>

             <TabsContent value="process">
              <Card>
                <CardHeader>
                  <CardTitle>Quá trình công tác</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salary">
              <Card>
                <CardHeader>
                  <CardTitle>Lương & Phụ cấp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
