'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bot, CalendarClock, CheckCircle2, Loader2, Mic, Volume2, VolumeX, MessageCircle, Send, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/api';
import type { CreateLeadResponse, PublicSite } from '@/lib/site-data';

type ChatMessage = { role: 'bot' | 'user'; text: string };
type Recognition = { lang: string; start: () => void; stop: () => void; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };

const starter: ChatMessage[] = [
  { role: 'bot', text: 'Hola, soy el asistente web del despacho. Puedo orientarte sobre servicios, ubicación o ayudarte a agendar una consulta.' },
];

export function ChatBot({ site }: { site: PublicSite }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starter);
  const [text, setText] = useState('');
  const [booking, setBooking] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CreateLeadResponse | null>(null);
  const [voice, setVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, booking, result]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); recognitionRef.current?.stop(); }, []);
  function speak(message: string) {
    if (!('speechSynthesis' in window)) { setVoiceHint('La lectura de voz no está disponible en este navegador.'); return; }
    window.speechSynthesis.cancel();
    setVoiceHint('');
    const utterance = new SpeechSynthesisUtterance(message.replace(/https?:\/\/\S+/g, 'Puedes abrir el enlace de seguimiento en el chat.'));
    utterance.lang = 'es-EC';
    const spanish = window.speechSynthesis.getVoices().find((item) => item.lang.startsWith('es'));
    if (spanish) utterance.voice = spanish;
    utterance.rate = 0.97;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => { if (event.error === 'canceled' || event.error === 'interrupted') return; setSpeaking(false); setVoiceHint('No se pudo reproducir la voz. Puedes intentarlo otra vez.'); };
    window.speechSynthesis.speak(utterance);
  }
  function answer(value: string) {
    const reply = replyFrom(value);
    setMessages((items) => [...items, { role: 'user', text: value }, { role: 'bot', text: reply }]);
    if (voice) speak(reply);
  }
  function dictate() {
    if (listening) { recognitionRef.current?.stop(); return; }
    const browser = window as typeof window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) { setVoiceHint('El dictado no está disponible aquí. Puedes escribir tu pregunta.'); return; }
    window.speechSynthesis?.cancel();
    const recognition = new Constructor();
    recognitionRef.current = recognition;
    recognition.lang = 'es-EC';
    recognition.onresult = (event) => { setText(event.results[0][0].transcript); setVoiceHint('Revisa tu mensaje y pulsa enviar.'); };
    recognition.onerror = () => { setListening(false); setVoiceHint('No pudimos acceder al micrófono. Revisa su permiso en el navegador.'); };
    recognition.onend = () => setListening(false);
    try { recognition.start(); setListening(true); setVoiceHint('Escuchando…'); } catch { setVoiceHint('El micrófono no pudo iniciarse. Inténtalo otra vez.'); }
  }
  const servicesText = useMemo(() => site.services.map((service) => service.name).join(', '), [site.services]);

  function replyFrom(message: string) {
    const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/perfil|abogado|jordy|biografia|master/.test(normalized)) return `${site.profile.fullName}. ${site.profile.credentials}. ${site.profile.bioBody}`;
    if (/seguimiento|estado|solicitud/.test(normalized)) return 'Puedes revisar el estado con el enlace privado que recibiste al registrar tu solicitud. Desde allí también puedes subir el comprobante de la consulta virtual.';
    if (/redes|tiktok|instagram|publicacion/.test(normalized)) return 'En Vitrina legal encontrarás las publicaciones del despacho. También puedes visitar sus redes desde los enlaces del perfil y contacto.';
    if (normalized.includes('cita') || normalized.includes('consulta') || normalized.includes('agendar')) {
      setBooking(true);
      return 'Perfecto. Te abro el formulario corto para dejar la solicitud registrada con enlace de seguimiento.';
    }
    if (normalized.includes('servicio') || normalized.includes('penal') || normalized.includes('familia') || normalized.includes('civil') || normalized.includes('transito') || normalized.includes('tránsito')) {
      return `El despacho muestra estas áreas: ${servicesText || 'servicios legales configurados en el admin'}. Si no sabes cuál aplica, puedes elegir “Otra / No estoy seguro”.`;
    }
    if (normalized.includes('ubicacion') || normalized.includes('ubicación') || normalized.includes('direccion') || normalized.includes('dirección') || normalized.includes('mapa')) {
      return `La atención presencial es en ${site.profile.addressLine1}, ${site.profile.addressLine2}, ${site.profile.city}. En la página de contacto puedes ver el mapa embebido.`;
    }
    if (normalized.includes('pago') || normalized.includes('transferencia') || normalized.includes('comprobante')) {
      return 'Para consulta virtual, la solicitud queda pendiente de comprobante. Al enviarla recibirás un enlace para subir la transferencia y revisar el estado.';
    }
    return 'Te puedo ayudar con servicios, ubicación, pago virtual o agendar una consulta. Si quieres avanzar, escribe “agendar cita”.';
  }

  function submitText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    answer(clean);
    setText('');
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const created = await apiFetch<CreateLeadResponse>('/api/public/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'),
          whatsapp: data.get('whatsapp'),
          email: data.get('email'),
          legalArea: data.get('legalArea'),
          consultationType: data.get('consultationType'),
          preferredDate: data.get('preferredDate') || null,
          message: data.get('message'),
          source: 'Chat bot web',
        }),
      });
      setResult(created);
      setMessages((items) => [...items, {
        role: 'bot',
        text: `Listo, tu solicitud quedó registrada. Estado: ${created.status}. Seguimiento: ${created.trackingUrl}`,
      }]);
      if (voice) speak('Tu solicitud quedó registrada. Guarda el enlace de seguimiento para revisar su estado y subir el comprobante si la consulta es virtual.');
      setBooking(false);
      form.reset();
    } catch (error) {
      setMessages((items) => [...items, { role: 'bot', text: error instanceof Error ? error.message : 'No fue posible registrar la cita.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <section className="animate-chat-in fixed bottom-24 right-5 z-50 w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#171512] text-white shadow-[0_28px_80px_rgba(0,0,0,.34)]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#d4a95d] text-[#17120c]"><Bot className="size-5" /></span>
              <div><h2 className="text-sm font-semibold">Asistente legal web</h2><p className="text-xs text-white/40">Información y citas</p></div>
            </div>
            <button onClick={() => { setOpen(false); window.speechSynthesis?.cancel(); recognitionRef.current?.stop(); setSpeaking(false); }} aria-label="Cerrar chat" className="grid size-9 place-items-center rounded-full border border-white/10 text-white/60"><X className="size-4" /></button>
          </header>

          <div className="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-5 py-2.5">
            <span role="status" className="text-xs text-white/60">{speaking ? '● Hablando…' : listening ? '● Escuchando…' : 'A tu disposición'}</span>
            <button aria-pressed={voice} onClick={() => { setVoice(!voice); if (!voice) speak(messages.filter((item) => item.role === 'bot').at(-1)?.text || starter[0].text); else { window.speechSynthesis?.cancel(); setSpeaking(false); } }} className="flex items-center gap-2 rounded-full border border-[#d4a95d]/30 px-3 py-1.5 text-xs text-[#d4a95d]">{voice ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}{voice ? 'Voz activada' : 'Activar voz'}</button>
          </div>
          <div ref={scrollRef} className="max-h-[50dvh] space-y-3 overflow-y-auto overscroll-contain px-5 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#d4a95d] text-[#17120c]' : 'bg-white/8 text-white/74'}`}>{message.text}</p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ['Servicios', 'servicios'],
                ['Ubicación', 'ubicación'],
                ['Pago virtual', 'pago virtual'],
                ['Agendar', 'agendar cita'],
              ].map(([label, value]) => (
                <button key={label} onClick={() => answer(value)} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/64 transition hover:border-[#d4a95d]/50 hover:text-white">{label}</button>
              ))}
            </div>

            {booking && (
              <form onSubmit={submitBooking} className="mt-3 grid gap-3 rounded-[1rem] bg-white/[.06] p-3">
                <Input name="name" required minLength={2} placeholder="Nombre y apellido" className="h-10 border-white/12 bg-black/20 text-white placeholder:text-white/30" />
                <Input name="whatsapp" required placeholder="WhatsApp" className="h-10 border-white/12 bg-black/20 text-white placeholder:text-white/30" />
                <Input name="email" type="email" placeholder="Correo para recibir seguimiento" className="h-10 border-white/12 bg-black/20 text-white placeholder:text-white/30" />
                <select name="legalArea" required defaultValue="" className="h-10 rounded-lg border border-white/12 bg-[#171512] px-3 text-sm text-white">
                  <option value="" disabled>Área legal</option>
                  {site.services.map((service) => <option key={service.id}>{service.name}</option>)}
                  <option>Otra / No estoy seguro</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select name="consultationType" className="h-10 rounded-lg border border-white/12 bg-[#171512] px-3 text-sm text-white"><option>Presencial</option><option>Virtual</option></select>
                  <Input name="preferredDate" type="date" className="h-10 border-white/12 bg-black/20 text-white" />
                </div>
                <Textarea name="message" required minLength={10} placeholder="Cuéntanos brevemente el caso" className="min-h-20 border-white/12 bg-black/20 text-white placeholder:text-white/30" />
                <button disabled={sending} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d4a95d] text-sm font-semibold text-[#17120c] disabled:opacity-60">{sending ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />} Registrar cita</button>
              </form>
            )}

            {result && (
              <div className="rounded-[1rem] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> Solicitud enviada</div>
                <p className="mt-2 text-emerald-50/70">Estado: {result.status}. Pago: {result.paymentStatus}.</p>
                <a href={result.trackingUrl} className="mt-3 inline-flex items-center gap-2 font-semibold text-[#d4a95d]">Abrir seguimiento <ArrowRight className="size-4" /></a>
              </div>
            )}
          </div>

          {voiceHint && <p role="status" className="px-4 py-2 text-xs text-[#d4a95d]">{voiceHint}</p>}
          <form onSubmit={submitText} className="flex gap-2 border-t border-white/10 p-3">
            <button type="button" onClick={dictate} aria-label={listening ? 'Detener dictado' : 'Dictar mensaje'} aria-pressed={listening} className={`grid size-11 shrink-0 place-items-center rounded-full border border-white/15 ${listening ? 'animate-pulse bg-red-500/20 text-red-300' : 'text-[#d4a95d]'}`}><Mic className="size-4" /></button>
            <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe tu pregunta" className="h-11 border-white/12 bg-white/5 text-white placeholder:text-white/30" />
            <button aria-label="Enviar mensaje" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d4a95d] text-[#17120c]"><Send className="size-4" /></button>
          </form>
        </section>
      )}

      <button onClick={() => setOpen(true)} aria-label="Abrir chat legal" className="fixed bottom-24 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#171512] text-[#d4a95d] shadow-[0_15px_35px_rgba(0,0,0,.28)] ring-1 ring-white/12 transition hover:scale-[1.03]">
        <MessageCircle className="size-6" />
      </button>
    </>
  );
}
