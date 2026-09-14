'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Eye,
  FileImage,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  MailCheck,
  MapPinned,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Pencil,
  Plus,
  Save,
  Scale,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiFetch, authHeaders, assetUrl } from '@/lib/api';
import { defaultNotificationSettings, defaultProfile, type Lead, type LegalService, type MediaPost, type NotificationSettings, type SiteProfile } from '@/lib/site-data';

type Section = 'resumen' | 'identidad' | 'servicios' | 'vitrina' | 'consultas' | 'configuracion';
type DashboardData = { totalLeads: number; newLeads: number; services: number; mediaPosts: number; recentLeads: Lead[] };

const blankService: LegalService = { id: '', slug: '', name: '', shortDescription: '', longDescription: '', icon: 'Scale', accent: '05', galleryImageUrls: ['', '', '', ''], isFeatured: true, displayOrder: 5, active: true };
const blankMedia: MediaPost = { id: '', platform: 'TikTok', title: '', url: '', thumbnailUrl: '/images/jordy-tamayo-office.png', caption: '', category: 'Actualidad', displayOrder: 4, active: true };
const leadStatusOptions = ['Nuevo', 'Pago pendiente', 'Comprobante recibido', 'Contactado', 'Agendado', 'Atendido', 'Cerrado', 'Archivado'];

