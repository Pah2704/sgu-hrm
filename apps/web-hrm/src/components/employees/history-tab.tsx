'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {  
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { DecisionFormModal } from './decision-form-modal';
import api from '@/lib/api';
import { format } from 'date-fns';

export function HistoryTab() {
  const params = useParams();
  const employeeId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null); // For edit

  // Fetch history
  const { data: decisions, error, mutate } = useSWR(
    employeeId ? `/employees/${employeeId}/decisions` : null,
    (url) => api.get(url).then((res) => res.data)
  );

  const getStatusBadge = (decision: any) => {
    if (!decision.endDate) {
      return <Badge className="bg-green-500">Đương nhiệm</Badge>;
    }
    return <Badge variant="secondary">Đã kết thúc</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quá trình công tác</CardTitle>
          <Button onClick={() => { setSelectedDecision(null); setIsModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Bổ nhiệm / Điều động
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Chức vụ / Đơn vị</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tài liệu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!decisions ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Đang tải...</TableCell>
                </TableRow>
              ) : decisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Chưa có lịch sử công tác
                  </TableCell>
                </TableRow>
              ) : (
                decisions.map((decision: any) => (
                  <TableRow key={decision.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedDecision(decision); setIsModalOpen(true); }}>
                    <TableCell className="font-medium">
                      {format(new Date(decision.appointDate), 'dd/MM/yyyy')}
                      {' - '}
                      {decision.endDate ? format(new Date(decision.endDate), 'dd/MM/yyyy') : 'Nay'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {decision.position?.name || 'Không xác định'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {decision.isPrimary ? '(Chức vụ chính)' : '(Kiêm nhiệm)'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {decision.decisionNo || '-'}
                      {decision.decisionDate && (
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(decision.decisionDate), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(decision)}</TableCell>
                    <TableCell className="text-right">
                      {decision.documentUrl && (
                        <a 
                          href={decision.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()} // Prevent row click
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DecisionFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        employeeId={employeeId}
        decision={selectedDecision}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
