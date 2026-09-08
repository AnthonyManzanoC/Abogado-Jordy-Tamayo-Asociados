import type { Metadata } from 'next';
import { ServicesIndex } from '@/components/services-index';

export const metadata: Metadata = {
  title: 'Servicios legales | Abg. Jordy Tamayo',
  description: 'Conozca las áreas de práctica y servicios legales disponibles en Babahoyo y modalidad virtual.',
  openGraph: { title: 'Servicios legales | Abg. Jordy Tamayo', description: 'Estrategia jurídica clara y atención directa en Babahoyo.', images: [] },
  twitter: { title: 'Servicios legales | Abg. Jordy Tamayo', description: 'Estrategia jurídica clara y atención directa en Babahoyo.', images: [] },
};

export default function ServicesPage() { return <ServicesIndex />; }
