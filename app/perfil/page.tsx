import type { Metadata } from 'next';
import { ProfilePage } from '@/components/profile-page';

export const metadata: Metadata = {
  title: 'Perfil profesional | Abg. Jordy Tamayo',
  description: 'Conozca la formación, enfoque y trayectoria profesional del Abg. Jordy Tamayo en Babahoyo.',
  openGraph: { title: 'Perfil profesional | Abg. Jordy Tamayo', description: 'Formación, criterio y una práctica jurídica cercana.', images: [{ url: '/images/jordy-tamayo-hero.png' }] },
  twitter: { title: 'Perfil profesional | Abg. Jordy Tamayo', description: 'Formación, criterio y una práctica jurídica cercana.', images: [{ url: '/images/jordy-tamayo-hero.png' }] },
};

export default function Perfil() { return <ProfilePage />; }
