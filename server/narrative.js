import { z } from 'zod';
import he from 'he';
import dns from 'node:dns/promises';
import net from 'node:net';

export const NarrativeBodySchema = z.object({
  website: z.string().min(1),
  insuredName: z.string().optional(),
  debug: z.boolean().optional(),
});

const isPrivateIp = (ip) => {
  if (!ip) return false;
  const v = net.isIP(ip);
  if (!v) return false;

  if (v === 4) {
    const [a, b] = ip.split('.').map((x) => parseInt(x, 10));
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('fe80:')) return true;

  return false;
};

export const normaliseUrl = async (input) => {
  const raw = input.trim();
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error('Invalid website URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http/https URLs are allowed');
  }

  const host = url.hostname;
  if (!host) throw new Error('Invalid website hostname');
  if (host === 'localhost' || host.endsWith('.local')) {
    throw new Error('Localhost/local domains are not allowed');
  }

  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error('Private IP targets are not allowed');
    return url;
  }

  const lookups = await dns.lookup(host, { all: true, verbatim: true });
  if (!lookups?.length) throw new Error('Could not resolve hostname');
  for (const rec of lookups) {
    if (isPrivateIp(rec.address)) throw new Error('Hostname resolves to a private IP (blocked)');
  }

  return url;
};

const extractMetaDescription = (html) => {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  if (!m) return '';
  const tag = m[0];
  const content = tag.match(/content=["']([^"']+)["']/i)?.[1] || '';
  return he.decode(String(content)).replace(/\s+/g, ' ').trim();
};

const extractAboutLink = (html, baseUrl) => {
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, ' ');
    const combined = `${href} ${text}`.toLowerCase();
    if (!combined.includes('about')) continue;

    try {
      const u = new URL(href, baseUrl);
      if (u.origin !== baseUrl.origin) return '';
      return u.toString();
    } catch {
      return '';
    }
  }
  return '';
};

const extractText = (html) => {
  if (!html) return '';

  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ');

  const mainMatch = s.match(/<(main|article)[^>]*>([\s\S]*?)<\/(main|article)>/i);
  if (mainMatch?.[2]) s = mainMatch[2];

  s = s
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<\/p>/gi, '. ')
    .replace(/<[^>]+>/g, ' ');

  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  s = s.replace(/\s+/g, ' ').trim();
  s = he.decode(s);

  return s;
};

const dropBoilerplateSentences = (sentences) => {
  const bad = [
    'cookie',
    'privacy',
    'terms',
    'consent',
    'accept all',
    'manage preferences',
    'subscribe',
    'newsletter',
  ];

  return (sentences || []).filter((s) => {
    const t = String(s || '').toLowerCase();
    if (!t) return false;
    return !bad.some((k) => t.includes(k));
  });
};

const splitSentences = (text) => {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  return parts.map((p) => p.trim()).filter(Boolean);
};

const generateNarrative = ({ metaDescription, text, insuredName }) => {
  let sentences = splitSentences(text);
  sentences = dropBoilerplateSentences(sentences);

  if (!sentences.length) {
    const prefix = insuredName ? `${insuredName} — ` : '';
    return `${prefix}No readable content found on the provided website. (auto-generated from website; please verify)`;
  }

  const preferred = sentences.filter((s) => /\b(about|since|founded|established|we are|who we are)\b/i.test(s));
  const base = preferred.length ? preferred : sentences;

  const pick = base.slice(0, 4);
  const prefix = insuredName ? `${insuredName} — ` : '';

  const meta = String(metaDescription || '').trim();
  const metaSentence = meta ? (meta.endsWith('.') ? meta : `${meta}.`) : '';

  const main = pick.join(' ');
  const combined = [metaSentence, main].filter(Boolean).join(' ');

  return `${prefix}${combined} (auto-generated from website; please verify)`;
};

export const mountNarrativeApi = (app) => {
  app.post('/api/narrative', async (req, res) => {
    try {
      const body = NarrativeBodySchema.parse(req.body);
      const url = await normaliseUrl(body.website);

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 15000);

      const r = await fetch(url.toString(), {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'submission-builder/1.0 (+non-ai-narrative)',
          Accept: 'text/html,application/xhtml+xml',
        },
      }).finally(() => clearTimeout(timeout));

      if (!r.ok) {
        return res.status(502).json({ error: `Failed to fetch website (HTTP ${r.status})` });
      }

      const ct = r.headers.get('content-type') || '';
      if (!ct.toLowerCase().includes('text/html')) {
        return res.status(400).json({ error: `URL did not return HTML (content-type: ${ct})` });
      }

      const html = await r.text();
      const metaDescription = extractMetaDescription(html);

      const aboutUrlStr = extractAboutLink(html, url);
      let aboutText = '';
      if (aboutUrlStr) {
        try {
          const aboutUrl = new URL(aboutUrlStr);
          const aboutCtrl = new AbortController();
          const aboutTimeout = setTimeout(() => aboutCtrl.abort(), 15000);

          const aboutRes = await fetch(aboutUrl.toString(), {
            signal: aboutCtrl.signal,
            redirect: 'follow',
            headers: {
              'User-Agent': 'submission-builder/1.0 (+non-ai-narrative)',
              Accept: 'text/html,application/xhtml+xml',
            },
          }).finally(() => clearTimeout(aboutTimeout));

          const aboutCt = aboutRes.headers.get('content-type') || '';
          if (aboutRes.ok && aboutCt.toLowerCase().includes('text/html')) {
            const aboutHtml = await aboutRes.text();
            aboutText = extractText(aboutHtml);
          }
        } catch {
          // ignore
        }
      }

      const text = [extractText(html), aboutText].filter(Boolean).join(' ');
      const cappedText = text.length > 20000 ? text.slice(0, 20000) : text;

      const narrative = generateNarrative({ metaDescription, text: cappedText, insuredName: body.insuredName });

      const payload = { narrative, sourceUrl: url.toString() };
      if (body.debug) payload.extractedTextSample = cappedText.slice(0, 500);

      return res.json(payload);
    } catch (err) {
      const msg = err?.message || 'Unknown error';
      return res.status(400).json({ error: msg });
    }
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
};