export function AdminCms() {
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>('resumen');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<SiteProfile>(defaultProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings);
  const [services, setServices] = useState<LegalService[]>([]);
  const [media, setMedia] = useState<MediaPost[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData>({ totalLeads: 0, newLeads: 0, services: 0, mediaPosts: 0, recentLeads: [] });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [serviceEditor, setServiceEditor] = useState<LegalService | null>(null);
  const [mediaEditor, setMediaEditor] = useState<MediaPost | null>(null);

  const loadAll = useCallback(async (authToken: string) => {
    const headers = authHeaders(authToken);
    try {
      const [nextProfile, nextNotifications, nextServices, nextMedia, nextLeads, nextDashboard] = await Promise.all([
        apiFetch<SiteProfile>('/api/admin/profile', { headers }),
        apiFetch<NotificationSettings>('/api/admin/notifications', { headers }),
        apiFetch<LegalService[]>('/api/admin/services', { headers }),
        apiFetch<MediaPost[]>('/api/admin/media', { headers }),
        apiFetch<Lead[]>('/api/admin/leads', { headers }),
        apiFetch<DashboardData>('/api/admin/dashboard', { headers }),
      ]);
      setProfile(nextProfile); setNotifications(nextNotifications); setServices(nextServices); setMedia(nextMedia); setLeads(nextLeads); setDashboard(nextDashboard);
    } catch {
      localStorage.removeItem('jt-admin-token');
      setToken('');
    } finally { setChecking(false); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('jt-admin-token') || '';
    if (saved) { setToken(saved); void loadAll(saved); } else setChecking(false);
  }, [loadAll]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setNotice('');
    const data = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
      localStorage.setItem('jt-admin-token', result.token);
      setToken(result.token);
      await loadAll(result.token);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No fue posible iniciar sesión.'); }
    finally { setLoading(false); }
  }

  function logout() { localStorage.removeItem('jt-admin-token'); setToken(''); }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  }

  async function saveProfile() {
    setLoading(true);
    try {
      const saved = await apiFetch<SiteProfile>('/api/admin/profile', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(profile) });
      setProfile(saved); showNotice('Cambios publicados correctamente.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible guardar.'); }
    finally { setLoading(false); }
  }

  async function saveNotifications(next?: NotificationSettings) {
    setLoading(true);
    try {
      const payload = next ?? notifications;
      const saved = await apiFetch<NotificationSettings>('/api/admin/notifications', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      setNotifications(saved);
      showNotice('Correo y notificaciones guardados.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible guardar el correo.'); }
    finally { setLoading(false); }
  }

  async function testNotifications(email?: string) {
    setLoading(true);
    try {
      const result = await apiFetch<{ message: string }>('/api/admin/notifications/test', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ email: email || notifications.adminEmail }),
      });
      showNotice(result.message);
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible enviar la prueba.'); }
    finally { setLoading(false); }
  }

  async function uploadImage(file: File, key: 'heroImageUrl' | 'portraitImageUrl' | 'degreeImageUrl' | 'officeBuildingImageUrl' | 'thumbnailUrl' | 'serviceGallery', index = 0) {
    const body = new FormData(); body.append('file', file);
    setLoading(true);
    try {
      const result = await apiFetch<{ url: string }>('/api/admin/upload', { method: 'POST', headers: authHeaders(token), body });
      if (key === 'thumbnailUrl') setMediaEditor((current) => current ? { ...current, thumbnailUrl: result.url } : current);
      else if (key === 'serviceGallery') setServiceEditor((current) => {
        if (!current) return current;
        const gallery = [...(current.galleryImageUrls || [])];
        while (gallery.length < 4) gallery.push('');
        gallery[index] = result.url;
        return { ...current, galleryImageUrls: gallery };
      });
      else setProfile((current) => ({ ...current, [key]: result.url }));
      showNotice('Imagen cargada. Guarde los cambios para publicarla.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible cargar la imagen.'); }
    finally { setLoading(false); }
  }

  async function saveService(item: LegalService) {
    setLoading(true);
    try {
      const path = item.id ? `/api/admin/services/${item.id}` : '/api/admin/services';
      await apiFetch(path, { method: item.id ? 'PUT' : 'POST', headers: authHeaders(token), body: JSON.stringify(item) });
      setServices(await apiFetch('/api/admin/services', { headers: authHeaders(token) }));
      setServiceEditor(null); showNotice('Servicio guardado y publicado.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible guardar el servicio.'); }
    finally { setLoading(false); }
  }

  async function deleteService(id: string) {
    if (!window.confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
    await apiFetch(`/api/admin/services/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    setServices((items) => items.filter((item) => item.id !== id)); showNotice('Servicio eliminado.');
  }

  async function saveMedia(item: MediaPost) {
    setLoading(true);
    try {
      const path = item.id ? `/api/admin/media/${item.id}` : '/api/admin/media';
      await apiFetch(path, { method: item.id ? 'PUT' : 'POST', headers: authHeaders(token), body: JSON.stringify(item) });
      setMedia(await apiFetch('/api/admin/media', { headers: authHeaders(token) }));
      setMediaEditor(null); showNotice('Publicación guardada.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No fue posible guardar la publicación.'); }
    finally { setLoading(false); }
  }

  async function deleteMedia(id: string) {
    if (!window.confirm('¿Eliminar esta publicación de la vitrina?')) return;
    await apiFetch(`/api/admin/media/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    setMedia((items) => items.filter((item) => item.id !== id)); showNotice('Publicación eliminada.');
  }

  async function updateLeadStatus(id: string, status: string) {
    const updated = await apiFetch<Lead>(`/api/admin/leads/${id}/status`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ status }) });
    setLeads((items) => items.map((item) => item.id === id ? updated : item));
    showNotice('Estado actualizado.');
  }

  if (checking) return <div className="grid min-h-screen place-items-center bg-[#f4f1eb]"><Loader2 className="size-7 animate-spin text-[#9a6728]" /></div>;
  if (!token) return <AdminLogin onSubmit={login} loading={loading} error={notice} />;

  const titles: Record<Section, [string, string]> = {
    resumen: ['Panel general', 'Una vista rápida de la actividad del despacho.'],
    identidad: ['Identidad y contenido', 'Edite la portada, biografía, métricas e imágenes públicas.'],
    servicios: ['Servicios legales', 'Cree y ordene las áreas de práctica con su página dedicada.'],
    vitrina: ['Vitrina legal', 'Enlace videos, casos y publicaciones destacadas de sus redes.'],
    consultas: ['Consultas y citas', 'Gestione cada contacto desde su llegada hasta el cierre.'],
    configuracion: ['Contacto, mapa y correo', 'Configure WhatsApp, redes, ubicación, mapa embebido y notificaciones Brevo.'],
  };

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#191713]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[#171512] p-4 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-2"><AdminBrand /><button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="size-5" /></button></div>
        <nav className="mt-7 space-y-1">
          <NavButton active={section === 'resumen'} icon={LayoutDashboard} label="Resumen" onClick={() => { setSection('resumen'); setSidebarOpen(false); }} />
          <NavButton active={section === 'identidad'} icon={CircleUserRound} label="Identidad y contenido" onClick={() => { setSection('identidad'); setSidebarOpen(false); }} />
          <NavButton active={section === 'servicios'} icon={BriefcaseBusiness} label="Servicios" onClick={() => { setSection('servicios'); setSidebarOpen(false); }} />
          <NavButton active={section === 'vitrina'} icon={MessageSquareText} label="Vitrina legal" onClick={() => { setSection('vitrina'); setSidebarOpen(false); }} />
          <NavButton active={section === 'consultas'} icon={Inbox} label="Consultas" badge={dashboard.newLeads || undefined} onClick={() => { setSection('consultas'); setSidebarOpen(false); }} />
          <NavButton active={section === 'configuracion'} icon={Settings} label="Contacto y canales" onClick={() => { setSection('configuracion'); setSidebarOpen(false); }} />
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-[10px] uppercase tracking-[.18em] text-white/35">Sitio público</p><p className="mt-1 text-sm font-medium">Contenido sincronizado</p><a href="/" target="_blank" className="mt-4 inline-flex items-center gap-2 text-xs text-[#d4a95d]">Abrir página <ArrowUpRight className="size-3.5" /></a></div>
        <button onClick={logout} className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"><LogOut className="size-4" /> Cerrar sesión</button>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/8 bg-[#f4f1eb]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <button onClick={() => setSidebarOpen(true)} className="grid size-10 place-items-center rounded-full border border-black/10 lg:hidden"><Menu className="size-5" /></button>
          <div className="hidden items-center gap-2 text-sm text-black/45 lg:flex"><Sparkles className="size-4 text-[#a36d29]" /> Administración de contenido</div>
          <div className="flex items-center gap-3"><a href="/" target="_blank" className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold sm:flex"><Eye className="size-4" /> Ver sitio</a><button aria-label="Notificaciones" className="grid size-10 place-items-center rounded-full border border-black/10 bg-white"><Bell className="size-4" /></button><span className="grid size-10 place-items-center rounded-full bg-[#191713] text-sm font-semibold text-white">JT</span></div>
        </header>

        <div className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{titles[section][0]}</h1><p className="mt-2 text-sm text-black/48">{titles[section][1]}</p></div>{(section === 'identidad' || section === 'configuracion') && <button onClick={saveProfile} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#191713] px-5 text-sm font-semibold text-white disabled:opacity-50"><Save className="size-4" /> Guardar y publicar</button>}</div>

          {section === 'resumen' && <Overview dashboard={dashboard} leads={leads} setSection={setSection} />}
          {section === 'identidad' && <IdentityEditor profile={profile} setProfile={setProfile} onUpload={uploadImage} />}
          {section === 'servicios' && <ServicesManager services={services} onEdit={setServiceEditor} onDelete={deleteService} />}
          {section === 'vitrina' && <MediaManager posts={media} onEdit={setMediaEditor} onDelete={deleteMedia} />}
          {section === 'consultas' && <LeadsManager leads={leads} onStatus={updateLeadStatus} />}
          {section === 'configuracion' && <SettingsEditor profile={profile} setProfile={setProfile} notifications={notifications} setNotifications={setNotifications} onUpload={uploadImage} onSaveNotifications={saveNotifications} onTestNotifications={testNotifications} loading={loading} />}
        </div>
      </div>

      {sidebarOpen && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />}
      {notice && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#191713] px-5 py-3 text-sm font-medium text-white shadow-xl"><Check className="size-4 text-[#d4a95d]" /> {notice}</div>}
      <ServiceDialog value={serviceEditor} onChange={setServiceEditor} onSave={saveService} onUpload={uploadImage} loading={loading} />
      <MediaDialog value={mediaEditor} onChange={setMediaEditor} onSave={saveMedia} onUpload={uploadImage} loading={loading} />
      {section === 'servicios' && <button onClick={() => setServiceEditor({ ...blankService, displayOrder: services.length + 1, accent: String(services.length + 1).padStart(2, '0') })} className="fixed bottom-6 right-6 z-20 inline-flex h-13 items-center gap-2 rounded-full bg-[#d1a052] px-6 text-sm font-semibold text-[#17120c] shadow-xl lg:right-10"><Plus className="size-4" /> Nuevo servicio</button>}
      {section === 'vitrina' && <button onClick={() => setMediaEditor({ ...blankMedia, displayOrder: media.length + 1 })} className="fixed bottom-6 right-6 z-20 inline-flex h-13 items-center gap-2 rounded-full bg-[#d1a052] px-6 text-sm font-semibold text-[#17120c] shadow-xl lg:right-10"><Plus className="size-4" /> Añadir publicación</button>}
    </main>
  );
}

function AdminLogin({ onSubmit, loading, error }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; loading: boolean; error: string }) {
  return <main className="grid min-h-screen bg-[#11100e] lg:grid-cols-2"><section className="relative hidden overflow-hidden lg:block"><img src="/images/jordy-tamayo-hero.png" alt="Abg. Jordy Tamayo" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/10" /><div className="absolute inset-x-0 bottom-0 p-12 text-white"><span className="text-xs uppercase tracking-[.2em] text-[#d4a95d]">Panel administrativo</span><h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[.95] tracking-[-.04em]">Su despacho,<br />siempre actualizado.</h1></div></section><section className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md text-white"><AdminBrand /><div className="mt-16"><h2 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h2><p className="mt-2 text-sm text-white/42">Ingrese para gestionar contenido, consultas y canales.</p></div><form onSubmit={onSubmit} className="mt-9 space-y-5"><label className="grid gap-2 text-sm"><span className="text-white/70">Correo</span><Input name="email" type="email" required defaultValue="admin@jordytamayo.ec" className="h-12 border-white/15 bg-white/5 text-white placeholder:text-white/25" /></label><label className="grid gap-2 text-sm"><span className="text-white/70">Contraseña</span><Input name="password" type="password" required className="h-12 border-white/15 bg-white/5 text-white" /></label>{error && <p className="text-sm text-red-300">{error}</p>}<button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d4a95d] text-sm font-semibold text-[#17120c] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />} Ingresar al panel</button></form><a href="/" className="mt-7 inline-flex items-center gap-2 text-sm text-white/38 hover:text-white"><ArrowLeft className="size-4" /> Volver al sitio</a></div></section></main>;
}

function AdminBrand() { return <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-white/15 text-[#d4a95d]"><Scale className="size-5" /></span><span className="text-white"><strong className="block text-sm tracking-[.11em]">JORDY TAMAYO</strong><small className="text-[9px] tracking-[.21em] text-white/35">LEGAL ADMIN</small></span></div>; }

function NavButton({ active, icon: Icon, label, onClick, badge }: { active: boolean; icon: typeof LayoutDashboard; label: string; onClick: () => void; badge?: number }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active ? 'bg-[#d4a95d] font-semibold text-[#17120c]' : 'text-white/52 hover:bg-white/5 hover:text-white'}`}><Icon className="size-4" /><span className="flex-1">{label}</span>{badge ? <span className={`grid min-w-5 place-items-center rounded-full px-1 text-[10px] ${active ? 'bg-black/12' : 'bg-[#d4a95d] text-black'}`}>{badge}</span> : null}</button>; }

function Overview({ dashboard, leads, setSection }: { dashboard: DashboardData; leads: Lead[]; setSection: (section: Section) => void }) {
  const cards = [
    ['Consultas totales', dashboard.totalLeads, Inbox], ['Nuevas por atender', dashboard.newLeads, Bell], ['Servicios activos', dashboard.services, BriefcaseBusiness], ['Contenido publicado', dashboard.mediaPosts, MessageSquareText],
  ] as const;
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-black/8 bg-white p-6"><div className="flex items-center justify-between"><span className="text-sm text-black/45">{label}</span><span className="grid size-9 place-items-center rounded-full bg-[#efe7da] text-[#9a6728]"><Icon className="size-4" /></span></div><p className="mt-8 text-4xl font-semibold tracking-tight">{value}</p></div>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="rounded-2xl border border-black/8 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Consultas recientes</h2><p className="mt-1 text-xs text-black/40">Contactos recibidos desde la web</p></div><button onClick={() => setSection('consultas')} className="text-xs font-semibold text-[#9a6728]">Ver todas</button></div><div className="mt-5 divide-y divide-black/8">{leads.slice(0, 5).map((lead) => <div key={lead.id} className="flex items-center gap-4 py-4"><span className="grid size-10 place-items-center rounded-full bg-[#f2eee7] text-sm font-semibold">{lead.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{lead.name}</p><p className="truncate text-xs text-black/42">{lead.legalArea} · {lead.consultationType}</p></div><StatusBadge status={lead.status} /></div>)}{!leads.length && <Empty text="Las nuevas consultas aparecerán aquí." />}</div></div><div className="relative overflow-hidden rounded-2xl bg-[#191713] p-7 text-white"><div className="hero-grid absolute inset-0 opacity-30" /><div className="relative"><span className="grid size-11 place-items-center rounded-full bg-[#d4a95d] text-[#17120c]"><BarChart3 className="size-5" /></span><h2 className="mt-10 text-2xl font-semibold">La web está lista para convertir visitas en consultas.</h2><p className="mt-3 text-sm leading-6 text-white/45">Revise que su WhatsApp esté configurado antes de compartir el enlace en redes.</p><button onClick={() => setSection('configuracion')} className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#d4a95d]">Configurar canales <ArrowUpRight className="size-3.5" /></button></div></div></div></>;
}

function IdentityEditor({ profile, setProfile, onUpload }: { profile: SiteProfile; setProfile: (value: SiteProfile) => void; onUpload: (file: File, key: 'heroImageUrl' | 'portraitImageUrl' | 'degreeImageUrl') => void }) {
  const update = (key: keyof SiteProfile, value: string) => setProfile({ ...profile, [key]: value });
  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-6"><EditorCard title="Portada" description="El primer mensaje que verá una persona al entrar."><div className="grid gap-5 sm:grid-cols-2"><FormField label="Etiqueta superior"><Input value={profile.eyebrow} onChange={(e) => update('eyebrow', e.target.value)} /></FormField><FormField label="Nombre público"><Input value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} /></FormField><FormField label="Primera línea"><Input value={profile.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} /></FormField><FormField label="Línea destacada"><Input value={profile.heroAccent} onChange={(e) => update('heroAccent', e.target.value)} /></FormField><div className="sm:col-span-2"><FormField label="Descripción"><Textarea value={profile.heroDescription} onChange={(e) => update('heroDescription', e.target.value)} className="min-h-24" /></FormField></div></div></EditorCard><EditorCard title="Biografía" description="Presente su formación, enfoque y forma de trabajar."><div className="grid gap-5"><FormField label="Título de la sección"><Input value={profile.bioTitle} onChange={(e) => update('bioTitle', e.target.value)} /></FormField><FormField label="Texto biográfico"><Textarea value={profile.bioBody} onChange={(e) => update('bioBody', e.target.value)} className="min-h-36" /></FormField><FormField label="Credenciales"><Input value={profile.credentials} onChange={(e) => update('credentials', e.target.value)} /></FormField></div></EditorCard><EditorCard title="Cifras de autoridad" description="Mantenga estos datos precisos y verificables."><div className="grid gap-5 sm:grid-cols-2"><FormField label="Prueba social"><Input value={profile.socialProof} onChange={(e) => update('socialProof', e.target.value)} /></FormField><FormField label="Descripción"><Input value={profile.socialProofLabel} onChange={(e) => update('socialProofLabel', e.target.value)} /></FormField><FormField label="Métrica 1"><Input value={profile.metricOneValue} onChange={(e) => update('metricOneValue', e.target.value)} /></FormField><FormField label="Etiqueta métrica 1"><Input value={profile.metricOneLabel} onChange={(e) => update('metricOneLabel', e.target.value)} /></FormField><FormField label="Métrica 2"><Input value={profile.metricTwoValue} onChange={(e) => update('metricTwoValue', e.target.value)} /></FormField><FormField label="Etiqueta métrica 2"><Input value={profile.metricTwoLabel} onChange={(e) => update('metricTwoLabel', e.target.value)} /></FormField></div></EditorCard></div><div className="space-y-5"><ImageUploader title="Foto principal" url={profile.heroImageUrl} onFile={(file) => onUpload(file, 'heroImageUrl')} /><ImageUploader title="Foto de perfil" url={profile.portraitImageUrl} onFile={(file) => onUpload(file, 'portraitImageUrl')} /><ImageUploader title="Foto académica" url={profile.degreeImageUrl} onFile={(file) => onUpload(file, 'degreeImageUrl')} /></div></div>;
}

function ServicesManager({ services, onEdit, onDelete }: { services: LegalService[]; onEdit: (item: LegalService) => void; onDelete: (id: string) => void }) { return <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{services.map((service) => <div key={service.id} className="relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-black/8 bg-white p-6">{service.galleryImageUrls?.[0] && <img src={assetUrl(service.galleryImageUrls[0])} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[.08]" />}<div className="relative flex items-start justify-between"><span className="text-xs font-semibold text-[#9a6728]">{service.accent}</span><StatusBadge status={service.active ? 'Publicado' : 'Oculto'} /></div><h2 className="relative mt-10 text-2xl font-semibold tracking-tight">{service.name}</h2><p className="relative mt-3 line-clamp-2 text-sm leading-6 text-black/45">{service.shortDescription}</p><div className="relative mt-auto flex gap-2 pt-6"><button onClick={() => onEdit({ ...service, galleryImageUrls: service.galleryImageUrls || [] })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2.5 text-xs font-semibold backdrop-blur"><Pencil className="size-3.5" /> Editar</button><button onClick={() => onDelete(service.id)} aria-label={`Eliminar ${service.name}`} className="grid size-10 place-items-center rounded-xl border border-red-200 bg-white/80 text-red-600 backdrop-blur"><Trash2 className="size-4" /></button></div></div>)}{!services.length && <Empty text="Aún no hay servicios. Cree el primero." />}</div>; }

function MediaManager({ posts, onEdit, onDelete }: { posts: MediaPost[]; onEdit: (item: MediaPost) => void; onDelete: (id: string) => void }) { return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <div key={post.id} className="overflow-hidden rounded-2xl border border-black/8 bg-white"><div className="relative h-56 bg-[#191713]"><img src={assetUrl(post.thumbnailUrl)} alt="" className="h-full w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-white backdrop-blur">{post.platform}</span></div><div className="p-5"><p className="text-xs text-[#9a6728]">{post.category}</p><h2 className="mt-2 text-lg font-semibold">{post.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-black/45">{post.caption}</p><div className="mt-5 flex gap-2"><button onClick={() => onEdit({ ...post })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-xs font-semibold"><Pencil className="size-3.5" /> Editar</button><button onClick={() => onDelete(post.id)} className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600"><Trash2 className="size-4" /></button></div></div></div>)}</div>; }

function LeadsManager({ leads, onStatus }: { leads: Lead[]; onStatus: (id: string, status: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-black/8 bg-[#faf8f4] text-xs text-black/40">
            <tr>
              <th className="px-5 py-4 font-medium">Cliente</th>
              <th className="px-5 py-4 font-medium">Consulta</th>
              <th className="px-5 py-4 font-medium">Seguimiento</th>
              <th className="px-5 py-4 font-medium">Pago</th>
              <th className="px-5 py-4 font-medium">Recibida</th>
              <th className="px-5 py-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top">
                <td className="px-5 py-5">
                  <strong>{lead.name}</strong>
                  <span className="mt-1 block text-xs text-black/40">{lead.consultationType}</span>
                  <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-semibold text-[#267b4a]">{lead.whatsapp}</a>
                  {lead.email && <span className="mt-1 block text-xs text-black/40">{lead.email}</span>}
                </td>
                <td className="max-w-sm px-5 py-5">
                  <strong className="text-xs text-[#9a6728]">{lead.legalArea}</strong>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/50">{lead.message}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[.14em] text-black/32"><CalendarCheck className="size-3" /> {lead.appointmentStatus || 'Pendiente'}</span>
                </td>
                <td className="px-5 py-5">
                  <a href={`/seguimiento/${lead.trackingToken}`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold"><MapPinned className="size-3.5" /> Abrir link</a>
                  <span className="mt-2 block max-w-[210px] truncate text-[10px] text-black/35">{lead.trackingToken}</span>
                </td>
                <td className="px-5 py-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f1eb] px-3 py-2 text-xs font-semibold text-black/55"><CreditCard className="size-3.5 text-[#9a6728]" /> {lead.paymentStatus || 'No requerido'}</span>
                  {lead.paymentProofUrl && <a href={assetUrl(lead.paymentProofUrl)} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-semibold text-[#9a6728]">Ver comprobante</a>}
                </td>
                <td className="px-5 py-5 text-xs text-black/45">{new Date(lead.createdAt).toLocaleDateString('es-EC')}</td>
                <td className="px-5 py-5">
                  <select value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value)} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold">
                    {leadStatusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!leads.length && <Empty text="Todavía no se han recibido consultas." />}
    </div>
  );
}

function SettingsEditor({
  profile,
  setProfile,
  notifications,
  setNotifications,
  onUpload,
  onSaveNotifications,
  onTestNotifications,
  loading,
}: {
  profile: SiteProfile;
  setProfile: (value: SiteProfile) => void;
  notifications: NotificationSettings;
  setNotifications: (value: NotificationSettings) => void;
  onUpload: (file: File, key: 'officeBuildingImageUrl') => void;
  onSaveNotifications: (value?: NotificationSettings) => void;
  onTestNotifications: (email?: string) => void;
  loading: boolean;
}) {
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const update = (key: keyof SiteProfile, value: string) => setProfile({ ...profile, [key]: value });
  const updateNotification = (key: keyof NotificationSettings, value: string | boolean) => setNotifications({ ...notifications, [key]: value });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EditorCard title="WhatsApp y contacto" description="El número debe incluir el código de país. Ejemplo Ecuador: 593...">
        <div className="grid gap-5">
          <FormField label="Número de WhatsApp"><Input value={profile.whatsAppNumber} onChange={(e) => update('whatsAppNumber', e.target.value)} placeholder="593990000000" /></FormField>
          <FormField label="Teléfono"><Input value={profile.phone} onChange={(e) => update('phone', e.target.value)} /></FormField>
          <FormField label="Correo público"><Input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} /></FormField>
        </div>
      </EditorCard>

      <EditorCard title="Redes sociales" description="Pegue los enlaces públicos completos de cada perfil.">
        <div className="grid gap-5">
          <FormField label="TikTok"><Input value={profile.tikTokUrl} onChange={(e) => update('tikTokUrl', e.target.value)} /></FormField>
          <FormField label="Instagram"><Input value={profile.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} /></FormField>
          <FormField label="Facebook"><Input value={profile.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} /></FormField>
        </div>
      </EditorCard>

      <div className="xl:col-span-2">
        <EditorCard title="Ubicación del despacho" description="El mapa embebido y la foto salen en inicio y contacto.">
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Edificio"><Input value={profile.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} /></FormField>
              <FormField label="Calles"><Input value={profile.addressLine2} onChange={(e) => update('addressLine2', e.target.value)} /></FormField>
              <FormField label="Ciudad"><Input value={profile.city} onChange={(e) => update('city', e.target.value)} /></FormField>
              <FormField label="Enlace de Google Maps"><Input value={profile.googleMapsUrl} onChange={(e) => update('googleMapsUrl', e.target.value)} /></FormField>
              <div className="sm:col-span-2"><FormField label="URL del mapa embebido"><Input value={profile.googleMapsEmbedUrl} onChange={(e) => update('googleMapsEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps?...&output=embed" /></FormField></div>
            </div>
            <ImageUploader title="Foto del edificio" url={profile.officeBuildingImageUrl} onFile={(file) => onUpload(file, 'officeBuildingImageUrl')} />
          </div>
        </EditorCard>
      </div>

      <div className="xl:col-span-2">
        <EditorCard title="Correo Brevo" description="Notifica al admin cuando entra una cita, cuando suben comprobante y cuando cambia el estado.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2"><MailCheck className="size-4 text-[#9a6728]" /> Notificaciones activas</span>
              <Switch checked={notifications.enabled} onCheckedChange={(checked) => updateNotification('enabled', checked)} />
            </label>
            <FormField label="Correo del admin"><Input type="email" value={notifications.adminEmail} onChange={(e) => updateNotification('adminEmail', e.target.value)} /></FormField>
            <FormField label="Nombre remitente"><Input value={notifications.senderName} onChange={(e) => updateNotification('senderName', e.target.value)} /></FormField>
            <FormField label="Correo remitente verificado"><Input type="email" value={notifications.senderEmail} onChange={(e) => updateNotification('senderEmail', e.target.value)} /></FormField>
            <div className="sm:col-span-2">
              <FormField label={notifications.hasBrevoApiKey ? 'API key Brevo guardada' : 'API key Brevo'}>
                <Input type="password" value={apiKeyDraft} onChange={(e) => setApiKeyDraft(e.target.value)} placeholder={notifications.hasBrevoApiKey ? 'Deje en blanco para conservar la clave actual' : 'Pegue la API key de Brevo'} />
              </FormField>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => { onSaveNotifications({ ...notifications, brevoApiKey: apiKeyDraft }); setApiKeyDraft(''); }} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#191713] px-5 text-sm font-semibold text-white disabled:opacity-50"><Save className="size-4" /> Guardar correo</button>
            <button onClick={() => onTestNotifications(notifications.adminEmail)} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold disabled:opacity-50"><KeyRound className="size-4" /> Enviar prueba</button>
          </div>
        </EditorCard>
      </div>
    </div>
  );
}

function ServiceDialog({
  value,
  onChange,
  onSave,
  onUpload,
  loading,
}: {
  value: LegalService | null;
  onChange: (value: LegalService | null) => void;
  onSave: (value: LegalService) => void;
  onUpload: (file: File, key: 'serviceGallery', index: number) => void;
  loading: boolean;
}) {
  if (!value) return null;
  const update = (key: keyof LegalService, next: string | boolean | number | string[]) => onChange({ ...value, [key]: next });
  const gallery = [...(value.galleryImageUrls || [])];
  while (gallery.length < 4) gallery.push('');
  const updateGallery = (index: number, url: string) => {
    const next = [...gallery];
    next[index] = url;
    update('galleryImageUrls', next);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onChange(null)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{value.id ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          <DialogDescription>Cada servicio tendrá página pública y carrusel visual administrable.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre"><Input value={value.name} onChange={(e) => update('name', e.target.value)} /></FormField>
          <FormField label="URL corta"><Input value={value.slug} onChange={(e) => update('slug', e.target.value)} placeholder="derecho-penal" /></FormField>
          <FormField label="Número"><Input value={value.accent} onChange={(e) => update('accent', e.target.value)} /></FormField>
          <FormField label="Icono"><select value={value.icon} onChange={(e) => update('icon', e.target.value)} className="h-8 rounded-lg border border-input px-2 text-sm"><option>Scale</option><option>Shield</option><option>Users</option><option>FileText</option><option>Car</option><option>Landmark</option><option>BriefcaseBusiness</option></select></FormField>
          <div className="sm:col-span-2"><FormField label="Resumen"><Textarea value={value.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} /></FormField></div>
          <div className="sm:col-span-2"><FormField label="Descripción de la página"><Textarea value={value.longDescription} onChange={(e) => update('longDescription', e.target.value)} className="min-h-28" /></FormField></div>
          <FormField label="Orden"><Input type="number" value={value.displayOrder} onChange={(e) => update('displayOrder', Number(e.target.value))} /></FormField>
          <label className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm"><span>Publicado</span><Switch checked={value.active} onCheckedChange={(checked) => update('active', checked)} /></label>
          <div className="sm:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-black/58"><FileImage className="size-4 text-[#9a6728]" /> Carrusel del servicio</div>
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.slice(0, 4).map((url, index) => (
                <div key={index} className="rounded-2xl border border-black/8 bg-[#faf8f4] p-3">
                  <div className="relative h-36 overflow-hidden rounded-xl bg-[#191713]">
                    {url ? <img src={assetUrl(url)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-white/30">Imagen {index + 1}</div>}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Input value={url} onChange={(e) => updateGallery(index, e.target.value)} placeholder="/images/services/..." />
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white text-xs font-semibold">
                      <Upload className="size-4" /> Subir imagen
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0], 'serviceGallery', index)} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => onSave({ ...value, galleryImageUrls: gallery.slice(0, 4) })} disabled={loading || !value.name || !value.shortDescription} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#191713] px-5 text-sm font-semibold text-white disabled:opacity-40"><Save className="size-4" /> Guardar servicio</button>
      </DialogContent>
    </Dialog>
  );
}

function MediaDialog({ value, onChange, onSave, onUpload, loading }: { value: MediaPost | null; onChange: (value: MediaPost | null) => void; onSave: (value: MediaPost) => void; onUpload: (file: File, key: 'thumbnailUrl') => void; loading: boolean }) { if (!value) return null; const update = (key: keyof MediaPost, next: string | boolean | number) => onChange({ ...value, [key]: next }); return <Dialog open onOpenChange={(open) => !open && onChange(null)}><DialogContent className="max-h-[92vh] overflow-y-auto bg-white sm:max-w-2xl"><DialogHeader><DialogTitle className="text-2xl">{value.id ? 'Editar publicación' : 'Añadir a la vitrina'}</DialogTitle><DialogDescription>Enlace una publicación viral, un caso comentado o contenido educativo.</DialogDescription></DialogHeader><div className="mt-3 grid gap-5 sm:grid-cols-2"><FormField label="Plataforma"><select value={value.platform} onChange={(e) => update('platform', e.target.value)} className="h-8 rounded-lg border border-input px-2 text-sm"><option>TikTok</option><option>Instagram</option><option>Facebook</option><option>YouTube</option></select></FormField><FormField label="Categoría"><Input value={value.category} onChange={(e) => update('category', e.target.value)} /></FormField><div className="sm:col-span-2"><FormField label="Título"><Input value={value.title} onChange={(e) => update('title', e.target.value)} /></FormField></div><div className="sm:col-span-2"><FormField label="Enlace de la publicación"><Input type="url" value={value.url} onChange={(e) => update('url', e.target.value)} /></FormField></div><div className="sm:col-span-2"><FormField label="Descripción"><Textarea value={value.caption} onChange={(e) => update('caption', e.target.value)} /></FormField></div><div className="sm:col-span-2"><ImageUploader title="Portada de la publicación" url={value.thumbnailUrl} onFile={(file) => onUpload(file, 'thumbnailUrl')} /></div><FormField label="Orden"><Input type="number" value={value.displayOrder} onChange={(e) => update('displayOrder', Number(e.target.value))} /></FormField><label className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm"><span>Publicado</span><Switch checked={value.active} onCheckedChange={(checked) => update('active', checked)} /></label></div><button onClick={() => onSave(value)} disabled={loading || !value.title || !value.url} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#191713] px-5 text-sm font-semibold text-white disabled:opacity-40"><Save className="size-4" /> Guardar publicación</button></DialogContent></Dialog>; }

function EditorCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-black/8 bg-white p-6 sm:p-7"><div className="mb-6 border-b border-black/8 pb-5"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-black/42">{description}</p></div>{children}</section>; }
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-xs font-semibold text-black/58"><span>{label}</span>{children}</label>; }
function ImageUploader({ title, url, onFile }: { title: string; url: string; onFile: (file: File) => void }) { return <div className="overflow-hidden rounded-2xl border border-black/8 bg-white"><div className="relative h-52 bg-[#191713]"><img src={assetUrl(url)} alt="" className="h-full w-full object-cover" /></div><div className="flex items-center justify-between p-4"><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-[10px] text-black/35">JPG, PNG o WebP · máx. 8 MB</p></div><label className="grid size-10 cursor-pointer place-items-center rounded-full border border-black/10 hover:bg-black/5"><Upload className="size-4" /><input type="file" accept="image/*" className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /></label></div></div>; }
function StatusBadge({ status }: { status: string }) { const tone = status === 'Nuevo' || status === 'Publicado' ? 'bg-emerald-50 text-emerald-700' : status === 'Oculto' || status === 'Archivado' ? 'bg-stone-100 text-stone-500' : 'bg-amber-50 text-amber-700'; return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>; }
function Empty({ text }: { text: string }) { return <div className="grid min-h-40 place-items-center p-8 text-center"><div><FileImage className="mx-auto size-7 text-black/20" /><p className="mt-3 text-sm text-black/38">{text}</p></div></div>; }
