# Jordy Tamayo — plataforma legal

Sitio público y CMS administrativo para el despacho del Abg. Jordy Tamayo.

## Arquitectura

- Frontend Next-compatible: React 19 + Vinext, SSR, TypeScript y Tailwind CSS.
- Backend: ASP.NET Core 9, API REST, JWT, PBKDF2 y capas `Domain`, `Features` e `Infrastructure`.
- Datos: PostgreSQL en Supabase mediante Npgsql + Dapper.
- Multimedia: fotografías iniciales en el frontend y nuevas cargas administrativas persistidas en PostgreSQL.

## Ejecutar

En una copia nueva del repositorio, instale las dependencias y cree la configuración local:

```powershell
npm ci
dotnet restore JordyTamayo.sln
Copy-Item .env.example .env.local
```

Complete `.env.local` con su conexión PostgreSQL y sus propios valores de `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `JWT_SECRET`. Las credenciales y los datos de clientes no se incluyen en el repositorio. El administrador existente conserva su contraseña; `ADMIN_PASSWORD` solo se usa al crearlo por primera vez.

La configuración local está en `.env.local` (archivo ignorado por Git). Para iniciar ambos servicios:

```powershell
.\start-local.ps1
```

También pueden ejecutarse por separado:

```powershell
npm run dev
dotnet run --project backend\src\JordyTamayo.Api --urls http://localhost:5188
```

La API aplica automáticamente las migraciones pendientes y crea el contenido inicial al arrancar.

## Rutas principales

- `/`: sitio público.
- `/servicios`: índice completo de áreas de práctica.
- `/servicios/[slug]`: página dinámica de cada servicio.
- `/perfil`: biografía, enfoque y trayectoria.
- `/vitrina-legal`: biblioteca filtrable de publicaciones; incrusta enlaces compatibles de TikTok, Instagram y YouTube.
- `/contacto`: ubicación, WhatsApp y formulario completo de consulta.
- `/admin`: identidad, biografía, imágenes, servicios, vitrina legal, consultas, WhatsApp, redes y ubicación.
- `/api/health`: comprobación de la API.

## PWA y WhatsApp

- El sitio es instalable como aplicación con manifiesto, service worker e iconos propios en `public/icons`.
- El botón **Habla con el Abg.** aparece en todo el sitio y abre WhatsApp con un mensaje preparado.
- El número utilizado por el botón se configura desde `/admin`, en **Contacto y canales**.

Antes de desplegar, cambie `ADMIN_PASSWORD`, `JWT_SECRET` y configure las variables equivalentes en Vercel/Render.
