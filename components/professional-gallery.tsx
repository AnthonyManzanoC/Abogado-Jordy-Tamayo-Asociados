'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { assetUrl } from '@/lib/api';
import type { MediaPost } from '@/lib/site-data';

export function ProfessionalGallery({ posts, compact = false }: { posts: MediaPost[]; compact?: boolean }) {
  const photos = posts.filter((post) => post.platform === 'Fotografía' && post.active);
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  if (!photos.length) return null;
  const current = selected === null ? null : photos[selected];
  const move = (step: number) => setSelected((index) => ((index ?? 0) + step + photos.length) % photos.length);
  return <section className="overflow-hidden border-y border-border bg-card px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-label="Galería profesional">
    <div className="mx-auto max-w-[1344px]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#a36d29]">Más allá del retrato</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">Una trayectoria.<br /><span className="font-serif font-normal italic text-[#a36d29]">Muchas historias.</span></h2></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">Formación, preparación y cercanía. Conozca el lado profesional de Jordy Tamayo a través de sus propias fotografías.</p></div>
      <div className={compact ? 'flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
        {(compact ? photos.slice(0, 5) : photos).map((photo, index) => <button key={photo.id} onClick={() => { setSelected(index); setNotice(''); }} className={`group text-left ${compact ? 'w-[82vw] max-w-[390px] shrink-0 snap-start' : ''}`} aria-label={`Ampliar: ${photo.title}`}>
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
