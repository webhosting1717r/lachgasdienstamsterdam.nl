# lachgasdienstamsterdam.nl

Statische website voor de zoekterm **lachgas amsterdam**. De map is direct deploybaar: elke pagina is een `index.html` in een eigen map, de CSS staat inline in elke pagina, er zijn geen webfonts of externe scripts.

## Structuur

| Pad | Inhoud |
|---|---|
| `index.html`, `*/index.html` | 65 gegenereerde pagina's (home, Lachgas Amsterdam, producten, info, 40 gebiedspagina's, Engels, juridisch) |
| `assets/img/` | Foto's (Fastgas tanks) in JPG/PNG + WebP-varianten, logo, favicon, OG-afbeelding |
| `assets/js/widget.js` | Mobiel menu, contactwidget, contactformulier |
| `assets/css/style.css` | Bron-CSS; wordt bij het bouwen in elke pagina ge-inlined |
| `_build/build.js` | Generator: alle teksten, schema.org, sitemap, robots, .htaccess |
| `_build/areas.js` | Data van de 40 bezorggebieden (stadsdelen, buurten, regio) |
| `_build/serve.js` | Lokale previewserver |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `404.html` | SEO-bestanden |
| `.htaccess` | Apache: www→non-www, https, caching, security headers |
| `vercel.json`, `.vercelignore` | Zelfde regels voor Vercel |
| `CNAME` | Domein voor GitHub Pages |

## Bewerken en bouwen

Pas teksten aan in `_build/build.js` of `_build/areas.js` (niet in de gegenereerde HTML) en bouw opnieuw:

```bash
node _build/build.js
```

Lokaal bekijken:

```bash
node _build/serve.js . 8792
```

## Deploy

- **Vercel**: importeer de repo, framework "Other", output directory `.` (root). `vercel.json` regelt redirects en headers; `_build` wordt niet mee-geüpload.
- **GitHub Pages**: branch `main`, map `/` (root). `CNAME` staat klaar; Jekyll negeert `_build` automatisch.
- **Apache-hosting**: upload de hele map inclusief `.htaccess`.

Het canonical-domein is **www** (`https://www.lachgasdienstamsterdam.nl`); de apex wordt doorgestuurd naar www (Vercel-instelling, `vercel.json` en `.htaccess`). Dien in Google Search Console `https://www.lachgasdienstamsterdam.nl/sitemap.xml` in.

## Nog te doen voor livegang

- Vervang `your-form-id` in `_build/build.js` (contactformulier) door een echt Formspree-id en bouw opnieuw.
- Controleer telefoon/WhatsApp-nummers in `SITE` bovenin `_build/build.js` en in `assets/js/widget.js`.
