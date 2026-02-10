'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeesService } from '@/services/employees.service';
import { Employee, Gender } from '@/types/employee';
import { useQueryClient } from '@tanstack/react-query';

const employeeSchema = z.object({
  employeeCode: z.string().min(1, 'Mã viên chức là bắt buộc'),
  citizenId: z.string().min(9, 'CCCD phải có ít nhất 9 số'),
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  dob: z.string().min(1, 'Ngày sinh là bắt buộc'), // YYYY-MM-DD
  gender: z.nativeEnum(Gender),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().optional(),
  unitId: z.string().min(1, 'Đơn vị là bắt buộc'),
  officialDate: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee | null;
}

export function EmployeeFormModal({ open, onOpenChange, employeeToEdit }: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!employeeToEdit;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: '',
      citizenId: '',
      fullName: '',
      dob: '',
      gender: Gender.MALE,
      email: '',
      phone: '',
      unitId: '', // Ideally fetch this from a Unit Select component or pass default
      officialDate: '',
    },
  });

  useEffect(() => {
    if (employeeToEdit) {
      form.reset({
        employeeCode: employeeToEdit.employeeCode,
        citizenId: employeeToEdit.citizenId,
        fullName: employeeToEdit.fullName,
        dob: employeeToEdit.dob ? new Date(employeeToEdit.dob).toISOString().split('T')[0] : '',
        gender: employeeToEdit.gender,
        email: employeeToEdit.email || '',
        phone: employeeToEdit.phone || '',
        unitId: employeeToEdit.unitId,
        officialDate: undefined, // Need to handle date parsing if it exists
      });
    } else {
      form.reset({
        employeeCode: '',
        citizenId: '',
        fullName: '',
        dob: '',
        gender: Gender.MALE,
        email: '',
        phone: '',
        unitId: '',
        officialDate: '',
      });
    }
  }, [employeeToEdit, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (isEditing && employeeToEdit) {
        await employeesService.update(employeeToEdit.id, values);
        toast.success('Cập nhật nhân sự thành công');
      } else {
        await employeesService.create(values);
        toast.success('Thêm mới nhân sự thành công');
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onOpenChange(false);
    } catch (error: unknown) {
      if (isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || error.message);
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Cập nhật hồ sơ nhân sự' : 'Thêm mới nhân sự'}</DialogTitle>
          <DialogDescription>
            Nhập các thông tin cơ bản. Tài khoản người dùng sẽ được tạo tự động nếu có Email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã viên chức <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Vd: VC001" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="citizenId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CCCD/CMND <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="079..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="NGUYỄN VĂN A" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>Nam</SelectItem>
                        <SelectItem value={Gender.FEMALE}>Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị quản lý <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID đơn vị tạm thời (Sẽ thay bằng TreeSelect)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Tạo tài khoản)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@sgu.edu.vn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="090..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-brand-cyan hover:bg-brand-cyan/90">
                {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
