'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { TreeUnitDto } from '@/types';
import UnitTree from '@/components/org/unit-tree';
import { UnitFormModal } from '@/components/org/unit-form-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get(url).then((res) => res.data);
type UnitFormValues = {
  code: string;
  name: string;
  shortName?: string;
  unitType: string;
  status?: string;
  parentId?: string;
  sortOrder?: number;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export default function OrganizationsPage() {
  const { data, error, isLoading } = useSWR<TreeUnitDto[]>('/units', fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<TreeUnitDto | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const handleAdd = (pId?: string) => {
    setSelectedUnit(null);
    setParentId(pId || null);
    setIsModalOpen(true);
  };

  const handleEdit = (unit: TreeUnitDto) => {
    setSelectedUnit(unit);
    setParentId(unit.parentId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      if (selectedUnit) {
        await api.patch(`/units/${selectedUnit.id}`, values);
        toast.success('Cáº­p nháº­t Ä‘Æ¡n vá»‹ thÃ nh cÃ´ng');
      } else {
        await api.post('/units', { ...values, parentId: parentId || undefined });
        toast.success('ThÃªm Ä‘Æ¡n vá»‹ thÃ nh cÃ´ng');
      }
      mutate('/units');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Luu don vi that bai', {
        description: getApiErrorMessage(err, 'Khong the luu don vi'),
      });
      throw err; // Re-throw to keep modal open if needed, but handled here
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a Ä‘Æ¡n vá»‹ nÃ y?')) return;
    try {
      await api.delete(`/units/${id}`);
      toast.success('XÃ³a Ä‘Æ¡n vá»‹ thÃ nh cÃ´ng');
      mutate('/units');
    } catch (err: unknown) {
      toast.error('Xoa don vi that bai', {
        description: getApiErrorMessage(err, 'Khong the xoa don vi'),
      });
    }
  };

  if (error) return <div className="p-6 text-red-500">Lá»—i táº£i dá»¯ liá»‡u: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tá»• chá»©c nhÃ¢n sá»±</h1>
          <p className="text-muted-foreground">Quáº£n lÃ½ cÆ¡ cáº¥u tá»• chá»©c vÃ  Ä‘Æ¡n vá»‹ trá»±c thuá»™c.</p>
        </div>
        <Button onClick={() => handleAdd()}>
          <Plus className="mr-2 h-4 w-4" /> ThÃªm Ä‘Æ¡n vá»‹ má»›i
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CÃ¢y sÆ¡ Ä‘á»“ tá»• chá»©c</CardTitle>
          <CardDescription>
            Hiá»ƒn thá»‹ cáº¥u trÃºc phÃ²ng ban, khoa, trung tÃ¢m.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Äang táº£i...</div>
          ) : (
             <UnitTree 
              units={data || []} 
              onAdd={handleAdd} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <UnitFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={selectedUnit}
        parentId={parentId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

