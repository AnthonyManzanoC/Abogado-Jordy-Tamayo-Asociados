'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, FileUp, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { API_BASE, apiFetch, assetUrl } from '@/lib/api';
import type { LeadTracking } from '@/lib/site-data';

export function RequestTracking({ token }: { token: string }) {
  const [lead, setLead] = useState<LeadTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setPublicUrl(`${window.location.origin}/seguimiento/${token}`);
    setLoading(true);
    apiFetch<LeadTracking>(`/api/public/requests/${token}`)
      .then(setLead)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'No fue posible encontrar la solicitud.'))
      .finally(() => setLoading(false));
  }, [token]);

  const needsPayment = useMemo(() => Boolean(lead?.consultationType.toLowerCase().includes('virtual') && lead.paymentStatus !== 'No requerido'), [lead]);
  const proofHref = lead?.paymentProofUrl ? assetUrl(lead.paymentProofUrl) : '';

  async function uploadProof(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    setUploading(true);
    setNotice('');
    setError('');
    try {
      const updated = await apiFetch<LeadTracking>(`/api/public/requests/${token}/payment-proof`, { method: 'POST', body });
      setLead(updated);
      setNotice('Comprobante enviado. El despacho fue notificado para validarlo.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible subir el comprobante.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-[#11100e] px-5 py-5 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft className="size-4" /> Volver al inicio</a>
          <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#d4a95d]">Seguimiento seguro</span>
        </div>
      </header>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          {loading && <div className="grid min-h-96 place-items-center"><Loader2 className="size-8 animate-spin text-[#a36d29]" /></div>}
          {!loading && error && !lead && <StatusPanel title="No encontramos esta solicitud" copy={error} />}
          {lead && (
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
              <aside className="rounded-[1.8rem] bg-[#181612] p-7 text-white sm:p-9">
                <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#d4a95d]">Solicitud</span>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{lead.name}</h1>
                <p className="mt-4 text-sm leading-6 text-white/52">{lead.legalArea} · {lead.consultationType}</p>
                <div className="mt-9 space-y-4 border-t border-white/12 pt-7">
                  <Info icon={Clock3} label="Estado de atención" value={lead.appointmentStatus || lead.status} />
                  <Info icon={CreditCard} label="Estado de pago" value={lead.paymentStatus} />
                  {lead.preferredDate && <Info icon={MapPin} label="Fecha preferida" value={new Date(`${lead.preferredDate}T00:00:00`).toLocaleDateString('es-EC')} />}
                </div>
              </aside>

              <section className="rounded-[1.8rem] border border-border bg-card p-6 sm:p-9">
                <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#a36d29]">Estado actual</span>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">{lead.status}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Guarde este enlace para volver a revisar el avance: <span className="font-semibold text-foreground">{publicUrl || `/seguimiento/${lead.trackingToken}`}</span>
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><ShieldCheck className="size-4" /> Solicitud registrada</span>
                </div>

                {lead.publicNotes && <p className="mt-7 rounded-2xl bg-background p-5 text-sm leading-6 text-muted-foreground">{lead.publicNotes}</p>}

                {needsPayment && (
                  <div className="mt-7 rounded-[1.4rem] border border-border bg-background p-5">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d1a052] text-[#17120c]"><FileUp className="size-5" /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold">Comprobante de transferencia</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">Para consulta virtual, suba una imagen o PDF del comprobante. El admin recibirá un aviso para validarlo.</p>
                        {proofHref ? <a href={proofHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-[#9a6728]">Ver comprobante enviado</a> : null}
                        <label className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background">
                          {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                          {uploading ? 'Subiendo...' : proofHref ? 'Reemplazar comprobante' : 'Subir comprobante'}
                          <Input type="file" accept="image/*,application/pdf" className="sr-only" onChange={uploadProof} disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {notice && <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> {notice}</p>}
                {error && <p className="mt-5 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>}

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    ['Recibida', 'Su solicitud ya existe en el sistema.'],
                    ['Revisión', 'El despacho valida datos y modalidad.'],
                    ['Atención', 'Se coordina o atiende la consulta.'],
                  ].map(([title, copy], index) => (
                    <div key={title} className="border-t border-border py-5">
                      <span className="text-xs font-semibold text-[#a36d29]">0{index + 1}</span>
                      <h3 className="mt-8 font-semibold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
      <span className="sr-only">API: {API_BASE}</span>
    </main>
  );
}

function StatusPanel({ title, copy }: { title: string; copy: string }) {
  return <div className="grid min-h-96 place-items-center rounded-[1.8rem] border border-border bg-card p-8 text-center"><div><ShieldCheck className="mx-auto size-10 text-[#a36d29]" /><h1 className="mt-5 text-3xl font-semibold">{title}</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{copy}</p></div></div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 size-5 text-[#d4a95d]" /><div><span className="block text-xs text-white/36">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div></div>;
}
