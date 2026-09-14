'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Car, FileText, Landmark, Scale, Shield, Users, type LucideIcon } from 'lucide-react';
import { PageCta, PageEyebrow, PageFrame } from '@/components/interior-shell';
import { ServiceGalleryBackground } from '@/components/service-gallery';
import { apiFetch } from '@/lib/api';
import { defaultSite, type PublicSite } from '@/lib/site-data';

const icons: Record<string, LucideIcon> = { Shield, Users, FileText, Car, Scale, Landmark, BriefcaseBusiness };

export function ServicesIndex() {
  const [site, setSite] = useState<PublicSite>(defaultSite);
  useEffect(() => { apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined); }, []);

  return (
    <PageFrame active="/servicios" profile={site.profile} site={site}>
      <section className="relative overflow-hidden bg-[#11100e] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
        <div className="hero-grid absolute inset-y-0 right-0 w-[60%] opacity-40" />
        <div className="relative mx-auto max-w-[1344px]"><PageEyebrow>Servicios legales</PageEyebrow><h1 className="mt-7 max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[.88] tracking-[-.06em]">Una práctica completa.<br /><span className="font-serif font-normal italic text-[#d4a95d]">Un criterio directo.</span></h1><p className="mt-9 max-w-2xl text-lg leading-8 text-white/55">Soluciones jurídicas construidas alrededor de su realidad, sus riesgos y el resultado que necesita alcanzar.</p></div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1344px]">
          <div className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[.7fr_1.3fr]"><PageEyebrow>Áreas de práctica</PageEyebrow><p className="max-w-3xl text-2xl leading-10 text-muted-foreground sm:text-3xl">No hay dos conflictos iguales. Cada servicio comienza con una evaluación clara y se convierte en una ruta legal diseñada para avanzar.</p></div>
          <div className="mt-10 grid border-l border-t border-border md:grid-cols-2">
            {site.services.map((service) => { const Icon = icons[service.icon] || Scale; return <a key={service.id} href={`/servicios/${service.slug}`} className="service-photo-card group relative flex min-h-[430px] flex-col overflow-hidden border-b border-r border-border bg-card p-7 transition duration-300 hover:bg-[#181612] hover:text-white sm:p-10"><ServiceGalleryBackground service={service} className="opacity-0 transition duration-500 group-hover:opacity-100" /><div className="relative flex items-center justify-between"><span className="text-xs font-semibold text-[#a36d29] transition group-hover:text-[#d4a95d]">{service.accent}</span><Icon className="size-7 text-muted-foreground transition group-hover:text-[#d4a95d]" /></div><div className="relative mt-auto"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{service.name}</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground transition group-hover:text-white/66">{service.shortDescription}</p><span className="mt-9 inline-flex items-center gap-2 text-sm font-semibold">Conocer el servicio <ArrowUpRight className="size-4 transition group-hover:translate-x-1" /></span></div></a>; })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-[1344px] gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><PageEyebrow>¿Cómo elegir?</PageEyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-.04em]">Si no sabe por dónde empezar, está bien.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[['1', 'Cuente el contexto'], ['2', 'Identificamos el área'], ['3', 'Definimos el siguiente paso']].map(([number, text]) => <div key={number} className="rounded-2xl border border-border bg-background p-6"><span className="text-xs font-semibold text-[#a36d29]">0{number}</span><p className="mt-12 font-semibold">{text}</p></div>)}</div></div></section>
      <PageCta title="Conversemos sobre lo que está en juego." />
    </PageFrame>
  );
}
