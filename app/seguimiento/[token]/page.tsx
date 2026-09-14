import type { Metadata } from 'next';
import { RequestTracking } from '@/components/request-tracking';

export const metadata: Metadata = {
  title: 'Seguimiento de solicitud | Abg. Jordy Tamayo',
  description: 'Revise el estado de su solicitud legal y suba comprobantes para consultas virtuales.',
};

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RequestTracking token={token} />;
}
