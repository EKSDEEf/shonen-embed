import { PLAYER_ORIGIN, buildEmbedUrl, iframeCode, trustedMessage, commandMessage } from './integration.mjs';

const form = document.getElementById('builder');
const status = document.getElementById('status');
const output = document.getElementById('code');
const log = document.getElementById('events');
const buttons = [...document.querySelectorAll('[data-command]')];
let frame = null, sequence = 0;
const pending = new Map(), entries = [];
if (!form.elements.parentOrigin.value && location.origin !== 'null') form.elements.parentOrigin.value = location.origin;
if (location.protocol === 'file:') status.textContent = 'Local file mode: enter your website origin to generate code. To load the player, serve this folder on HTTPS or localhost HTTP.';

function append(value) {
  entries.unshift(`${new Date().toLocaleTimeString()} ${JSON.stringify(value)}`);
  entries.splice(50);
  log.textContent = entries.join('\n\n');
}
function options() {
  const input = new FormData(form);
  return { animeId: Number(input.get('animeId')), episode: Number(input.get('episode')), parentOrigin: input.get('parentOrigin'),
    language: input.get('language'), start: Number(input.get('start')), captions: input.get('captions'), accent: input.get('accent').slice(1),
    autoplay: input.has('autoplay'), muted: input.has('muted') };
}
function generate() {
  if (!form.reportValidity()) throw new Error('Check the form fields.');
  const value = options(), url = buildEmbedUrl(value);
  output.value = iframeCode(url);
  return { value, url };
}
function removePlayer() {
  for (const timer of pending.values()) clearTimeout(timer);
  pending.clear();
  frame?.remove(); frame = null;
  buttons.forEach(button => { button.disabled = true; });
  document.getElementById('player').textContent = 'No player loaded.';
}
function generateCode() {
  try { generate(); status.textContent = 'Code generated. Copy it into the configured parent website.'; }
  catch (error) { output.value = ''; status.textContent = error.message; }
}
document.getElementById('generate').addEventListener('click', generateCode);
form.addEventListener('submit', event => { event.preventDefault(); generateCode(); });
document.getElementById('load').addEventListener('click', () => {
  try {
    const { value, url } = generate();
    if (location.protocol === 'file:') throw new Error('Code generation works from disk, but playback requires HTTPS or a localhost HTTP server. See the README.');
    if (value.parentOrigin !== location.origin) throw new Error('To load here, set Parent origin to ' + location.origin + '.');
    removePlayer();
    frame = document.createElement('iframe');
    frame.title = 'Shonen anime player'; frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen = true; frame.referrerPolicy = 'origin'; frame.src = url;
    document.getElementById('player').replaceChildren(frame);
    frame.addEventListener('load', () => { status.textContent = 'Iframe document loaded. Waiting for verified player messages; document load does not guarantee playback.'; });
    status.textContent = 'Loading embed. Autoplay follows your selected settings and browser policy.';
  } catch (error) { status.textContent = error.message; }
});
document.getElementById('unload').addEventListener('click', () => { removePlayer(); status.textContent = 'Player removed.'; });
document.getElementById('copy').addEventListener('click', async () => {
  if (!output.value) { status.textContent = 'Generate code first.'; return; }
  try { await navigator.clipboard.writeText(output.value); status.textContent = 'Copied.'; }
  catch { output.focus(); output.select(); status.textContent = 'Select and copy the code manually.'; }
});
window.addEventListener('message', event => {
  if (!trustedMessage(event, frame?.contentWindow)) return;
  const message = event.data;
  append(message);
  buttons.forEach(button => { button.disabled = false; });
  if (message.event === 'commandresult') {
    const timer = pending.get(message.data.requestId);
    if (timer) { clearTimeout(timer); pending.delete(message.data.requestId); }
    status.textContent = message.data.ok ? 'Command accepted.' : 'Command failed: ' + message.data.message;
  } else if (message.event === 'error') {
    status.textContent = 'Player error: ' + message.data.message;
  }
});
document.getElementById('commands').addEventListener('click', event => {
  const button = event.target.closest('button[data-command]');
  if (!button || !frame) return;
  try {
    const command = button.dataset.command;
    const data = command === 'seek' ? { time: Number(document.getElementById('seek').value) } :
      command === 'setVolume' ? { volume: Number(document.getElementById('volume').value) } :
      command === 'setMuted' ? { muted: button.dataset.value === 'true' } :
      command === 'setCaptions' ? { language: button.dataset.value } : {};
    const requestId = 'example-' + ++sequence;
    const message = commandMessage(command, data, requestId);
    pending.set(requestId, setTimeout(() => { pending.delete(requestId); status.textContent = 'Command timed out. The player may not be initialized or may be unavailable.'; }, 8000));
    frame.contentWindow.postMessage(message, PLAYER_ORIGIN);
    status.textContent = 'Command sent: ' + command;
  } catch (error) { status.textContent = error.message; }
});
document.getElementById('clear').addEventListener('click', () => { entries.length = 0; log.textContent = ''; });
window.addEventListener('pagehide', () => { for (const timer of pending.values()) clearTimeout(timer); });