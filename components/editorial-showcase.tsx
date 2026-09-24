'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronRight, Pause, Play } from 'lucide-react';
import { getSocialEmbedUrl } from '@/lib/social-embed';
import type { MediaPost } from '@/lib/site-data';

/** One mounted player: a publication can never compete with another for audio. */
export function EditorialShowcase({ posts }: { posts: MediaPost[] }) {
  const items = posts.filter(p => p.active && p.platform !== 'Fotografía');
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const soundWanted = useRef(true);
  const fallbackAttempted = useRef(false);
  const command = (type: string) => frame.current?.contentWindow?.postMessage({ type, 'x-tiktok-player': true }, 'https://www.tiktok.com');
  const section = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const post = items[selected] ?? items[0];
  const embed = post ? getSocialEmbedUrl(post.url) : null;
  const tiktok = embed?.startsWith('https://www.tiktok.com/player/');
  const playing = visible && !paused;
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }, { threshold: .25 });
    observer.observe(node);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== 'https://www.tiktok.com' || event.source !== frame.current?.contentWindow || !event.data?.['x-tiktok-player']) return;
      if (event.data.type === 'onPlayerReady' && playing) {
        fallbackAttempted.current = false;
        command(soundWanted.current ? 'unMute' : 'mute');
        command('play');
      }
      if (event.data.type === 'onMute') setMuted(Boolean(event.data.value));
      if (event.data.type === 'onPlayerError' && event.data.value?.errorCode === 3002) {
        setAudioBlocked(true);
        setMuted(true);
        if (!fallbackAttempted.current) {
          fallbackAttempted.current = true;
          command('mute');
          command('play');
        }
        return;
      }
      if (event.data.type === 'onStateChange' && event.data.value === 0 && playing) {
        setSelected(index => (index + 1) % items.length);
        setError(false);
      }
      if (event.data.type === 'onPlayerError') setError(true);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [items.length, playing]);
  if (!post) return null;
  const src = tiktok ? `${embed}&muted=0&description=1&music_info=1&rel=0`.replace('autoplay=0', 'autoplay=1') : embed;
  return <div className="mt-12 overflow-hidden rounded-[2rem] border border-border bg-card lg:grid lg:grid-cols-[.85fr_1.15fr]">
    <div className="bg-[#151410] p-5 sm:p-8">
      <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[.2em] text-[#d4a95d]"><span>En primera persona · {post.platform}</span><span>{Math.min(selected + 1, items.length)} / {items.length}</span></div>
      <div ref={section} className="relative mx-auto aspect-[9/16] w-full max-w-[350px] scroll-mt-24 overflow-hidden rounded-2xl bg-black">
        {src && playing ? <iframe key={post.id} ref={frame} src={src} title={post.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" /> : <button onClick={() => setPaused(false)} className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center text-white"><Play className="size-12 text-[#d4a95d]" /><span>{post.title}</span><span className="text-xs text-white/60">Reproducir publicación</span></button>}
      </div>
      <div className="mx-auto mt-5 flex max-w-[350px] items-center justify-between gap-3 text-xs text-white/65"><button onClick={() => setPaused(!paused)} aria-pressed={paused} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2">{paused ? <Play className="size-3" /> : <Pause className="size-3" />}{paused ? 'Reanudar' : 'Pausar'}</button><button onClick={() => { const enable = muted || audioBlocked; soundWanted.current = enable; command(enable ? 'unMute' : 'mute'); if (enable) command('play'); setMuted(!enable); setAudioBlocked(false); }} className="rounded-full border border-[#d4a95d]/50 px-4 py-2 text-[#d4a95d]">{muted || audioBlocked ? 'Activar sonido' : 'Silenciar'}</button></div>
      {audioBlocked && <p role="status" className="mx-auto mt-3 max-w-[350px] text-xs leading-5 text-white/70">Su navegador requiere un toque para escuchar. Active el sonido aquí o en el reproductor.</p>}
      {error && <p role="status" className="mt-4 text-center text-xs text-white/70">TikTok no pudo cargar este video. Puede abrir la publicación original.</p>}
    </div>
    <div className="p-6 sm:p-10 lg:p-12"><p className="text-xs uppercase tracking-[.22em] text-[#a36d29]">Selección editorial</p><h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Historias que merecen<br /><span className="font-serif font-normal italic text-[#a36d29]">una conversación.</span></h3><p className="mt-5 text-sm leading-7 text-muted-foreground">Publicaciones originales de Jordy Tamayo. El recorrido comienza al llegar aquí y continúa con el siguiente video al terminar. Elija una historia para explorarla.</p>
      <div className="mt-8 divide-y divide-border">{items.map((item, index) => <button key={item.id} onClick={() => { setSelected(index); setPaused(false); setError(false); section.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }} aria-pressed={post.id === item.id} className={`flex w-full gap-4 rounded-lg px-3 py-6 text-left transition ${post.id === item.id ? 'bg-[#a36d29]/10' : 'hover:bg-muted'}`}><span className="pt-1 text-xs text-[#a36d29]">{String(index + 1).padStart(2, '0')}</span><span className="flex-1"><span className="text-[10px] uppercase tracking-[.18em] text-[#a36d29]">{item.category}</span><span className="mt-2 block text-xl font-semibold">{item.title}</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.caption}</span></span><ChevronRight className="mt-2 size-4 shrink-0 text-[#a36d29]" /></button>)}</div>
      <a href={post.url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">Ver original con sonido <ArrowUpRight className="size-4" /></a><p className="mt-4 text-xs leading-5 text-muted-foreground">La reproducción depende de TikTok y de los permisos de su navegador. Cada caso tiene circunstancias propias; estos contenidos no garantizan resultados.</p>
    </div>
  </div>;
}
