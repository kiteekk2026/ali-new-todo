import SideNav from '@/app/ui/dashboard/sidenav';

// Dashboard pages read live database rows at request time.
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div role="region" aria-label="Dashboard content" tabIndex={0} className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}