'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import useSWR from 'swr';
import api from '@/lib/api';

const decisionSchema = z.object({
  positionId: z.string().min(1, 'Vui lòng chọn chức vụ'),
  decisionNo: z.string().optional(),
  decisionDate: z.string().optional(),
  appointDate: z.string().min(1, 'Ngày bổ nhiệm là bắt buộc'),
  endDate: z.string().optional(), // For manual closing
  isPrimary: z.boolean().default(false),
  documentUrl: z.string().optional(),
});

type DecisionFormValues = z.infer<typeof decisionSchema>;

interface DecisionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  decision?: any; // If editing
  onSuccess: () => void;
}

export function DecisionFormModal({ open, onOpenChange, employeeId, decision, onSuccess }: DecisionFormModalProps) {
  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      positionId: '',
      decisionNo: '',
      decisionDate: '',
      appointDate: '',
      isPrimary: false,
      documentUrl: '',
    },
  });

  // Fetch positions master data
  const { data: positions } = useSWR('/positions', (url) => api.get(url).then(res => res.data));

  useEffect(() => {
    if (open) {
      form.reset({
        positionId: decision?.positionId || '',
        decisionNo: decision?.decisionNo || '',
        decisionDate: decision?.decisionDate ? new Date(decision.decisionDate).toISOString().split('T')[0] : '',
        appointDate: decision?.appointDate ? new Date(decision.appointDate).toISOString().split('T')[0] : '',
        endDate: decision?.endDate ? new Date(decision.endDate).toISOString().split('T')[0] : '',
        isPrimary: decision?.isPrimary || false,
        documentUrl: decision?.documentUrl || '',
      });
    }
  }, [open, decision, form]);

  const onSubmit = async (data: DecisionFormValues) => {
    try {
      const payload = {
        ...data,
        employeeId,
        appointDate: new Date(data.appointDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null, // Handle reset
        decisionDate: data.decisionDate ? new Date(data.decisionDate).toISOString() : undefined,
      };

      if (decision) {
        await api.patch(`/decisions/${decision.id}`, payload);
        toast.success('Cập nhật quyết định thành công');
      } else {
        await api.post('/decisions', payload);
        toast.success('Bổ nhiệm thành công');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Có lỗi xảy ra', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{decision ? 'Cập nhật Quyết định' : 'Bổ nhiệm / Điều động'}</DialogTitle>
          <DialogDescription>
            Nhập thông tin quyết định bổ nhiệm nhân sự.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chức vụ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chức vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions?.map((pos: any) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name} ({pos.code})
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
                name="appointDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bổ nhiệm (Hiệu lực)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="decisionNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số Quyết định</FormLabel>
                    <FormControl>
                      <Input placeholder="123/QĐ-ĐHSG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decisionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày ký</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link văn bản (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Sau này sẽ thay bằng upload file trực tiếp.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Là chức vụ chính (Primary)
                    </FormLabel>
                    <FormDescription>
                      Nếu chọn, hệ thống sẽ tự động đóng kết thúc chức vụ chính cũ (nếu có).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {decision && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc (Thôi giữ chức vụ)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Để trống nếu vẫn đang đương nhiệm.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu quyết định</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
