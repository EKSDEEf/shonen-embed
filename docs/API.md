# Public embed API

## Endpoint

```http
GET https://shonen.to/embed/anilist/{id}/{episode}
```

The response is **HTML**, intended for an iframe. This is not a JSON stream API. No signup or API key is required.

| Path field | Accepted values |
| --- | --- |
| `id` | AniList ID, integer 1–2147483647 |
| `episode` | Integer 1–100000 |

## Query parameters

| Parameter | Default | Accepted values |
| --- | --- | --- |
| `parentOrigin` | Browser referrer origin | Exact HTTPS parent origin; HTTP only for `localhost` or `127.0.0.1` |
| `language` | `sub` | `sub`, `dub` |
| `autoplay` | `0` | `0`, `1`, `false`, `true` |
| `muted` | `0` | `0`, `1`, `false`, `true` |
| `start` | `0` | Integer seconds, 0–604800; no negative values or decimals |
| `captions` | `en` | `en`, `off` |
| `accent` | `8e7bff` | Six hexadecimal digits, without `#` |

Unknown, duplicated, or nested parameters are rejected. Always use a URL builder to encode `parentOrigin` properly.

If the browser sends a referrer, its origin must agree with `parentOrigin`. If no referrer is sent, `parentOrigin` is required. The player uses a framing policy to restrict normal browser embeddings to Shonen and the declared parent origin.

## Example

```text
https://shonen.to/embed/anilist/21/1?language=sub&parentOrigin=https%3A%2F%2Fexample.com&autoplay=0&muted=1&start=120&captions=en&accent=8e7bff
```

## Sessions and availability

- Loading an embed creates an episode/audio-scoped session lasting four hours.
- Reload the public iframe URL after session expiry. Do not copy internal session URLs into your website.
- A successful HTML response does not guarantee playable media: sources resolve after the player loads.
- Source availability, captions, intro timing, qualities, and Dub coverage depend on the episode.
- The embed attempts Primary, then Secondary when available. Public embeds do not include Alpha fallback.
- Autoplay is an attempt, not a guarantee; browser policy still applies.

## Limits

Current application limits per visitor IP:

- 60 embed player loads per minute.
- 120 internal source requests per minute.

Other infrastructure limits can also apply. Limits may change to protect capacity. HTTP 429 includes `Retry-After`; do not repeatedly reload a failing iframe.

## Errors

| Status | Meaning |
| --- | --- |
| 400 | Invalid options, missing parent origin, duplicate/nested parameters |
| 401 | Invalid or expired internal player session |
| 403 | Origin mismatch or blocked embedding domain |
| 404 | Unknown route or no available source, depending on the request |
| 405 | Unsupported HTTP method |
| 429 | Rate limit reached |
| 502 / 503 / 504 | Temporary backend/upstream failure, disabled embeds, or timeout |

Player-page errors are HTML. Playback failures can also be delivered as `error` events. Treat message text as display text, not a stable machine-readable contract. See [events](EVENTS.md).

## Specifications

- Repository snapshot: [`../openapi.json`](../openapi.json)
- Live specification: <https://shonen.to/embed/openapi.json>

Internal session/source/status endpoints are implementation details, not supported endpoints for extracting media or building a separate raw-source client.