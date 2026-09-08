import type { Metadata } from 'next';
import { VitrinaPage } from '@/components/vitrina-page';

export const metadata: Metadata = {
  title: 'Vitrina legal | Abg. Jordy Tamayo',
  description: 'Videos, publicaciones, casos comentados y actualidad jurídica por el Abg. Jordy Tamayo.',
  openGraph: { title: 'Vitrina legal | Abg. Jordy Tamayo', description: 'Casos, ideas y derecho en movimiento.', images: [] },
  twitter: { title: 'Vitrina legal | Abg. Jordy Tamayo', description: 'Casos, ideas y derecho en movimiento.', images: [] },
};

export default function VitrinaLegal() { return <VitrinaPage />; }
