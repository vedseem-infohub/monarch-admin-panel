import { redirect } from 'next/navigation';

export default function RootPage() {
  // Server-side fallback redirect to /admin/dashboard (middleware will intercept if unauthenticated)
  redirect('/admin/dashboard');
}

