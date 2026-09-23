'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Play, Search, SlidersHorizontal } from 'lucide-react';
import { PageCta, PageEyebrow, PageFrame } from '@/components/interior-shell';
import { apiFetch, assetUrl } from '@/lib/api';
import { defaultSite, type PublicSite } from '@/lib/site-data';
import { EditorialShowcase } from '@/components/editorial-showcase';

export function VitrinaPage() {
  const [site, setSite] = useState<PublicSite>(defaultSite);
  const [platform, setPlatform] = useState('Todos');
  const [query, setQuery] = useState('');
  useEffect(() => { apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined); }, []);

  const platforms = useMemo(() => ['Todos', ...Array.from(new Set(site.mediaPosts.filter((post) => post.platform !== 'Fotografía').map((post) => post.platform)))], [site.mediaPosts]);
  const filtered = useMemo(() => site.mediaPosts.filter((post) => {
    const byPlatform = post.platform !== 'Fotografía' && (platform === 'Todos' || post.platform === platform);
    const haystack = `${post.title} ${post.caption} ${post.category}`.toLowerCase();
    return byPlatform && haystack.includes(query.toLowerCase());
  }), [site.mediaPosts, platform, query]);

  return (
    <PageFrame active="/vitrina-legal" profile={site.profile} site={site}>
      <section className="relative overflow-hidden bg-[#11100e] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12"><div className="hero-grid absolute inset-y-0 right-0 w-[60%] opacity-40" /><div className="relative mx-auto max-w-[1344px]"><PageEyebrow>Vitrina legal</PageEyebrow><h1 className="mt-7 max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[.88] tracking-[-.06em]">Casos, ideas y<br /><span className="font-serif font-normal italic text-[#d4a95d]">derecho en movimiento.</span></h1><p className="mt-9 max-w-2xl text-lg leading-8 text-white/55">Una biblioteca viva de contenido jurídico para comprender mejor las decisiones que importan.</p></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-[1344px]"><div className="flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-center"><div className="flex flex-wrap gap-2">{platforms.map((item) => <button key={item} onClick={() => setPlatform(item)} className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${platform === item ? 'bg-foreground text-background' : 'border border-border bg-card hover:border-[#c79345]'}`}>{item}</button>)}</div><label className="flex h-11 w-full max-w-sm items-center gap-3 rounded-full border border-border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en la vitrina" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label></div>

        <EditorialShowcase posts={filtered} />
        {!filtered.length && <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-border bg-card text-center"><div><SlidersHorizontal className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">Sin resultados</h2><p className="mt-1 text-sm text-muted-foreground">Pruebe otra plataforma o término de búsqueda.</p></div></div>}
      </div></section>
      <PageCta title="¿Tiene una pregunta que todavía no hemos respondido?" />
    </PageFrame>
  );
}
