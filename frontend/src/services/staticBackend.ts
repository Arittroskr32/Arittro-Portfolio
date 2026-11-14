// In-browser replacement for the old Express + MySQL backend.
//
// The services still call apiClient.get('/projects') etc. Those calls land
// here and are answered from JSON files:
//   * visitors read the JSON that was deployed with the site (fast, cached by CDN)
//   * a signed-in admin reads the latest JSON straight from the repo, and every
//     create / update / delete becomes a commit made through the GitHub API.
// Writes that happen close together (e.g. the profile editor saving four fields
// at once) are grouped into a single commit.

import { BUILD_ID, REPO_DATA_DIR, REPO_UPLOADS_DIR, sitePath } from './config';
import { FileChange, GitHubError, commitFiles, getHeadSha, getToken, readTextFile } from './github';

type Row = Record<string, any>;
type CollectionName =
  | 'projects'
  | 'blog_posts'
  | 'certificates'
  | 'ctf_entries'
  | 'bug_bounty_entries'
  | 'cves'
  | 'skills'
  | 'highlights'
  | 'journey_highlights'
  | 'profile_content'
  | 'settings';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Image URLs
// ---------------------------------------------------------------------------

/** Images uploaded during this admin session, shown before the redeploy finishes. */
const sessionUploads = new Map<string, string>();

/** "/uploads/x.png" (as stored in JSON) -> URL the browser can load. */
export function resolveAsset(p: any): any {
  if (!p || typeof p !== 'string') return p ?? null;
  if (/^(https?:|data:|blob:)/i.test(p)) return p;
  const local = sessionUploads.get(p.startsWith('/') ? p : `/${p}`);
  if (local) return local;
  return `${window.location.origin}${sitePath(p)}`;
}

/** Reverse of resolveAsset, so we never store absolute URLs in JSON. */
function toStoragePath(p: any): any {
  if (!p || typeof p !== 'string') return p ?? null;
  for (const [path, url] of sessionUploads) if (url === p) return path;
  const prefix = `${window.location.origin}${sitePath('')}`;
  if (p.startsWith(prefix)) return `/${p.slice(prefix.length)}`;
  return p;
}

// ---------------------------------------------------------------------------
// Collection definitions (mirrors the old controllers)
// ---------------------------------------------------------------------------

interface CollectionDef {
  name: CollectionName;
  /** Fields accepted from the admin forms. */
  fields: string[];
  numeric?: string[];
  booleans?: string[];
  hasImage?: boolean;
  uploadPrefix?: string;
  sort?: (a: Row, b: Row) => number;
  label: string;
}

const byDesc = (k: string) => (a: Row, b: Row) => String(b[k] ?? '').localeCompare(String(a[k] ?? ''));
const byAsc = (k: string) => (a: Row, b: Row) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''));
const chain = (...fns: ((a: Row, b: Row) => number)[]) => (a: Row, b: Row) => {
  for (const f of fns) {
    const r = f(a, b);
    if (r) return r;
  }
  return 0;
};

