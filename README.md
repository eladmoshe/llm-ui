# LLM UI (Static, Mobile First)

Single-file chat interface (`index.html`) designed to run on GitHub Pages.

## Features

- Mobile-first chat UX inspired by ChatGPT web flow
- Provider settings with API key input (currently `Grok (xAI)`)
- Dynamic model loading from API (`/v1/language-models` with `/v1/models` fallback)
- Streaming assistant responses (SSE from `/v1/chat/completions`)
- Clear run state indicators: `Running...` vs `Ready`
- Stop generation while streaming

## Run locally

Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000`.

## Deploy to GitHub Pages

1. Commit `index.html` (and this README) to your repo.
2. In GitHub repo settings, enable Pages from your branch (root folder).
3. Open the published URL.

## Security note

The API key is stored in browser `localStorage`. This is convenient for static hosting but not suitable for shared devices.

## Extending providers

Providers are defined in `/index.html` inside the `PROVIDERS` object and built via `createOpenAICompatibleProvider(...)`.
Add a new entry with:

- `id`
- `label`
- `baseUrl`
- `defaultModels`
- `preferredModelPrefix`

If a provider uses a different API shape, add a custom `listModels` and `streamChat` implementation.
