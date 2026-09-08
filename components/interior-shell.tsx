'use client';

import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Camera, Menu, MessageCircle, Play, Scale, Users, X } from 'lucide-react';
import type { SiteProfile } from '@/lib/site-data';
import { defaultProfile } from '@/lib/site-data';

const navigation = [
  ['Inicio', '/'],
  ['Servicios', '/servicios'],
  ['Perfil', '/perfil'],
  ['Vitrina legal', '/vitrina-legal'],
  ['Contacto', '/contacto'],
];

export function InteriorHeader({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#11100e]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3" aria-label="Jordy Tamayo, inicio">
          <span className="grid size-10 place-items-center rounded-full border border-white/20 text-[#d4a95d]"><Scale className="size-5" /></span>
          <span><strong className="block text-sm tracking-[.12em]">JORDY TAMAYO</strong><small className="text-[9px] tracking-[.24em] text-white/42">ABOGADO · MÁSTER</small></span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {navigation.map(([label, href]) => <a key={href} href={href} className={`text-sm transition hover:text-white ${active === href ? 'text-[#d4a95d]' : 'text-white/56'}`}>{label}</a>)}
        </nav>
        <div className="flex items-center gap-2"><a href="/contacto" className="hidden rounded-full bg-[#d4a95d] px-5 py-3 text-sm font-semibold text-[#17120c] sm:block">Agendar consulta</a><button onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-full border border-white/15 lg:hidden" aria-label="Abrir menú">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
      </div>
      {open && <nav className="border-t border-white/10 px-5 py-3 lg:hidden">{navigation.map(([label, href]) => <a key={href} href={href} className="flex border-b border-white/8 py-4 text-sm text-white/72">{label}</a>)}</nav>}
    </header>
  );
}

export function InteriorFooter({ profile = defaultProfile }: { profile?: SiteProfile }) {
  return (
    <footer className="bg-[#0e0d0c] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-12 border-b border-white/10 pb-12 md:grid-cols-[1fr_auto] md:items-end">
        <div><span className="text-xs uppercase tracking-[.2em] text-[#d4a95d]">Jordy Tamayo · Abogado</span><p className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Derecho con criterio y carácter.</p></div>
        <div className="flex gap-3"><Social href={profile.tikTokUrl} label="TikTok"><Play className="size-4 fill-current" /></Social><Social href={profile.instagramUrl} label="Instagram"><Camera className="size-4" /></Social><Social href={profile.facebookUrl} label="Facebook"><Users className="size-4" /></Social></div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 pt-7 text-xs text-white/38 sm:flex-row"><span>© {new Date().getFullYear()} Jordy Tamayo.</span><div className="flex flex-wrap gap-5">{navigation.slice(1).map(([label, href]) => <a key={href} href={href} className="hover:text-white">{label}</a>)}<a href="/admin" className="hover:text-white">Administrar</a></div></div>
    </footer>
  );
}

export function PageFrame({ active, profile, children }: { active?: string; profile?: SiteProfile; children: ReactNode }) {
  const resolvedProfile = profile ?? defaultProfile;
  return <main className="min-h-screen bg-background text-foreground"><InteriorHeader active={active} />{children}<InteriorFooter profile={resolvedProfile} /><GlobalWhatsApp profile={resolvedProfile} /></main>;
}

function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-white/15 text-white/55 transition hover:border-[#d4a95d]/50 hover:text-[#d4a95d]">{children}</a>; }

export function PageEyebrow({ children }: { children: ReactNode }) { return <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[#a36d29]"><span className="size-1.5 rounded-full bg-[#c79345]" />{children}</span>; }

export function PageCta({ title = 'Su caso merece una estrategia clara.' }: { title?: string }) { return <section className="bg-[#d1a052] px-5 py-16 text-[#17120c] sm:px-8 sm:py-20"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 md:flex-row md:items-center"><h2 className="max-w-3xl text-4xl font-semibold leading-none tracking-[-.04em] sm:text-6xl">{title}</h2><a href="/contacto" className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-[#17120c] px-6 text-sm font-semibold text-white">Agendar consulta <ArrowUpRight className="size-4" /></a></div></section>; }

function GlobalWhatsApp({ profile }: { profile: SiteProfile }) {
  const number = profile.whatsAppNumber.replace(/\D/g, '');
  const message = encodeURIComponent('Hola, Abg. Jordy Tamayo. Visité su página web y quisiera recibir orientación legal sobre mi caso.');
  const href = number ? `https://wa.me/${number}?text=${message}` : '/contacto';
  return <a href={href} target={number ? '_blank' : undefined} rel={number ? 'noreferrer' : undefined} aria-label="Habla con el Abogado" className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(0,0,0,.28)] transition hover:scale-[1.03]"><MessageCircle className="size-5" /><span>Habla con el Abg.</span></a>;
}
