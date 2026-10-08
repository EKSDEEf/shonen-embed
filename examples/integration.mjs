export const PLAYER_ORIGIN = 'https://shonen.to';

export function buildEmbedUrl({ animeId, episode, parentOrigin, language = 'sub', autoplay = false, muted = true, start = 0, captions = 'en', accent = '8e7bff' }) {
  if (!Number.isSafeInteger(animeId) || animeId < 1 || animeId > 2147483647) throw new Error('Use a positive AniList ID up to 2147483647.');
  if (!Number.isSafeInteger(episode) || episode < 1 || episode > 100000) throw new Error('Episode must be an integer between 1 and 100000.');
  let parent;
  try { parent = new URL(parentOrigin); } catch { throw new Error('Open this example on HTTPS or a localhost HTTP server.'); }
  if (parent.origin !== parentOrigin || parent.username || parent.password ||
      (parent.protocol !== 'https:' && !(parent.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parent.hostname)))) {
    throw new Error('Use an exact HTTPS parent origin, or localhost HTTP, without a path or trailing slash.');
  }
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(parent.hostname) || parent.hostname.length > 253) throw new Error('Use a valid ASCII hostname.');
  if (!['sub', 'dub'].includes(language)) throw new Error('Audio must be sub or dub.');
  if (typeof autoplay !== 'boolean' || typeof muted !== 'boolean') throw new Error('Autoplay and muted must be booleans.');
  if (!Number.isInteger(start) || start < 0 || start > 604800) throw new Error('Start must be an integer between 0 and 604800.');
  if (!['en', 'off'].includes(captions)) throw new Error('Captions must be en or off.');
  if (!/^[a-f0-9]{6}$/i.test(accent)) throw new Error('Accent must be six hexadecimal digits without #.');
  const url = new URL(`/embed/anilist/${animeId}/${episode}`, PLAYER_ORIGIN);
  url.search = new URLSearchParams({ parentOrigin, language, autoplay: autoplay ? '1' : '0', muted: muted ? '1' : '0', start: String(start), captions, accent: accent.toLowerCase() });
  return url.href;
}

export function iframeCode(url) {
  const src = String(url).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<iframe\n  src="${src}"\n  title="Shonen anime player"\n  style="width:100%;aspect-ratio:16/9;border:0"\n  allow="autoplay; fullscreen; picture-in-picture"\n  referrerpolicy="origin"\n  allowfullscreen>\n</iframe>`;
}

const events = new Set(['ready', 'play', 'pause', 'buffering', 'progress', 'sourcechange', 'captionchange', 'ended', 'error', 'commandresult']);
export function trustedMessage(event, frameWindow) {
  const message = event.data;
  return !!frameWindow && event.origin === PLAYER_ORIGIN && event.source === frameWindow &&
    !!message && typeof message === 'object' && message.channel === 'shonen.embed' && message.version === 1 && events.has(message.event) &&
    Number.isInteger(message.animeId) && Number.isInteger(message.episode) && ['sub', 'dub'].includes(message.language) &&
    !!message.data && typeof message.data === 'object';
}

export function commandMessage(command, data, requestId) {
  if (typeof requestId !== 'string' || !requestId || requestId.length > 100) throw new Error('Use a request ID of 1–100 characters.');
  if (!data || typeof data !== 'object') throw new Error('Command data must be an object.');
  switch (command) {
    case 'play': case 'pause': break;
    case 'seek': if (!Number.isFinite(data.time) || data.time < 0) throw new Error('Use a non-negative seek time.'); break;
    case 'setVolume': if (!Number.isFinite(data.volume) || data.volume < 0 || data.volume > 1) throw new Error('Use volume between 0 and 1.'); break;
    case 'setMuted': if (typeof data.muted !== 'boolean') throw new Error('muted must be boolean.'); break;
    case 'setCaptions': if (!['en', 'off'].includes(data.language)) throw new Error('Captions must be en or off.'); break;
    default: throw new Error('Unsupported player command.');
  }
  return { channel: 'shonen.embed', version: 1, requestId, command, data };
}