import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmbedUrl, iframeCode, trustedMessage, commandMessage } from '../examples/integration.mjs';

const defaults = { animeId: 21, episode: 1, parentOrigin: 'https://example.com' };
test('URL generation uses public endpoint, encoded exact origin and quiet defaults', () => {
  const url = new URL(buildEmbedUrl(defaults));
  assert.equal(url.origin, 'https://shonen.to');
  assert.equal(url.pathname, '/embed/anilist/21/1');
  assert.equal(url.searchParams.get('parentOrigin'), 'https://example.com');
  assert.equal(url.searchParams.get('autoplay'), '0');
  assert.equal(url.searchParams.get('muted'), '1');
  assert(iframeCode(url.href).includes('&amp;'));
});
test('localhost and GitHub Pages origins work without repository paths', () => {
  assert(buildEmbedUrl({ ...defaults, parentOrigin: 'http://127.0.0.1:8081' }).includes('8081'));
  assert(buildEmbedUrl({ ...defaults, parentOrigin: 'https://account.github.io' }).includes('github.io'));
});
test('invalid IDs, origins and player options are rejected', () => {
  for (const input of [{ animeId: 0 }, { animeId: 2147483648 }, { episode: 1.5 }, { episode: 100001 },
    { parentOrigin: 'file:///example.html' }, { parentOrigin: 'http://example.com' }, { parentOrigin: 'https://example.com/' },
    { parentOrigin: 'https://example.com/path' }, { parentOrigin: 'https://user@example.com' }, { parentOrigin: 'https://example.com;x' },
    { language: 'fr' }, { autoplay: '1' }, { start: -1 }, { start: 604801 }, { captions: 'ar' }, { accent: '#8e7bff' }]) {
    assert.throws(() => buildEmbedUrl({ ...defaults, ...input }));
  }
});
test('messages require exact origin, iframe window and protocol envelope', () => {
  const frame = {}, data = { channel: 'shonen.embed', version: 1, event: 'ready', animeId: 21, episode: 1, language: 'sub', data: {} };
  const event = { origin: 'https://shonen.to', source: frame, data };
  assert.equal(trustedMessage(event, frame), true);
  assert.equal(trustedMessage({ ...event, origin: 'https://shonen.to.evil.test' }, frame), false);
  assert.equal(trustedMessage({ ...event, source: {} }, frame), false);
  assert.equal(trustedMessage({ ...event, data: { ...data, version: 2 } }, frame), false);
  assert.equal(trustedMessage(event, null), false);
});
test('commands match protocol and validate data', () => {
  assert.deepEqual(commandMessage('seek', { time: 120 }, 'seek-1'), { channel: 'shonen.embed', version: 1, requestId: 'seek-1', command: 'seek', data: { time: 120 } });
  for (const [command, data] of [['seek', { time: -1 }], ['setVolume', { volume: 2 }], ['setMuted', { muted: 'true' }], ['setCaptions', { language: 'fr' }], ['loadEpisode', {}]]) {
    assert.throws(() => commandMessage(command, data, 'test'));
  }
});