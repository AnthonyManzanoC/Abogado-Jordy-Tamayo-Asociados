'use client';

import { assetUrl } from '@/lib/api';
import type { LegalService } from '@/lib/site-data';

export function getServiceGallery(service: LegalService) {
  return (service.galleryImageUrls || []).filter(Boolean).slice(0, 4);
}

export function ServiceGalleryBackground({ service, className = '' }: { service: LegalService; className?: string }) {
  const images = getServiceGallery(service);
  if (!images.length) return null;

  return (
    <div className={`service-gallery-frame pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={assetUrl(image)}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/34 to-black/16" />
    </div>
  );
}
