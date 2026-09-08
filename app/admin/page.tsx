import type { Metadata } from 'next';
import { AdminCms } from '@/components/admin-cms';

export const metadata: Metadata = {
  title: 'Administración | Jordy Tamayo',
  description: 'Panel privado de gestión de contenidos y consultas.',
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function AdminPage() {
  return <AdminCms />;
}
