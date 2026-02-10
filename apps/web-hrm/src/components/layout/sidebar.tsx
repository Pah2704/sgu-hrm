'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, FileText, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
  { icon: Building2, label: 'Tổ chức', href: '/organizations' },
  { icon: Users, label: 'Nhân sự', href: '/employees' },
  { icon: FileText, label: 'Hợp đồng', href: '/contracts' },
  { icon: Settings, label: 'Cấu hình', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border shadow-xl z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-accent/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
             {/* Abstract Logo Placeholder */}
             <div className="h-full w-full rounded-full bg-[oklch(0.25_0.08_260)]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">SGU HRM</h1>
            <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">Đại Học Sài Gòn</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest">Menu</span>
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white/30 rounded-r-full" />
              )}
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-sidebar-foreground/70 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
        <div className="text-xs text-center text-sidebar-foreground/40 font-mono">
          v1.0.0 (Beta)
        </div>
      </div>
    </aside>
  );
}
