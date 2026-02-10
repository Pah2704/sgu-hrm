'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TreeUnitDto, UnitType, UnitStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  code: z.string().min(1, 'Mã đơn vị là bắt buộc'),
  name: z.string().min(1, 'Tên đơn vị là bắt buộc'),
  shortName: z.string().optional(),
  unitType: z.nativeEnum(UnitType),
  status: z.nativeEnum(UnitStatus).optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});

interface UnitFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TreeUnitDto | null;
  parentId?: string | null;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
}

export function UnitFormModal({
  open,
  onOpenChange,
  initialData,
  parentId,
  onSubmit,
}: UnitFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      shortName: '',
      unitType: UnitType.PHONG,
      status: UnitStatus.ACTIVE,
      parentId: parentId || undefined, // explicit undefined for optional
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        shortName: initialData.shortName || '',
        unitType: initialData.unitType as UnitType,
        status: initialData.status as UnitStatus,
        parentId: initialData.parentId || undefined,
        sortOrder: initialData.sortOrder || 0,
      });
    } else {
      form.reset({
        code: '',
        name: '',
        shortName: '',
        unitType: UnitType.PHONG,
        status: UnitStatus.ACTIVE,
        parentId: parentId || undefined,
        sortOrder: 0,
      });
    }
  }, [initialData, parentId, form, open]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onSubmit(values as any);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Cập nhật thông tin đơn vị.' : 'Tạo mới một đơn vị trong hệ thống.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã đơn vị</FormLabel>
                  <FormControl>
                    <Input placeholder="KHOA_CNTT" {...field} disabled={!!initialData} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đơn vị</FormLabel>
                  <FormControl>
                    <Input placeholder="Khoa Công nghệ thông tin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(UnitType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {initialData && (
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(UnitStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
