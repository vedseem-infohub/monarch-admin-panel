import React, { Suspense } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayoutShell>
        <Suspense fallback={null}>{children}</Suspense>
      </AdminLayoutShell>
    </AdminGuard>
  );
}
