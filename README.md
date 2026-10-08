# Shonen Embed

Embed the **shonen.to** player on your website with one iframe. No signup, API key, or player installation is required.

The player is hosted by Shonen. This repository contains integration documentation and examples, **not the player backend or a video download API**.

## Quick start

Replace `your-site.com` with the exact origin of the page containing the iframe:

```html
<iframe
  src="https://shonen.to/embed/anilist/21/1?language=sub&amp;parentOrigin=https%3A%2F%2Fyour-site.com"
  title="Shonen anime player"
  style="width:100%;aspect-ratio:16/9;border:0"
  allow="autoplay; fullscreen; picture-in-picture"
  referrerpolicy="origin"
  allowfullscreen>
</iframe>
```

`21` is the AniList anime ID; `1` is the episode number. AniList and MyAnimeList IDs are **not interchangeable**.

The URL format is:

```text
https://shonen.to/embed/anilist/{animeId}/{episode}?language=sub&parentOrigin={encodedOrigin}
```

Use our [online generator and documentation](https://shonen.to/embed-info) if you prefer generating the code interactively.

## Guides

- [Step-by-step tutorial](docs/TUTORIAL.md)
- [URL options and API reference](docs/API.md)
- [Playback events and player commands](docs/EVENTS.md)
- [Troubleshooting and service limitations](docs/TROUBLESHOOTING.md)
- [OpenAPI specification](openapi.json) — snapshot of the public HTML embed endpoint
- [Live OpenAPI specification](https://shonen.to/embed/openapi.json)

## Try the working example

The example has a code generator, responsive iframe, verified event log, and command buttons. It does **not** load a player or start playback until you explicitly load the embed. It starts muted with autoplay disabled.

From this repository's directory, use Python 3:

```sh
python -m http.server 8081 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8081/examples/
```

Alternatively, host the folder on an HTTPS website or enable GitHub Pages for the repository. Open `/examples/` on the published Pages URL. The example automatically uses the current website origin, including the port on localhost.

You can double-click `examples/index.html` to **generate embed code**: enter your production website origin manually. To **load the player**, use HTTPS or localhost HTTP as shown above. A `file://` page has no supported parent origin for playback.

There are no JavaScript dependencies or build steps. Node.js 22+ is needed only for the optional example tests:

```sh
node --test tests/integration.test.mjs
```

The HTML loads a bundled classic script, so code generation works without a server. If you edit the `.mjs` source files, rebuild it with `node scripts/build-example.mjs`.

## What the player includes

- Primary → Secondary internal stream recovery when both are available.
- Sub or Dub audio, subject to episode availability.
- English-default captions when the upstream captions are accessible.
- Source-specific Skip intro when timing metadata is available.
- Playback controls, theme accent, fullscreen, and picture-in-picture where supported.
- Cross-origin playback events and limited player commands.

## Before publishing your integration

- Production parent pages must use HTTPS. HTTP is supported only for `localhost` and `127.0.0.1` development.
- `parentOrigin` must match the actual parent origin, without a path or trailing slash.
- Keep Shonen branding visible. Use content only with the necessary permissions.
- Shonen observes embedding domains and can block websites or disable embeddings. Usage is recorded as domain-level counters, not unique viewers.
- No guaranteed availability, Dub coverage, caption availability, or smart-TV compatibility is promised.
- Embedded recovery is Primary → Secondary only. Alpha fallback is not part of the public embed.
- Media streams directly from third-party services. This integration does not conceal network URLs or provide DRM.
- Session URLs inside the player are temporary implementation details. Use the public embed URL, not copied sessions or media URLs.

## Repository contents

```text
README.md
docs/
  TUTORIAL.md
  API.md
  EVENTS.md
  TROUBLESHOOTING.md
examples/
  index.html
  example.css
  example.mjs
  example.js
  integration.mjs
scripts/
  build-example.mjs
tests/
  integration.test.mjs
openapi.json
```

This guide reflects public embed version 1. Check the live documentation for changes. Creating a GitHub repository does not grant rights to any media or change Shonen's service availability.