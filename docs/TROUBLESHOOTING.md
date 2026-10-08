# Troubleshooting

## "parentOrigin does not match the embedding page"

Use `location.origin` from the real parent page. Check HTTPS vs HTTP, `www` vs the root domain, port numbers, and redirects. Do not use the full page URL, a trailing slash, the Shonen origin, or a GitHub repository URL.

For GitHub Pages at `https://account.github.io/repository/`, use `https://account.github.io`.

## "Add parentOrigin" / file:// doesn't work

The browser may hide its referrer. Specify an exact `parentOrigin` in the URL. Code generation works from a local HTML file when you enter your website origin, but loading the player requires localhost HTTP or HTTPS.

## Generate code reloads the page or clears the origin

Use the latest example, including its adjacent `example.js` file. It uses a classic bundled script and a non-submitting Generate code button so local-file code generation does not depend on browser module loading. If scripts are disabled, enable JavaScript. When hosting with a restrictive CSP, allow the example's same-origin external script. Never upload just the HTML without its JavaScript files.

## Blank or refused frame

- Allow `https://shonen.to` in your site's CSP `frame-src`.
- Do not sandbox away the iframe's origin or disable scripts.
- Check browser Console errors and browser/network privacy extensions.
- Nested frames with unrelated ancestors may be disallowed by the player framing policy.
- Make sure the iframe has a visible width and height.

## Autoplay or remote Play command fails

Autoplay is restricted by browsers. Use the button inside the iframe, or try muted autoplay if suitable for your site. Check the `commandresult` message. `allow="autoplay"` permits the feature but does not guarantee browser approval.

## No captions or only one stream source

Availability varies by episode/audio. English captions are selected only if accessible. Missing captions do not necessarily mean the video is broken. Primary or Secondary can be absent; Dub coverage is not guaranteed.

## Skip intro missing

The active source must provide intro metadata, and the current position must be within that intro range. The button is intentionally hidden outside the range.

## Player stops after several hours

Sessions last four hours. Reload the public iframe URL, not an internal session URL. Upstream media can also expire or become unavailable independently.

## Domain blocked or embeds disabled

Shonen can block domains and their subdomains or disable embedding globally. Active sessions check once per minute. Do not bypass these controls. The ability to load media earlier does not guarantee ongoing permission or availability.

## Too many requests

Wait for `Retry-After` on HTTP 429. Avoid reload loops, preloading many iframes, or polling source endpoints. Corporate/shared networks can share an IP and therefore a limit.

## Does it work on TVs?

Some TV browsers may support the player, but smart-TV compatibility and remote navigation are not verified. Fullscreen and picture-in-picture depend on browser and device support. There is no DRM guarantee or source-concealment feature.

## Are source URLs private?

No. Media streams directly from third-party services, so network tools can see the requested media hosts. This repository intentionally does not document raw-source extraction endpoints. Use the public iframe interface.

## What is recorded?

Shonen records observed embedding domains, iframe loads, source requests, denied requests, and last-seen timestamps. Domain counters are retained for about 90 days. These are not unique-viewer counts. Referrers can be absent; non-browser clients can spoof origin information.

## No service guarantees

Third-party availability can change. There is no guarantee of all episodes, Dub, captions, or uninterrupted playback. Use content only where you have the required rights and permissions, preserve branding, and comply with site blocks.