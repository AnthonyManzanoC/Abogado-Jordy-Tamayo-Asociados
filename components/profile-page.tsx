'use client';

import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, MessageSquareText, Scale, Sparkles } from 'lucide-react';
import { PageCta, PageEyebrow, PageFrame } from '@/components/interior-shell';
import { apiFetch, assetUrl } from '@/lib/api';
import { defaultSite, type PublicSite } from '@/lib/site-data';

export function ProfilePage() {
  const [site, setSite] = useState<PublicSite>(defaultSite);
  useEffect(() => { apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined); }, []);
  const { profile } = site;

  return (
    <PageFrame active="/perfil" profile={profile}>
      <section className="relative overflow-hidden bg-[#11100e] px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-12">
        <div className="hero-grid absolute inset-y-0 right-0 w-1/2 opacity-35" />
        <div className="relative mx-auto grid max-w-[1344px] items-end gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="py-8"><PageEyebrow>Perfil profesional</PageEyebrow><h1 className="mt-7 text-[clamp(3.5rem,7.5vw,7.6rem)] font-semibold leading-[.88] tracking-[-.06em]">Una voz cercana.<br /><span className="font-serif font-normal italic text-[#d4a95d]">Una defensa firme.</span></h1><p className="mt-9 max-w-xl text-lg leading-8 text-white/55">{profile.bioBody}</p></div>
          <div className="relative mx-auto h-[620px] w-full max-w-[520px] overflow-hidden rounded-t-[11rem] border border-white/12 bg-[#24201c]"><img src={assetUrl(profile.heroImageUrl)} alt={profile.fullName} className="h-full w-full object-cover object-top" /><div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#11100e] to-transparent" /></div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto grid max-w-[1344px] gap-14 lg:grid-cols-[.78fr_1.22fr]"><div><PageEyebrow>La práctica</PageEyebrow><h2 className="mt-6 text-4xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl">{profile.bioTitle}</h2></div><div><p className="text-xl leading-9 text-muted-foreground sm:text-2xl sm:leading-10">La excelencia legal no empieza en los tribunales: empieza al escuchar bien, estudiar cada detalle y explicar con honestidad qué caminos existen.</p><div className="mt-12 grid gap-4 sm:grid-cols-3">{[[BookOpen, 'Estudio', 'Preparación constante para sostener cada decisión.'], [Scale, 'Criterio', 'Análisis independiente y estrategia proporcional.'], [MessageSquareText, 'Claridad', 'Comunicación directa durante todo el proceso.']].map(([Icon, title, copy]) => { const ItemIcon = Icon as typeof Scale; return <div key={String(title)} className="rounded-2xl border border-border bg-card p-6"><ItemIcon className="size-5 text-[#a36d29]" /><h3 className="mt-10 font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(copy)}</p></div>; })}</div></div></div></section>

      <section className="bg-[#181612] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto grid max-w-[1344px] gap-14 lg:grid-cols-2"><div className="relative min-h-[560px] overflow-hidden rounded-[2rem]"><img src={assetUrl(profile.degreeImageUrl)} alt="Formación académica" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-7 left-7 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-xs uppercase tracking-[.18em] backdrop-blur"><GraduationCap className="size-4 text-[#d4a95d]" /> Formación académica</span></div><div className="flex flex-col justify-center"><PageEyebrow>Trayectoria</PageEyebrow><h2 className="mt-6 text-4xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl">Formación que se traduce en estrategia.</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/52">Los títulos importan cuando se convierten en mejores preguntas, argumentos más sólidos y decisiones mejor informadas para el cliente.</p><div className="mt-12 grid grid-cols-2 border-y border-white/12"><div className="border-r border-white/12 py-7"><strong className="text-5xl text-[#d4a95d]">{profile.metricOneValue}</strong><span className="mt-2 block max-w-32 text-sm text-white/42">{profile.metricOneLabel}</span></div><div className="py-7 pl-7"><strong className="text-5xl text-[#d4a95d]">{profile.metricTwoValue}</strong><span className="mt-2 block max-w-32 text-sm text-white/42">{profile.metricTwoLabel}</span></div></div></div></div></section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto grid max-w-[1344px] items-center gap-14 lg:grid-cols-[.95fr_1.05fr]"><div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-muted"><img src={assetUrl(profile.portraitImageUrl)} alt="Jordy Tamayo en su despacho" className="absolute inset-0 h-full w-full object-cover" /></div><div><span className="inline-flex size-12 items-center justify-center rounded-full bg-[#d1a052] text-[#17120c]"><Sparkles className="size-5" /></span><h2 className="mt-8 text-4xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl">El derecho debe poder entenderse.</h2><p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">La presencia en redes forma parte de esa convicción: acercar ideas jurídicas útiles a la comunidad, desmontar confusiones y abrir conversaciones que muchas personas postergan por no saber por dónde empezar.</p><div className="mt-8 inline-flex items-baseline gap-3"><strong className="text-5xl tracking-tight">{profile.socialProof}</strong><span className="text-sm text-muted-foreground">{profile.socialProofLabel}</span></div></div></div></section>
      <PageCta title="Una buena defensa empieza por entender su historia." />
    </PageFrame>
  );
}
