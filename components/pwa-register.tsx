'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const capturePrompt = (event: Event) => {
      setInstallPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setHidden(true);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  if (!installPrompt || hidden) return null;

  async function install() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
      setHidden(true);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border border-white/12 bg-[#171512] p-1.5 pl-4 text-white shadow-[0_15px_35px_rgba(0,0,0,.25)]">
      <button onClick={install} className="flex items-center gap-2 text-xs font-semibold"><Download className="size-4 text-[#d4a95d]" /> Instalar app</button>
      <button onClick={() => setHidden(true)} aria-label="Cerrar invitación de instalación" className="grid size-8 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"><X className="size-3.5" /></button>
    </div>
  );
}
