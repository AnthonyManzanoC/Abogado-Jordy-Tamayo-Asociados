CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE site_profile
    ADD COLUMN IF NOT EXISTS google_maps_embed_url text NOT NULL DEFAULT 'https://www.google.com/maps?q=Edificio%20Alavama%20Babahoyo&output=embed',
    ADD COLUMN IF NOT EXISTS office_building_image_url text NOT NULL DEFAULT '/images/jordy-tamayo-office.png';

ALTER TABLE legal_services
    ADD COLUMN IF NOT EXISTS gallery_image_urls text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS tracking_token text,
    ADD COLUMN IF NOT EXISTS appointment_status text NOT NULL DEFAULT 'Pendiente',
    ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'No requerido',
    ADD COLUMN IF NOT EXISTS payment_proof_url text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS payment_notes text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS public_notes text NOT NULL DEFAULT '';

UPDATE leads
SET tracking_token = replace(gen_random_uuid()::text, '-', '')
WHERE tracking_token IS NULL OR tracking_token = '';

ALTER TABLE leads
    ALTER COLUMN tracking_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS leads_tracking_token_key ON leads(tracking_token);
CREATE INDEX IF NOT EXISTS leads_payment_status_created_idx ON leads(payment_status, created_at DESC);

CREATE TABLE IF NOT EXISTS notification_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled boolean NOT NULL DEFAULT false,
    provider text NOT NULL DEFAULT 'Brevo',
    admin_email text NOT NULL DEFAULT 'janthonymc09@gmail.com',
    sender_name text NOT NULL DEFAULT 'Jordy Tamayo & Asociados',
    sender_email text NOT NULL DEFAULT 'janthonymc09@gmail.com',
    brevo_api_key text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO notification_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS notification_logs (
    id uuid PRIMARY KEY,
    lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
    kind text NOT NULL,
    recipient text NOT NULL,
    status text NOT NULL,
    provider_message_id text NOT NULL DEFAULT '',
    error_message text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

UPDATE legal_services
SET gallery_image_urls = ARRAY[
    '/images/services/penal-1.svg',
    '/images/services/penal-2.svg',
    '/images/services/penal-3.svg',
    '/images/services/penal-4.svg'
]
WHERE slug = 'derecho-penal' AND cardinality(gallery_image_urls) = 0;

UPDATE legal_services
SET gallery_image_urls = ARRAY[
    '/images/services/familia-1.svg',
    '/images/services/familia-2.svg',
    '/images/services/familia-3.svg',
    '/images/services/familia-4.svg'
]
WHERE slug = 'derecho-familia' AND cardinality(gallery_image_urls) = 0;

UPDATE legal_services
SET gallery_image_urls = ARRAY[
    '/images/services/civil-1.svg',
    '/images/services/civil-2.svg',
    '/images/services/civil-3.svg',
    '/images/services/civil-4.svg'
]
WHERE slug = 'derecho-civil' AND cardinality(gallery_image_urls) = 0;

UPDATE legal_services
SET gallery_image_urls = ARRAY[
    '/images/services/transito-1.svg',
    '/images/services/transito-2.svg',
    '/images/services/transito-3.svg',
    '/images/services/transito-4.svg'
]
WHERE slug = 'transito' AND cardinality(gallery_image_urls) = 0;
