'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { PageEyebrow, PageFrame } from '@/components/interior-shell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api';
import { defaultSite, type PublicSite } from '@/lib/site-data';

export function ContactPage() {
  const [site, setSite] = useState<PublicSite>(defaultSite);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { apiFetch<PublicSite>('/api/public/site').then(setSite).catch(() => undefined); }, []);
  const whatsapp = useMemo(() => site.profile.whatsAppNumber.replace(/\D/g, ''), [site.profile.whatsAppNumber]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await apiFetch('/api/public/leads', { method: 'POST', body: JSON.stringify({ name: data.get('name'), whatsapp: data.get('whatsapp'), email: data.get('email'), legalArea: data.get('legalArea'), consultationType: data.get('consultationType'), preferredDate: data.get('preferredDate') || null, message: data.get('message') }) });
      event.currentTarget.reset(); setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible enviar la consulta.'); }
    finally { setSending(false); }
  }

  return (
    <PageFrame active="/contacto" profile={site.profile}>
      <section className="relative overflow-hidden bg-[#11100e] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12"><div className="hero-grid absolute inset-y-0 right-0 w-1/2 opacity-35" /><div className="relative mx-auto max-w-[1344px]"><PageEyebrow>Contacto y citas</PageEyebrow><h1 className="mt-7 max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[.88] tracking-[-.06em]">Hablemos de lo<br /><span className="font-serif font-normal italic text-[#d4a95d]">que está en juego.</span></h1><p className="mt-9 max-w-2xl text-lg leading-8 text-white/55">Comparta la situación con confidencialidad. El primer paso es entender el contexto y definir si podemos ayudarle.</p></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-[1344px] gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="space-y-4"><div className="rounded-[1.8rem] bg-[#d1a052] p-7 text-[#17120c]"><MapPin className="size-6" /><h2 className="mt-12 text-2xl font-semibold">Consulta presencial</h2><p className="mt-3 text-sm leading-6 text-black/62"><strong>{site.profile.addressLine1}</strong><br />{site.profile.addressLine2}<br />{site.profile.city}</p><a href={site.profile.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Ver en el mapa <ArrowRight className="size-4" /></a></div><div className="rounded-[1.8rem] bg-[#191713] p-7 text-white"><Clock3 className="size-6 text-[#d4a95d]" /><h2 className="mt-10 text-2xl font-semibold">Con cita previa</h2><p className="mt-3 text-sm leading-6 text-white/48">Atención presencial en Babahoyo o consulta virtual desde cualquier lugar.</p>{whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, Abg. Jordy Tamayo. Visité su página web y quisiera recibir orientación legal sobre mi caso.')}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d4a95d]"><MessageCircle className="size-4" /> Habla con el Abg.</a>}</div><div className="rounded-[1.8rem] border border-border bg-card p-7"><ShieldCheck className="size-6 text-[#a36d29]" /><h2 className="mt-10 text-lg font-semibold">Información confidencial</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Sus datos se usan únicamente para revisar y responder esta solicitud.</p></div></aside>

        <div className="rounded-[2rem] border border-border bg-card p-6 sm:p-9 lg:p-12">{sent ? <div className="grid min-h-[640px] place-items-center text-center"><div><CheckCircle2 className="mx-auto size-14 text-[#a36d29]" /><h2 className="mt-6 text-4xl font-semibold tracking-tight">Consulta recibida.</h2><p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">Gracias por compartir la información. El despacho se pondrá en contacto para coordinar el siguiente paso.</p><button onClick={() => setSent(false)} className="mt-7 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Enviar otra consulta</button></div></div> : <><div><PageEyebrow>Formulario seguro</PageEyebrow><h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Cuéntenos brevemente su caso.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">No necesita conocer el área legal exacta; el equipo la identificará al revisar su solicitud.</p></div><form onSubmit={submit} className="mt-9 grid gap-5 sm:grid-cols-2"><Field label="Nombre y apellido"><Input name="name" required minLength={2} className="h-11 bg-background" /></Field><Field label="WhatsApp"><Input name="whatsapp" required placeholder="+593…" className="h-11 bg-background" /></Field><Field label="Correo (opcional)"><Input name="email" type="email" className="h-11 bg-background" /></Field><Field label="Área legal"><select name="legalArea" required defaultValue="" className="h-11 rounded-lg border border-input bg-background px-3 text-sm"><option value="" disabled>Seleccione</option>{site.services.map((service) => <option key={service.id}>{service.name}</option>)}<option>Otra / No estoy seguro</option></select></Field><Field label="Modalidad"><select name="consultationType" className="h-11 rounded-lg border border-input bg-background px-3 text-sm"><option>Presencial</option><option>Virtual</option></select></Field><Field label="Fecha preferida"><Input name="preferredDate" type="date" className="h-11 bg-background" /></Field><div className="sm:col-span-2"><Field label="Descripción"><Textarea name="message" required minLength={10} className="min-h-36 bg-background" placeholder="Explique los hechos principales, fechas importantes y qué necesita resolver…" /></Field></div>{error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}<div className="flex flex-col gap-4 border-t border-border pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-sm text-xs leading-5 text-muted-foreground">Enviar este formulario no crea por sí solo una relación abogado-cliente.</p><button disabled={sending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background disabled:opacity-50">{sending ? 'Enviando…' : 'Enviar consulta'} <ArrowRight className="size-4" /></button></div></form></>}
        </div>
      </div></section>

      <section className="border-t border-border bg-card px-5 py-14 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1344px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">También puede contactar directamente:</p><div className="flex flex-wrap gap-5 text-sm font-semibold">{site.profile.phone && <a href={`tel:${site.profile.phone}`} className="inline-flex items-center gap-2"><Phone className="size-4 text-[#a36d29]" />{site.profile.phone}</a>}<a href={`mailto:${site.profile.email}`} className="inline-flex items-center gap-2"><Mail className="size-4 text-[#a36d29]" />{site.profile.email}</a></div></div></section>
    </PageFrame>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium"><span>{label}</span>{children}</label>; }
