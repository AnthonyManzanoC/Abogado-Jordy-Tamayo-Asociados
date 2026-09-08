CREATE TABLE IF NOT EXISTS site_profile (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    brand_name text NOT NULL DEFAULT 'Jordy Tamayo',
    full_name text NOT NULL DEFAULT 'Abg. Jordy Tamayo',
    credentials text NOT NULL DEFAULT 'Abogado · Máster',
    eyebrow text NOT NULL DEFAULT 'Estrategia legal · Babahoyo',
    hero_title text NOT NULL DEFAULT 'Derecho con',
    hero_accent text NOT NULL DEFAULT 'criterio y carácter.',
    hero_description text NOT NULL DEFAULT 'Asesoría jurídica cercana, estratégica y directa.',
    bio_title text NOT NULL DEFAULT 'Preparación que se convierte en estrategia.',
    bio_body text NOT NULL DEFAULT 'Una práctica jurídica moderna, construida sobre estudio constante, análisis riguroso y una comunicación clara con cada cliente.',
    social_proof text NOT NULL DEFAULT '200K+',
    social_proof_label text NOT NULL DEFAULT 'comunidad en TikTok',
    metric_one_value text NOT NULL DEFAULT '01',
    metric_one_label text NOT NULL DEFAULT 'estrategia para cada caso',
    metric_two_value text NOT NULL DEFAULT '360°',
    metric_two_label text NOT NULL DEFAULT 'visión legal',
    address_line1 text NOT NULL DEFAULT 'Edificio Alavama',
    address_line2 text NOT NULL DEFAULT 'Calle Sucre y Av. 5 de Junio',
    city text NOT NULL DEFAULT 'Babahoyo, Los Ríos',
    google_maps_url text NOT NULL DEFAULT 'https://maps.google.com/?q=Edificio+Alavama+Babahoyo',
    whatsapp_number text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT 'contacto@jordytamayo.ec',
    phone text NOT NULL DEFAULT '',
    tiktok_url text NOT NULL DEFAULT 'https://www.tiktok.com/@jordytamayo',
    instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/jordytamayo28',
    facebook_url text NOT NULL DEFAULT 'https://www.facebook.com/share/19PQUeXhoj/',
    hero_image_url text NOT NULL DEFAULT '/images/jordy-tamayo-hero.png',
    portrait_image_url text NOT NULL DEFAULT '/images/jordy-tamayo-office.png',
    degree_image_url text NOT NULL DEFAULT '/images/jordy-tamayo-maestria.png',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_services (
    id uuid PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    short_description text NOT NULL,
    long_description text NOT NULL,
    icon text NOT NULL DEFAULT 'Scale',
    accent text NOT NULL DEFAULT '01',
    is_featured boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_posts (
    id uuid PRIMARY KEY,
    platform text NOT NULL,
    title text NOT NULL,
    url text NOT NULL UNIQUE,
    thumbnail_url text NOT NULL DEFAULT '',
    caption text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT 'Actualidad',
    display_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    whatsapp text NOT NULL,
    email text NOT NULL DEFAULT '',
    legal_area text NOT NULL,
    consultation_type text NOT NULL DEFAULT 'Presencial',
    preferred_date date,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'Nuevo',
    source text NOT NULL DEFAULT 'Web',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_created_idx ON leads(status, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    password_salt text NOT NULL,
    role text NOT NULL DEFAULT 'Admin',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id uuid PRIMARY KEY,
    file_name text NOT NULL,
    content_type text NOT NULL,
    content bytea NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
