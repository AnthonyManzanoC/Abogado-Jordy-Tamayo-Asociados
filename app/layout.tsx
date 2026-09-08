import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Libre_Franklin } from 'next/font/google';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });
const mono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] });
const editorial = Libre_Franklin({ variable: '--font-editorial', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Abg. Jordy Tamayo | Asesoría legal en Babahoyo',
  description: 'Asesoría y representación legal estratégica en Babahoyo. Atención presencial y virtual.',
  applicationName: 'Jordy Tamayo',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Jordy Tamayo', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  metadataBase: new URL('http://localhost:3002'),
  openGraph: {
    title: 'Abg. Jordy Tamayo | Derecho con criterio y carácter',
    description: 'Asesoría y representación legal estratégica en Babahoyo. Atención presencial y virtual.',
    type: 'website',
    locale: 'es_EC',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Jordy Tamayo — Derecho con criterio y carácter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abg. Jordy Tamayo | Derecho con criterio y carácter',
    description: 'Asesoría y representación legal estratégica en Babahoyo.',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = { themeColor: '#11100e', colorScheme: 'light dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} ${mono.variable} ${editorial.variable} antialiased`}>{children}<PwaRegister /></body>
    </html>
  );
}
