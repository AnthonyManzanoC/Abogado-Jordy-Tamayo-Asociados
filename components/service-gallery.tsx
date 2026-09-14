'use client';

import { assetUrl } from '@/lib/api';
import { useEffect, useState } from 'react';
import type { LegalService } from '@/lib/site-data';

export function getServiceGallery(service: LegalService) {
  return (service.galleryImageUrls || []).filter(Boolean).slice(0, 4);
}

export function ServiceGalleryBackground({ service, className = '' }: { service: LegalService; className?: string }) {
  const images = getServiceGallery(service);
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length, service.id]);
  if (!images.length) return null;

  return (
    <div className={`service-gallery-frame pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={assetUrl(image)}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ animation: 'none', opacity: index === active ? 1 : 0, transition: 'opacity 900ms ease' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/34 to-black/16" />
      <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">{images.map((_, index) => <span key={index} className={`h-0.5 rounded-full transition-all ${index === active ? 'w-6 bg-[#d4a95d]' : 'w-2 bg-white/40'}`} />)}</div>
    </div>
  );
}
