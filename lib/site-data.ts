export type SiteProfile = {
  id: number;
  brandName: string;
  fullName: string;
  credentials: string;
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  bioTitle: string;
  bioBody: string;
  socialProof: string;
  socialProofLabel: string;
  metricOneValue: string;
  metricOneLabel: string;
  metricTwoValue: string;
  metricTwoLabel: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  officeBuildingImageUrl: string;
  whatsAppNumber: string;
  email: string;
  phone: string;
  tikTokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  heroImageUrl: string;
  portraitImageUrl: string;
  degreeImageUrl: string;
  updatedAt?: string;
};

export type LegalService = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  accent: string;
  galleryImageUrls: string[];
  isFeatured: boolean;
  displayOrder: number;
  active: boolean;
};

export type MediaPost = {
  id: string;
  platform: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  category: string;
  displayOrder: number;
  active: boolean;
};

export type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  legalArea: string;
  consultationType: string;
  preferredDate?: string;
  message: string;
  status: string;
  trackingToken: string;
  appointmentStatus: string;
  paymentStatus: string;
  paymentProofUrl: string;
  paymentNotes: string;
  publicNotes: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicSite = { profile: SiteProfile; services: LegalService[]; mediaPosts: MediaPost[] };

export type CreateLeadResponse = {
  id: string;
  trackingToken: string;
  trackingUrl: string;
  status: string;
  paymentStatus: string;
  message: string;
};