const COLLECTIONS: Record<string, CollectionDef> = {
  projects: {
    name: 'projects',
    label: 'project',
    fields: ['title', 'description', 'long_description', 'category', 'technologies', 'github_url', 'live_url', 'featured', 'authors'],
    booleans: ['featured'],
    hasImage: true,
    uploadPrefix: 'project',
    sort: byDesc('created_at'),
  },
  'blog-posts': {
    name: 'blog_posts',
    label: 'blog post',
    fields: ['title', 'category', 'tags', 'content'],
    hasImage: true,
    uploadPrefix: 'blog',
    sort: byDesc('created_at'),
  },
  certificates: {
    name: 'certificates',
    label: 'certificate',
    fields: ['rank', 'title', 'description', 'issuing_organization', 'issue_date', 'skill_tags', 'verification_link'],
    numeric: ['rank'],
    hasImage: true,
    uploadPrefix: 'certificate',
    sort: chain((a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0), byDesc('issue_date'), byAsc('title')),
  },
  ctf: {
    name: 'ctf_entries',
    label: 'CTF entry',
    fields: ['competition_name', 'event_date', 'rank', 'team_name', 'challenges_solved', 'total_challenges', 'points_earned', 'writeup_url', 'description'],
    numeric: ['rank', 'challenges_solved', 'total_challenges', 'points_earned'],
    hasImage: true,
    uploadPrefix: 'ctf',
    sort: chain(byDesc('event_date'), byAsc('competition_name')),
  },
  'bug-bounty': {
    name: 'bug_bounty_entries',
    label: 'bug bounty entry',
    fields: ['program_name', 'vulnerability_type', 'severity', 'bounty_amount', 'report_date', 'status', 'description', 'report_url'],
    numeric: ['bounty_amount'],
    sort: byDesc('report_date'),
  },
  cves: {
    name: 'cves',
    label: 'CVE',
    fields: ['cve_id', 'title', 'product', 'vulnerability_type', 'cwe', 'cvss_version', 'cvss_score', 'severity', 'cna', 'published_date', 'advisory_url', 'cve_url', 'description'],
    numeric: ['cvss_score'],
    hasImage: true,
    uploadPrefix: 'cve',
    sort: chain(byDesc('published_date'), byDesc('cve_id')),
  },
  skills: {
    name: 'skills',
    label: 'skill',
    fields: ['name', 'category', 'proficiency', 'level', 'icon'],
    numeric: ['proficiency'],
    sort: chain(byAsc('category'), (a, b) => (Number(b.proficiency) || 0) - (Number(a.proficiency) || 0)),
  },
  'journey-highlights': {
    name: 'journey_highlights',
    label: 'journey highlight',
    fields: ['year', 'title', 'description', 'display_order', 'is_featured'],
    numeric: ['display_order', 'is_featured'],
    sort: (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0),
  },
  highlights: {
    name: 'highlights',
    label: 'highlight',
    fields: ['title', 'label', 'value', 'icon', 'display_order'],
    sort: (a, b) => (Number(a.display_order ?? a.id) || 0) - (Number(b.display_order ?? b.id) || 0),
  },
};

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

const publicCache = new Map<string, Promise<any>>();
let adminCache: { sha: string; data: Map<string, any> } | null = null;

const isAdmin = () => !!getToken();

function emptyFor(name: CollectionName) {
  return name === 'profile_content' || name === 'settings' ? {} : [];
}

async function loadPublic(name: CollectionName): Promise<any> {
  if (!publicCache.has(name)) {
    publicCache.set(
      name,
      fetch(sitePath(`data/${name}.json?v=${BUILD_ID}`))
        .then((r) => (r.ok ? r.json() : emptyFor(name)))
        .catch(() => emptyFor(name))
    );
  }
  return publicCache.get(name)!;
}

async function loadAtSha(name: CollectionName, sha: string): Promise<any> {
  const text = await readTextFile(`${REPO_DATA_DIR}/${name}.json`, sha);
  if (text == null) return emptyFor(name);
  return typeof text === 'string' ? JSON.parse(text) : text;
}

async function loadAdmin(name: CollectionName): Promise<any> {
  if (!adminCache) adminCache = { sha: await getHeadSha(), data: new Map() };
  const cache = adminCache;
  if (!cache.data.has(name)) cache.data.set(name, await loadAtSha(name, cache.sha));
  return cache.data.get(name);
}

async function load(name: CollectionName): Promise<any> {
  if (isAdmin()) {
    try {
      return structuredClone(await loadAdmin(name));
    } catch (e) {
      console.warn('Falling back to deployed data:', e);
    }
  }
  return structuredClone(await loadPublic(name));
}

/** Forget cached data (e.g. after signing in or out). */
export function resetDataCache() {
  publicCache.clear();
  adminCache = null;
}

// ---------------------------------------------------------------------------
// Writes: queued, grouped into one commit, retried if the branch moved
// ---------------------------------------------------------------------------

interface WriteCtx {
  load(name: CollectionName): Promise<any>;
  save(name: CollectionName, value: any): void;
  addFile(path: string, base64: string): void;
  deleteFile(path: string): void;
}

interface PendingWrite {
  run: (ctx: WriteCtx) => Promise<any>;
  message: string;
  resolve: (v: any) => void;
  reject: (e: any) => void;
}

