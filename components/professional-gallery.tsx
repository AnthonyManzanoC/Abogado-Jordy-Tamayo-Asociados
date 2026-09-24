'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { assetUrl } from '@/lib/api';
import type { MediaPost } from '@/lib/site-data';

export function ProfessionalGallery({ posts, compact = false }: { posts: MediaPost[]; compact?: boolean }) {
  const photos = posts.filter((post) => post.platform === 'Fotografía' && post.active);
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const rail = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const advance = (step: number) => {
    const node = rail.current;
    if (!node) return;
    const distance = (node.firstElementChild as HTMLElement)?.offsetWidth + 20;
    const end = node.scrollLeft >= node.scrollWidth - node.clientWidth - 8;
    node.scrollTo({ left: step > 0 && end ? 0 : node.scrollLeft + step * distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  useEffect(() => {
    if (!compact || !auto || hover || selected !== null || !rail.current) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let firstAdvance: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .2;
      window.clearTimeout(firstAdvance);
      if (visible && !document.hidden && !motion.matches) firstAdvance = window.setTimeout(() => advance(1), 1200);
    }, { threshold: .2 });
    observer.observe(rail.current);
    const timer = window.setInterval(() => { if (visible && !document.hidden && !motion.matches) advance(1); }, 5000);
    return () => { observer.disconnect(); window.clearInterval(timer); window.clearTimeout(firstAdvance); };
  }, [compact, auto, hover, selected, photos.length]);
  if (!photos.length) return null;
  const current = selected === null ? null : photos[selected];
  const move = (step: number) => setSelected((index) => ((index ?? 0) + step + photos.length) % photos.length);
  return <section className="overflow-hidden border-y border-border bg-card px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-label="Galería profesional">
    <div className="mx-auto max-w-[1344px]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#a36d29]">Más allá del retrato</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">Una trayectoria.<br /><span className="font-serif font-normal italic text-[#a36d29]">Muchas historias.</span></h2></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">Formación, preparación y cercanía. Conozca el lado profesional de Jordy Tamayo a través de sus propias fotografías.</p></div>
      {compact && <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-muted-foreground">{photos.length} momentos · Deslice o use las flechas para descubrirlos</p><div className="flex items-center gap-3"><button aria-label="Fotografías anteriores" onClick={() => { setAuto(false); advance(-1); }} className="rounded-full border border-border p-3"><ArrowLeft className="size-4" /></button><button onClick={() => setAuto(!auto)} aria-pressed={auto} className="rounded-full border border-border px-4 py-3 text-xs">{auto ? 'Pausar recorrido' : 'Recorrido automático'}</button><button aria-label="Fotografías siguientes" onClick={() => { setAuto(false); advance(1); }} className="rounded-full border border-border p-3"><ArrowRight className="size-4" /></button></div></div>}
      <div ref={rail} onFocusCapture={() => setHover(true)} onBlurCapture={() => setHover(false)} onTouchStart={() => setHover(true)} onTouchEnd={() => setHover(false)} onTouchCancel={() => setHover(false)} className={compact ? 'flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
        {photos.map((photo, index) => <button key={photo.id} onClick={() => { setSelected(index); setNotice(''); }} className={`group text-left ${compact ? 'w-[82vw] max-w-[390px] shrink-0 snap-start' : ''}`} aria-label={`Ampliar: ${photo.title}`}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[2rem] bg-[#e9e4db]"><img src={assetUrl(photo.thumbnailUrl)} alt={photo.title} loading="lazy" decoding="async" className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.025]" /><span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur"><Expand className="size-4" /></span></div>
          <div className="border-b border-border py-5"><p className="text-[10px] uppercase tracking-[.2em] text-[#a36d29]">{photo.category}</p><h3 className="mt-2 text-xl font-semibold">{photo.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{photo.caption}</p></div>
        </button>)}
      </div>
      {compact && <a href="/perfil#galeria" className="mt-8 inline-flex items-center gap-3 text-sm font-semibold">Explorar la galería completa <ArrowRight className="size-4" /></a>}
    </div>
    <Dialog open={current !== null} onOpenChange={(open) => !open && setSelected(null)}>
      <DialogContent className="max-h-[95dvh] overflow-y-auto bg-[#11100e] p-5 text-white sm:max-w-5xl" onKeyDown={(event) => { if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1); }}>
        <DialogTitle className="pr-10 text-lg">{current?.title}</DialogTitle>
        {current && <img src={assetUrl(current.thumbnailUrl)} alt={current.title} className="max-h-[68dvh] w-full object-contain" />}
        <p className="text-sm text-white/65">{current?.caption}</p>
        <div className="flex items-center justify-between gap-3"><button aria-label="Foto anterior" onClick={() => move(-1)} className="rounded-full border border-white/20 p-3"><ArrowLeft className="size-5" /></button><span className="text-xs text-white/60">{(selected ?? 0) + 1} / {photos.length}</span><button onClick={async () => { const url = new URL('/perfil#galeria', window.location.origin).href; try { if (navigator.share) await navigator.share({ title: 'Jordy Tamayo · Perfil profesional', url }); else { await navigator.clipboard.writeText(url); setNotice('Enlace copiado'); } } catch { setNotice('Puedes compartir el enlace de esta página.'); } }} className="inline-flex items-center gap-2 text-xs text-[#d4a95d]"><Share2 className="size-4" /> Compartir perfil</button><button aria-label="Foto siguiente" onClick={() => move(1)} className="rounded-full border border-white/20 p-3"><ArrowRight className="size-5" /></button></div><p role="status" className="text-xs text-[#d4a95d]">{notice}</p>
      </DialogContent>
    </Dialog>
  </section>;
}
