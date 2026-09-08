import type { Metadata } from 'next';
import { ContactPage } from '@/components/contact-page';

export const metadata: Metadata = {
  title: 'Contacto y citas | Abg. Jordy Tamayo',
  description: 'Solicite una consulta legal presencial en Babahoyo o virtual con el Abg. Jordy Tamayo.',
  openGraph: { title: 'Contacto y citas | Abg. Jordy Tamayo', description: 'Solicite una consulta presencial o virtual.', images: [] },
  twitter: { title: 'Contacto y citas | Abg. Jordy Tamayo', description: 'Solicite una consulta presencial o virtual.', images: [] },
};

export default function Contacto() { return <ContactPage />; }
