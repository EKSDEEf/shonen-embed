# Player events and commands

Communication uses `window.postMessage`, with channel `shonen.embed` and protocol version `1`.

## Receive events securely

```js
const frame = document.getElementById('shonen-player');

window.addEventListener('message', event => {
  if (event.origin !== 'https://shonen.to') return;
  if (event.source !== frame.contentWindow) return;

  const message = event.data;
  if (!message || message.channel !== 'shonen.embed' || message.version !== 1) return;

  if (message.event === 'progress') {
    console.log(message.data.currentTime, message.data.duration);
  }
  if (message.event === 'ended') {
    console.log('Episode finished.');
  }
});
```

When handling multiple players, match each event to its iframe window. Never trust messages based only on the channel name or use them to inject HTML.

## Message envelope

```json
{
  "channel": "shonen.embed",
  "version": 1,
  "animeId": 21,
  "episode": 1,
  "language": "sub",
  "event": "progress",
  "data": {
    "currentTime": 126.4,
    "duration": 1478
  }
}
```

## Events

| Event | Data / meaning |
| --- | --- |
| `ready` | Metadata loaded; does not prove playback is advancing |
| `play` | Playback has started/resumed |
| `pause` | Playback paused; may also occur during source replacement |
| `buffering` | Waiting for media |
| `progress` | `{ currentTime, duration }`; duration may be `null`; throttled to roughly every five seconds |
| `sourcechange` | `{ source: "primary" }` or `{ source: "secondary" }` |
| `captionchange` | `{ caption }`; display label such as `English` or `Off` |
| `ended` | Media ended; parent site decides what happens next |
| `error` | `{ message }`; failure after available recovery attempts or authorization revocation |
| `commandresult` | `{ requestId, ok, message? }`; optional message describes a failed command |

Stream URLs and internal session tokens are not included in these messages. Initialization and source replacement may produce multiple events; don't depend on a fixed event ordering.

## Send a command

```js
frame.contentWindow.postMessage({
  channel: 'shonen.embed',
  version: 1,
  requestId: 'seek-1',
  command: 'seek',
  data: { time: 120 }
}, 'https://shonen.to');
```

Use a unique string request ID of at most 100 characters so you can correlate the result. Commands are accepted only from the configured parent origin and parent window. Do not use `"*"` as the target origin.

| Command | Data |
| --- | --- |
| `play` | `{}` |
| `pause` | `{}` |
| `seek` | `{ time: 120 }`; finite non-negative seconds; media duration must be ready |
| `setVolume` | `{ volume: 0.5 }`; number between 0 and 1 |
| `setMuted` | `{ muted: true }`; boolean |
| `setCaptions` | `{ language: "en" }` or `{ language: "off" }` |

Successful command result:

```json
{
  "event": "commandresult",
  "data": { "requestId": "seek-1", "ok": true }
}
```

The actual result also contains the normal channel/version/anime envelope. An acknowledgment means the command was accepted/completed, not that a seek has finished buffering or that playback will remain uninterrupted.

### Browser restrictions

A parent-page Play button cannot reliably pass user activation across a cross-origin iframe. The `play` command may fail under autoplay policy. Let viewers use the Play button **inside the player** when necessary. Muted autoplay may be permitted but is not guaranteed.

Captions can be unavailable; `setCaptions` then returns a failed command result. Seek commands should be sent after `ready`. There are no public commands to change the source, anime, audio, or episode; navigate the iframe to a new public embed URL instead.

The working example uses bounded command timeouts and validates both origin and sending window. A command timeout can mean the iframe has not initialized, was blocked, or has been revoked; it is not a playback-success signal.