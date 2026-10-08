# Embed tutorial

## 1. Choose an anime and episode

Use an AniList anime ID. For example, `https://anilist.co/anime/21/` identifies anime ID `21`.

For episode 1, the embed path is:

```text
https://shonen.to/embed/anilist/21/1
```

Use positive integer episode numbers. A valid ID and episode number do not guarantee a playable stream exists.

## 2. Determine your website origin

An origin contains the scheme, hostname, and non-default port. It does not contain a path, query, or trailing slash.

| Page URL | Parent origin |
| --- | --- |
| `https://example.com/watch/21` | `https://example.com` |
| `https://www.example.com/watch/21` | `https://www.example.com` |
| `https://account.github.io/my-repo/` | `https://account.github.io` |
| `http://127.0.0.1:8081/examples/` | `http://127.0.0.1:8081` |

`www.example.com` and `example.com` are different origins. Use the origin after any redirect to your canonical domain.

## 3. Add an iframe

For a page hosted at `https://example.com`:

```html
<iframe
  src="https://shonen.to/embed/anilist/21/1?language=sub&amp;parentOrigin=https%3A%2F%2Fexample.com&amp;autoplay=0"
  title="Shonen anime player"
  style="width:100%;aspect-ratio:16/9;border:0"
  allow="autoplay; fullscreen; picture-in-picture"
  referrerpolicy="origin"
  allowfullscreen>
</iframe>
```

Use `&amp;` in HTML attributes, but ordinary `&` when constructing a URL in JavaScript.

## 4. Or generate the URL in JavaScript

This avoids hardcoding your domain and works on both HTTPS hosting and supported localhost development:

```html
<iframe
  id="shonen-player"
  title="Shonen anime player"
  style="width:100%;aspect-ratio:16/9;border:0"
  allow="autoplay; fullscreen; picture-in-picture"
  referrerpolicy="origin"
  allowfullscreen>
</iframe>
<script>
  const url = new URL('https://shonen.to/embed/anilist/21/1');
  url.search = new URLSearchParams({
    parentOrigin: location.origin,
    language: 'sub',
    autoplay: '0',
    muted: '1',
    captions: 'en',
    accent: '8e7bff'
  });
  document.getElementById('shonen-player').src = url.href;
</script>
```

Your website's Content Security Policy must permit its scripts and the Shonen frame. If inline scripts are disallowed, place this JavaScript in an allowed external file or use your site's nonce mechanism.

## 5. Select Dub or a different episode

- Set `language=dub` for English Dub when available.
- Change the episode component from `/1` to `/2` for episode 2.
- Set `start=120` to begin at two minutes after media loads.
- Set `captions=off` to start without captions.

Changing the iframe URL reloads the player and creates a new session. Let the user choose when to navigate to a new episode. There is no public `loadEpisode` command or automatic next-episode navigation.

## 6. Test your integration

1. Open the parent page through an HTTPS website or localhost HTTP server.
2. Check that the iframe loads without an origin error.
3. Press Play yourself; autoplay is off by default.
4. Check source selection, captions when available, and fullscreen.
5. If using events, verify both `event.origin` and `event.source`.
6. Test mobile sizing and browser autoplay behavior.

See [the working example](../examples/index.html) for code generation and event/command handling. View it through a server, not GitHub's source-file viewer.

## 7. Hosting on GitHub Pages

1. Upload **this folder's contents** to a new repository, so `README.md` is at the repository root.
2. In the repository's Pages settings, publish the selected branch's root directory.
3. Once GitHub supplies the HTTPS Pages URL, open `examples/` on that URL.
4. If you use a custom domain, `location.origin` in the example follows the custom domain automatically.

Pages is for hosting the example. You do not need to host any Shonen player files or backend.

## Framing and site security

If your parent site uses CSP, merge Shonen into its existing policy:

```text
frame-src 'self' https://shonen.to;
```

Do not replace your entire CSP with just this directive without considering your other policies. A restrictive Permissions Policy can also disable fullscreen or autoplay.

Avoid adding a sandbox unless you understand its impact. A sandbox that removes the iframe's own origin breaks this integration. Nested iframe arrangements with unrelated ancestor origins may be rejected by Shonen's framing policy.