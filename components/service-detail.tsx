'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MessageCircle, Scale } from 'lucide-react';
import { ChatBot } from '@/components/chat-bot';
import { ServiceGalleryBackground } from '@/components/service-gallery';
import { apiFetch } from '@/lib/api';
import { defaultServices, defaultSite, type LegalService, type PublicSite } from '@/lib/site-data';

export function ServiceDetail({ slug }: { slug: string }) {
  const [service, setService] = useState<LegalService | undefined>(() => defaultServices.find((item) => item.slug === slug));
  const [site, setSite] = useState<PublicSite>(defaultSite);

  useEffect(() => {
    apiFetch<LegalService>(`/api/public/services/${slug}`).then(setService).catch(() => undefined);
    apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined);
  }, [slug]);

  if (!service) {
    return <main className="grid min-h-screen place-items-center bg-[#11100e] p-6 text-center text-white"><div><Scale className="mx-auto size-10 text-[#d4a95d]" /><h1 className="mt-5 text-3xl font-semibold">Servicio no disponible</h1><a href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-white/60"><ArrowLeft className="size-4" /> Volver al inicio</a></div></main>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-[#11100e] text-white">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-white/20 text-[#d4a95d]"><Scale className="size-5" /></span><span><strong className="block text-sm tracking-[.12em]">JORDY TAMAYO</strong><small className="text-[10px] tracking-[.22em] text-white/45">ABOGADO · MÁSTER</small></span></a>
          <a href="/#ubicacion" className="rounded-full bg-[#d4a95d] px-5 py-3 text-sm font-semibold text-[#17120c]">Agendar consulta</a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#11100e] px-5 py-20 text-white sm:px-8 sm:py-28">
        <ServiceGalleryBackground service={service} className="opacity-[.34]" />
        <div className="hero-grid absolute inset-y-0 right-0 w-1/2 opacity-40" />
        <div className="absolute inset-0 bg-[#11100e]/58" />
        <div className="relative mx-auto max-w-[1280px]">
          <a href="/#servicios" className="inline-flex items-center gap-2 text-sm text-white/48 transition hover:text-white"><ArrowLeft className="size-4" /> Todas las áreas</a>
          <span className="mt-16 block text-xs font-semibold uppercase tracking-[.2em] text-[#d4a95d]">Área {service.accent}</span>
          <h1 className="mt-5 max-w-5xl text-[clamp(3.4rem,8vw,8rem)] font-semibold leading-[.88] tracking-[-.055em]">{service.name}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/58">{service.shortDescription}</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.7fr_1.3fr]">
          <div><span className="text-xs font-semibold uppercase tracking-[.2em] text-[#9a6728]">Enfoque del servicio</span><h2 className="mt-5 text-3xl font-semibold tracking-tight">Defensa preparada.<br />Decisiones claras.</h2></div>
          <div>
            <p className="text-xl leading-9 text-muted-foreground sm:text-2xl sm:leading-10">{service.longDescription}</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {['Evaluación inicial del caso', 'Estrategia jurídica personalizada', 'Comunicación clara y seguimiento', 'Representación y acompañamiento'].map((item) => <div key={item} className="flex items-center gap-3 border-t border-border py-5 text-sm font-medium"><span className="grid size-7 place-items-center rounded-full bg-[#d4a95d]/18 text-[#9a6728]"><Check className="size-4" /></span>{item}</div>)}
            </div>
            <div className="mt-14 rounded-[2rem] bg-[#d1a052] p-8 text-[#17120c] sm:p-12"><MessageCircle className="size-8" /><h3 className="mt-8 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">El siguiente paso empieza con una conversación.</h3><p className="mt-4 max-w-xl text-black/60">Comparta brevemente su situación para coordinar una consulta presencial en Babahoyo o una atención virtual.</p><a href="/#ubicacion" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17120c] px-6 py-3.5 text-sm font-semibold text-white">Solicitar consulta <ArrowRight className="size-4" /></a></div>
          </div>
        </div>
      </section>
      <ChatBot site={site} />
    </main>
  );
}