let pending: PendingWrite[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing: Promise<void> = Promise.resolve();

function queueWrite<T>(message: string, run: (ctx: WriteCtx) => Promise<T>): Promise<T> {
  if (!isAdmin()) return Promise.reject(new HttpError(401, 'Sign in to the admin panel first.'));
  return new Promise<T>((resolve, reject) => {
    pending.push({ run, message, resolve, reject });
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = null;
      const batch = pending;
      pending = [];
      flushing = flushing.then(() => flush(batch));
    }, 350);
  });
}

async function flush(batch: PendingWrite[]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const sha = await getHeadSha();
      const working = new Map<string, any>();
      const dirty = new Set<CollectionName>();
      const files = new Map<string, FileChange>();
      const ctx: WriteCtx = {
        async load(name) {
          if (!working.has(name)) working.set(name, await loadAtSha(name, sha));
          return working.get(name);
        },
        save(name, value) {
          working.set(name, value);
          dirty.add(name);
        },
        addFile(path, base64) {
          files.set(path, { path, content: base64, base64: true });
        },
        deleteFile(path) {
          files.set(path, { path, content: null });
        },
      };
      const results: { ok: boolean; value: any }[] = [];
      for (const w of batch) {
        try {
          results.push({ ok: true, value: await w.run(ctx) });
        } catch (e) {
          results.push({ ok: false, value: e });
        }
      }
      for (const name of dirty) {
        files.set(`${REPO_DATA_DIR}/${name}.json`, {
          path: `${REPO_DATA_DIR}/${name}.json`,
          content: JSON.stringify(working.get(name), null, 2) + '\n',
        });
      }
      let newSha = sha;
      if (files.size) {
        const messages = [...new Set(batch.filter((_, i) => results[i].ok).map((w) => w.message))];
        const title = messages.length === 1 ? messages[0] : `Admin: ${messages.length} content updates`;
        const body = messages.length > 1 ? `\n\n${messages.map((m) => `- ${m}`).join('\n')}` : '';
        newSha = await commitFiles(sha, [...files.values()], `${title}${body}`);
      }
      // Keep the admin view in sync with what we just committed.
      const prev = adminCache;
      adminCache = { sha: newSha, data: new Map() };
      for (const [k, v] of working) adminCache.data.set(k, v);
      if (prev && prev.sha === sha) for (const [k, v] of prev.data) if (!adminCache.data.has(k)) adminCache.data.set(k, v);
      markPendingDeploy();
      batch.forEach((w, i) => (results[i].ok ? w.resolve(results[i].value) : w.reject(results[i].value)));
      return;
    } catch (e) {
      if (e instanceof GitHubError && e.status === 409 && attempt < 2) continue;
      batch.forEach((w) => w.reject(e));
      return;
    }
  }
}

