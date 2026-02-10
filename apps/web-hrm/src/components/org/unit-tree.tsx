'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { TreeUnitDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface UnitTreeProps {
  units: TreeUnitDto[];
  onAdd: (parentId: string) => void;
  onEdit: (unit: TreeUnitDto) => void;
  onDelete: (id: string) => void;
}

function UnitNode({
  node,
  onAdd,
  onEdit,
  onDelete,
}: {
  node: TreeUnitDto;
  onAdd: (id: string) => void;
  onEdit: (u: TreeUnitDto) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-100 group">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-4" />
          )}
          <span className={cn("text-sm font-medium", node.status !== 'ACTIVE' && "text-slate-400 line-through")}>
            {node.name} <span className="text-xs text-muted-foreground font-normal">({node.code})</span>
          </span>
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(node.id)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(node)}>
            <Pencil className="h-3 w-3" />
          </Button>
          {node.children.length === 0 && (
             <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => onDelete(node.id)}>
               <Trash2 className="h-3 w-3" />
             </Button>
          )}
        </div>
      </div>
      
      {hasChildren && (
        <CollapsibleContent className="pl-6 border-l ml-3 border-slate-200">
          {node.children.map((child) => (
            <UnitNode
              key={child.id}
              node={child}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function UnitTree({ units, onAdd, onEdit, onDelete }: UnitTreeProps) {
  if (!units || units.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu đơn vị</div>;
  }

  return (
    <div className="space-y-1">
      {units.map((root) => (
        <UnitNode
          key={root.id}
          node={root}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
