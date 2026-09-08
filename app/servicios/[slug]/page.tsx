import type { Metadata } from 'next';
import { ServiceDetail } from '@/components/service-detail';
import { defaultServices } from '@/lib/site-data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = defaultServices.find((item) => item.slug === slug);
  const title = service ? `${service.name} | Abg. Jordy Tamayo` : 'Servicios legales | Abg. Jordy Tamayo';
  const description = service?.shortDescription ?? 'Asesoría legal estratégica en Babahoyo.';
  return { title, description, openGraph: { title, description, images: [] }, twitter: { title, description, images: [] } };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
