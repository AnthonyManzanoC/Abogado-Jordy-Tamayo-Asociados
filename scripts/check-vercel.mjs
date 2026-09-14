import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';

const output = resolve('.vercel/output');
const config = JSON.parse(await readFile(resolve(output, 'config.json'), 'utf8'));
assert.equal(config.version, 3);
assert.ok(config.routes.some((route) => route.dest === '/__server'));
const { default: server } = await import(pathToFileURL(resolve(output, 'functions/__server.func/index.mjs')));
const origin = 'https://abogado-jordy-tamayo-asociados.vercel.app';

for (const path of ['/', '/perfil', '/servicios', '/servicios/derecho-penal', '/vitrina-legal', '/contacto', '/admin']) {
  const response = await server.fetch(new Request(`${origin}${path}`));
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type') || '', /text\/html/);
  const html = await response.text();
  assert.match(html, /Jordy Tamayo/i, path);
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"?#]+)(?:[^"\s]*)"/g)) {
    if (/^\/(?:_next|images|icons)\//.test(asset))
      await access(resolve(output, `static${asset}`));
  }
  console.log(`PASS: ${path} — rendered HTML and referenced assets`);
}

const canonicalRsc = await server.fetch(new Request(`${origin}/perfil`, { headers: { RSC: '1' } }));
assert.equal(canonicalRsc.status, 307);
assert.equal(canonicalRsc.headers.get('location'), '/perfil?_rsc');
const rsc = await server.fetch(new Request(`${origin}/perfil?_rsc`, { headers: { RSC: '1' } }));
assert.equal(rsc.status, 200);
assert.match(rsc.headers.get('content-type') || '', /text\/x-component/);
await rsc.text();
console.log('PASS: client navigation RSC response');

const manifest = JSON.parse(await readFile(resolve(output, 'static/manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) await access(resolve(output, `static/${icon.src.replace(/^\//, '')}`));
await access(resolve(output, 'static/sw.js'));
console.log('PASS: PWA manifest, icons and service worker');

for (const family of ['penal', 'familia', 'civil', 'transito']) {
  for (const index of [1, 2, 3, 4]) {
    await access(resolve(output, `static/images/services/${family}-${index}.svg`));
  }
}
console.log('PASS: service carousel image assets');

// Exercise the real API helper without network requests or database writes.
const source = await readFile('lib/api.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const originalUrl = process.env.NEXT_PUBLIC_API_URL;
const originalMode = process.env.NODE_ENV;
const originalFetch = globalThis.fetch;
try {
  let testNumber = 0;
  for (const [value, mode, expected] of [
    ['https://api-jordy-tamayo.onrender.com/', 'production', 'https://api-jordy-tamayo.onrender.com'],
    ['  https://api-jordy-tamayo.onrender.com///  ', 'production', 'https://api-jordy-tamayo.onrender.com'],
    ['', 'production', 'https://api-jordy-tamayo.onrender.com'],
    ['', 'development', 'http://localhost:5188'],
  ]) {
    process.env.NEXT_PUBLIC_API_URL = value;
    process.env.NODE_ENV = mode;
    const helper = await import(`data:text/javascript;base64,${Buffer.from(`${js}\n// case ${testNumber++}`).toString('base64')}`);
    assert.equal(helper.API_BASE, expected);
    assert.equal(helper.assetUrl('/api/media/example'), `${expected}/api/media/example`);
    globalThis.fetch = async (url) => {
      assert.equal(url, `${expected}/api/public/site`);
      return Response.json({ ok: true });
    };
    assert.deepEqual(await helper.apiFetch('/api/public/site'), { ok: true });
  }
} finally {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalUrl;
  if (originalMode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalMode;
  globalThis.fetch = originalFetch;
}
console.log('PASS: API URL normalization and environment defaults');
