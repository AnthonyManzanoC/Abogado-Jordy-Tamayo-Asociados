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

Antes de desplegar, use credenciales propias y mantenga `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `JWT_SECRET` exclusivamente en el backend de Render. El frontend solo necesita la URL pública de la API.

## Frontend en Vercel

El frontend usa Vinext, no el compilador de Next.js. La compilación de Vercel usa Nitro para generar las funciones de servidor, las rutas y los archivos públicos en `.vercel/output`; no es una web Vite estática con un `dist/index.html`.

`vercel.json` fija la configuración del despliegue desde Git:

- Raíz del proyecto: raíz del repositorio (`./`).
- Framework: `Vite` (no seleccionar `Next.js`).
- Instalación: `npm ci`.
- Compilación: `npm run build:vercel`.
- Salida: `.vercel/output`, en formato Build Output API de Vercel, con `config.json`, `functions` y `static`.

En Vercel, configure para Production y Preview:

```env
NEXT_PUBLIC_API_URL=https://api-jordy-tamayo.onrender.com
```

Esta variable se incorpora durante la compilación; después de cambiarla es necesario un nuevo despliegue. La aplicación elimina espacios externos y barras finales para evitar rutas `//api/...`. No copie secretos de PostgreSQL ni del administrador a las variables del frontend.

Las compilaciones habituales `npm run build` y el desarrollo local conservan el flujo de Sites/Cloudflare. `npm run build:vercel` selecciona explícitamente la integración para Vercel. No se modifican los estilos ni los componentes visuales.

Validación antes de publicar:

```powershell
npm run build:vercel
npm run check:vercel
dotnet run --project backend/tests/DeploymentChecks/DeploymentChecks.csproj
```

Estas pruebas verifican el servidor generado, siete rutas, navegación RSC, archivos de la PWA, normalización de la URL y permisos CORS. No escriben en la base de datos. Referencias: [Vinext con Nitro](https://github.com/cloudflare/vinext#other-platforms-via-nitro) y [Build Output API](https://vercel.com/docs/build-output-api).

## API en Render con Docker

El archivo `backend/src/JordyTamayo.Api/Dockerfile` compila la API con .NET 9 y publica únicamente los archivos necesarios para ejecutarla, incluidas las migraciones SQL. El contexto de construcción debe ser la **raíz del repositorio**, no la carpeta de la API. `.dockerignore` excluye las credenciales locales y las compilaciones previas.

Al crear el Web Service en Render, use estos valores:

| Campo | Valor |
| --- | --- |
| Branch | `main` |
| Language | `Docker` |
| Root Directory | Vacío (raíz del repositorio) |
| Dockerfile Path | `backend/src/JordyTamayo.Api/Dockerfile` |
| Docker Build Context Directory | `.` (raíz del repositorio) |
| Docker Command | Vacío (usa el arranque del Dockerfile) |
| Health Check Path | `/api/health` |

Configure las siguientes variables en **Environment**, nunca dentro del Dockerfile ni del repositorio:

- `PORT=8080`: coincide con `ASPNETCORE_URLS=http://+:8080` del contenedor.
- `DATABASE_URL`: conexión PostgreSQL de Supabase, con los caracteres especiales de la contraseña codificados en la URL.
- `JWT_SECRET`: secreto aleatorio propio de al menos 32 bytes.
- `ADMIN_EMAIL`: correo del administrador; conserve el mismo al usar una base existente.
- `ADMIN_PASSWORD`: contraseña segura para crear el administrador inicial. No cambia la contraseña de una cuenta existente.

Render utiliza `10000` como puerto predeterminado; este contenedor usa explícitamente `8080`, por lo que debe configurar `PORT=8080`. Consulte [Docker en Render](https://render.com/docs/docker) y [configuración de puertos](https://render.com/docs/web-services#port-binding).

Para verificar la imagen en un equipo con Docker, ejecute desde la raíz:

```powershell
docker build -f backend/src/JordyTamayo.Api/Dockerfile -t jordy-tamayo-api .
docker run --rm -p 8080:8080 --env-file .env.local jordy-tamayo-api
```

La ejecución requiere acceso a PostgreSQL y aplica las migraciones pendientes al arrancar. No use una base de producción para pruebas de arranque. Compruebe después `http://localhost:8080/api/health`.

La política CORS permite el dominio exacto `https://abogado-jordy-tamayo-asociados.vercel.app`, además de `localhost` y `127.0.0.1`. Los dominios adicionales se configuran en Render con `Cors__AllowedOrigins__1`, `Cors__AllowedOrigins__2`, etc., usando el origen HTTPS sin rutas. No se permite de forma general cualquier dominio `*.vercel.app`; cada preview o dominio propio debe autorizarse explícitamente. Después de modificar la política debe desplegarse también la API.