const DEPLOY_KEY = 'admin_last_commit_at';
function markPendingDeploy() {
  try {
    localStorage.setItem(DEPLOY_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('admin:committed'));
}
export function lastCommitAt(): string | null {
  try {
    return localStorage.getItem(DEPLOY_KEY);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const nowIso = () => new Date().toISOString();
const nextId = (rows: Row[]) => rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;

function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ParsedBody {
  fields: Row;
  image: File | null;
}

function parseBody(body: any): ParsedBody {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const fields: Row = {};
    let image: File | null = null;
    body.forEach((v, k) => {
      if (typeof v !== 'string') {
        if (v.size > 0) image = v as File;
      } else fields[k] = v;
    });
    return { fields, image };
  }
  return { fields: { ...(body || {}) }, image: null };
}

function coerce(def: CollectionDef, input: Row): Row {
  const out: Row = {};
  for (const f of def.fields) {
    if (!(f in input)) continue;
    let v = input[f];
    if (def.numeric?.includes(f)) v = v === '' || v == null ? null : Number(v);
    else if (def.booleans?.includes(f)) v = v === true || v === 'true' || v === 1 || v === '1' ? 1 : 0;
    out[f] = v;
  }
  return out;
}

function present(def: CollectionDef | null, row: Row): Row {
  const r = { ...row };
  if ('image_url' in r) r.image_url = resolveAsset(r.image_url);
  if (def?.name === 'bug_bounty_entries' && r.bounty_amount != null) r.bounty_amount = Number(r.bounty_amount);
  return r;
}

async function storeImage(ctx: WriteCtx, def: CollectionDef, file: File): Promise<string> {
  const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || '.png').toLowerCase();
  const name = `${def.uploadPrefix || 'file'}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const storagePath = `/uploads/${name}`;
  ctx.addFile(`${REPO_UPLOADS_DIR}/${name}`, await fileToBase64(file));
  sessionUploads.set(storagePath, URL.createObjectURL(file));
  return storagePath;
}

function removeImage(ctx: WriteCtx, stored: any) {
  const p = toStoragePath(stored);
  if (typeof p === 'string' && p.startsWith('/uploads/')) ctx.deleteFile(`${REPO_UPLOADS_DIR}/${p.slice('/uploads/'.length)}`);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function handleRequest(method: Method, endpoint: string, body?: any): Promise<any> {
  const url = new URL(endpoint, 'http://local');
  const parts = url.pathname.split('/').filter(Boolean);
  const q = url.searchParams;

  // ---- special endpoints ----
  if (parts[0] === 'profile-content') {
    if (method === 'GET') return load('profile_content');
    const { section, content } = body || {};
    return queueWrite(`Admin: update profile (${section})`, async (ctx) => {
      const obj = await ctx.load('profile_content');
      obj[section] = content;
      ctx.save('profile_content', obj);
      return { message: 'Profile content updated successfully' };
    });
  }

  if (parts[0] === 'stats') {
    if (method === 'GET') {
      const obj = await load('profile_content');
      return {
        ctfs_played: obj.stats_ctfs_played || '0',
        security_projects: obj.stats_security_projects || '0',
        writeups: obj.stats_writeups || '0',
        bounties: obj.stats_bounties || '0',
      };
    }
    return queueWrite('Admin: update quick stats', async (ctx) => {
      const obj = await ctx.load('profile_content');
      for (const k of ['ctfs_played', 'security_projects', 'writeups', 'bounties']) {
        if (body?.[k] != null) obj[`stats_${k}`] = String(body[k]);
      }
      ctx.save('profile_content', obj);
      return { message: 'Stats updated successfully' };
    });
  }

  if (parts[0] === 'settings') {
    if (method === 'GET') return load('settings');
    return queueWrite('Admin: update site settings', async (ctx) => {
      const obj = await ctx.load('settings');
      Object.assign(obj, body || {});
      ctx.save('settings', obj);
      return { message: 'Settings saved' };
    });
  }

  if (parts[0] === 'dashboard' && parts[1] === 'stats') {
    const [projects, blogs, ctf, bb, skills, certs, cves] = await Promise.all(
      (['projects', 'blog_posts', 'ctf_entries', 'bug_bounty_entries', 'skills', 'certificates', 'cves'] as CollectionName[]).map(load)
    );
    return {
      projects: projects.length,
      blogPosts: blogs.length,
      ctfEntries: ctf.length,
      bugBountyEntries: bb.length,
      skills: skills.length,
      certificates: certs.length,
      cves: cves.length,
      unreadMessages: 0,
    };
  }

  if (parts[0] === 'contact') {
    if (method === 'POST') return submitContact(body);
    if (method === 'GET') return [];
    return { message: 'ok' };
  }

  // ---- generic collections ----
  const def = COLLECTIONS[parts[0]];
  if (!def) throw new HttpError(404, `Unknown endpoint ${endpoint}`);
  const id = parts[1] != null ? Number(parts[1]) : null;
  const sub = parts[2];

  if (method === 'GET') {
    let rows: Row[] = await load(def.name);
    if (id != null) {
      const row = rows.find((r) => Number(r.id) === id);
      if (!row) throw new HttpError(404, `${def.label} not found`);
      return present(def, row);
    }
    if (q.get('featured') === 'true') rows = rows.filter((r) => Number(r.featured) === 1 || r.featured === true);
    for (const k of ['category', 'status', 'severity']) {
      const v = q.get(k);
      if (v) rows = rows.filter((r) => String(r[k]) === v);
    }
    if (def.sort) rows = [...rows].sort(def.sort);
    return rows.map((r) => present(def, r));
  }

  const { fields, image } = parseBody(body);

  if (method === 'POST' && id == null) {
    return queueWrite(`Admin: add ${def.label} "${fields.title || fields.name || fields.competition_name || fields.cve_id || fields.program_name || ''}"`, async (ctx) => {
      const rows: Row[] = await ctx.load(def.name);
      const row: Row = { id: nextId(rows), ...coerce(def, fields) };
      if (def.name === 'journey_highlights') {
        row.display_order = rows.reduce((m, r) => Math.max(m, Number(r.display_order) || 0), 0) + 1;
        row.is_featured = Number(fields.is_featured) || 0;
      }
      if (def.hasImage) row.image_url = image ? await storeImage(ctx, def, image) : toStoragePath(fields.image_url) || null;
      row.created_at = nowIso();
      if (['projects', 'blog_posts', 'certificates', 'journey_highlights'].includes(def.name)) row.updated_at = row.created_at;
      rows.push(row);
      ctx.save(def.name, rows);
      return { id: row.id, message: `${capitalize(def.label)} created successfully`, image_url: resolveAsset(row.image_url) };
    });
  }

  if (id == null) throw new HttpError(400, 'Missing id');

  if ((method === 'PUT' || method === 'PATCH') && !sub) {
    return queueWrite(`Admin: update ${def.label} #${id}`, async (ctx) => {
      const rows: Row[] = await ctx.load(def.name);
      const idx = rows.findIndex((r) => Number(r.id) === id);
      if (idx < 0) throw new HttpError(404, `${def.label} not found`);
      const row = { ...rows[idx], ...coerce(def, fields) };
      if (def.hasImage) {
        if (image) {
          if (rows[idx].image_url) removeImage(ctx, rows[idx].image_url);
          row.image_url = await storeImage(ctx, def, image);
        } else if (fields.deleteImage === 'true') {
          if (rows[idx].image_url) removeImage(ctx, rows[idx].image_url);
          row.image_url = null;
        } else if ('image_url' in fields) {
          row.image_url = toStoragePath(fields.image_url) || null;
        }
      }
      if ('updated_at' in rows[idx]) row.updated_at = nowIso();
      rows[idx] = row;
      ctx.save(def.name, rows);
      return { message: `${capitalize(def.label)} updated successfully`, image_url: resolveAsset(row.image_url) };
    });
  }

  if (method === 'DELETE') {
    return queueWrite(`Admin: delete ${def.label} #${id}${sub === 'image' ? ' image' : ''}`, async (ctx) => {
      const rows: Row[] = await ctx.load(def.name);
      const idx = rows.findIndex((r) => Number(r.id) === id);
      if (idx < 0) throw new HttpError(404, `${def.label} not found`);
      if (sub === 'image') {
        if (!rows[idx].image_url) throw new HttpError(400, 'No image to delete');
        removeImage(ctx, rows[idx].image_url);
        rows[idx] = { ...rows[idx], image_url: null };
        ctx.save(def.name, rows);
        return { message: 'Image deleted successfully' };
      }
      if (def.hasImage && rows[idx].image_url) removeImage(ctx, rows[idx].image_url);
      rows.splice(idx, 1);
      ctx.save(def.name, rows);
      return { message: `${capitalize(def.label)} deleted successfully` };
    });
  }

  throw new HttpError(405, `${method} ${endpoint} is not supported`);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Contact form (no server any more)
// ---------------------------------------------------------------------------

async function submitContact(body: any) {
  const settings = await load('settings');
  const endpoint: string = settings.contact_form_endpoint || '';
  const to: string = settings.contact_email || '';
  const { name = '', email = '', subject = '', message = '' } = body || {};

  if (endpoint) {
    // Works with Formspree / Web3Forms / Getform style endpoints that accept JSON.
    const payload: Row = { name, email, subject: subject || `Portfolio contact from ${name}`, message };
    if (settings.contact_form_access_key) payload.access_key = settings.contact_form_access_key;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new HttpError(res.status, 'Could not send the message. Please email me directly.');
    return { id: Date.now(), message: 'Message sent successfully', mode: 'sent' };
  }

  if (!to) throw new HttpError(503, 'The contact form is not configured yet.');
  const mailSubject = encodeURIComponent(subject || `Portfolio contact from ${name}`);
  const mailBody = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
  window.location.href = `mailto:${to}?subject=${mailSubject}&body=${mailBody}`;
  return { id: Date.now(), message: 'Your email app has been opened with the message.', mode: 'mailto' };
}
