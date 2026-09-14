'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Camera,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Play,
  Scale,
  Shield,
  Sparkles,
  Sun,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ChatBot } from '@/components/chat-bot';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { API_BASE, apiFetch, assetUrl } from '@/lib/api';
import { defaultSite, type CreateLeadResponse, type LegalService, type PublicSite } from '@/lib/site-data';
import { ServiceGalleryBackground } from '@/components/service-gallery';

const icons: Record<string, LucideIcon> = { Shield, Users, FileText, Car, Scale, Landmark, BriefcaseBusiness };

export function PublicSite() {
  const [site, setSite] = useState<PublicSite>(defaultSite);
  const [menuOpen, setMenuOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [leadResult, setLeadResult] = useState<CreateLeadResponse | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined);
  }, []);

  const { profile, services, mediaPosts } = site;
  const whatsappHref = useMemo(() => {
    const number = profile.whatsAppNumber.replace(/\D/g, '');
    return number ? `https://wa.me/${number}?text=${encodeURIComponent('Hola, Abg. Jordy Tamayo. Visité su página web y quisiera recibir orientación legal sobre mi caso.')}` : '';
  }, [profile.whatsAppNumber]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFormError('');
    const data = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<CreateLeadResponse>('/api/public/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'),
          whatsapp: data.get('whatsapp'),
          email: data.get('email'),
          legalArea: data.get('legalArea'),
          consultationType: data.get('consultationType'),
          preferredDate: data.get('preferredDate') || null,
          message: data.get('message'),
          source: 'Formulario inicio',
        }),
      });
      setLeadResult(result);
      setSent(true);
      event.currentTarget.reset();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible enviar la consulta.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex" aria-label="Navegación principal">
            <a href="/servicios" className="transition hover:text-white">Servicios</a>
            <a href="/perfil" className="transition hover:text-white">Perfil</a>
            <a href="/vitrina-legal" className="transition hover:text-white">Vitrina legal</a>
            <a href="/contacto" className="transition hover:text-white">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'} className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button onClick={() => setConsultOpen(true)} className="hidden rounded-full bg-[#d4a95d] px-5 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#e8c57d] sm:inline-flex">
              Agendar consulta
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-full border border-white/15 text-white lg:hidden" aria-label="Abrir menú">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#11100e]/98 px-5 py-5 text-white lg:hidden">
            {[["Servicios", "/servicios"], ["Perfil", "/perfil"], ["Vitrina legal", "/vitrina-legal"], ["Contacto", "/contacto"]].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-white/10 py-4 text-white/80">
                {label}<ChevronRight className="size-4" />
              </a>
            ))}
          </nav>
        )}
      </header>

      <section id="inicio" className="relative isolate min-h-[760px] bg-[#11100e] pt-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(194,144,66,.16),transparent_30%),linear-gradient(110deg,#11100e_0%,#11100e_47%,#201b16_100%)]" />
        <div className="hero-grid absolute inset-y-0 right-0 w-[54%] opacity-35" />
        <div className="relative mx-auto grid min-h-[680px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:px-12">
          <div className="z-10 max-w-3xl animate-rise">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d4a95d]/35 bg-[#d4a95d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e6c88f]">
              <span className="size-1.5 rounded-full bg-[#d4a95d]" /> {profile.eyebrow}
            </div>
            <h1 className="max-w-4xl text-[clamp(3.3rem,7vw,7rem)] font-semibold leading-[.9] tracking-[-.055em]">
              {profile.heroTitle}
              <span className="block font-serif font-normal italic text-[#d4a95d]">{profile.heroAccent}</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/64 sm:text-lg">{profile.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setConsultOpen(true)} className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-[#11100e] transition hover:bg-[#f2eadf]">
                Cuéntame tu caso <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <a href="#ubicacion" className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-white/18 px-7 text-sm font-medium text-white/78 backdrop-blur transition hover:border-white/40 hover:text-white">
                <MapPin className="size-4 text-[#d4a95d]" /> {profile.addressLine1}, Babahoyo
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/12 pt-7 text-sm text-white/55">
              <span><strong className="mr-2 text-2xl font-semibold text-white">{profile.socialProof}</strong>{profile.socialProofLabel}</span>
              <span className="hidden h-8 w-px bg-white/15 sm:block" />
              <span>Atención presencial y virtual</span>
            </div>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[560px] self-end lg:h-[630px]">
            <div className="absolute -left-4 top-14 z-10 hidden rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-xl sm:block">
              <p className="text-[10px] uppercase tracking-[.22em] text-white/45">Enfoque</p>
              <p className="mt-1 text-sm font-medium">Soluciones que avanzan</p>
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-t-[12rem] border border-white/12 bg-[#25211d]">
              <img src={assetUrl(profile.heroImageUrl)} alt={profile.fullName} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#11100e] to-transparent" />
            </div>
          </div>
        </div>
        <a href="#servicios" aria-label="Ver servicios" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 transition hover:text-white sm:block">
          <ArrowDownRight className="size-6" />
        </a>
      </section>

      <section id="servicios" className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionHeading kicker="Áreas de práctica" title="Estrategia para lo que está en juego." copy="Cada servicio combina preparación rigurosa, comunicación directa y una ruta clara para tomar mejores decisiones." />
          <div className="mt-14 grid border-l border-t border-border sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
          <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><p className="text-sm text-muted-foreground">¿No encuentra su caso? <button onClick={() => setConsultOpen(true)} className="font-semibold text-foreground underline decoration-[#c79345] underline-offset-4">Conversemos para orientarle.</button></p><a href="/servicios" className="inline-flex items-center gap-2 text-sm font-semibold">Ver todos los servicios <ArrowRight className="size-4" /></a></div>
        </div>
      </section>

      <section id="trayectoria" className="bg-[#171512] py-24 text-white sm:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12">
          <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-[#29241f]">
            <img src={assetUrl(profile.degreeImageUrl)} alt="Trayectoria académica de Jordy Tamayo" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[.18em] backdrop-blur"><GraduationCap className="size-4 text-[#d4a95d]" /> Formación de cuarto nivel</span>
            </div>
          </div>
          <div className="flex flex-col justify-between py-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#d4a95d]">Perfil profesional</span>
              <h2 className="mt-6 max-w-3xl text-[clamp(2.6rem,5vw,5.4rem)] font-semibold leading-[.95] tracking-[-.045em]">{profile.bioTitle}</h2>
              <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">{profile.bioBody}</p>
            </div>
            <div className="mt-14 grid grid-cols-2 border-y border-white/12">
              <div className="border-r border-white/12 py-8 pr-5">
                <p className="text-4xl font-semibold tracking-tight text-[#d4a95d] sm:text-6xl">{profile.metricOneValue}</p>
                <p className="mt-2 max-w-32 text-sm text-white/50">{profile.metricOneLabel}</p>
              </div>
              <div className="py-8 pl-6">
                <p className="text-4xl font-semibold tracking-tight text-[#d4a95d] sm:text-6xl">{profile.metricTwoValue}</p>
                <p className="mt-2 max-w-32 text-sm text-white/50">{profile.metricTwoLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d1a052] py-20 text-[#17120c] sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[.2em]">Cómo trabajamos</span>
              <h2 className="mt-5 text-4xl font-semibold leading-none tracking-[-.04em] sm:text-6xl">Claridad desde<br />el primer paso.</h2>
            </div>
            <div className="grid gap-0 border-t border-black/25 sm:grid-cols-3">
              {[
                ['01', 'Escuchamos', 'Una primera conversación para entender el contexto, la urgencia y sus objetivos.'],
                ['02', 'Trazamos', 'Diagnóstico jurídico y una estrategia explicada sin vueltas ni lenguaje innecesario.'],
                ['03', 'Actuamos', 'Ejecución diligente, seguimiento cercano y decisiones sustentadas en evidencia.'],
              ].map(([number, title, copy]) => (
                <div key={number} className="border-b border-black/25 py-7 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                  <span className="text-xs font-bold">{number}</span>
                  <h3 className="mt-12 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/65">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="vitrina" className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <SectionHeading kicker="Vitrina legal" title="El derecho también se conversa." copy="Casos, actualidad y respuestas jurídicas compartidas con una comunidad activa." />
            <a href="/vitrina-legal" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold">Explorar toda la vitrina <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {mediaPosts.map((post, index) => (
              <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className={`group relative overflow-hidden rounded-[1.8rem] bg-[#181612] text-white ${index === 0 ? 'lg:row-span-2 lg:min-h-[650px]' : 'min-h-[310px]'}`}>
                <img src={assetUrl(post.thumbnailUrl)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] backdrop-blur">
                  <Play className="size-3 fill-current" /> {post.platform}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="text-[10px] uppercase tracking-[.2em] text-[#e0b56c]">{post.category}</span>
                  <h3 className="mt-3 max-w-md text-2xl font-semibold leading-tight">{post.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/58">{post.caption}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em]">Ver publicación <ArrowUpRight className="size-3.5" /></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="ubicacion" className="border-t border-border bg-card py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12">
          <div className="rounded-[2rem] bg-[#181612] p-8 text-white sm:p-12 lg:p-16">
            <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#d4a95d]">Despacho en Babahoyo</span>
            <h2 className="mt-6 text-4xl font-semibold leading-none tracking-[-.04em] sm:text-6xl">Aquí empieza<br />una ruta clara.</h2>
            <div className="mt-14 space-y-5 border-t border-white/12 pt-8">
              <div className="flex gap-4"><MapPin className="mt-0.5 size-5 shrink-0 text-[#d4a95d]" /><div><strong className="block">{profile.addressLine1}</strong><span className="mt-1 block text-sm text-white/55">{profile.addressLine2}<br />{profile.city}</span></div></div>
              <div className="flex gap-4"><Clock3 className="mt-0.5 size-5 shrink-0 text-[#d4a95d]" /><div><strong className="block">Atención con cita previa</strong><span className="mt-1 block text-sm text-white/55">Presencial o virtual, según su necesidad.</span></div></div>
            </div>
            <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#181612] transition hover:bg-[#efe7db]">Abrir ubicación <ArrowUpRight className="size-4" /></a>
          </div>
          <div className="grid content-center gap-5 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative min-h-64 overflow-hidden rounded-[1.6rem] bg-muted">
                <img src={assetUrl(profile.officeBuildingImageUrl)} alt={`Oficina en ${profile.addressLine1}`} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="min-h-64 overflow-hidden rounded-[1.6rem] border border-border bg-background">
                <iframe src={profile.googleMapsEmbedUrl || profile.googleMapsUrl} title="Mapa del despacho" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0" />
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#a36d29]">Primera consulta</span>
            <h2 className="mt-5 text-4xl font-semibold leading-[.98] tracking-[-.04em] sm:text-6xl">Su caso merece ser escuchado.</h2>
            <p className="mt-6 max-w-lg leading-7 text-muted-foreground">Déjenos sus datos y una descripción breve. La información será revisada de forma confidencial para coordinar el siguiente paso.</p>
            <button onClick={() => setConsultOpen(true)} className="group mt-9 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition hover:opacity-85">Agendar consulta <ArrowRight className="size-4 transition group-hover:translate-x-1" /></button>
            {profile.phone && <a href={`tel:${profile.phone}`} className="mt-6 flex items-center gap-3 text-sm font-semibold"><Phone className="size-4 text-[#a36d29]" /> {profile.phone}</a>}
          </div>
        </div>
      </section>

      <footer className="bg-[#0e0d0c] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row md:items-center">
          <Brand />
          <div className="flex flex-wrap items-center gap-3">
            <SocialLink href={profile.tikTokUrl} label="TikTok"><Play className="size-4 fill-current" /></SocialLink>
            <SocialLink href={profile.instagramUrl} label="Instagram"><Camera className="size-4" /></SocialLink>
            <SocialLink href={profile.facebookUrl} label="Facebook"><Users className="size-4" /></SocialLink>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 pt-7 text-xs text-white/38 sm:flex-row">
          <p>© {new Date().getFullYear()} Jordy Tamayo. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-5"><a href="/perfil" className="hover:text-white">Perfil</a><a href="/servicios" className="hover:text-white">Servicios</a><a href="/vitrina-legal" className="hover:text-white">Vitrina</a><a href="/contacto" className="hover:text-white">Contacto</a><a href="/admin" className="hover:text-white">Administrar</a></div>
        </div>
      </footer>

      <ChatBot site={site} />

      {whatsappHref ? (
        <a aria-label="Habla con el Abogado por WhatsApp" href={whatsappHref} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(0,0,0,.28)] transition hover:scale-[1.03]"><MessageCircle className="size-5" /><span>Habla con el Abg.</span></a>
      ) : (
        <button aria-label="Habla con el Abogado" onClick={() => setConsultOpen(true)} className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(0,0,0,.28)] transition hover:scale-[1.03]"><MessageCircle className="size-5" /><span>Habla con el Abg.</span></button>
      )}

      <Dialog open={consultOpen} onOpenChange={(open) => { setConsultOpen(open); if (!open) { setSent(false); setLeadResult(null); setFormError(''); } }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border border-border bg-card p-0 sm:max-w-2xl">
          <div className="border-b border-border bg-[#181612] px-6 py-7 text-white sm:px-8">
            <DialogHeader>
              <span className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-[#d4a95d]">Consulta confidencial</span>
              <DialogTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">Cuéntenos qué está pasando.</DialogTitle>
              <DialogDescription className="mt-2 text-white/55">Recibirá una respuesta para coordinar la consulta. En una emergencia, use los canales oficiales correspondientes.</DialogDescription>
            </DialogHeader>
          </div>
          {sent ? (
            <div className="grid min-h-80 place-items-center p-8 text-center">
              <div><CheckCircle2 className="mx-auto size-12 text-[#a36d29]" /><h3 className="mt-5 text-2xl font-semibold">Consulta recibida</h3><p className="mt-2 max-w-sm text-muted-foreground">Gracias. Guarde el enlace de seguimiento para revisar el estado y subir comprobante si la consulta es virtual.</p>{leadResult && <a href={leadResult.trackingUrl} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d1a052] px-5 py-3 text-sm font-semibold text-[#17120c]">Abrir seguimiento <ArrowRight className="size-4" /></a>}<button onClick={() => setConsultOpen(false)} className="mt-4 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Cerrar</button></div>
            </div>
          ) : (
            <form onSubmit={submitLead} className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
              <Field label="Nombre y apellido"><Input name="name" required minLength={2} placeholder="Su nombre" className="h-11 bg-background" /></Field>
              <Field label="WhatsApp"><Input name="whatsapp" required placeholder="Ej. +593 99 000 0000" className="h-11 bg-background" /></Field>
              <Field label="Correo (opcional)"><Input name="email" type="email" placeholder="correo@ejemplo.com" className="h-11 bg-background" /></Field>
              <Field label="Área legal">
                <select name="legalArea" required defaultValue="" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30">
                  <option value="" disabled>Seleccione una opción</option>
                  {services.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}
                  <option value="Otra">Otra / No estoy seguro</option>
                </select>
              </Field>
              <Field label="Modalidad"><select name="consultationType" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option>Presencial</option><option>Virtual</option></select></Field>
              <Field label="Fecha preferida"><Input name="preferredDate" type="date" className="h-11 bg-background" /></Field>
              <div className="sm:col-span-2"><Field label="Cuéntenos brevemente su caso"><Textarea name="message" required minLength={10} placeholder="Describa el problema, fechas importantes y qué resultado busca…" className="min-h-28 bg-background" /></Field></div>
              {formError && <p className="sm:col-span-2 text-sm text-destructive">{formError}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs leading-5 text-muted-foreground">Al enviar acepta que usemos estos datos únicamente para responder su consulta.</p>
                <button disabled={sending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background disabled:opacity-50">{sending ? 'Enviando…' : 'Enviar consulta'} <ArrowRight className="size-4" /></button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <span className="sr-only">API: {API_BASE}</span>
    </main>
  );
}

function Brand() {
  return (
    <a href="#inicio" className="flex items-center gap-3" aria-label="Jordy Tamayo, inicio">
      <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-[#d4a95d]"><Scale className="size-5" /></span>
      <span className="leading-none text-white"><strong className="block text-sm font-semibold tracking-[0.12em]">JORDY TAMAYO</strong><span className="mt-1 block text-[10px] tracking-[0.26em] text-white/55">ABOGADO · MÁSTER</span></span>
    </a>
  );
}

function SectionHeading({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
      <div><span className="text-xs font-semibold uppercase tracking-[.2em] text-[#9a6728]">{kicker}</span><h2 className="mt-5 max-w-3xl text-[clamp(2.6rem,5vw,5.4rem)] font-semibold leading-[.95] tracking-[-.045em]">{title}</h2></div>
      <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">{copy}</p>
    </div>
  );
}

function ServiceCard({ service }: { service: LegalService }) {
  const Icon = icons[service.icon] || Scale;
  return (
    <a href={`/servicios/${service.slug}`} className="group relative flex min-h-[360px] flex-col overflow-hidden border-b border-r border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:bg-[#181612] hover:text-white sm:p-8">
      <ServiceGalleryBackground service={service} className="opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between"><span className="text-xs font-semibold text-[#a36d29] transition group-hover:text-[#d4a95d]">{service.accent}</span><Icon className="size-6 text-muted-foreground transition group-hover:text-[#d4a95d]" /></div>
      <div className="relative mt-auto"><h3 className="text-2xl font-semibold tracking-tight">{service.name}</h3><p className="mt-4 leading-6 text-muted-foreground transition group-hover:text-white/70">{service.shortDescription}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Explorar servicio <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></div>
    </a>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-white/15 text-white/65 transition hover:border-[#d4a95d]/50 hover:text-[#d4a95d]">{children}</a>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium"><span>{label}</span>{children}</label>;
}
