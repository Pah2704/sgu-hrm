import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import AuthGuard from '@/components/helpers/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 lg:flex-row">
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