export type LeadTracking = {
  id: string;
  trackingToken: string;
  name: string;
  legalArea: string;
  consultationType: string;
  preferredDate?: string;
  status: string;
  appointmentStatus: string;
  paymentStatus: string;
  paymentProofUrl: string;
  publicNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettings = {
  enabled: boolean;
  provider: string;
  adminEmail: string;
  senderName: string;
  senderEmail: string;
  hasBrevoApiKey: boolean;
  brevoApiKey?: string;
  updatedAt?: string;
};

export const defaultProfile: SiteProfile = {
  id: 1,
  brandName: 'Jordy Tamayo',
  fullName: 'Abg. Jordy Tamayo',
  credentials: 'Abogado · Máster',
  eyebrow: 'Estrategia legal · Babahoyo',
  heroTitle: 'Derecho con',
  heroAccent: 'criterio y carácter.',
  heroDescription: 'Asesoría jurídica cercana, estratégica y directa. Cada caso merece una defensa preparada para avanzar con claridad.',
  bioTitle: 'Preparación que se convierte en estrategia.',
  bioBody: 'Una práctica jurídica moderna, construida sobre estudio constante, análisis riguroso y una comunicación clara con cada cliente. Jordy Tamayo combina formación de cuarto nivel con una presencia digital que acerca el derecho a miles de personas.',
  socialProof: '200K+',
  socialProofLabel: 'comunidad en TikTok',
  metricOneValue: '01',
  metricOneLabel: 'estrategia para cada caso',
  metricTwoValue: '360°',
  metricTwoLabel: 'visión legal',
  addressLine1: 'Edificio Alavama',
  addressLine2: 'Calle Sucre y Av. 5 de Junio',
  city: 'Babahoyo, Los Ríos',
  googleMapsUrl: 'https://maps.google.com/?q=Edificio+Alavama+Babahoyo',
  googleMapsEmbedUrl: 'https://www.google.com/maps?q=Edificio%20Alavama%20Babahoyo&output=embed',
  officeBuildingImageUrl: '/images/jordy-tamayo-office.png',
  whatsAppNumber: '',
  email: 'contacto@jordytamayo.ec',
  phone: '',
  tikTokUrl: 'https://www.tiktok.com/@jordytamayo',
  instagramUrl: 'https://www.instagram.com/jordytamayo28',
  facebookUrl: 'https://www.facebook.com/share/19PQUeXhoj/',
  heroImageUrl: '/images/trayectoria/principal.webp',
  portraitImageUrl: '/images/trayectoria/despacho.webp',
  degreeImageUrl: '/images/jordy-tamayo-maestria.png',
};

export const defaultServices: LegalService[] = [
  { id: 'penal', slug: 'derecho-penal', name: 'Derecho penal', shortDescription: 'Defensa técnica, inmediata y estratégica en cada etapa del proceso.', longDescription: 'Acompañamiento integral desde la primera consulta, análisis de riesgos, diseño de la teoría del caso y representación durante todo el proceso penal.', icon: 'Shield', accent: '01', galleryImageUrls: ['/images/services/penal-1.webp', '/images/services/penal-2.webp', '/images/services/penal-3.webp', '/images/services/penal-4.webp'], isFeatured: true, displayOrder: 1, active: true },
  { id: 'familia', slug: 'derecho-familia', name: 'Familia', shortDescription: 'Soluciones humanas y firmes para decisiones que cambian la vida.', longDescription: 'Asesoría en divorcios, alimentos, tenencia, régimen de visitas y acuerdos familiares, con claridad jurídica y sensibilidad personal.', icon: 'Users', accent: '02', galleryImageUrls: ['/images/services/familia-1.webp', '/images/services/familia-2.webp', '/images/services/familia-3.webp', '/images/services/familia-4.webp'], isFeatured: true, displayOrder: 2, active: true },
  { id: 'civil', slug: 'derecho-civil', name: 'Civil y contratos', shortDescription: 'Prevención de conflictos y defensa de sus derechos patrimoniales.', longDescription: 'Redacción y revisión de contratos, obligaciones, cobros, propiedad y controversias civiles con una visión preventiva y práctica.', icon: 'FileText', accent: '03', galleryImageUrls: ['/images/services/civil-1.webp', '/images/services/civil-2.webp', '/images/services/civil-3.webp', '/images/services/civil-4.webp'], isFeatured: true, displayOrder: 3, active: true },
  { id: 'transito', slug: 'transito', name: 'Tránsito', shortDescription: 'Respuesta ágil ante accidentes, citaciones y procedimientos.', longDescription: 'Defensa y asesoría en infracciones, accidentes de tránsito, impugnaciones y procedimientos administrativos o judiciales.', icon: 'Car', accent: '04', galleryImageUrls: ['/images/services/transito-1.webp', '/images/services/transito-2.webp', '/images/services/transito-3.webp', '/images/services/transito-4.webp'], isFeatured: true, displayOrder: 4, active: true },
];

export const defaultMedia: MediaPost[] = [
  { id: 'tiktok', platform: 'TikTok', title: 'Criterio legal en lenguaje claro', url: 'https://www.tiktok.com/@jordytamayo', thumbnailUrl: '/images/jordy-tamayo-hero.png', caption: 'Análisis, actualidad y educación jurídica para una comunidad de más de 200K personas.', category: 'Comunidad', displayOrder: 1, active: true },
  { id: 'instagram', platform: 'Instagram', title: 'Detrás de cada caso', url: 'https://www.instagram.com/jordytamayo28', thumbnailUrl: '/images/jordy-tamayo-office.png', caption: 'Contenido profesional, experiencias y una mirada cercana a la práctica del derecho.', category: 'Práctica legal', displayOrder: 2, active: true },
  { id: 'facebook', platform: 'Facebook', title: 'Actualidad jurídica', url: 'https://www.facebook.com/share/19PQUeXhoj/', thumbnailUrl: '/images/jordy-tamayo-maestria.png', caption: 'Información útil y contacto directo con la comunidad de Babahoyo.', category: 'Actualidad', displayOrder: 3, active: true },
];

const professionalPhotos: MediaPost[] = [
  ['estudio', 'La estrategia empieza aquí', 'Práctica profesional'],
  ['despacho', 'Una atención cercana', 'El despacho'],
  ['ceremonia', 'Un paso más en la formación', 'Formación académica'],
  ['asamblea', 'Una mirada institucional', 'Trayectoria'],
  ['graduacion', 'Formación compartida', 'Formación académica'],
  ['posgrado', 'El valor de seguir aprendiendo', 'Formación académica'],
  ['cercania', 'El lado humano del despacho', 'El despacho'],
  ['territorio', 'Presencia en territorio', 'Práctica profesional'],
  ['encuentro', 'Momentos de una trayectoria', 'Trayectoria'],
  ['archivo-5504', 'Una meta cumplida', 'Formación académica'],
  ['archivo-5428', 'Recuerdos de posgrado', 'Formación académica'],
  ['archivo-7422', 'Ejercicio profesional', 'Práctica profesional'],
  ['archivo-6814', 'Desde el despacho', 'El despacho'],
].map(([file, title, category], index) => ({ id: `photo-${file}`, platform: 'Fotografía', title, category, caption: '', url: `/images/trayectoria/${file}.webp`, thumbnailUrl: `/images/trayectoria/${file}.webp`, displayOrder: index + 1, active: true }));

export const defaultSite: PublicSite = { profile: defaultProfile, services: defaultServices, mediaPosts: [...defaultMedia, ...professionalPhotos] };

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  provider: 'Brevo',
  adminEmail: 'janthonymc09@gmail.com',
  senderName: 'Jordy Tamayo & Asociados',
  senderEmail: 'janthonymc09@gmail.com',
  hasBrevoApiKey: false,
};
