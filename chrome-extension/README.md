# Career-Ops Chrome Extension

Scrapes job listings from the page you're viewing and auto-fills application
forms using your Career-Ops backend (Sync Token required).

## Install (Load Unpacked)

1. Open `chrome://extensions` in Chrome (or Edge/Brave equivalent).
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select this `chrome-extension/` folder.
4. Pin the extension, click its icon, open settings (⚙), and paste your
   **Sync Token** from the Career-Ops dashboard.
5. Click **Test Connection** to verify, then **Save Settings**.

That's it — open a job listing on a supported portal and the popup will scan it.

> After installing or updating the extension, refresh any job pages that were
> already open so the content script loads.

## Configuration layers

Settings are resolved in three layers — the highest one with a value wins:

| Priority | Source | Who sets it |
|----------|--------|-------------|
| 1 (highest) | Popup settings (chrome.storage.sync) | You, in the ⚙ panel |
| 2 | Remote config JSON (`remoteConfigUrl`) | Your team / your own hosted file |
| 3 | `config.json` packaged with the extension | Defaults shipped in this folder |

Leave a popup field **empty** to inherit from the layer below. Saving settings
also asks Chrome for permission to call your backend's origin, so API requests
aren't blocked.

### config.json

```json
{
  "baseUrl": "http://localhost:3000",
  "remoteConfigUrl": "",
  "knownPortals": ["linkedin.com", "..."]
}
```

- `baseUrl` — your Career-Ops SaaS backend.
- `remoteConfigUrl` — optional URL of a hosted JSON file to pull config from.
- `knownPortals` — hosts that have dedicated scraper parsers; any other site
  uses the Universal Mode density scanner (and shows a banner saying so).

### Remote config

Host a JSON file anywhere (gist, S3, your backend) and set its URL as
`remoteConfigUrl` (in the popup or in `config.json`). It may override
`baseUrl` and `knownPortals` only — it cannot change the remote config URL
itself. The file must be served with CORS enabled (`Access-Control-Allow-Origin`)
or its origin granted to the extension (Save Settings requests this).

Example — point a whole team at one deployment:

```json
{ "baseUrl": "https://career-ops.example.com" }
```

## Adding a new job portal

1. Add the host to `host_permissions` and `content_scripts.matches` in
   `manifest.json`.
2. Add a parser entry to `SITE_PARSERS` in `content.js` (CSS selectors for
   title/company/description, tried in order; functions are allowed for
   non-trivial lookups).
3. Add the host to `knownPortals` in `config.json` (or your remote config) so
   the popup stops showing the Universal Mode banner for it.

Skipping step 2 still works — unknown sites fall back to the universal
density scanner.

## Files

| File | Role |
|------|------|
| `manifest.json` | MV3 manifest: permissions, content script matches |
| `config.json` | Packaged default configuration |
| `popup.html` / `popup.js` | Popup UI: settings, scrape, detect, auto-fill |
| `content.js` | Page-side scraper, form detector, and form filler |
