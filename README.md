# YouEye Translate

Translation app for the [YouEye](https://github.com/YouEye-Platform/YouEye) platform.

Translate runs as a native YouEye app. It provides a focused translation interface, saved phrases, dashboard widgets, and a settings surface embedded inside YouEye Settings.

Current public release line: `v0.5.0`

## Features

- Text translation between common languages
- Automatic language detection
- Translation history and saved phrases
- Swap source and target languages
- Quick translate, recent translations, and saved phrase widgets
- Timeline preview card for translation activity
- App-owned settings panel for YouEye Settings
- Theme, language, and account menu integration
- PWA-ready build with service worker assets

## YouEye Surfaces

| Surface | Purpose |
|---|---|
| `/` | Main Translate app |
| `/embed/widget/quick-translate` | Dashboard quick translate widget |
| `/embed/widget/recent-translations` | Dashboard recent translations widget |
| `/embed/widget/saved-phrases` | Dashboard saved phrases widget |
| `/embed/card/translation-preview` | Timeline/info-card surface |
| `/embed/settings` | App settings panel shown inside YouEye Settings |
| `/api/manifest` | Native app manifest consumed by Market and UI |
| `/api/health` | Container health and version endpoint |

## Development

```bash
pnpm install
pnpm dev
```

The app uses Next.js 15, TypeScript, Tailwind CSS, MyMemory translation data, and YouEye's native app surface contract.

## Release Artifact

The Control Panel updater expects each native app release to upload an uncompressed `standalone.tar` asset.

```bash
pnpm build
cd .next/standalone
tar -cf standalone.tar .
```

The release tag for this standalone repo is `v0.5.0` with no component prefix.

## License

YouEye source code is licensed under the [Business Source License 1.1](LICENSE). Each version converts to AGPL-3.0 after four years.

The "YouEye" name and logo are trademarks. See [TRADEMARK.md](TRADEMARK.md) for usage guidelines.
