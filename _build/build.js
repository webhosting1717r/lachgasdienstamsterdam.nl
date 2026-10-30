// Static site generator for lachgasdienstamsterdam.nl
// Run:  node _build/build.js   (from the site root)  — writes all pages into the site root.
'use strict';
const fs = require('fs');
const path = require('path');
const AREAS = require('./areas');

const OUT = path.resolve(__dirname, '..');
// The whole stylesheet is inlined into every page: one request less, no render-blocking CSS.
const CSS = fs.readFileSync(path.join(OUT, 'assets/css/style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n').trim();
const TODAY = '2026-10-26';
const CSS_V = '1';
const JS_V = '2';

const SITE = {
  // Canonical host is www: Vercel serves production on www and 308-redirects the apex there.
  url: 'https://www.lachgasdienstamsterdam.nl',
  name: 'Lachgas Dienst Amsterdam',
  alt: 'Lachgasdienst Amsterdam',
  tagline: 'Lachgas bezorgen in Amsterdam · 24/7 · binnen 20-30 min',
  wa: '3197010270187',
  waDisplay: '+31 97010270187',
  tel: '+31852128051',
  telDisplay: '085 212 8051',
  email: 'info@lachgasdienstamsterdam.nl',
  ogImage: '/assets/img/og-image.jpg',
};
const WA_TEXT = encodeURIComponent('Hoi, ik wil graag lachgas bestellen in Amsterdam.');
const WA_URL = `https://wa.me/${SITE.wa}?text=${WA_TEXT}`;
const TEL_URL = `tel:${SITE.tel}`;

const PRODUCTS = [
  { slug: 'product/fastgas-2kg', name: 'Fastgas 2KG Wegwerp Tank', short: 'Fastgas 2KG', kg: 2, tanks: 1, balloons: 'circa 250', img: 'fastgas-2kg-tank', ext: 'png', w: 440, h: 440, cutout: true, badge: 'Meest besteld', sku: 'LDA-FASTGAS-2KG',
    blurb: 'Het compacte standaardformaat: één verzegelde 2 kilo tank, direct klaar voor gebruik en goed voor circa 250 ballonnen. Ideaal voor een feestje thuis.' },
  { slug: 'product/fastgas-4kg', name: 'Fastgas 4KG Wegwerp Tank', short: 'Fastgas 4KG', kg: 4, tanks: 2, balloons: 'circa 500', img: 'fastgas-4kg', ext: 'jpg', w: 640, h: 512, badge: 'Voor grotere groepen', sku: 'LDA-FASTGAS-4KG',
    blurb: 'Twee verzegelde Fastgas tanks van 2 kilo in één bestelling: samen 4 kilo zuiver lachgas, goed voor circa 500 ballonnen. Voor verjaardagen, housewarmings en grotere groepen.' },
  { slug: 'product/fastgas-10kg', name: 'Fastgas 10KG Wegwerp Tank', short: 'Fastgas 10KG', kg: 10, tanks: 5, balloons: 'circa 1250', img: 'fastgas-10kg', ext: 'jpg', w: 640, h: 427, badge: 'Events & horeca', sku: 'LDA-FASTGAS-10KG',
    blurb: 'Vijf verzegelde Fastgas tanks van 2 kilo: in totaal 10 kilo lachgas, goed voor circa 1250 ballonnen. Het voordeligste formaat voor evenementen, horeca en grote feesten.' },
];

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE.url + p;
const areaBySlug = Object.fromEntries(AREAS.map((a) => [a.slug, a]));
const areaUrl = (a) => `/lachgas-${a.slug}/`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Only a lowercase article is grammatical glue ("de Jordaan" -> "Jordaan"); a capitalised one is part of the name ("De Pijp").
const stripArticle = (n) => n.replace(/^(de|het) /, '');

function waBtn(label = 'Bestel via WhatsApp', cls = 'btn wa') {
  return `<a class="${cls}" href="${WA_URL}" target="_blank" rel="noopener"><img src="/assets/img/icon-whatsapp.svg" alt="" class="btn-icon" width="20" height="20">${label}</a>`;
}
function telBtn(label = `Bel ${SITE.telDisplay}`, cls = 'btn ghost') {
  return `<a class="${cls}" href="${TEL_URL}"><img src="/assets/img/icon-call.svg" alt="" class="btn-icon" width="20" height="20">${label}</a>`;
}

const productSrcset = (p) => p.cutout ? `/assets/img/${p.img}-220.webp 220w, /assets/img/${p.img}.webp 440w` : `/assets/img/${p.img}-360.webp 360w, /assets/img/${p.img}-480.webp 480w, /assets/img/${p.img}.webp ${p.w}w`;
function productImg(p, { cls = '', lazy = true, sizes = 220 } = {}) {
  const webp = productSrcset(p);
  const sizesAttr = typeof sizes === 'number' ? `${sizes}px` : sizes;
  return `<picture><source type="image/webp" srcset="${webp}" sizes="${sizesAttr}"><img class="${p.cutout ? 'cutout ' : ''}${cls}" src="/assets/img/${p.img}.${p.ext}" alt="${esc(p.name)} – ${p.tanks === 1 ? '1 verzegelde Fastgas lachgastank' : p.tanks + ' verzegelde Fastgas lachgastanks'}" width="${p.w}" height="${p.h}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high" decoding="sync"'}></picture>`;
}

function productCards() {
  return `<ul class="products">${PRODUCTS.map((p) => `<li><a class="product" href="/${p.slug}/">${p.badge ? `<span class="badge">${p.badge}</span>` : ''}${productImg(p, { sizes: 200 })}<h3>${p.short}</h3><span class="meta">${p.kg} kg N₂O · ${p.balloons} ballonnen</span><span class="btn">Bekijk &amp; bestel</span></a></li>`).join('')}</ul>`;
}

function steps(area) {
  const where = area ? ` in ${area}` : ' in Amsterdam';
  return `<ol class="steps">
<li><strong>App of bel ons</strong><p>Stuur een WhatsApp naar <a href="${WA_URL}" target="_blank" rel="noopener">${SITE.waDisplay}</a> of bel <a href="${TEL_URL}">${SITE.telDisplay}</a> en geef uw adres${where} door.</p></li>
<li><strong>Kies uw formaat</strong><p>Fastgas Wegwerp Tank in <a href="/product/fastgas-2kg/">2KG</a>, <a href="/product/fastgas-4kg/">4KG</a> of <a href="/product/fastgas-10kg/">10KG</a>. Wij bevestigen direct de verwachte aankomsttijd.</p></li>
<li><strong>Betaal bij aflevering</strong><p>Onze koerier staat gemiddeld binnen 20-30 minuten voor de deur. Betalen kan met PIN of contant. Legitimatie 18+ kan worden gevraagd.</p></li>
</ol>`;
}

function faqHtml(items) {
  return `<div class="faq">${items.map((f) => `<details><summary>${f.q}</summary><p class="faq-a">${f.a}</p></details>`).join('\n')}</div>`;
}
const plain = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function cityGrid(slugs, more = true) {
  const links = slugs.map((s) => areaBySlug[s]).filter(Boolean).map((a) => `<a href="${areaUrl(a)}">${cap(stripArticle(a.name))}</a>`).join('');
  return `<div class="city-grid">${links}${more ? '<a class="more" href="/bezorggebied/">Volledig bezorggebied →</a>' : ''}</div>`;
}

function areaColumns() {
  const col = (type, title) => `<div><h3>${title}</h3>${cityGrid(AREAS.filter((a) => a.type === type).map((a) => a.slug), false)}</div>`;
  return `<div class="area-cols">${col('stadsdeel', 'Stadsdelen')}${col('buurt', 'Buurten')}${col('plaats', 'Regio')}</div>`;
}

function hoursList() {
  const days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
  return `<ul class="hours">${days.map((d) => `<li><span>${d}</span><strong>00:00 – 24:00</strong></li>`).join('')}</ul>`;
}

function ctaStrip() {
  return `<div class="cta-strip"><div class="container">
<a class="whatsapp" href="${WA_URL}" target="_blank" rel="noopener"><img src="/assets/img/icon-whatsapp.svg" alt="" class="btn-icon" width="20" height="20">WhatsApp bestellen</a>
<a class="call" href="${TEL_URL}"><img src="/assets/img/icon-call.svg" alt="" class="btn-icon" width="20" height="20">Bel ${SITE.telDisplay}</a>
<a href="/lachgas-tanks/">Bekijk de Fastgas tanks →</a>
</div></div>`;
}

const SAFETY_LIST = `<ul class="reasons">
<li>Gebruik alleen in een goed geventileerde ruimte</li>
<li>Ga zitten of liggen, nooit staand gebruiken</li>
<li>Nooit combineren met alcohol, drugs of medicijnen</li>
<li>Nooit direct uit de tank inademen, altijd via een ballon</li>
<li>Niet gebruiken bij zwangerschap of vitamine B12-tekort</li>
<li>Niet deelnemen aan het verkeer na gebruik</li>
<li>Tanks buiten bereik van kinderen bewaren</li>
<li>Uitsluitend voor volwassenen van 18 jaar en ouder</li>
</ul>`;

// ---------------------------------------------------------------- schema
const BUSINESS = {
  '@type': ['LocalBusiness', 'Store'], '@id': abs('/#business'), name: SITE.name, alternateName: [SITE.alt, 'Lachgaskoerier Amsterdam'],
  description: '24/7 lachgas bezorgdienst in Amsterdam en omstreken. Originele, verzegelde Fastgas Wegwerp Tanks (2KG, 4KG, 10KG) binnen 20-30 minuten bezorgd. Bestellen via WhatsApp of telefoon, betalen bij aflevering. Uitsluitend 18+.',
  url: SITE.url + '/', image: abs(SITE.ogImage), logo: abs('/assets/img/logo.svg'), telephone: SITE.tel, email: SITE.email,
  priceRange: '€€', currenciesAccepted: 'EUR', paymentAccepted: 'Cash, Debit Card, iDEAL',
  address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressRegion: 'Noord-Holland', addressCountry: 'NL' },
  geo: { '@type': 'GeoCoordinates', latitude: 52.3676, longitude: 4.9041 },
  areaServed: AREAS.map((a) => ({ '@type': 'City', name: cap(stripArticle(a.name)) })),
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'sales', name: 'WhatsApp bestellen', telephone: '+' + SITE.wa, url: `https://wa.me/${SITE.wa}`, availableLanguage: ['nl', 'en'] },
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: SITE.tel, availableLanguage: ['nl', 'en'] },
  ],
  sameAs: [`https://wa.me/${SITE.wa}`],
  makesOffer: PRODUCTS.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: p.name, url: abs('/' + p.slug + '/') } })),
};
const WEBSITE = { '@type': 'WebSite', '@id': abs('/#website'), name: SITE.name, url: SITE.url + '/', inLanguage: 'nl-NL', publisher: { '@id': abs('/#business') } };

function schemaGraph(p) {
  const url = abs(p.path);
  const graph = [BUSINESS, WEBSITE, {
    '@type': p.schemaType || 'WebPage', '@id': url + '#webpage', url, name: p.title, description: p.desc, inLanguage: p.lang === 'en' ? 'en' : 'nl-NL',
    isPartOf: { '@id': abs('/#website') }, about: { '@id': abs('/#business') }, datePublished: '2026-10-26', dateModified: TODAY,
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(p.ogImage || SITE.ogImage) },
  }];
  const crumbs = [{ name: 'Home', item: SITE.url + '/' }, ...(p.crumbs || [])];
  graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item || url })) });
  if (p.faq && p.faq.length) graph.push({ '@type': 'FAQPage', mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) });
  (p.schema || []).forEach((s) => graph.push(s));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// ---------------------------------------------------------------- layout
const NAV = [['/', 'Home'], ['/lachgas-amsterdam/', 'Lachgas Amsterdam'], ['/lachgas-tanks/', 'Fastgas tanks'], ['/bezorggebied/', 'Bezorggebied'], ['/lachgas-prijzen-amsterdam/', 'Prijzen'], ['/contact/', 'Contact']];

function header(active) {
  return `<a class="skip-link" href="#main">Naar de inhoud</a>
<header class="site-header"><div class="container">
<a class="brand" href="/"><img class="brand-mark" src="/assets/img/logo.svg" alt="" width="46" height="46"><span class="brand-text">${SITE.name}<small>24/7 lachgas bezorgen · Amsterdam</small></span></a>
<button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="main-nav"><span class="nav-toggle-icon"></span></button>
<nav class="main-nav" id="main-nav" aria-label="Hoofdmenu">${NAV.map(([h, l]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}<a class="nav-cta" href="${WA_URL}" target="_blank" rel="noopener"><img src="/assets/img/icon-whatsapp.svg" alt="" class="btn-icon" width="20" height="20">WhatsApp</a></nav>
</div></header>`;
}

function footer(lang) {
  const en = lang === 'en';
  return `<footer class="site-footer"><div class="container footer-grid">
<div><h3>${SITE.name}</h3><p>${en ? 'Nitrous oxide delivery service for Amsterdam and the surrounding region. Sealed Fastgas disposable tanks, ordered via WhatsApp and delivered within 20-30 minutes, 24/7.' : 'Lachgas bezorgdienst voor Amsterdam en omstreken. Originele, verzegelde Fastgas Wegwerp Tanks, besteld via WhatsApp en binnen 20-30 minuten bezorgd, dag en nacht.'}</p><p><span class="age-badge">18+</span>${en ? 'We only deliver to adults aged 18 and over.' : 'Wij leveren uitsluitend aan volwassenen van 18 jaar en ouder.'}</p></div>
<div><h3>Bestellen</h3><a href="/lachgas-bestellen-amsterdam/">Lachgas bestellen</a><a href="/lachgas-tanks/">Fastgas tanks</a><a href="/product/fastgas-2kg/">Fastgas 2KG</a><a href="/product/fastgas-4kg/">Fastgas 4KG</a><a href="/product/fastgas-10kg/">Fastgas 10KG</a><a href="/lachgas-prijzen-amsterdam/">Prijzen</a><a href="/horeca-en-evenementen/">Horeca &amp; evenementen</a></div>
<div><h3>Bezorgen</h3><a href="/lachgas-amsterdam/">Lachgas Amsterdam</a><a href="/lachgas-bezorgen-amsterdam/">Lachgas bezorgen</a><a href="/lachgas-nachtbezorging-amsterdam/">&rsquo;s Nachts bestellen</a><a href="/bezorggebied/">Bezorggebied</a><a href="/lachgas-amsterdam-centrum/">Centrum</a><a href="/lachgas-amsterdam-zuid/">Zuid</a><a href="/lachgas-amstelveen/">Amstelveen</a></div>
<div><h3>Info &amp; contact</h3><a href="${WA_URL}" target="_blank" rel="noopener"><img src="/assets/img/icon-whatsapp.svg" alt="" class="btn-icon" width="18" height="18">WhatsApp ${SITE.waDisplay}</a><a href="${TEL_URL}"><img src="/assets/img/icon-call.svg" alt="" class="btn-icon" width="18" height="18">Bel ${SITE.telDisplay}</a><a href="/wat-is-lachgas/">Wat is lachgas?</a><a href="/lachgas-veilig-gebruiken/">Veilig gebruik</a><a href="/veelgestelde-vragen/">Veelgestelde vragen</a><a href="/over-ons/">Over ons</a><a href="/contact/">Contact</a></div>
</div>
<div class="container footer-bottom"><span>&copy; 2026 ${SITE.name} · Amsterdam</span><span><a href="/algemene-voorwaarden/">Algemene voorwaarden</a> · <a href="/privacy/">Privacy</a> · <a href="/nitrous-oxide-delivery-amsterdam/" hreflang="en">English</a></span></div>
</footer>`;
}

function hero(p) {
  const crumbs = p.crumbs ? `<nav class="breadcrumbs" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li>${p.crumbs.map((c, i, arr) => i === arr.length - 1 ? `<li aria-current="page">${c.name}</li>` : `<li><a href="${c.item.replace(SITE.url, '')}">${c.name}</a></li>`).join('')}</ol></nav>` : '';
  const text = `${crumbs}<p class="eyebrow">${p.eyebrow}</p><h1>${p.h1}</h1><p class="lead">${p.lead}</p>${p.heroActions !== false ? `<div class="hero-actions">${waBtn(p.lang === 'en' ? 'Order via WhatsApp' : 'Bestel via WhatsApp')}${telBtn(p.lang === 'en' ? 'Call ' + SITE.telDisplay : 'Bel ' + SITE.telDisplay)}</div>` : ''}${p.stats ? `<ul class="stat-row">${p.stats.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}`;
  if (p.hero === 'photo') {
    return `<header class="hero hero-photo"><div class="hero-photo-media"><picture><source type="image/webp" srcset="/assets/img/fastgas-close-up-768.webp 768w, /assets/img/fastgas-close-up.webp 1100w" sizes="100vw"><img src="/assets/img/fastgas-close-up.jpg" alt="" width="1100" height="733" fetchpriority="high" decoding="sync"></picture></div><div class="container">${text}</div></header>`;
  }
  if (p.hero === 'plain') return `<header class="hero"><div class="container">${text}</div></header>`;
  const prod = PRODUCTS[0];
  // The tank is the LCP element on phones too (its top edge sits inside the first viewport), so it is preloaded and priority-hinted everywhere.
  return `<header class="hero"><div class="container hero-grid"><div>${text}</div><div class="hero-visual"><span class="ring" aria-hidden="true"></span><picture><source type="image/webp" srcset="/assets/img/${prod.img}-220.webp 220w, /assets/img/${prod.img}.webp 440w" sizes="(max-width: 860px) 220px, 300px"><img src="/assets/img/${prod.img}.${prod.ext}" alt="Fastgas 2KG Wegwerp Tank – lachgas tank bezorgd in Amsterdam" width="440" height="440" fetchpriority="high" decoding="sync"></picture></div></div></header>`;
}

function render(p) {
  const url = abs(p.path);
  const lang = p.lang || 'nl';
  const ogImage = abs(p.ogImage || SITE.ogImage);
  const hreflang = p.hreflang ? p.hreflang.map(([l, h]) => `<link rel="alternate" hreflang="${l}" href="${abs(h)}">`).join('\n') : '';
  // Preload exactly the image the hero will render (LCP candidate); nothing on pages without a hero image.
  const preload = p.hero === 'photo'
    ? '<link rel="preload" as="image" fetchpriority="high" imagesrcset="/assets/img/fastgas-close-up-768.webp 768w, /assets/img/fastgas-close-up.webp 1100w" imagesizes="100vw">'
    : p.hero === 'plain' ? (p.preload || '') : '<link rel="preload" as="image" fetchpriority="high" imagesrcset="/assets/img/fastgas-2kg-tank-220.webp 220w, /assets/img/fastgas-2kg-tank.webp 440w" imagesizes="(max-width: 860px) 220px, 300px">';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="robots" content="${p.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}">
<link rel="canonical" href="${url}">
${hreflang}
<meta name="theme-color" content="#0a1428">
<meta name="geo.region" content="NL-NH">
<meta name="geo.placename" content="Amsterdam">
<meta name="geo.position" content="52.3676;4.9041">
<meta name="ICBM" content="52.3676, 4.9041">
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
<link rel="apple-touch-icon" href="/assets/img/favicon.svg">
${preload}
<style>${CSS}</style>
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="${lang === 'en' ? 'en_GB' : 'nl_NL'}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="${p.ogImage ? p.ogW : 1200}">
<meta property="og:image:height" content="${p.ogImage ? p.ogH : 630}">
<meta property="og:image:alt" content="${esc(p.ogAlt || 'Fastgas Wegwerp Tank – Lachgas Dienst Amsterdam')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${ogImage}">
<script type="application/ld+json">${schemaGraph(p)}</script>
</head>
<body>
${header(p.navActive || p.path)}
<main id="main">
${hero(p)}
${p.body}
${p.faq && p.faq.length ? `<section class="section"><div class="container"><p class="eyebrow">${lang === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen'}</p><h2>${p.faqTitle || (lang === 'en' ? 'Questions about ordering' : 'Vragen over ' + p.h1.toLowerCase())}</h2>${faqHtml(p.faq)}</div></section>` : ''}
${ctaStrip()}
</main>
${footer(lang)}
${fabMarkup(lang)}
<script src="/assets/js/widget.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

// Floating contact widget, rendered in the HTML so it paints with the first frame (widget.js only wires the toggle).
function fabMarkup(lang) {
  const en = lang === 'en';
  return `<div class="contact-fab" id="contact-fab"><div class="fab-menu" id="fab-menu"><a class="fab-item wa" href="${WA_URL}" target="_blank" rel="noopener"><img class="fab-icon" src="/assets/img/icon-whatsapp.svg" alt="" width="22" height="22"><span>${en ? 'Order via WhatsApp' : 'WhatsApp bestellen'}</span></a><a class="fab-item call" href="${TEL_URL}"><img class="fab-icon" src="/assets/img/icon-call.svg" alt="" width="22" height="22"><span>${en ? 'Call us' : 'Bel direct'}</span></a></div><button class="fab-main" id="fab-toggle" type="button" aria-label="${en ? 'Show contact options' : 'Contactopties tonen'}" aria-expanded="false" aria-controls="fab-menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>`;
}

// ---------------------------------------------------------------- shared copy blocks
const REASONS = `<ul class="reasons">
<li>Gemiddeld binnen 20-30 minuten bezorgd</li>
<li>24 uur per dag, 7 dagen per week, ook feestdagen</li>
<li>Uitsluitend originele, verzegelde Fastgas tanks</li>
<li>Vaste prijzen, geen verborgen bezorgkosten</li>
<li>Bestellen via WhatsApp of telefoon, geen account nodig</li>
<li>Betalen bij aflevering met PIN of contant</li>
<li>Discrete koerier in neutrale kleding en auto</li>
<li>Groot bezorggebied: Amsterdam, Amstelveen, Zaandam, Haarlem</li>
</ul>`;

const GRID_SIZES = '(max-width: 640px) calc(100vw - 44px), 540px';
const PHOTO_GRID = `<div class="photo-grid">
<figure><picture><source type="image/webp" srcset="/assets/img/fastgas-close-up-400.webp 400w, /assets/img/fastgas-close-up-560.webp 560w, /assets/img/fastgas-close-up-768.webp 768w, /assets/img/fastgas-close-up.webp 1100w" sizes="${GRID_SIZES}"><img src="/assets/img/fastgas-close-up.jpg" alt="Fastgas Wegwerp Tank close-up: lachgas stroomt uit het ventiel van een 2 kilo tank" width="1100" height="733" loading="lazy" decoding="async"></picture><figcaption>Fastgas Wegwerp Tank in gebruik: het ventiel regelt de uitstroomsnelheid</figcaption></figure>
<figure><picture><source type="image/webp" srcset="/assets/img/fastgas-blueprint-400.webp 400w, /assets/img/fastgas-blueprint-560.webp 560w, /assets/img/fastgas-blueprint-768.webp 768w, /assets/img/fastgas-blueprint.webp 1536w" sizes="${GRID_SIZES}"><img src="/assets/img/fastgas-blueprint.jpg" alt="Specificaties en echtheidskenmerken van de originele Fastgas Wegwerp Tank" width="1536" height="1024" loading="lazy" decoding="async"></picture><figcaption>Echtheidskenmerken van de originele Fastgas tank: zegel, QR-code en certificering</figcaption></figure>
</div>`;

const HOME_FAQ = [
  { q: 'Hoe snel bezorgen jullie lachgas in Amsterdam?', a: 'Gemiddeld staat onze koerier binnen 20 tot 30 minuten voor de deur, overal binnen de ring en in de meeste wijken daarbuiten. Zodra u via WhatsApp of telefonisch bestelt, bevestigen we direct de verwachte aankomsttijd.' },
  { q: 'Kan ik lachgas bestellen zonder vooraf te betalen?', a: 'Ja. U betaalt onze koerier bij aflevering, met PIN of contant. Vooraf betalen of een account aanmaken is niet nodig.' },
  { q: 'Bezorgen jullie ook ’s nachts en in het weekend?', a: 'Ja, wij zijn 24 uur per dag en 7 dagen per week bereikbaar, ook op feestdagen zoals Koningsdag, Kerst en Oud &amp; Nieuw. Lees meer over <a href="/lachgas-nachtbezorging-amsterdam/">lachgas ’s nachts bestellen</a>.' },
  { q: 'Welke lachgas tanks leveren jullie?', a: 'Wij leveren uitsluitend de originele Fastgas Wegwerp Tank: <a href="/product/fastgas-2kg/">2KG</a> (circa 250 ballonnen), <a href="/product/fastgas-4kg/">4KG</a> (circa 500 ballonnen) en <a href="/product/fastgas-10kg/">10KG</a> (circa 1250 ballonnen). Elke tank is verzegeld, gecertificeerd en direct klaar voor gebruik.' },
  { q: 'Wat kost lachgas bezorgen in Amsterdam?', a: 'Wij werken met vaste prijzen per formaat, inclusief bezorging binnen Amsterdam. Vraag de actuele prijs op via WhatsApp of bekijk onze <a href="/lachgas-prijzen-amsterdam/">prijzenpagina</a>.' },
  { q: 'Is er een minimumleeftijd?', a: 'Ja. Wij leveren uitsluitend aan volwassenen van 18 jaar en ouder. Onze koerier kan bij aflevering om een geldig legitimatiebewijs vragen.' },
  { q: 'Bezorgen jullie ook buiten Amsterdam?', a: 'Zeker. Wij bezorgen in Amstelveen, Diemen, Zaandam, Haarlem, Hoofddorp, Almere, Purmerend en meer. Bekijk het volledige <a href="/bezorggebied/">bezorggebied</a>.' },
];

// ---------------------------------------------------------------- pages
const pages = [];

// HOME
pages.push({
  path: '/', navActive: '/',
  title: 'Lachgas Amsterdam bestellen – 24/7 bezorgd in 20-30 min',
  desc: 'Lachgas Amsterdam: 24/7 bezorgd in heel Amsterdam. Fastgas tank (2KG, 4KG, 10KG) binnen 20-30 min thuis. Bestel via WhatsApp, betaal bij aflevering. 18+.',
  hreflang: [['nl', '/'], ['en', '/nitrous-oxide-delivery-amsterdam/'], ['x-default', '/']],
  eyebrow: 'Lachgas bezorgdienst Amsterdam · 24/7',
  h1: 'Lachgas Amsterdam bestellen? Binnen 20-30 minuten bezorgd.',
  lead: 'Lachgas Dienst Amsterdam bezorgt de originele Fastgas Wegwerp Tank dag en nacht in heel Amsterdam en de regio. Bestel via WhatsApp of bel ons, en betaal pas bij aflevering.',
  stats: ['Binnen 20-30 min bezorgd', '24/7 geopend', 'Betalen bij aflevering', 'Alleen 18+'],
  faq: HOME_FAQ, faqTitle: 'Vragen over lachgas bestellen in Amsterdam',
  body: `
<section class="section"><div class="container prose">
<p class="eyebrow">Dé lachgaskoerier van Amsterdam</p>
<h2>Lachgas bezorgen in Amsterdam, snel en discreet</h2>
<p>Op zoek naar <strong>lachgas in Amsterdam</strong>? Lachgas Dienst Amsterdam is de bezorgservice voor iedereen die snel, veilig en zonder gedoe een lachgas tank in huis wil hebben. Onze koeriers rijden 24 uur per dag door de stad: van het Centrum en De Pijp tot Noord, Oost, West, Zuidoost en Nieuw-West. Ook in Amstelveen, Diemen, Zaandam en de rest van de regio staan we gemiddeld binnen een half uur voor de deur.</p>
<p>Wij leveren uitsluitend de <a href="/lachgas-tanks/">Fastgas Wegwerp Tank</a>: verzegeld, gecertificeerd en direct klaar voor gebruik. Geen statiegeld, geen lege fles terugbrengen en geen ingewikkelde bestelprocedure. U stuurt een WhatsApp-bericht met uw adres en het gewenste formaat, wij bevestigen de aankomsttijd en de koerier komt eraan.</p>
<p>Of het nu gaat om een spontane vrijdagavond in de Jordaan, een housewarming in Oost of een bestelling voor een horecazaak op het Rembrandtplein: wij zijn er, elke dag van het jaar.</p>
</div></section>

<section class="section alt"><div class="container">
<p class="eyebrow">Ons assortiment</p>
<h2>Fastgas Wegwerp Tank in 2KG, 4KG en 10KG</h2>
<p>Drie formaten, één origineel product. Kies het formaat dat bij uw feest past; voor grotere bestellingen en horeca geldt een scherpe staffelprijs.</p>
${productCards()}
${PHOTO_GRID}
</div></section>

<section class="section"><div class="container">
<p class="eyebrow">Zo werkt het</p>
<h2>Lachgas bestellen in Amsterdam in drie stappen</h2>
${steps()}
<p>${waBtn()} &nbsp; ${telBtn('Bel ' + SITE.telDisplay, 'btn ghost dark')}</p>
</div></section>

<section class="section dark"><div class="container">
<p class="eyebrow">Waarom Lachgas Dienst Amsterdam</p>
<h2>Waarom klanten voor onze lachgasdienst kiezen</h2>
${REASONS}
</div></section>

<section class="section"><div class="container prose">
<p class="eyebrow">Bezorggebied</p>
<h2>Lachgas bezorgen in heel Amsterdam en omstreken</h2>
<p>Wij bezorgen in alle stadsdelen van Amsterdam en in een groot deel van de regio. Klik op uw wijk of plaats voor de bezorgtijd en de mogelijkheden bij u in de buurt.</p>
${areaColumns()}
</div></section>

<section class="section alt"><div class="container two-col">
<div class="prose"><p class="eyebrow">Openingstijden</p><h2>Elke dag, elk uur bereikbaar</h2><p>Bij Lachgas Dienst Amsterdam bestaat er geen &ldquo;gesloten&rdquo;. Ook op zondag, tijdens feestdagen of om vier uur &rsquo;s nachts staat onze koerier klaar. Overdag bestellen voor later op de avond? Dat kan ook; wij plannen de bezorging op het tijdstip dat u wilt.</p><p><a href="/lachgas-nachtbezorging-amsterdam/">Meer over &rsquo;s nachts bestellen →</a></p></div>
<div>${hoursList()}</div>
</div></section>

<section class="section"><div class="container prose">
<p class="eyebrow">Veilig gebruik</p>
<h2>Verantwoord omgaan met lachgas</h2>
<p>Lachgas is geen onschuldig product. Wij leveren uitsluitend aan volwassenen en vragen iedere klant om de basisregels voor <a href="/lachgas-veilig-gebruiken/">veilig gebruik</a> te volgen:</p>
${SAFETY_LIST}
<p>Meer weten? Lees <a href="/wat-is-lachgas/">wat lachgas precies is</a>, hoe de <a href="/hoe-werkt-een-lachgas-tank/">Fastgas tank werkt</a> en wat de <a href="/is-lachgas-verboden/">wettelijke regels</a> in Nederland zijn.</p>
</div></section>`,
});

// PILLAR: lachgas amsterdam
pages.push({
  path: '/lachgas-amsterdam/', crumbs: [{ name: 'Lachgas Amsterdam' }],
  title: 'Lachgas Amsterdam – kopen & laten bezorgen, 24/7 in 20-30 min',
  desc: 'Lachgas kopen in Amsterdam: Fastgas tank 2KG, 4KG en 10KG binnen 20-30 min bezorgd in alle stadsdelen. 24/7 via WhatsApp, betalen bij aflevering.',
  eyebrow: 'Lachgas kopen in Amsterdam',
  h1: 'Lachgas Amsterdam',
  lead: 'De complete gids voor lachgas in Amsterdam: waar u het bestelt, wat het kost, hoe snel het bezorgd wordt en waar u op moet letten. Lachgas Dienst Amsterdam bezorgt in alle stadsdelen, 24 uur per dag.',
  stats: ['Alle stadsdelen', 'Binnen 20-30 min', '24/7 bezorging', 'Fastgas origineel'],
  schema: [{ '@type': 'Service', '@id': abs('/lachgas-amsterdam/#service'), serviceType: 'Lachgas bezorgen', name: 'Lachgas bezorgen in Amsterdam', provider: { '@id': abs('/#business') }, areaServed: { '@type': 'City', name: 'Amsterdam' }, url: abs('/lachgas-amsterdam/'), offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'EUR', url: abs('/lachgas-amsterdam/') } }],
  faq: [
    { q: 'Waar kan ik lachgas kopen in Amsterdam?', a: 'Bij Lachgas Dienst Amsterdam bestelt u lachgas via WhatsApp of telefoon en laat u het thuisbezorgen. Een winkel of afhaalpunt is niet nodig: onze koerier komt naar u toe, overal in Amsterdam, gemiddeld binnen 20-30 minuten.' },
    { q: 'Hoe laat kan ik lachgas bestellen in Amsterdam?', a: 'Altijd. Wij zijn 24 uur per dag en 7 dagen per week bereikbaar, ook ’s nachts, in het weekend en op feestdagen.' },
    { q: 'Wat is de beste lachgas tank voor een feestje?', a: 'Voor een feestje met 5 tot 15 personen is de Fastgas 2KG tank (circa 250 ballonnen) meestal voldoende. Voor grotere groepen raden we de 4KG aan, en voor evenementen en horeca de 10KG.' },
    { q: 'Is lachgas bezorgen in Amsterdam discreet?', a: 'Ja. Onze koeriers rijden in neutrale auto’s, dragen geen bedrijfskleding en leveren de tank in een neutrale tas af aan de deur.' },
    { q: 'Bezorgen jullie in alle stadsdelen van Amsterdam?', a: 'Ja: Centrum, Noord, Oost, West, Zuid, Zuidoost en Nieuw-West, inclusief alle buurten daarbinnen, van IJburg tot Osdorp en van de NDSM-werf tot Gaasperdam.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Lachgas bestellen in Amsterdam: zo werkt het</h2>
<p><strong>Lachgas Amsterdam</strong> is een van de meest gezochte termen in de stad, en niet zonder reden: Amsterdam is een feeststad en lachgas hoort voor veel mensen bij een avondje thuis met vrienden. Lachgas Dienst Amsterdam maakt het bestellen zo simpel mogelijk. U stuurt een WhatsApp-bericht naar <a href="${WA_URL}" target="_blank" rel="noopener">${SITE.waDisplay}</a> of belt <a href="${TEL_URL}">${SITE.telDisplay}</a>, geeft uw adres en het gewenste formaat door en wij bevestigen direct de aankomsttijd. Binnen de ring staat de koerier gemiddeld binnen 20 tot 30 minuten voor de deur.</p>
<p>Wij werken uitsluitend met de originele <a href="/lachgas-tanks/">Fastgas Wegwerp Tank</a>. Dat is een verzegelde, gecertificeerde tank van 2 kilo zuiver distikstofmonoxide (N₂O), leverbaar als losse tank (2KG), als set van twee (4KG) of als set van vijf (10KG). Elke tank wordt vóór vertrek nagewogen, zodat u nooit een halfvolle tank ontvangt.</p>
${steps()}
</div></section>

<section class="section alt"><div class="container">
<p class="eyebrow">Assortiment</p>
<h2>Welke lachgas tank kiest u?</h2>
${productCards()}
<div class="prose">
<table><thead><tr><th>Formaat</th><th>Inhoud</th><th>Ballonnen</th><th>Geschikt voor</th></tr></thead><tbody>
<tr><td><a href="/product/fastgas-2kg/">Fastgas 2KG</a></td><td>1 tank · 2 kg N₂O</td><td>circa 250</td><td>Feestje thuis, 5-15 personen</td></tr>
<tr><td><a href="/product/fastgas-4kg/">Fastgas 4KG</a></td><td>2 tanks · 4 kg N₂O</td><td>circa 500</td><td>Verjaardag, housewarming, 15-30 personen</td></tr>
<tr><td><a href="/product/fastgas-10kg/">Fastgas 10KG</a></td><td>5 tanks · 10 kg N₂O</td><td>circa 1250</td><td>Evenementen, horeca, grote feesten</td></tr>
</tbody></table>
</div>
</div></section>

<section class="section"><div class="container prose">
<p class="eyebrow">Per stadsdeel</p>
<h2>Lachgas bezorgen per stadsdeel in Amsterdam</h2>
<p>Elk stadsdeel heeft zijn eigen pagina met de gemiddelde bezorgtijd en de buurten die eronder vallen. Onze koeriers zijn verdeeld over de stad, zodat de aanrijtijd overal kort blijft.</p>
${cityGrid(AREAS.filter((a) => a.type === 'stadsdeel').map((a) => a.slug), false)}
<h3>Populaire buurten</h3>
${cityGrid(['de-pijp', 'jordaan', 'oud-west', 'oud-zuid', 'indische-buurt', 'ijburg', 'westerpark', 'bijlmer', 'osdorp', 'rivierenbuurt', 'buitenveldert', 'watergraafsmeer'])}
<h3>Buiten de stadsgrens</h3>
<p>Ook in <a href="/lachgas-amstelveen/">Amstelveen</a>, <a href="/lachgas-diemen/">Diemen</a>, <a href="/lachgas-zaandam/">Zaandam</a>, <a href="/lachgas-haarlem/">Haarlem</a>, <a href="/lachgas-hoofddorp/">Hoofddorp</a>, <a href="/lachgas-almere/">Almere</a> en <a href="/lachgas-purmerend/">Purmerend</a> bezorgen wij dagelijks. Bekijk het volledige <a href="/bezorggebied/">bezorggebied</a>.</p>
</div></section>

<section class="section dark"><div class="container">
<p class="eyebrow">Waarom wij</p>
<h2>Waarom Lachgas Dienst Amsterdam?</h2>
${REASONS}
</div></section>

<section class="section"><div class="container prose">
<p class="eyebrow">Goed om te weten</p>
<h2>Lachgas in Amsterdam: prijzen, regels en veiligheid</h2>
<h3>Wat kost lachgas in Amsterdam?</h3>
<p>Wij werken met vaste prijzen per formaat, inclusief bezorging binnen Amsterdam. De actuele prijs ontvangt u direct via WhatsApp; op onze <a href="/lachgas-prijzen-amsterdam/">prijzenpagina</a> leest u hoe de prijs is opgebouwd en wanneer een groter formaat voordeliger is.</p>
<h3>Mag lachgas in Amsterdam?</h3>
<p>Sinds 1 januari 2023 staat lachgas op lijst II van de Opiumwet. Verkoop en bezit voor recreatief gebruik zijn daarmee aan regels gebonden; gebruik in het verkeer is verboden. Op de pagina <a href="/is-lachgas-verboden/">is lachgas verboden?</a> leggen we uit wat de wet precies zegt en wat dat voor u betekent.</p>
<h3>Veilig gebruiken</h3>
<p>Gebruik lachgas altijd zittend, in een geventileerde ruimte, via een ballon en nooit in combinatie met alcohol. Lees onze volledige <a href="/lachgas-veilig-gebruiken/">richtlijnen voor veilig gebruik</a>.</p>
</div></section>`,
});

// lachgas bezorgen amsterdam
pages.push({
  path: '/lachgas-bezorgen-amsterdam/', crumbs: [{ name: 'Lachgas bezorgen Amsterdam' }],
  title: 'Lachgas bezorgen Amsterdam – 24/7 lachgaskoerier in 20-30 min',
  desc: 'Lachgas bezorgen in Amsterdam: onze koerier brengt de Fastgas Wegwerp Tank binnen 20-30 min bij u thuis, 24 uur per dag. Bestel via WhatsApp, betaal bij aflevering.',
  eyebrow: 'Lachgaskoerier Amsterdam',
  h1: 'Lachgas bezorgen in Amsterdam',
  lead: 'Onze koeriers rijden dag en nacht door Amsterdam. Binnen de ring bezorgen wij gemiddeld binnen 20-30 minuten, daarbuiten binnen 30-45 minuten. Altijd met de originele Fastgas Wegwerp Tank.',
  stats: ['Live aankomsttijd via WhatsApp', 'Discrete bezorging', 'Geen bezorgkosten in Amsterdam'],
  hero: 'photo',
  schema: [{ '@type': 'Service', '@id': abs('/lachgas-bezorgen-amsterdam/#service'), serviceType: 'Lachgas bezorgen', name: 'Lachgas bezorgen in Amsterdam', provider: { '@id': abs('/#business') }, areaServed: AREAS.filter((a) => a.type !== 'buurt').map((a) => ({ '@type': 'City', name: cap(stripArticle(a.name)) })), hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }, url: abs('/lachgas-bezorgen-amsterdam/') }],
  faq: [
    { q: 'Hoe lang duurt lachgas bezorgen in Amsterdam?', a: 'Binnen de ring A10 gemiddeld 20 tot 30 minuten. In Amstelveen, Diemen, Badhoevedorp en Landsmeer ongeveer hetzelfde; in Zaandam, Haarlem, Hoofddorp, Almere en Purmerend 30 tot 45 minuten. Bij uw bestelling geven we altijd een concrete aankomsttijd door.' },
    { q: 'Rekenen jullie bezorgkosten?', a: 'Binnen Amsterdam zijn er geen bezorgkosten; de prijs die u via WhatsApp krijgt is de prijs die u betaalt. Voor adressen verder buiten de stad kan een kleine toeslag gelden, die we vooraf duidelijk melden.' },
    { q: 'Kan ik de koerier volgen?', a: 'Wij sturen via WhatsApp een bevestiging met de verwachte aankomsttijd en een berichtje zodra de koerier bij u in de straat is.' },
    { q: 'Hoe wordt de tank afgeleverd?', a: 'De koerier overhandigt de verzegelde tank in een neutrale tas aan de deur. U controleert het zegel, rekent af met PIN of contant en kunt direct beginnen.' },
    { q: 'Kan ik een bezorgtijdstip afspreken?', a: 'Ja. Bestel overdag en geef aan wanneer u de tank wilt ontvangen; wij plannen de bezorging op het gewenste tijdstip.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Een lachgaskoerier die de stad kent</h2>
<p><strong>Lachgas bezorgen in Amsterdam</strong> vraagt om koeriers die de stad kennen: de eenrichtingsstraten in de Jordaan, de pont naar Noord, de parkeersituatie in De Pijp en de ringweg om snel van West naar Zuidoost te komen. Onze bezorgers rijden dagelijks dezelfde routes en zijn verdeeld over de stadsdelen, zodat er altijd iemand bij u in de buurt is.</p>
<p>Zodra uw bestelling binnenkomt, bevestigen we via WhatsApp welk formaat u krijgt, wat het kost en hoe laat de koerier er is. Verandert er onderweg iets, dan hoort u dat direct. Bij aankomst controleert u het zegel van de <a href="/lachgas-tanks/">Fastgas Wegwerp Tank</a> en rekent u af met PIN of contant.</p>
<h2>Bezorgtijden per gebied</h2>
<table><thead><tr><th>Gebied</th><th>Gemiddelde bezorgtijd</th></tr></thead><tbody>
<tr><td><a href="/lachgas-amsterdam-centrum/">Centrum</a>, <a href="/lachgas-amsterdam-west/">West</a>, <a href="/lachgas-amsterdam-zuid/">Zuid</a>, <a href="/lachgas-amsterdam-oost/">Oost</a></td><td>20-30 minuten</td></tr>
<tr><td><a href="/lachgas-amsterdam-noord/">Noord</a>, <a href="/lachgas-amsterdam-nieuw-west/">Nieuw-West</a>, <a href="/lachgas-amsterdam-zuidoost/">Zuidoost</a></td><td>20-35 minuten</td></tr>
<tr><td><a href="/lachgas-amstelveen/">Amstelveen</a>, <a href="/lachgas-diemen/">Diemen</a>, <a href="/lachgas-badhoevedorp/">Badhoevedorp</a>, <a href="/lachgas-landsmeer/">Landsmeer</a></td><td>20-35 minuten</td></tr>
<tr><td><a href="/lachgas-zaandam/">Zaandam</a>, <a href="/lachgas-weesp/">Weesp</a>, <a href="/lachgas-abcoude/">Abcoude</a>, <a href="/lachgas-uithoorn/">Uithoorn</a>, <a href="/lachgas-aalsmeer/">Aalsmeer</a></td><td>30-40 minuten</td></tr>
<tr><td><a href="/lachgas-haarlem/">Haarlem</a>, <a href="/lachgas-hoofddorp/">Hoofddorp</a>, <a href="/lachgas-purmerend/">Purmerend</a>, <a href="/lachgas-almere/">Almere</a></td><td>30-50 minuten</td></tr>
</tbody></table>
<p>Op vrijdag- en zaterdagnacht tussen 00:00 en 03:00 is het het drukst; bestel dan iets eerder of geef een tijdstip door, dan plannen we uw bezorging in.</p>
</div></section>
<section class="section alt"><div class="container">
<p class="eyebrow">Zo werkt het</p>
<h2>Bestellen in drie stappen</h2>
${steps()}
</div></section>
<section class="section"><div class="container">
<p class="eyebrow">Ons assortiment</p>
<h2>Wat wij bezorgen</h2>
${productCards()}
</div></section>
<section class="section dark"><div class="container"><p class="eyebrow">Bezorggebied</p><h2>Overal in Amsterdam en omstreken</h2>${areaColumns()}</div></section>`,
});

// lachgas bestellen amsterdam
pages.push({
  path: '/lachgas-bestellen-amsterdam/', crumbs: [{ name: 'Lachgas bestellen' }],
  title: 'Lachgas bestellen Amsterdam – via WhatsApp, betalen bij aflevering',
  desc: 'Lachgas bestellen in Amsterdam in één WhatsApp-bericht: adres + formaat (2KG, 4KG, 10KG). Wij bevestigen de aankomsttijd, u betaalt bij aflevering. 24/7.',
  eyebrow: 'Zo bestelt u',
  h1: 'Lachgas bestellen in Amsterdam',
  lead: 'Geen webshop, geen account, geen vooruitbetaling. Eén bericht met uw adres en het gewenste formaat is genoeg; binnen 20-30 minuten staat de koerier voor de deur.',
  stats: ['WhatsApp of telefoon', 'Geen account nodig', 'PIN of contant'],
  faq: [
    { q: 'Wat moet ik in mijn WhatsApp-bericht zetten?', a: 'Uw straat, huisnummer en plaats, het gewenste formaat (2KG, 4KG of 10KG) en eventueel het tijdstip waarop u de tank wilt ontvangen. Wij antwoorden met de prijs en de verwachte aankomsttijd.' },
    { q: 'Kan ik ook bellen om te bestellen?', a: 'Ja, bel ' + SITE.telDisplay + '. Telefonisch bestellen gaat net zo snel; we herhalen uw adres en formaat en bevestigen de aankomsttijd.' },
    { q: 'Kan ik iDEAL of een betaalverzoek gebruiken?', a: 'U betaalt bij aflevering met PIN of contant. Op verzoek kan de koerier ook een betaalverzoek (Tikkie/iDEAL) sturen dat u ter plekke voldoet.' },
    { q: 'Kan ik meerdere tanks bestellen?', a: 'Zeker. De 4KG bestaat uit twee tanks en de 10KG uit vijf tanks; grotere aantallen voor horeca of evenementen regelen we via onze zakelijke pagina.' },
    { q: 'Moet ik mij legitimeren?', a: 'Onze koerier kan bij aflevering om een geldig legitimatiebewijs vragen. Wij leveren uitsluitend aan personen van 18 jaar en ouder.' },
  ],
  body: `
<section class="section"><div class="container">
<p class="eyebrow">In drie stappen</p>
<h2>Zo bestelt u lachgas bij ons</h2>
${steps()}
<p>${waBtn('Nu bestellen via WhatsApp')} &nbsp; ${telBtn('Bel ' + SITE.telDisplay, 'btn ghost dark')}</p>
</div></section>
<section class="section alt"><div class="container prose">
<h2>Voorbeeldbericht</h2>
<p>Twijfelt u wat u moet sturen? Dit is genoeg:</p>
<div class="note">&ldquo;Hoi, graag 1x Fastgas 2KG naar Ceintuurbaan 123-2, Amsterdam. Zo snel mogelijk.&rdquo;</div>
<p>Wij antwoorden binnen een paar minuten met de prijs en de verwachte aankomsttijd. Wilt u de tank later op de avond? Zet dan het gewenste tijdstip erbij; wij plannen de bezorging in.</p>
<h2>Welk formaat bestelt u?</h2>
<p>Voor een avond met een handvol vrienden volstaat de <a href="/product/fastgas-2kg/">Fastgas 2KG</a> (circa 250 ballonnen). Bij 15 tot 30 gasten is de <a href="/product/fastgas-4kg/">4KG</a> de betere keuze, en voor grote feesten, evenementen en horeca is de <a href="/product/fastgas-10kg/">10KG</a> het voordeligst per ballon. Vergeet niet dat u ballonnen en eventueel een <a href="/lachgas-cracker/">cracker</a> of tuutje nodig heeft; bij de Fastgas tank zit het ventiel al op de tank.</p>
<h2>Overdag bestellen voor &rsquo;s avonds</h2>
<p>Weet u al dat u vanavond een feestje heeft? Bestel dan overdag. U betaalt dezelfde prijs, de koerier komt op het afgesproken tijdstip en u hoeft niet te wachten op het drukste moment van de avond. Ook &rsquo;s nachts bestellen kan altijd: lees meer over onze <a href="/lachgas-nachtbezorging-amsterdam/">nachtbezorging</a>.</p>
</div></section>
<section class="section"><div class="container">${productCards()}</div></section>`,
});

// lachgas-tanks hub
pages.push({
  path: '/lachgas-tanks/', navActive: '/lachgas-tanks/', crumbs: [{ name: 'Fastgas tanks' }],
  title: 'Lachgas tank kopen Amsterdam – Fastgas 2KG, 4KG & 10KG',
  desc: 'Lachgas tank kopen in Amsterdam? Originele Fastgas Wegwerp Tank: 2KG (±250 ballonnen), 4KG (±500) en 10KG (±1250). Verzegeld, geen statiegeld, 24/7 in 20-30 min.',
  eyebrow: 'Fastgas Wegwerp Tank',
  h1: 'Lachgas tanks: Fastgas 2KG, 4KG en 10KG',
  lead: 'Wij leveren uitsluitend de originele Fastgas Wegwerp Tank. Verzegeld, nagewogen en direct klaar voor gebruik. Geen statiegeld, geen lege fles inleveren.',
  stats: ['Origineel Fastgas', 'Zuiver N₂O', 'Geen statiegeld'],
  hero: 'photo',
  faq: [
    { q: 'Wat is een Fastgas Wegwerp Tank?', a: 'Een verzegelde aluminium tank met 2 kilo zuiver distikstofmonoxide (N₂O), voorzien van een draaiventiel. De tank is voor eenmalig gebruik: na afloop gooit u hem weg bij het restafval of geeft u hem mee aan de koerier.' },
    { q: 'Hoeveel ballonnen haal ik uit een lachgas tank?', a: 'Uit een 2 kilo tank circa 250 ballonnen, afhankelijk van de ballongrootte. De 4KG (twee tanks) is goed voor circa 500 en de 10KG (vijf tanks) voor circa 1250 ballonnen.' },
    { q: 'Hoe herken ik een originele Fastgas tank?', a: 'Aan het intacte zegel, de QR-code op het etiket, het Fastgas-logo in reliëf en het certificeringsnummer op de onderzijde. Onze koerier laat u het zegel controleren voordat u betaalt.' },
    { q: 'Heb ik een cracker nodig bij een lachgas tank?', a: 'Nee. Het ventiel zit al op de tank; u draait de ballon over het tuutje en opent het ventiel. Een cracker is alleen nodig voor losse slagroompatronen.' },
    { q: 'Is een lachgas tank gevaarlijk?', a: 'De tank staat onder druk en moet rechtop, koel en buiten bereik van kinderen bewaard worden. Niet verhitten, niet doorboren en niet in de auto laten liggen. Bij normaal gebruik en opslag is de Fastgas tank veilig.' },
  ],
  body: `
<section class="section"><div class="container">
<p class="eyebrow">Kies uw formaat</p>
<h2>Drie formaten, één origineel product</h2>
${productCards()}
<div class="prose">
<table><thead><tr><th>Formaat</th><th>Aantal tanks</th><th>Inhoud</th><th>Ballonnen</th><th>Prijs per ballon</th></tr></thead><tbody>
<tr><td><a href="/product/fastgas-2kg/">Fastgas 2KG</a></td><td>1</td><td>2 kg</td><td>±250</td><td>standaard</td></tr>
<tr><td><a href="/product/fastgas-4kg/">Fastgas 4KG</a></td><td>2</td><td>4 kg</td><td>±500</td><td>voordeliger</td></tr>
<tr><td><a href="/product/fastgas-10kg/">Fastgas 10KG</a></td><td>5</td><td>10 kg</td><td>±1250</td><td>voordeligst</td></tr>
</tbody></table>
</div>
</div></section>
<section class="section alt"><div class="container prose">
<h2>Waarom de Fastgas Wegwerp Tank?</h2>
<p>De Fastgas tank is de meest verkochte wegwerp lachgastank van Europa. Elke tank wordt in de fabriek gevuld met zuiver, food-grade N₂O, verzegeld en voorzien van een uniek certificeringsnummer. Wij wegen iedere tank vóór vertrek na, zodat u altijd een volle tank ontvangt.</p>
<ul class="reasons">
<li>Verzegeld en gecertificeerd, met QR-code voor echtheidscontrole</li>
<li>Draaiventiel op de tank: geen cracker of losse onderdelen nodig</li>
<li>Geen statiegeld en geen retourafspraak</li>
<li>Nagewogen vóór vertrek: altijd goed gevuld</li>
<li>Compact formaat, past in elke tas of kast</li>
<li>Zuiver N₂O zonder bijmenging</li>
</ul>
${PHOTO_GRID}
<h2>Lachgas tank of slagroompatronen?</h2>
<p>Eén 2 kilo tank vervangt circa 250 slagroompatronen van 8 gram. U heeft geen cracker nodig, geen berg lege patronen en de tank is in één keer klaar voor gebruik. Lees de volledige vergelijking op <a href="/lachgas-tank-of-slagroompatronen/">lachgas tank of slagroompatronen</a>, of bekijk <a href="/hoe-werkt-een-lachgas-tank/">hoe een lachgas tank werkt</a>.</p>
</div></section>`,
});

// product pages
PRODUCTS.forEach((p, i) => {
  const others = PRODUCTS.filter((o) => o !== p);
  const prodPath = '/' + p.slug + '/';
  pages.push({
    path: prodPath, navActive: '/lachgas-tanks/', crumbs: [{ name: 'Fastgas tanks', item: abs('/lachgas-tanks/') }, { name: p.name }],
    title: `${p.name} Amsterdam – ${p.balloons} ballonnen, 24/7 bezorgd`,
    desc: `${p.name} bestellen in Amsterdam: ${p.tanks === 1 ? 'één verzegelde tank' : p.tanks + ' verzegelde tanks'}, ${p.kg} kg zuiver lachgas, ${p.balloons} ballonnen. Binnen 20-30 min bezorgd, betalen bij aflevering. 18+.`,
    ogImage: `/assets/img/${p.img}.${p.ext}`, ogW: p.w, ogH: p.h, ogAlt: p.name, ogType: 'product',
    eyebrow: 'Fastgas Wegwerp Tank', h1: p.name, lead: p.blurb, hero: 'plain',
    preload: `<link rel="preload" as="image" fetchpriority="high" imagesrcset="${productSrcset(p)}" imagesizes="320px">`,
    stats: [`${p.kg} kg N₂O`, `${p.balloons} ballonnen`, p.tanks === 1 ? '1 tank' : `${p.tanks} tanks`, 'Binnen 20-30 min'],
    schema: [{ '@type': 'Product', '@id': abs(prodPath + '#product'), name: p.name, image: abs(`/assets/img/${p.img}.${p.ext}`), description: p.blurb, brand: { '@type': 'Brand', name: 'Fastgas' }, sku: p.sku, category: 'Lachgas tanks',
      weight: { '@type': 'QuantitativeValue', value: p.kg, unitCode: 'KGM' },
      additionalProperty: [{ '@type': 'PropertyValue', name: 'Inhoud', value: `${p.kg} kg N₂O` }, { '@type': 'PropertyValue', name: 'Aantal tanks', value: String(p.tanks) }, { '@type': 'PropertyValue', name: 'Aantal ballonnen', value: p.balloons }, { '@type': 'PropertyValue', name: 'Statiegeld', value: 'Geen' }],
      offers: { '@type': 'Offer', url: abs(prodPath), priceCurrency: 'EUR', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@id': abs('/#business') }, areaServed: 'Amsterdam en omstreken', deliveryLeadTime: { '@type': 'QuantitativeValue', minValue: 20, maxValue: 30, unitCode: 'MIN' } } }],
    faq: [
      { q: `Voor hoeveel ballonnen is de ${p.name}?`, a: `De ${p.short} bevat in totaal ${p.kg} kilo lachgas, goed voor ${p.balloons} ballonnen. Dat komt overeen met ${p.kg * 125} slagroompatronen van 8 gram.` },
      { q: `Wat kost de ${p.name}?`, a: `Vraag de actuele prijs op via WhatsApp; wij werken met vaste prijzen inclusief bezorging in Amsterdam. ${i > 0 ? 'Per ballon is dit formaat voordeliger dan de losse 2KG tank.' : 'Grotere formaten zijn per ballon voordeliger.'} Zie ook onze <a href="/lachgas-prijzen-amsterdam/">prijzen</a>.` },
      { q: `Hoe snel wordt de ${p.short} bezorgd?`, a: 'In Amsterdam gemiddeld binnen 20 tot 30 minuten, 24 uur per dag. Buiten de stad binnen 30 tot 45 minuten.' },
      { q: 'Moet ik de lege tank inleveren?', a: 'Nee. De Fastgas Wegwerp Tank heeft geen statiegeld. Een lege tank kan bij het restafval of u geeft hem mee aan onze koerier.' },
      { q: `Is de ${p.short} geschikt voor horeca?`, a: p.kg >= 10 ? 'Ja, de 10KG is ons horecaformaat. Voor terugkerende afname bieden wij staffelprijzen; bekijk onze pagina voor <a href="/horeca-en-evenementen/">horeca en evenementen</a>.' : `Voor horeca en evenementen raden wij de <a href="/product/fastgas-10kg/">Fastgas 10KG</a> aan, die per ballon het voordeligst is. Bekijk onze pagina voor <a href="/horeca-en-evenementen/">horeca en evenementen</a>.` },
    ],
    body: `
<section class="section"><div class="container">
<div class="product-hero">
<div>${productImg(p, { lazy: false, sizes: 320 })}</div>
<div><p class="eyebrow" style="color:var(--mint)">Fastgas Wegwerp Tank</p><h2>${p.name}</h2><div class="price">Prijs op aanvraag<small>Vaste prijs incl. bezorging in Amsterdam · vraag de actuele prijs via WhatsApp</small></div>
<ul><li>Inhoud: ${p.kg} kg zuiver N₂O (${p.tanks === 1 ? '1 tank van 2 kg' : p.tanks + ' tanks van 2 kg'})</li><li>Goed voor ${p.balloons} ballonnen</li><li>Verzegeld, gecertificeerd en nagewogen</li><li>Ventiel op de tank, geen cracker nodig</li><li>Geen statiegeld, geen retour</li><li>Levering uitsluitend aan 18+</li></ul>
<div class="variant-row">${PRODUCTS.map((o) => `<a href="/${o.slug}/"${o === p ? ' class="active"' : ''}>${o.kg}KG</a>`).join('')}</div>
<p>${waBtn()} ${telBtn()}</p></div>
</div>
</div></section>
<section class="section alt"><div class="container prose">
<h2>Over de ${p.name}</h2>
<p>${p.blurb} Elke tank is gevuld met zuiver distikstofmonoxide, verzegeld in de fabriek en voorzien van een uniek certificeringsnummer. U draait de ballon over het tuutje, opent het ventiel en regelt met het ventiel zelf hoe snel de ballon vult.</p>
${p.kg === 2 ? '<p>De 2KG is ons meest bestelde formaat: compact genoeg om in een tas mee te nemen, groot genoeg voor een hele avond met vrienden. Twijfelt u tussen 2KG en 4KG? Bij meer dan vijftien gasten is de 4KG meestal de betere keuze.</p>' : ''}
${p.kg === 4 ? '<p>De 4KG bestaat uit twee losse Fastgas tanks. Dat is handig: u kunt de tanks op twee plekken neerzetten, of de tweede tank bewaren voor een volgende keer. Per ballon is de 4KG voordeliger dan twee keer een losse 2KG bestellen.</p>' : ''}
${p.kg === 10 ? '<p>De 10KG bestaat uit vijf losse Fastgas tanks en is bedoeld voor evenementen, grote feesten en horeca. Voor terugkerende afname werken we met staffelprijzen en kunnen we op vaste tijden leveren; bekijk onze pagina voor <a href="/horeca-en-evenementen/">horeca en evenementen</a>.</p>' : ''}
<h3>Specificaties</h3>
<table><tbody><tr><th>Product</th><td>${p.name}</td></tr><tr><th>Merk</th><td>Fastgas (origineel)</td></tr><tr><th>Inhoud</th><td>${p.kg} kg N₂O</td></tr><tr><th>Aantal tanks</th><td>${p.tanks}</td></tr><tr><th>Aantal ballonnen</th><td>${p.balloons}</td></tr><tr><th>Gelijk aan</th><td>${p.kg * 125} slagroompatronen</td></tr><tr><th>Ventiel</th><td>Draaiventiel op de tank</td></tr><tr><th>Statiegeld</th><td>Geen</td></tr><tr><th>Bezorgtijd Amsterdam</th><td>20-30 minuten</td></tr></tbody></table>
<h3>Andere formaten</h3>
<p>${others.map((o) => `<a href="/${o.slug}/">${o.name}</a> (${o.balloons} ballonnen)`).join(' · ')}</p>
${PHOTO_GRID}
</div></section>
<section class="section"><div class="container"><p class="eyebrow">Zo werkt het</p><h2>${p.short} bestellen in Amsterdam</h2>${steps()}</div></section>`,
  });
});

// prijzen
pages.push({
  path: '/lachgas-prijzen-amsterdam/', navActive: '/lachgas-prijzen-amsterdam/', crumbs: [{ name: 'Lachgas prijzen' }],
  title: 'Lachgas prijzen Amsterdam – wat kost een lachgas tank?',
  desc: 'Lachgas prijs Amsterdam: vaste prijzen voor de Fastgas tank 2KG, 4KG en 10KG, inclusief bezorging in Amsterdam. Geen bezorgkosten, geen statiegeld.',
  eyebrow: 'Transparante prijzen',
  h1: 'Lachgas prijzen in Amsterdam',
  lead: 'Vaste prijzen per formaat, inclusief bezorging binnen Amsterdam. Geen bezorgkosten, geen statiegeld en geen verrassingen bij de deur.',
  stats: ['Geen bezorgkosten', 'Geen statiegeld', 'Staffelkorting bij 4KG en 10KG'],
  faq: [
    { q: 'Wat kost een lachgas tank in Amsterdam?', a: 'De prijs hangt af van het formaat: 2KG, 4KG of 10KG. Wij publiceren de prijzen niet online omdat ze afhankelijk zijn van inkoop en vraag, maar u krijgt via WhatsApp binnen een minuut de actuele vaste prijs, inclusief bezorging.' },
    { q: 'Zijn er bezorgkosten?', a: 'Binnen Amsterdam niet. Voor adressen buiten de stad, zoals Haarlem, Almere of Purmerend, kan een kleine kilometertoeslag gelden die we vooraf melden.' },
    { q: 'Is ’s nachts bestellen duurder?', a: 'Nee. Wij hanteren dag en nacht dezelfde prijs, ook in het weekend en op feestdagen.' },
    { q: 'Krijg ik korting bij meerdere tanks?', a: 'Ja. De 4KG (twee tanks) en 10KG (vijf tanks) zijn per ballon voordeliger dan losse 2KG tanks. Voor horeca en evenementen gelden aparte staffelprijzen.' },
    { q: 'Hoe kan ik betalen?', a: 'Bij aflevering met PIN of contant. Op verzoek stuurt de koerier een betaalverzoek dat u ter plekke voldoet.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Hoe is de prijs van lachgas opgebouwd?</h2>
<p>De prijs van een lachgas tank bestaat uit het product zelf (de originele Fastgas Wegwerp Tank), de bezorging en de service. Bij Lachgas Dienst Amsterdam zit alles in één vaste prijs per formaat: u betaalt wat wij via WhatsApp bevestigen, niets meer. Bezorging binnen Amsterdam is gratis, er is geen statiegeld en &rsquo;s nachts bestellen kost hetzelfde als overdag.</p>
<table><thead><tr><th>Formaat</th><th>Inhoud</th><th>Ballonnen</th><th>Prijs</th></tr></thead><tbody>
<tr><td><a href="/product/fastgas-2kg/">Fastgas 2KG</a></td><td>1 tank</td><td>±250</td><td>Vaste prijs, vraag via WhatsApp</td></tr>
<tr><td><a href="/product/fastgas-4kg/">Fastgas 4KG</a></td><td>2 tanks</td><td>±500</td><td>Voordeliger per ballon</td></tr>
<tr><td><a href="/product/fastgas-10kg/">Fastgas 10KG</a></td><td>5 tanks</td><td>±1250</td><td>Voordeligst per ballon</td></tr>
<tr><td>Horeca / evenementen</td><td>Op maat</td><td>Op maat</td><td><a href="/horeca-en-evenementen/">Staffelprijs op aanvraag</a></td></tr>
</tbody></table>
<p>${waBtn('Vraag de actuele prijs')}</p>
<h2>Waarom goedkoop lachgas niet altijd goedkoop is</h2>
<p>Op social media en marktplaatsen worden regelmatig &ldquo;goedkope&rdquo; lachgas tanks aangeboden. Vaak gaat het dan om namaak, om tanks die niet volledig gevuld zijn of om aanbieders die na betaling niet komen opdagen. Een originele Fastgas tank herkent u aan het zegel, de QR-code en het certificeringsnummer; wij wegen bovendien elke tank na vóór vertrek. U betaalt pas bij aflevering, dus u loopt nooit risico.</p>
<h2>Prijs per ballon vergelijken</h2>
<p>Wie de prijs per ballon vergelijkt, ziet snel dat een tank veel voordeliger is dan slagroompatronen: één 2KG tank vervangt circa 250 patronen. Voor grotere groepen loont het om direct de 4KG of 10KG te bestellen. Lees meer in <a href="/lachgas-tank-of-slagroompatronen/">lachgas tank of slagroompatronen</a>.</p>
</div></section>
<section class="section alt"><div class="container">${productCards()}</div></section>`,
});

// nachtbezorging
pages.push({
  path: '/lachgas-nachtbezorging-amsterdam/', crumbs: [{ name: 'Lachgas ’s nachts bestellen' }],
  title: 'Lachgas ’s nachts bestellen Amsterdam – 24 uur bezorgservice',
  desc: 'Lachgas ’s nachts bestellen in Amsterdam: wij leveren ook na middernacht, in het weekend en op feestdagen. Fastgas tank binnen 20-30 min, zelfde prijs als overdag.',
  eyebrow: '24 uur per dag',
  h1: 'Lachgas ’s nachts bestellen in Amsterdam',
  lead: 'Het feest loopt uit en de tank is leeg? Wij bezorgen 24 uur per dag, ook om drie uur ’s nachts, op zondag en op feestdagen. Zelfde prijs, zelfde snelheid.',
  stats: ['Ook na 00:00', 'Weekend & feestdagen', 'Geen nachttoeslag'],
  hero: 'photo',
  faq: [
    { q: 'Tot hoe laat kan ik lachgas bestellen?', a: 'Altijd. Wij zijn 24 uur per dag bereikbaar via WhatsApp en telefoon. Ook om 03:00 of 05:00 ’s nachts rijden onze koeriers.' },
    { q: 'Is nachtbezorging duurder?', a: 'Nee. Wij rekenen geen nachttoeslag; de prijs is dag en nacht hetzelfde.' },
    { q: 'Hoe lang duurt bezorging ’s nachts?', a: 'Vaak zelfs sneller dan overdag, omdat de wegen leeg zijn: gemiddeld 20 tot 30 minuten in Amsterdam. Alleen op vrijdag- en zaterdagnacht tussen 00:00 en 03:00 kan het iets drukker zijn.' },
    { q: 'Bezorgen jullie op feestdagen?', a: 'Ja: Koningsdag, Oud &amp; Nieuw, Kerst, Pasen, Pinksteren en alle andere feestdagen. Houd er rekening mee dat het op Koningsnacht en Oudejaarsnacht erg druk is; bestel dan vooruit.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>De nachtkoerier van Amsterdam</h2>
<p>Amsterdam slaapt nooit, en wij ook niet. Waar de meeste bezorgdiensten om middernacht stoppen, rijden onze koeriers juist dan het hardst: van de clubs rond het Rembrandtplein en de Wallen tot afterparty&rsquo;s in Noord en Oost. <strong>Lachgas &rsquo;s nachts bestellen</strong> werkt precies zo als overdag: een WhatsApp-bericht met uw adres en formaat, en binnen 20-30 minuten staat de koerier voor de deur.</p>
<h3>Zo bestelt u &rsquo;s nachts</h3>
${steps()}
<h2>Drukke nachten: bestel vooruit</h2>
<p>Op vrijdag- en zaterdagnacht tussen 00:00 en 03:00, op Koningsnacht en tijdens Oud &amp; Nieuw is het het drukst. Weet u al dat u een tank nodig heeft? Bestel dan eerder op de avond en geef het gewenste tijdstip door, dan plannen we uw bezorging in en hoeft u nooit te wachten.</p>
<h2>Veilig gebruik &rsquo;s nachts</h2>
<p>Later op de avond is er vaak alcohol in het spel. Combineer lachgas nooit met alcohol of andere middelen, gebruik altijd zittend en via een ballon, en ga na gebruik niet de weg op. Lees onze <a href="/lachgas-veilig-gebruiken/">tips voor veilig gebruik</a>.</p>
</div></section>
<section class="section alt"><div class="container two-col"><div class="prose"><p class="eyebrow">Openingstijden</p><h2>Altijd open</h2><p>Doorlopend geopend, ook op feestdagen. Bel of app ons op elk moment van de dag of nacht.</p></div><div>${hoursList()}</div></div></section>`,
});

// bezorggebied
pages.push({
  path: '/bezorggebied/', navActive: '/bezorggebied/', crumbs: [{ name: 'Bezorggebied' }],
  title: 'Bezorggebied – lachgas in Amsterdam, Amstelveen, Zaandam & meer',
  desc: 'Bezorggebied: alle stadsdelen en buurten van Amsterdam plus Amstelveen, Diemen, Zaandam, Haarlem, Hoofddorp, Almere en Purmerend. Lachgas in 20-45 min, 24/7.',
  eyebrow: 'Waar wij komen',
  h1: 'Bezorggebied lachgas Amsterdam en omstreken',
  lead: 'Wij bezorgen de Fastgas Wegwerp Tank in heel Amsterdam en in een groot deel van de regio. Staat uw plaats er niet bij? Vraag het via WhatsApp; vaak is er meer mogelijk.',
  stats: ['7 stadsdelen', '18 buurten', '15 plaatsen in de regio'],
  faq: [
    { q: 'Bezorgen jullie buiten Amsterdam?', a: 'Ja, in Amstelveen, Diemen, Ouderkerk, Badhoevedorp, Zwanenburg, Landsmeer, Zaandam, Weesp, Abcoude, Uithoorn, Aalsmeer, Haarlem, Hoofddorp, Purmerend en Almere.' },
    { q: 'Mijn plaats staat er niet bij. Kunnen jullie toch komen?', a: 'Stuur ons een WhatsApp met uw adres. Voor plaatsen net buiten ons standaardgebied kunnen we vaak toch bezorgen, soms met een kleine toeslag.' },
    { q: 'Wat is de bezorgtijd buiten de stad?', a: 'Amstelveen, Diemen, Badhoevedorp en Landsmeer: 20-35 minuten. Zaandam, Weesp, Abcoude, Uithoorn en Aalsmeer: 30-40 minuten. Haarlem, Hoofddorp, Purmerend en Almere: 30-50 minuten.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Stadsdelen van Amsterdam</h2>
<p>Binnen de ring A10 en in de stadsdelen daarbuiten bezorgen wij gemiddeld binnen 20-30 minuten.</p>
${cityGrid(AREAS.filter((a) => a.type === 'stadsdeel').map((a) => a.slug), false)}
<h2>Buurten en wijken</h2>
<p>Elke buurt heeft een eigen pagina met bezorgtijd en bijzonderheden.</p>
${cityGrid(AREAS.filter((a) => a.type === 'buurt').map((a) => a.slug), false)}
<h2>Regio rond Amsterdam</h2>
<p>Ook buiten de stadsgrens rijden onze koeriers dagelijks. De bezorgtijd ligt hier tussen 20 en 50 minuten, afhankelijk van de afstand; we geven altijd vooraf een concrete aankomsttijd door.</p>
${cityGrid(AREAS.filter((a) => a.type === 'plaats').map((a) => a.slug), false)}
</div></section>
<section class="section alt"><div class="container"><p class="eyebrow">Zo werkt het</p><h2>Bestellen in uw wijk</h2>${steps()}</div></section>`,
});

// horeca
pages.push({
  path: '/horeca-en-evenementen/', crumbs: [{ name: 'Horeca & evenementen' }],
  title: 'Lachgas horeca & evenementen Amsterdam – zakelijk bestellen',
  desc: 'Lachgas zakelijk bestellen in Amsterdam voor horeca, clubs, festivals en evenementen. Fastgas 10KG met staffelkorting, vaste levermomenten en 24/7 nalevering.',
  eyebrow: 'Zakelijk',
  h1: 'Lachgas voor horeca en evenementen in Amsterdam',
  lead: 'Clubs, bars, festivals, boten en privé-evenementen: wij leveren op vaste tijden, in grotere volumes en met staffelprijzen. Ook ’s nachts naleveren als de voorraad op is.',
  stats: ['Staffelprijzen', 'Vaste levermomenten', '24/7 nalevering'],
  faq: [
    { q: 'Wat is de minimale afname voor zakelijke prijzen?', a: 'Vanaf de 10KG (vijf tanks) per levering of bij terugkerende weekafname. Wij maken een prijsvoorstel op basis van volume en frequentie.' },
    { q: 'Kunnen jullie op een evenement leveren?', a: 'Ja. Geef locatie, tijdstip en contactpersoon door; wij leveren op het afgesproken moment en kunnen tijdens het evenement bijleveren.' },
    { q: 'Kan ik op factuur betalen?', a: 'Voor vaste zakelijke klanten is betaling op factuur mogelijk na een eerste contante of PIN-betaling. Vraag naar de voorwaarden.' },
    { q: 'Leveren jullie ook ballonnen en crackers?', a: 'Op aanvraag leveren wij ballonnen mee. De Fastgas tank heeft een eigen ventiel, dus crackers zijn niet nodig.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Zakelijk lachgas bestellen</h2>
<p>Naast particulieren beleveren wij horeca, evenementenorganisatoren en handelaren in Amsterdam en de regio. Voor zakelijke afname gelden andere volumes en voorwaarden dan voor een losse bestelling: wij leveren de <a href="/product/fastgas-10kg/">Fastgas 10KG</a> (vijf tanks) of veelvouden daarvan, met een staffelprijs die daalt naarmate u meer afneemt.</p>
<ul class="reasons">
<li>Staffelprijzen vanaf 10 kg per levering</li>
<li>Vaste levermomenten, bijvoorbeeld elke vrijdagmiddag</li>
<li>Nalevering tijdens uw evenement, ook &rsquo;s nachts</li>
<li>Eén vast contactpersoon via WhatsApp</li>
<li>Levering op boten, festivalterreinen en privélocaties</li>
<li>Uitsluitend originele, verzegelde Fastgas tanks</li>
</ul>
<h2>Voor wie?</h2>
<p>Clubs en bars rond het Rembrandtplein, het Leidseplein en de Wallen; festivals op het Westergasterrein en de NDSM-werf; partyboten op de grachten en het IJ; afterparty&rsquo;s, bedrijfsfeesten en bruiloften in en rond Amsterdam. Ook handelaren die zelf doorverkopen kunnen bij ons terecht voor grotere volumes.</p>
<h2>Prijsopgave aanvragen</h2>
<p>Stuur ons via WhatsApp uw bedrijfsnaam, de gewenste hoeveelheid en de leverfrequentie; u ontvangt binnen een uur een prijsvoorstel. Afhalen op afspraak in Amsterdam is ook mogelijk.</p>
<p>${waBtn('Vraag zakelijke prijzen aan')} &nbsp; ${telBtn('Bel ' + SITE.telDisplay, 'btn ghost dark')}</p>
</div></section>
<section class="section alt"><div class="container">${productCards()}</div></section>`,
});

// contact
pages.push({
  path: '/contact/', navActive: '/contact/', crumbs: [{ name: 'Contact' }],
  title: 'Contact – Lachgas Dienst Amsterdam | WhatsApp, telefoon & e-mail',
  desc: 'Contact met Lachgas Dienst Amsterdam: bestel via WhatsApp ' + SITE.waDisplay + ', bel ' + SITE.telDisplay + ' of mail. 24 uur per dag bereikbaar.',
  eyebrow: 'Neem contact op', h1: 'Contact', hero: 'plain',
  lead: 'Voor bestellingen gebruikt u het snelst WhatsApp of de telefoon. Voor overige vragen kunt u ook het contactformulier gebruiken; wij reageren per e-mail.',
  schema: [{ '@type': 'ContactPage', '@id': abs('/contact/#contactpage'), url: abs('/contact/'), name: 'Contact Lachgas Dienst Amsterdam' }],
  body: `
<section class="section"><div class="container">
<ul class="contact-cards">
<li><strong>WhatsApp (bestellen)</strong><a href="${WA_URL}" target="_blank" rel="noopener">${SITE.waDisplay}</a><br><span style="font-size:13px;color:var(--ink-dim)">24/7 · snelste manier om te bestellen</span></li>
<li><strong>Telefoon</strong><a href="${TEL_URL}">${SITE.telDisplay}</a><br><span style="font-size:13px;color:var(--ink-dim)">24/7 · bestellen en vragen</span></li>
<li><strong>E-mail</strong><a href="mailto:${SITE.email}">${SITE.email}</a><br><span style="font-size:13px;color:var(--ink-dim)">Zakelijke vragen en overige berichten</span></li>
</ul>
<div class="two-col">
<div><h2>Stuur ons een bericht</h2>
<form class="contact-form" action="https://formspree.io/f/your-form-id" method="POST">
<div class="form-row"><label for="naam">Naam</label><input id="naam" name="naam" type="text" required autocomplete="name"></div>
<div class="form-row"><label for="email">E-mailadres</label><input id="email" name="email" type="email" required autocomplete="email"></div>
<div class="form-row"><label for="telefoon">Telefoonnummer (optioneel)</label><input id="telefoon" name="telefoon" type="tel" autocomplete="tel"></div>
<div class="form-row"><label for="bericht">Bericht</label><textarea id="bericht" name="bericht" rows="5" required></textarea></div>
<button class="btn" type="submit">Verstuur bericht</button>
</form></div>
<div class="prose"><h2>Bedrijfsgegevens</h2><p><strong>${SITE.name}</strong><br>Amsterdam, Noord-Holland<br>E-mail: <a href="mailto:${SITE.email}">${SITE.email}</a><br>Telefoon: <a href="${TEL_URL}">${SITE.telDisplay}</a><br>WhatsApp: <a href="${WA_URL}" target="_blank" rel="noopener">${SITE.waDisplay}</a></p><h3>Openingstijden</h3>${hoursList()}</div>
</div>
</div></section>`,
});

// over ons
pages.push({
  path: '/over-ons/', crumbs: [{ name: 'Over ons' }],
  title: 'Over Lachgas Dienst Amsterdam – de lachgaskoerier van Amsterdam',
  desc: 'Lachgas Dienst Amsterdam is een Amsterdamse bezorgdienst voor originele Fastgas lachgas tanks. Snel, discreet en 24/7. Lees wie wij zijn en hoe wij werken.',
  faq: [
    { q: 'Zijn jullie een officiële Fastgas-dealer?', a: 'Wij kopen uitsluitend originele, verzegelde Fastgas tanks in via de officiële distributie en wegen elke tank na. U kunt de echtheid controleren via de QR-code op het etiket.' },
    { q: 'Hebben jullie een winkel of afhaalpunt?', a: 'Nee, wij zijn een pure bezorgdienst. Voor zakelijke klanten is afhalen op afspraak in Amsterdam mogelijk.' },
    { q: 'Hoe lang bestaan jullie al?', a: 'Ons team rijdt al jaren door Amsterdam. Onder de naam Lachgas Dienst Amsterdam bundelen we die ervaring met één product, vaste prijzen en een eigen website.' },
  ], faqTitle: 'Vragen over ons',
  eyebrow: 'Wie wij zijn', h1: 'Over Lachgas Dienst Amsterdam', hero: 'plain',
  lead: 'Een Amsterdams team van koeriers dat de stad kent en dag en nacht rijdt. Eén product, één vaste prijs en één belofte: binnen 20-30 minuten voor de deur.',
  schema: [{ '@type': 'AboutPage', '@id': abs('/over-ons/#aboutpage'), url: abs('/over-ons/'), name: 'Over Lachgas Dienst Amsterdam' }],
  body: `
<section class="section"><div class="container prose">
<h2>Ons verhaal</h2>
<p>Lachgas Dienst Amsterdam is ontstaan uit een simpele frustratie: wie in Amsterdam lachgas wilde bestellen, moest kiezen tussen onbetrouwbare aanbieders op social media, lange wachttijden of namaakproducten. Wij wilden het anders doen. Eén origineel product, de Fastgas Wegwerp Tank, vaste prijzen, een koerier die écht binnen een half uur komt en betaling pas bij aflevering.</p>
<h2>Hoe wij werken</h2>
<ul class="reasons">
<li>Koeriers verdeeld over alle stadsdelen</li>
<li>Elke tank nagewogen vóór vertrek</li>
<li>Bevestiging met aankomsttijd via WhatsApp</li>
<li>Neutrale auto&rsquo;s en neutrale tassen</li>
<li>Leeftijdscontrole aan de deur (18+)</li>
<li>Vaste prijzen, dag en nacht gelijk</li>
</ul>
<h2>Waar wij voor staan</h2>
<p>Wij geloven dat lachgas alleen verkocht moet worden aan volwassenen die er verantwoord mee omgaan. Daarom controleren wij leeftijd, leveren wij nooit aan mensen die zichtbaar onder invloed zijn, en vindt u op deze site uitgebreide informatie over <a href="/lachgas-veilig-gebruiken/">veilig gebruik</a> en de <a href="/is-lachgas-verboden/">wettelijke regels</a>.</p>
<h2>Contact</h2>
<p>Vragen, zakelijke verzoeken of feedback? Neem <a href="/contact/">contact</a> met ons op; we reageren snel.</p>
</div></section>`,
});

// FAQ hub
const ALL_FAQ = [
  ...HOME_FAQ,
  { q: 'Wat is het verschil tussen een lachgas tank en slagroompatronen?', a: 'Een 2 kilo tank bevat evenveel gas als circa 250 patronen van 8 gram, heeft een eigen ventiel en vereist geen cracker. Per ballon is een tank veel voordeliger. Lees de <a href="/lachgas-tank-of-slagroompatronen/">volledige vergelijking</a>.' },
  { q: 'Hoe bewaar ik een lachgas tank?', a: 'Rechtop, koel (onder 50 °C), droog en buiten bereik van kinderen. Niet in de zon, niet in een warme auto en niet bij een warmtebron.' },
  { q: 'Wat doe ik met een lege tank?', a: 'Een lege Fastgas tank mag bij het restafval of u geeft hem mee aan onze koerier. Er is geen statiegeld.' },
  { q: 'Hoe herken ik een originele Fastgas tank?', a: 'Aan het intacte zegel, de QR-code, het reliëflogo en het certificeringsnummer op de onderzijde. Bij twijfel scant u de QR-code.' },
  { q: 'Leveren jullie ook ballonnen?', a: 'Op aanvraag leveren wij ballonnen mee; geef dit aan bij uw bestelling.' },
  { q: 'Wat gebeurt er als de koerier niemand thuis treft?', a: 'De koerier belt of appt u. Als we u niet kunnen bereiken, rijdt de koerier door en kunt u opnieuw bestellen; er zijn geen kosten verbonden aan een gemiste levering.' },
];
pages.push({
  path: '/veelgestelde-vragen/', crumbs: [{ name: 'Veelgestelde vragen' }],
  title: 'Veelgestelde vragen – lachgas bestellen in Amsterdam',
  desc: 'Antwoord op alle vragen over lachgas bestellen in Amsterdam: bezorgtijd, prijzen, betalen, formaten, leeftijd, veiligheid en bewaren. Lachgas Dienst Amsterdam, 24/7.',
  eyebrow: 'FAQ', h1: 'Veelgestelde vragen', hero: 'plain',
  lead: 'Alles wat u wilt weten over bestellen, bezorgen, betalen en veilig gebruiken. Staat uw vraag er niet bij? App of bel ons.',
  faq: ALL_FAQ, faqTitle: 'Alle vragen en antwoorden',
  body: '',
});

// info pages
const infoPages = [
  { path: '/wat-is-lachgas/', name: 'Wat is lachgas?',
    faq: [
      { q: 'Hoe lang duurt de roes van lachgas?', a: 'Eén tot hooguit enkele minuten. Omdat het gas snel weer uit het lichaam verdwijnt, is het effect kort en zijn eventuele klachten zoals duizeligheid meestal snel over.' },
      { q: 'Is lachgas verslavend?', a: 'Lachgas is niet lichamelijk verslavend, maar het korte effect verleidt tot herhalen. Frequent gebruik kan leiden tot geestelijke afhankelijkheid en tot een vitamine B12-tekort met zenuwschade. Houd het bij incidenteel gebruik.' },
      { q: 'Wat is het verschil tussen medisch en recreatief lachgas?', a: 'Het gas zelf is hetzelfde (N₂O). Medisch lachgas wordt door een arts gemengd met zuurstof en gedoseerd toegediend; bij recreatief gebruik via een ballon ademt u puur N₂O in, zonder die zuurstofmenging. Daarom zijn de regels voor veilig gebruik zo belangrijk.' },
      { q: 'Ruikt of proeft lachgas ergens naar?', a: 'Nauwelijks. Lachgas is kleurloos en heeft een licht zoete geur en smaak. Een sterke chemische geur wijst op een ander gas of op vervuiling: gebruik dan niet.' },
    ],
    extra: `<h2>Waar wordt lachgas voor gebruikt?</h2><p>Distikstofmonoxide heeft veel meer toepassingen dan ballonnen. In de geneeskunde wordt het, gemengd met zuurstof, gebruikt als pijnstiller en licht narcosemiddel, bijvoorbeeld bij tandartsen en in de verloskunde. In de keuken is het het drijfgas in slagroompatronen en in horecaspuiten: het lost goed op in vet en geeft slagroom zijn luchtige structuur. In de autosport wordt N₂O als &ldquo;nitro&rdquo; in de motor gespoten om het vermogen tijdelijk te verhogen, en in de industrie dient het als oxidator en als analytisch referentiegas.</p><h2>Lachgas in cijfers</h2><ul><li>Scheikundige formule: N₂O, molaire massa 44 g/mol</li><li>Kookpunt: &minus;88,5 °C; in de tank is het grotendeels vloeibaar onder circa 50 bar</li><li>Eén Fastgas tank van 2 kg bevat evenveel gas als circa 250 slagroompatronen van 8 gram</li><li>Eén ballon bevat gemiddeld 8 tot 10 gram N₂O</li><li>Zwaarder dan lucht: in een slecht geventileerde ruimte hoopt het zich laag bij de grond op</li></ul><h2>Lachgas in Nederland</h2><p>Nederland was jarenlang een van de landen met het hoogste recreatieve gebruik van lachgas in Europa, vooral onder jongvolwassenen in de grote steden. Sinds 1 januari 2023 valt lachgas onder de Opiumwet; lees wat dat betekent op <a href="/is-lachgas-verboden/">is lachgas verboden?</a>. Wie lachgas gebruikt, doet dat het veiligst thuis, zittend, via een ballon en met mate.</p>`, title: 'Wat is lachgas? Werking, effecten en risico’s van N₂O uitgelegd', desc: 'Wat is lachgas (distikstofmonoxide, N₂O)? Hoe het werkt, welke effecten het heeft, hoe lang de roes duurt en welke risico’s er zijn. Eerlijke informatie.', eyebrow: 'Achtergrond', lead: 'Lachgas is de volksnaam voor distikstofmonoxide (N₂O), een kleurloos gas met een licht zoete geur. Hier leest u wat het is, hoe het werkt en wat de risico’s zijn.',
    body: `<h2>De scheikundige naam</h2><p>In de volksmond heet het lachgas, maar de officiële naam is distikstofmonoxide: twee stikstofatomen en één zuurstofatoom, N₂O. Het gas werd in 1772 ontdekt door Joseph Priestley en is sinds de negentiende eeuw in gebruik als narcosemiddel bij tandartsen en in ziekenhuizen. Daarnaast wordt het al decennia gebruikt als drijfgas in slagroompatronen en in de voedingsindustrie.</p><h2>Hoe werkt lachgas?</h2><p>Lachgas wordt via een ballon ingeademd. Het gas komt via de longen in het bloed en bereikt binnen enkele seconden de hersenen, waar het de prikkeloverdracht tijdelijk remt. Dat geeft een kortdurende roes: een licht, zweverig en euforisch gevoel, vaak met de neiging om te lachen (vandaar de naam), versterkte geluiden en soms lichte hallucinaties. De roes duurt één tot enkele minuten en verdwijnt daarna weer volledig.</p><h2>Effecten</h2><ul><li>Korte roes van één tot enkele minuten</li><li>Euforie en lachbuien</li><li>Licht, tintelend en zweverig gevoel</li><li>Geluiden en licht komen heviger binnen</li><li>Soms lichte hallucinaties</li></ul><h2>Risico&rsquo;s</h2><p>Lachgas verdringt zuurstof. Wie te veel achter elkaar gebruikt of direct uit de tank inademt, kan duizelig worden, flauwvallen of ernstige bevriezingsletsels oplopen. Bij frequent gebruik ontstaat een tekort aan vitamine B12, wat tot zenuwschade kan leiden (tintelingen, krachtverlies, problemen met lopen). Lachgas combineren met alcohol of andere middelen vergroot de risico&rsquo;s aanzienlijk, en gebruik in het verkeer is levensgevaarlijk en verboden.</p><p>Lees onze <a href="/lachgas-veilig-gebruiken/">richtlijnen voor veilig gebruik</a> en wat de <a href="/is-lachgas-verboden/">wet</a> zegt over lachgas in Nederland.</p>` },
  { path: '/lachgas-veilig-gebruiken/', name: 'Lachgas veilig gebruiken',
    faq: [
      { q: 'Hoeveel ballonnen zijn veilig op een avond?', a: 'Daar bestaat geen veilige ondergrens voor, maar hoe minder, hoe beter. Neem tussen ballonnen pauzes van minstens enkele minuten, adem gewone lucht in en stop zodra u tintelingen, hoofdpijn of misselijkheid voelt.' },
      { q: 'Wat doe ik als iemand flauwvalt na lachgas?', a: 'Leg de persoon op de zij, zorg voor frisse lucht en blijf erbij. Komt iemand niet binnen een minuut bij, ademt hij onregelmatig of is er een val met letsel: bel 112.' },
      { q: 'Kan ik lachgas gebruiken als ik medicijnen slik?', a: 'Overleg dat met uw huisarts of apotheker. Vooral bij medicijnen die het bewustzijn of de ademhaling beïnvloeden (slaapmiddelen, kalmeringsmiddelen, opioïden) is de combinatie gevaarlijk.' },
      { q: 'Hoe herken ik een vitamine B12-tekort door lachgas?', a: 'Tintelingen of een doof gevoel in handen en voeten, krachtverlies, moeite met lopen, vermoeidheid en concentratieproblemen. Stop direct met gebruik en ga naar de huisarts; een B12-tekort is goed te behandelen als het vroeg wordt ontdekt.' },
    ],
    extra: `<h2>Veelgemaakte fouten</h2><ul><li><strong>Staand gebruiken.</strong> Veruit de meeste ongelukken zijn valpartijen na flauwvallen. Ga zitten op een bank of op de grond.</li><li><strong>Ballon na ballon zonder pauze.</strong> Het zuurstofgehalte in uw bloed daalt bij elke ballon; adem tussendoor gewone lucht.</li><li><strong>Direct uit de tank.</strong> Het gas komt met &minus;40 °C naar buiten en kan lippen, keel en longen bevriezen.</li><li><strong>In een afgesloten ruimte.</strong> Lachgas is zwaarder dan lucht en verdringt zuurstof; zet een raam open.</li><li><strong>Combineren met alcohol.</strong> Alcohol vergroot de kans op misselijkheid, flauwvallen en verkeerde inschattingen.</li><li><strong>Gebruik in de auto.</strong> Verboden, en levensgevaarlijk voor uzelf en anderen.</li></ul><h2>Tips voor gastheren en -vrouwen</h2><p>Organiseert u een feestje? Zet de tank op een vaste, stabiele plek, laat gasten zittend gebruiken en houd één persoon nuchter die in de gaten houdt of iedereen in orde is. Zorg voor water, frisse lucht en voldoende pauzes. Vraag vooraf of er gasten zijn die zwanger zijn, medicijnen gebruiken of een B12-tekort hebben; zij kunnen beter niet meedoen.</p>`, title: 'Lachgas veilig gebruiken – 10 regels voor verantwoord gebruik', desc: 'Lachgas veilig gebruiken: via een ballon, zittend, geventileerd, nooit met alcohol en nooit in het verkeer. Tips over bewaren, B12 en wanneer u moet stoppen.', eyebrow: 'Veiligheid', lead: 'Lachgas is geen onschuldig product. Met deze regels beperkt u de risico’s voor uzelf en uw gasten.',
    body: `<h2>De tien regels voor veilig gebruik</h2><ol><li><strong>Altijd via een ballon.</strong> Nooit direct uit de tank, het tuutje of een cracker inademen: het gas is ijskoud en komt onder hoge druk vrij, wat bevriezing van lippen, keel en longen kan veroorzaken.</li><li><strong>Zittend of liggend.</strong> Door het tijdelijke zuurstofgebrek kunt u flauwvallen; een val is de meest voorkomende oorzaak van letsel.</li><li><strong>Goed geventileerde ruimte.</strong> Zet een raam open; in een afgesloten ruimte daalt het zuurstofgehalte.</li><li><strong>Rustig in- en uitademen.</strong> Adem tussen ballonnen gewone lucht in en neem pauzes.</li><li><strong>Nooit combineren.</strong> Niet met alcohol, drugs of medicijnen; de combinatie vergroot de kans op flauwvallen, misselijkheid en ongelukken.</li><li><strong>Niet in het verkeer.</strong> Rijden onder invloed van lachgas is verboden en levensgevaarlijk. Lees meer over <a href="/lachgas-en-verkeer/">lachgas en verkeer</a>.</li><li><strong>Niet bij zwangerschap of B12-tekort.</strong> Lachgas blokkeert vitamine B12; wie zwanger is, een B12-tekort heeft of veganistisch eet, loopt extra risico.</li><li><strong>Met mate.</strong> Frequent of langdurig gebruik kan zenuwschade veroorzaken. Houd het bij incidenteel gebruik en stop bij tintelingen of gevoelloosheid in handen of voeten.</li><li><strong>Let op elkaar.</strong> Laat niemand alleen gebruiken en grijp in als iemand niet lekker wordt.</li><li><strong>Alleen volwassenen.</strong> Wij leveren uitsluitend aan 18+; houd tanks buiten bereik van kinderen.</li></ol><h2>De tank veilig bewaren</h2><p>Bewaar de Fastgas tank rechtop, koel en droog, uit de zon en niet in een warme auto. Niet verhitten, niet doorboren en niet proberen te openen. Een lege tank kan bij het restafval.</p><h2>Wanneer medische hulp zoeken?</h2><p>Bel 112 bij bewusteloosheid die langer dan een minuut aanhoudt, bij ademhalingsproblemen of bij vermoedelijke bevriezing. Bij aanhoudende tintelingen, krachtverlies of problemen met lopen na herhaald gebruik: neem contact op met uw huisarts; een B12-tekort is goed behandelbaar als het op tijd wordt ontdekt.</p>` },
  { path: '/is-lachgas-verboden/', name: 'Is lachgas verboden?',
    faq: [
      { q: 'Mag ik thuis lachgas gebruiken?', a: 'De Opiumwet verbiedt bezit, verkoop en vervoer voor recreatief gebruik; gebruik zelf is niet apart strafbaar gesteld, maar bezit wel. Gebruik in de openbare ruimte is daarnaast in veel gemeenten via de APV verboden. Thuis, binnen en op een privéadres is het risico op handhaving het kleinst.' },
      { q: 'Is het bezit van één tank strafbaar?', a: 'Sinds 2023 valt bezit van lachgas voor recreatief gebruik onder de Opiumwet (lijst II). Kleine hoeveelheden voor eigen gebruik hebben in het vervolgingsbeleid een lage prioriteit, maar inbeslagname en een boete zijn mogelijk, zeker op straat of in de auto.' },
      { q: 'Mag ik lachgas kopen voor slagroom?', a: 'Ja. Toepassingen in de voedingsindustrie, zoals slagroompatronen en N₂O voor culinair gebruik, zijn uitgezonderd van het verbod.' },
      { q: 'Wat zijn de boetes voor lachgas?', a: 'Voor bezit van kleine hoeveelheden kan het Openbaar Ministerie een geldboete opleggen; handel en grote hoeveelheden kunnen tot vervolging en gevangenisstraf leiden. Voor gebruik in de openbare ruimte geldt een APV-boete, en rijden onder invloed valt onder de Wegenverkeerswet met invordering van het rijbewijs.' },
    ],
    extra: `<h2>Tijdlijn van de wetgeving</h2><table><thead><tr><th>Periode</th><th>Status</th></tr></thead><tbody><tr><td>Tot 2016</td><td>Geneesmiddelenwet: verkoop voor inhalatie verboden</td></tr><tr><td>2016 &ndash; 2022</td><td>Warenwet: verkoop en bezit vrij, lokale APV-verboden</td></tr><tr><td>Vanaf 1 januari 2023</td><td>Opiumwet lijst II: recreatief bezit, verkoop en vervoer verboden; medisch, technisch en culinair gebruik uitgezonderd</td></tr></tbody></table><h2>Hoe wordt gehandhaafd?</h2><p>De politie richt zich vooral op handel, op gebruik in het verkeer en op overlast in de openbare ruimte. Bij controles kan een tank in beslag worden genomen en kan een proces-verbaal volgen. Bestuurders die onder invloed rijden, riskeren invordering van het rijbewijs en strafvervolging. Voor particulieren die thuis een kleine hoeveelheid hebben, geldt in het vervolgingsbeleid een lage prioriteit, maar het blijft verboden.</p>`, title: 'Is lachgas verboden in Nederland? De regels sinds 2023 uitgelegd', desc: 'Sinds 1 januari 2023 staat lachgas op lijst II van de Opiumwet. Wat betekent dat voor bezit, verkoop, gebruik en verkeer? Uitzonderingen en handhaving uitgelegd.', eyebrow: 'Wettelijke status', lead: 'De regels rond lachgas zijn de afgelopen jaren flink veranderd. Hieronder leest u wat de wet sinds 1 januari 2023 zegt.',
    body: `<h2>Van warenwet naar Opiumwet</h2><p>Tot 2016 viel lachgas onder de Geneesmiddelenwet, daarna onder de Warenwet, waardoor verkoop en bezit vrij waren. Door de sterke groei van recreatief gebruik en het aantal verkeersongevallen besloot de overheid in te grijpen: sinds <strong>1 januari 2023</strong> staat lachgas (distikstofmonoxide) op <strong>lijst II van de Opiumwet</strong>, dezelfde lijst als bijvoorbeeld cannabis.</p><h2>Wat betekent dat concreet?</h2><ul><li>Het bezitten, verkopen, vervoeren en produceren van lachgas voor <em>recreatief</em> gebruik is verboden.</li><li>Gebruik van lachgas in het verkeer is verboden; de politie kan hierop handhaven.</li><li>Er gelden <strong>uitzonderingen</strong> voor medisch, technisch en voedingsgerelateerd gebruik, zoals slagroompatronen en N₂O voor professionele toepassingen.</li><li>Veel gemeenten, waaronder Amsterdam, hadden al eerder een lokaal verbod op gebruik in de openbare ruimte in bepaalde gebieden.</li></ul><h2>Wat betekent dit voor u?</h2><p>Wij vinden het belangrijk dat u weet waar u aan toe bent. Lachgas Dienst Amsterdam levert uitsluitend aan volwassenen, voor gebruik op privélocaties, en nooit aan personen die deelnemen aan het verkeer. Gebruik op straat, in parken of in de auto raden wij ten strengste af; het is verboden en u riskeert een boete en inbeslagname. Twijfelt u over de regels in uw situatie? Raadpleeg de website van de Rijksoverheid of het Trimbos-instituut.</p><h2>Lachgas en de gemeente Amsterdam</h2><p>De gemeente Amsterdam heeft in de APV gebieden aangewezen waar het gebruik van lachgas in de openbare ruimte verboden is, waaronder het centrum en diverse uitgaansgebieden. Gebruik daarom alleen binnen, op een privéadres.</p><p>Zie ook: <a href="/lachgas-en-verkeer/">lachgas en verkeer</a> en <a href="/lachgas-veilig-gebruiken/">veilig gebruik</a>.</p>` },
  { path: '/hoe-werkt-een-lachgas-tank/', name: 'Hoe werkt een lachgas tank?',
    faq: [
      { q: 'Hoe weet ik of de tank leeg is?', a: 'Als er bij een geopend ventiel geen gas meer uitkomt en de tank licht aanvoelt. Een volle Fastgas tank weegt circa 3,3 kg; leeg circa 1,3 kg. Schud niet aan de tank om het te controleren.' },
      { q: 'Waarom komt er rijp op de tank?', a: 'Het vloeibare N₂O verdampt bij het openen van het ventiel en onttrekt daarbij warmte aan de tank. Dat is normaal. Laat de tank even rusten als hij erg koud wordt; de druk herstelt zich vanzelf.' },
      { q: 'Kan ik een Fastgas tank hervullen?', a: 'Nee. De Fastgas Wegwerp Tank is voor eenmalig gebruik en heeft geen vulaansluiting. Probeer dit nooit zelf: hervullen is gevaarlijk en de tank is er niet op gebouwd.' },
      { q: 'Hoe lang blijft een geopende tank goed?', a: 'Zolang het ventiel goed dicht zit, blijft het gas maanden houdbaar. Bewaar de tank rechtop en koel. Een tank die sist terwijl het ventiel dicht is, zet u buiten en gebruikt u niet meer.' },
    ],
    extra: `<h2>Problemen oplossen</h2><table><thead><tr><th>Probleem</th><th>Oorzaak en oplossing</th></tr></thead><tbody><tr><td>Ballon vult niet</td><td>Ventiel niet ver genoeg open, of de ballon zit niet goed over het tuutje. Schuif de ballon dieper en draai rustig verder open.</td></tr><tr><td>Ventiel is ijskoud en lijkt vast te zitten</td><td>Normaal bij langdurig vullen. Wacht een minuut, raak het ventiel niet met blote huid aan en probeer opnieuw.</td></tr><tr><td>Er komt vloeistof mee</td><td>De tank ligt of staat scheef. Zet hem rechtop; vloeibaar N₂O in een ballon is gevaarlijk koud.</td></tr><tr><td>Gas blijft sissen bij gesloten ventiel</td><td>Ventiel beschadigd. Zet de tank buiten, gebruik hem niet meer en neem contact met ons op.</td></tr></tbody></table><h2>Welke ballonnen gebruikt u?</h2><p>Gebruik stevige latex ballonnen van 25 tot 30 cm. Dunne waterballonnen scheuren bij de koude van het gas. Vul de ballon tot hij stevig maar niet strak staat; overvullen kost gas en geeft geen sterker effect.</p>`, title: 'Hoe werkt een lachgas tank? Fastgas Wegwerp Tank stap voor stap', desc: 'Hoe werkt een lachgas tank? Stap voor stap: ventiel, ballon vullen, uitstroom regelen, bewaren en afvoeren. Alles over de Fastgas Wegwerp Tank van 2 kilo.', eyebrow: 'Uitleg', lead: 'De Fastgas Wegwerp Tank heeft een ingebouwd draaiventiel en is direct klaar voor gebruik. Zo werkt het.',
    body: `<h2>Stap voor stap</h2><ol><li><strong>Controleer het zegel.</strong> Een originele Fastgas tank is verzegeld. Verwijder het zegel pas als u de tank gaat gebruiken.</li><li><strong>Zet de tank rechtop</strong> op een stabiele ondergrond. Nooit liggend gebruiken: dan komt er vloeibaar gas mee.</li><li><strong>Schuif de ballon over het tuutje</strong> van het ventiel en houd de ballon met één hand vast.</li><li><strong>Draai het ventiel langzaam open.</strong> Hoe verder u draait, hoe sneller de ballon vult. Begin rustig; het gas is koud.</li><li><strong>Sluit het ventiel</strong> zodra de ballon de gewenste grootte heeft en haal de ballon eraf met de hals dichtgeknepen.</li><li><strong>Na gebruik</strong> het ventiel goed dichtdraaien en de tank rechtop bewaren.</li></ol><h2>Hoeveel ballonnen per tank?</h2><p>Een 2 kilo tank is goed voor circa 250 ballonnen, afhankelijk van de ballongrootte. Een 4KG bestelling bestaat uit twee tanks (±500 ballonnen), een 10KG uit vijf tanks (±1250 ballonnen). Bekijk alle <a href="/lachgas-tanks/">formaten</a>.</p><h2>Waarom het gas koud is</h2><p>In de tank zit N₂O grotendeels in vloeibare vorm onder druk. Zodra het ventiel opent, verdampt het gas en onttrekt het warmte aan de omgeving. Daarom wordt het ventiel koud en kan er rijp op de tank ontstaan. Raak het ventiel niet met blote huid aan tijdens langdurig vullen en adem nooit direct uit de tank.</p><h2>Opslag en afvoer</h2><p>Bewaar de tank rechtop, koel en droog, buiten bereik van kinderen. Een lege tank is drukloos en mag bij het restafval; u kunt hem ook meegeven aan onze koerier. Vergelijk de tank met patronen op <a href="/lachgas-tank-of-slagroompatronen/">lachgas tank of slagroompatronen</a>.</p>` },
  { path: '/lachgas-tank-of-slagroompatronen/', name: 'Lachgas tank of slagroompatronen?',
    faq: [
      { q: 'Hoeveel slagroompatronen zitten er in een 2 kg tank?', a: 'Circa 250 patronen van 8 gram. Een 4KG bestelling (twee tanks) staat gelijk aan circa 500 patronen, een 10KG (vijf tanks) aan circa 1250.' },
      { q: 'Kan ik mijn cracker op een tank gebruiken?', a: 'Nee, en dat is ook niet nodig. De Fastgas tank heeft een eigen draaiventiel met tuutje waar de ballon direct overheen gaat.' },
      { q: 'Zijn patronen veiliger dan een tank?', a: 'Niet per se. Patronen vereisen een cracker die kan bevriezen en die regelmatig vastloopt. Een tank staat onder hogere druk, maar heeft een gecontroleerd ventiel en hoeft nooit geopend of doorboord te worden. In beide gevallen gelden dezelfde gebruiksregels.' },
      { q: 'Wat is per ballon goedkoper?', a: 'Een tank, en met afstand. Patronen kosten per 8 gram al snel een veelvoud van wat dezelfde hoeveelheid gas uit een tank kost, nog los van de cracker en het afval.' },
    ],
    extra: `<h2>Rekenvoorbeeld voor een feestje</h2><p>Stel: tien gasten, elk vijf ballonnen. Dat zijn vijftig ballonnen van circa 8 gram, oftewel 400 gram lachgas. Met patronen heeft u vijftig patronen nodig, een cracker en een vuilniszak voor de lege hulzen; iemand moet bovendien elke ballon apart vullen. Met een <a href="/product/fastgas-2kg/">Fastgas 2KG</a> vult u diezelfde vijftig ballonnen in een paar minuten, houdt u nog ruim 1,5 kilo over voor een volgende keer en gooit u na afloop één lege tank weg.</p><h2>Voor wie zijn patronen dan nog zinvol?</h2><p>Voor de keuken. Slagroomspuiten werken met patronen van 8 gram en zijn daar perfect voor. Voor ballonnen in grotere aantallen is een tank in alle opzichten praktischer.</p>`, title: 'Lachgas tank of slagroompatronen? Prijs, gemak en veiligheid vergeleken', desc: 'Lachgas tank of slagroompatronen? Eén Fastgas tank van 2 kg vervangt circa 250 patronen. Vergelijk prijs per ballon, gemak, veiligheid en afval.', eyebrow: 'Vergelijking', lead: 'Patronen van 8 gram of een tank van 2 kilo? Wij zetten de verschillen op een rij.',
    body: `<h2>De vergelijking in één tabel</h2><table><thead><tr><th></th><th>Slagroompatronen (8 g)</th><th>Fastgas tank (2 kg)</th></tr></thead><tbody><tr><th>Gas per eenheid</th><td>8 gram</td><td>2000 gram (= 250 patronen)</td></tr><tr><th>Benodigdheden</th><td>Cracker of slagroomspuit</td><td>Niets: ventiel zit op de tank</td></tr><tr><th>Vulsnelheid</th><td>Eén ballon per patroon, handmatig</td><td>Traploos regelbaar via ventiel</td></tr><tr><th>Afval</th><td>250 lege stalen patronen</td><td>Eén lege tank</td></tr><tr><th>Prijs per ballon</th><td>Hoog</td><td>Laag</td></tr><tr><th>Geschikt voor</th><td>Enkele ballonnen</td><td>Feestjes, evenementen, horeca</td></tr></tbody></table><h2>Wanneer kiest u patronen?</h2><p>Alleen als u een paar ballonnen wilt en al een cracker in huis heeft. Voor alles daarboven is een tank goedkoper, sneller en schoner.</p><h2>Wanneer kiest u een tank?</h2><p>Bij elk feestje met meer dan een handvol ballonnen. De Fastgas tank vult een ballon in seconden, geeft geen berg afval en is per ballon een fractie van de prijs van patronen. Kies de <a href="/product/fastgas-2kg/">2KG</a> voor een avond met vrienden, de <a href="/product/fastgas-4kg/">4KG</a> voor een groter feest en de <a href="/product/fastgas-10kg/">10KG</a> voor evenementen.</p><h2>Veiligheid</h2><p>Een tank staat onder hogere druk dan een patroon en moet rechtop en koel bewaard worden. Daar staat tegenover dat u geen cracker nodig heeft, waardoor het risico op bevriezing door een vastgevroren cracker vervalt. Lees altijd onze <a href="/lachgas-veilig-gebruiken/">veiligheidsregels</a>.</p>` },
  { path: '/lachgas-cracker/', name: 'Lachgas cracker',
    faq: [
      { q: 'Waarom bevriest een cracker?', a: 'Het gas in een patroon staat onder hoge druk en expandeert bij het openen. Daarbij onttrekt het warmte aan het metaal van de cracker, die daardoor tot ver onder nul afkoelt. Raak een koude cracker nooit met natte vingers of lippen aan.' },
      { q: 'Past een cracker op een Fastgas tank?', a: 'Nee. De Fastgas tank heeft een vast draaiventiel met tuutje; een cracker is er niet voor bedoeld en niet nodig.' },
      { q: 'Welke ballonnen gebruik ik bij een cracker?', a: 'Stevige latex ballonnen van 25 tot 30 cm. Schuif de ballon ver over de uitgang van de cracker en houd hem goed vast tijdens het draaien.' },
      { q: 'Hoeveel ballonnen vul ik met één patroon?', a: 'Eén patroon van 8 gram vult één ballon. Voor meer ballonnen per keer is een tank met ventiel praktischer.' },
    ],
    extra: `<h2>Soorten crackers</h2><ul><li><strong>Aluminium cracker:</strong> de standaardvariant, licht en goedkoop, maar snel versleten schroefdraad.</li><li><strong>RVS cracker:</strong> duurzamer en minder gevoelig voor bevriezing, iets zwaarder en duurder.</li><li><strong>Cracker met handvat of isolatie:</strong> beschermt de hand tegen de kou tijdens het draaien.</li><li><strong>Slagroomspuit:</strong> technisch geen cracker, maar werkt met dezelfde patronen en wordt soms voor ballonnen gebruikt; bedoeld voor de keuken.</li></ul><h2>Veilig werken met een cracker</h2><p>Draai altijd met de uitgang van u af, gebruik een handschoen of doek tegen de kou, forceer een vastzittend patroon nooit en gooi lege patronen direct in een aparte bak. Lees ook onze algemene regels voor <a href="/lachgas-veilig-gebruiken/">veilig gebruik</a>.</p>`, title: 'Lachgas cracker – wat is het en wanneer heeft u er een nodig?', desc: 'Wat is een lachgas cracker en hoe werkt hij? Een cracker opent slagroompatronen van 8 gram. Bij de Fastgas Wegwerp Tank is geen cracker nodig: het ventiel zit op de tank.', eyebrow: 'Uitleg', lead: 'Een cracker is een klein, meestal aluminium hulpstuk waarmee een slagroompatroon wordt geopend. Bij onze Fastgas tanks heeft u hem niet nodig.',
    body: `<h2>Hoe werkt een lachgas cracker?</h2><p>Een cracker bestaat uit twee delen die in elkaar schroeven. U plaatst een slagroompatroon in het onderste deel, schuift een ballon over de opening en draait het bovenste deel aan. Een pin doorboort het patroon, waarna het gas in de ballon stroomt. Per patroon vult u één ballon.</p><h2>Nadelen van een cracker</h2><ul><li>De cracker wordt ijskoud en kan aan de huid vastvriezen</li><li>Eén ballon per patroon: traag bij grotere groepen</li><li>Veel afval: elke ballon is een leeg patroon</li><li>Vastzittende patronen en versleten schroefdraad zijn een bekend probleem</li></ul><h2>Het alternatief: de Fastgas Wegwerp Tank</h2><p>De <a href="/lachgas-tanks/">Fastgas tank</a> heeft een ingebouwd draaiventiel. U schuift de ballon over het tuutje, draait het ventiel open en regelt zelf de vulsnelheid. Geen cracker, geen patronen, geen afval. Eén 2 kilo tank vervangt circa 250 patronen; lees <a href="/hoe-werkt-een-lachgas-tank/">hoe de tank werkt</a>.</p><h2>Leveren jullie crackers?</h2><p>Nee. Omdat de Fastgas tank een eigen ventiel heeft, is een cracker overbodig. Op aanvraag leveren wij wel ballonnen mee bij uw bestelling.</p>` },
  { path: '/lachgas-en-verkeer/', name: 'Lachgas en verkeer',
    faq: [
      { q: 'Hoe lang na lachgas mag ik weer rijden?', a: 'De roes zelf duurt enkele minuten, maar concentratie, evenwicht en reactievermogen kunnen langer verminderd zijn, zeker in combinatie met vermoeidheid of alcohol. Rijd op een avond waarop u lachgas heeft gebruikt helemaal niet meer; neem een taxi of het openbaar vervoer.' },
      { q: 'Kan de politie lachgas testen?', a: 'Er is geen blaas- of speekseltest voor lachgas. De politie handhaaft op basis van rijgedrag, waarnemingen (ballonnen, tanks in de auto) en het verbod op bezit uit de Opiumwet. Bij een verdenking kan bloedonderzoek volgen.' },
      { q: 'Geldt het verbod ook voor fietsen en scooters?', a: 'Ja. Artikel 8 van de Wegenverkeerswet geldt voor alle bestuurders, dus ook voor fietsers en scooterrijders. Bovendien is bezit op straat strafbaar.' },
      { q: 'Wat gebeurt er bij een ongeval onder invloed van lachgas?', a: 'Dan is er sprake van rijden onder invloed. U riskeert strafvervolging, invordering van het rijbewijs en het niet uitkeren van de verzekering voor de schade.' },
    ],
    extra: `<h2>Wat als u toch moet reizen?</h2><p>Spreek vooraf af wie nuchter blijft en rijdt, of regel een taxi. In Amsterdam rijden de nachtbussen en de metro tot laat; vanaf de meeste uitgaansgebieden is een taxi binnen minuten geregeld. Laat tanks en ballonnen thuis: vervoer van lachgas voor recreatief gebruik is sinds 2023 op zichzelf al verboden.</p><h2>Cijfers</h2><p>Volgens onderzoek van onder meer het Trimbos-instituut en de politie nam het aantal verkeersongevallen waarbij lachgas een rol speelde tussen 2019 en 2022 sterk toe, met meerdere dodelijke ongevallen per jaar. Die ontwikkeling was een van de directe aanleidingen voor het landelijke verbod. Lees meer over de <a href="/is-lachgas-verboden/">wettelijke status</a>.</p>`, title: 'Lachgas in het verkeer – verboden, gevaarlijk en zo wordt gehandhaafd', desc: 'Lachgas in het verkeer is verboden en levensgevaarlijk. Waarom rijden onder invloed van lachgas zo gevaarlijk is, wat de wet zegt en hoe de politie handhaaft.', eyebrow: 'Veiligheid', lead: 'Rijden onder invloed van lachgas is verboden en een van de belangrijkste redenen dat de wet in 2023 is aangescherpt. Wij leveren nooit aan bestuurders.',
    body: `<h2>Waarom lachgas en verkeer niet samengaan</h2><p>Lachgas geeft een kortdurende roes waarbij de reactiesnelheid, het evenwicht en het bewustzijn tijdelijk uitvallen. Achter het stuur betekent dat enkele seconden volledige controleverlies, genoeg voor een frontale botsing of een aanrijding met een fietser. Het aantal ongevallen waarbij lachgas een rol speelde, nam de afgelopen jaren sterk toe; mede daarom is lachgas sinds 2023 opgenomen in de Opiumwet.</p><h2>Wat zegt de wet?</h2><ul><li>Artikel 8 van de Wegenverkeerswet verbiedt rijden onder invloed van elke stof die de rijvaardigheid beïnvloedt, dus ook lachgas.</li><li>Sinds 1 januari 2023 is bezit van lachgas voor recreatief gebruik strafbaar; een tank of ballon in de auto kan dus al tot een boete en inbeslagname leiden.</li><li>De politie kan uw rijbewijs invorderen en bij een ongeval volgt strafrechtelijke vervolging.</li></ul><h2>Ons beleid</h2><p>Onze koeriers leveren niet aan personen die in een auto zitten of aangeven te gaan rijden. Wij vragen onze klanten om lachgas uitsluitend thuis of op een privélocatie te gebruiken en daarna niet meer de weg op te gaan, ook niet op de fiets of scooter. Lees onze volledige <a href="/lachgas-veilig-gebruiken/">veiligheidsregels</a> en de uitleg over de <a href="/is-lachgas-verboden/">wettelijke status</a>.</p>` },
];
infoPages.forEach((ip) => {
  pages.push({ path: ip.path, crumbs: [{ name: ip.name }], title: ip.title, desc: ip.desc, eyebrow: ip.eyebrow, h1: ip.name, lead: ip.lead, hero: 'plain', schemaType: 'Article', heroActions: false,
    faq: ip.faq, faqTitle: `Vragen over ${ip.name.replace(/\?$/, '').toLowerCase()}`,
    schema: [{ '@type': 'Article', '@id': abs(ip.path + '#article'), headline: ip.name, description: ip.desc, inLanguage: 'nl-NL', datePublished: '2026-10-26', dateModified: TODAY, author: { '@id': abs('/#business') }, publisher: { '@id': abs('/#business') }, mainEntityOfPage: abs(ip.path), image: abs(SITE.ogImage) }],
    body: `<section class="section"><div class="container prose">${ip.body}${ip.extra || ''}</div></section>
<section class="section alt"><div class="container prose"><p class="eyebrow">Meer lezen</p><h2>Meer informatie over lachgas</h2><div class="city-grid">${infoPages.filter((o) => o !== ip).map((o) => `<a href="${o.path}">${o.name}</a>`).join('')}<a href="/veelgestelde-vragen/">Veelgestelde vragen</a></div></div></section>` });
});

// area pages
const AREA_VARIANTS = [
  (a) => `Onze koeriers kennen ${a.spots.slice(0, 3).join(', ')} en de straten eromheen als hun broekzak en rijden dagelijks meerdere keren door ${cap(a.name)}. Bestellen gaat via WhatsApp of telefoon; wij bevestigen direct de verwachte aankomsttijd en u betaalt pas bij aflevering.`,
  (a) => `Of u nu bij ${a.spots[0]} woont of aan de rand bij ${a.spots[a.spots.length - 1]}: binnen ${a.eta} minuten staat onze koerier voor de deur. Eén WhatsApp-bericht met uw adres en het gewenste formaat is genoeg, en u rekent af bij de deur met PIN of contant.`,
  (a) => `Wij bezorgen in heel ${cap(a.name)}, van ${a.spots[0]} tot ${a.spots[1]} en alles daartussen. De gemiddelde bezorgtijd is ${a.eta} minuten, dag en nacht. Bestel via WhatsApp of bel ons; betalen doet u bij aflevering.`,
];
AREAS.forEach((a, idx) => {
  const name = cap(a.name);
  const plainName = cap(stripArticle(a.name));
  const path = areaUrl(a);
  const parent = a.parent ? areaBySlug[a.parent] : null;
  const crumbs = [{ name: 'Bezorggebied', item: abs('/bezorggebied/') }];
  if (parent) crumbs.push({ name: cap(stripArticle(parent.name)), item: abs(areaUrl(parent)) });
  crumbs.push({ name: `Lachgas ${plainName}` });
  const inName = `in ${name}`;
  const prod = PRODUCTS[idx % 3];
  const faq = [
    { q: `Hoe snel bezorgen jullie lachgas ${inName}?`, a: `Gemiddeld binnen ${a.eta} minuten, 24 uur per dag. Zodra u bestelt, bevestigen we via WhatsApp de verwachte aankomsttijd${a.spots.length ? `, of u nu bij ${a.spots[0]} zit of bij ${a.spots[1]}` : ''}.` },
    { q: `Welke lachgas tanks kan ik ${inName} bestellen?`, a: `Uitsluitend de originele Fastgas Wegwerp Tank: <a href="/product/fastgas-2kg/">2KG</a> (±250 ballonnen), <a href="/product/fastgas-4kg/">4KG</a> (±500) en <a href="/product/fastgas-10kg/">10KG</a> (±1250). Verzegeld, nagewogen en direct klaar voor gebruik.` },
    { q: `Hoe betaal ik bij bezorging ${inName}?`, a: 'Bij aflevering, met PIN of contant. U hoeft niets vooruit te betalen en geen account aan te maken.' },
    { q: `Bezorgen jullie ook ’s nachts ${inName}?`, a: `Ja. Wij zijn 24/7 geopend en bezorgen ${inName} ook na middernacht, in het weekend en op feestdagen, zonder nachttoeslag.` },
    { q: 'Is er een minimumleeftijd?', a: 'Ja. Wij leveren uitsluitend aan personen van 18 jaar en ouder; de koerier kan om legitimatie vragen.' },
  ];
  if (a.type === 'plaats') faq.push({ q: `Zijn er bezorgkosten voor ${plainName}?`, a: a.eta.startsWith('2') ? `Nee, voor ${plainName} rekenen wij dezelfde prijs als binnen Amsterdam.` : `Voor ${plainName} kan een kleine kilometertoeslag gelden; wij melden dit altijd vooraf bij uw bestelling, zodat u nooit voor verrassingen staat.` });
  const typeLabel = a.type === 'stadsdeel' ? 'stadsdeel' : a.type === 'buurt' ? 'buurt' : 'plaats';
  const title = a.type === 'plaats'
    ? `Lachgas ${plainName} bestellen – 24/7 bezorgd in ${a.eta} min`
    : `Lachgas ${plainName} – 24/7 bezorgd in ${a.eta} min` + (plainName.length <= 16 ? ' | Fastgas tank' : '');
  const desc = plainName.length <= 16
    ? `Lachgas ${plainName} bestellen? Fastgas tank (2KG, 4KG, 10KG) in ${plainName} binnen ${a.eta} min bezorgd, 24/7. Bestel via WhatsApp, betaal bij aflevering. 18+.`
    : `Lachgas ${plainName} bestellen? Fastgas tank in ${plainName} binnen ${a.eta} min bezorgd, 24/7. Bestel via WhatsApp, betaal bij aflevering. 18+.`;
  pages.push({
    path, crumbs, title, desc,
    eyebrow: `Lachgas bezorgen ${inName}`, h1: `Lachgas ${plainName}`,
    lead: `${a.type === 'plaats' ? 'Ook' : 'Snel en discreet'} ${inName} bezorgen wij de Fastgas Wegwerp Tank gemiddeld binnen ${a.eta} minuten, dag en nacht. Bestel via WhatsApp of telefoon en betaal bij aflevering.`,
    stats: [`Binnen ${a.eta} min`, '24/7 geopend', 'Betalen bij aflevering'],
    schema: [{ '@type': 'Service', '@id': abs(path + '#service'), serviceType: 'Lachgas bezorgen', name: `Lachgas bezorgen ${inName}`, description: desc, provider: { '@id': abs('/#business') }, areaServed: { '@type': a.type === 'plaats' ? 'City' : 'Place', name: plainName, containedInPlace: a.type !== 'plaats' ? { '@type': 'City', name: 'Amsterdam' } : undefined }, url: abs(path), hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }, offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'EUR', url: abs(path) } }],
    faq, faqTitle: `Vragen over lachgas bezorgen ${inName}`,
    body: `
<section class="section"><div class="container prose">
<h2>Lachgas bestellen ${inName}</h2>
<p>${a.about}</p>
<p>${AREA_VARIANTS[idx % AREA_VARIANTS.length](a)}</p>
<ul class="reasons"><li>Verzegelde, originele Fastgas tanks</li><li>Gemiddeld binnen ${a.eta} minuten ${inName}</li><li>Bestellen via WhatsApp, geen account nodig</li><li>Betalen bij aflevering: PIN of contant</li></ul>
</div></section>
<section class="section alt"><div class="container two-col">
<div class="prose"><p class="eyebrow">Fastgas Wegwerp Tank</p><h2>Welk formaat bestelt u ${inName}?</h2><p>Voor een avond met vrienden is de <a href="/product/fastgas-2kg/">Fastgas 2KG</a> (±250 ballonnen) ruim voldoende. Grotere groep? Kies de <a href="/product/fastgas-4kg/">4KG</a> of <a href="/product/fastgas-10kg/">10KG</a>; per ballon bent u dan voordeliger uit. Elke tank is verzegeld, nagewogen en heeft een eigen ventiel, dus een cracker is niet nodig.</p><div class="variant-row">${PRODUCTS.map((o) => `<a href="/${o.slug}/" style="color:var(--navy);border-color:var(--line)">${o.short}</a>`).join('')}</div><p>${waBtn()}</p></div>
<div class="photo" style="background:#000;border-radius:16px;overflow:hidden">${productImg(prod, { sizes: '(max-width: 860px) calc(100vw - 44px), 480px' })}</div>
</div></section>
<section class="section"><div class="container"><p class="eyebrow">Zo werkt het</p><h2>Lachgas bezorgen ${inName} in drie stappen</h2>${steps(name)}</div></section>
<section class="section alt"><div class="container prose">
<p class="eyebrow">Bezorgtijd</p><h2>Hoe snel zijn wij ${inName}?</h2>
<p>De gemiddelde bezorgtijd ${inName} is <strong>${a.eta} minuten</strong>. Onze koeriers zijn verdeeld over de stad, zodat er vrijwel altijd iemand in de buurt van ${a.spots.slice(0, 2).join(' of ')} is. Op vrijdag- en zaterdagnacht tussen 00:00 en 03:00 kan het iets drukker zijn; bestel dan iets eerder of geef een tijdstip door, dan plannen we uw bezorging in. &rsquo;s Nachts bestellen is altijd mogelijk; lees meer over onze <a href="/lachgas-nachtbezorging-amsterdam/">nachtbezorging</a>.</p>
<p class="eyebrow" style="margin-top:28px">Ook in de buurt</p><h2>Lachgas bezorgen rond ${plainName}</h2>
<p>Wij bezorgen ook in de omliggende ${a.type === 'plaats' ? 'plaatsen en stadsdelen' : 'buurten en stadsdelen'}:</p>
${cityGrid(a.nearby)}
</div></section>`,
  });
});

// English page
pages.push({
  path: '/nitrous-oxide-delivery-amsterdam/', lang: 'en', crumbs: [{ name: 'Nitrous Oxide Delivery Amsterdam' }],
  hreflang: [['nl', '/'], ['en', '/nitrous-oxide-delivery-amsterdam/'], ['x-default', '/']],
  title: 'Nitrous Oxide Delivery Amsterdam – Laughing Gas 24/7 in 20-30 min',
  desc: 'Nitrous oxide (laughing gas) delivery in Amsterdam: sealed Fastgas tanks (2KG, 4KG, 10KG) delivered within 20-30 minutes, 24/7. Order via WhatsApp, pay on delivery. 18+.',
  eyebrow: 'Laughing gas delivery · Amsterdam', h1: 'Nitrous oxide delivery in Amsterdam', hero: 'photo',
  lead: 'Lachgas Dienst Amsterdam delivers sealed Fastgas disposable nitrous oxide tanks anywhere in Amsterdam, day and night. Message us on WhatsApp, we confirm the arrival time, and you pay the courier on delivery.',
  stats: ['Delivered in 20-30 min', 'Open 24/7', 'Pay on delivery', '18+ only'],
  faqTitle: 'Questions about laughing gas delivery in Amsterdam',
  faq: [
    { q: 'How fast is delivery in Amsterdam?', a: 'Most orders inside the A10 ring arrive within 20 to 30 minutes, day or night. Amstelveen, Diemen and Zaandam take about the same; Haarlem, Hoofddorp, Almere and Purmerend 30 to 45 minutes.' },
    { q: 'How do I order?', a: 'Send a WhatsApp message to ' + SITE.waDisplay + ' with your address and the size you want (2KG, 4KG or 10KG), or call ' + SITE.telDisplay + '. We reply with the price and the estimated arrival time.' },
    { q: 'How do I pay?', a: 'On delivery, by card (PIN) or cash. No account, no prepayment.' },
    { q: 'What exactly do you deliver?', a: 'Only the original Fastgas disposable tank: 2 kg of pure N₂O per tank, sealed and certified, with a built-in valve. The 4KG order contains two tanks, the 10KG order five. Roughly 250 balloons per tank.' },
    { q: 'Is there an age limit?', a: 'Yes. We only deliver to adults aged 18 and over and the courier may ask for ID. Nitrous oxide is a controlled substance in the Netherlands since 2023; never use it in traffic or in public spaces.' },
  ],
  body: `
<section class="section"><div class="container prose">
<h2>Laughing gas delivered to your door, 24/7</h2>
<p>Visiting Amsterdam or living here and looking for <strong>nitrous oxide delivery</strong>? Lachgas Dienst Amsterdam is a local courier service that brings the original Fastgas disposable tank to your hotel, apartment, boat or party venue, every hour of every day. There is no shop to visit and no account to create: one WhatsApp message is enough.</p>
<h2>Three sizes</h2>
<table><thead><tr><th>Size</th><th>Tanks</th><th>Content</th><th>Balloons</th></tr></thead><tbody><tr><td><a href="/product/fastgas-2kg/">Fastgas 2KG</a></td><td>1</td><td>2 kg N₂O</td><td>approx. 250</td></tr><tr><td><a href="/product/fastgas-4kg/">Fastgas 4KG</a></td><td>2</td><td>4 kg N₂O</td><td>approx. 500</td></tr><tr><td><a href="/product/fastgas-10kg/">Fastgas 10KG</a></td><td>5</td><td>10 kg N₂O</td><td>approx. 1250</td></tr></tbody></table>
<p>Every tank is sealed and certified, weighed before it leaves us, and has its own valve, so no cracker is needed. There is no deposit: once empty, the tank goes in the regular waste.</p>
<h2>How to order</h2>
<ol class="steps"><li><strong>Message or call us</strong><p>WhatsApp <a href="${WA_URL}" target="_blank" rel="noopener">${SITE.waDisplay}</a> or call <a href="${TEL_URL}">${SITE.telDisplay}</a> with your address in Amsterdam.</p></li><li><strong>Pick a size</strong><p>2KG, 4KG or 10KG. We confirm the price and the expected arrival time right away.</p></li><li><strong>Pay on delivery</strong><p>The courier arrives within 20-30 minutes on average. Pay by card or cash; ID may be requested (18+).</p></li></ol>
<h2>Delivery area</h2>
<p>All districts of Amsterdam: Centrum, Noord, Oost, West, Zuid, Zuidoost and Nieuw-West, plus Amstelveen, Diemen, Zaandam, Haarlem, Hoofddorp, Almere, Purmerend and more. See the full <a href="/bezorggebied/">delivery area</a> (Dutch).</p>
<h2>Use responsibly</h2>
<ul class="reasons"><li>Always use a balloon, never inhale from the tank</li><li>Sit down and use in a ventilated room</li><li>Never combine with alcohol or other substances</li><li>Never drive, cycle or ride after use</li><li>Keep tanks away from children</li><li>Adults only (18+)</li></ul>
</div></section>`,
});

// legal pages
pages.push({
  path: '/algemene-voorwaarden/', crumbs: [{ name: 'Algemene voorwaarden' }], hero: 'plain', heroActions: false,
  title: 'Algemene voorwaarden – Lachgas Dienst Amsterdam', desc: 'Algemene voorwaarden van Lachgas Dienst Amsterdam: bestellen, levering, betaling, leeftijdscontrole, annulering en aansprakelijkheid.',
  eyebrow: 'Juridisch', h1: 'Algemene voorwaarden', lead: 'Deze voorwaarden gelden voor alle bestellingen bij Lachgas Dienst Amsterdam.',
  body: `<section class="section"><div class="container prose">
<h2>1. Algemeen</h2><p>Deze voorwaarden zijn van toepassing op elke bestelling die via WhatsApp, telefoon of e-mail bij Lachgas Dienst Amsterdam (hierna: &ldquo;wij&rdquo;) wordt geplaatst. Door te bestellen gaat u akkoord met deze voorwaarden.</p>
<h2>2. Leeftijd</h2><p>Wij leveren uitsluitend aan personen van 18 jaar en ouder. De koerier kan om een geldig legitimatiebewijs vragen en mag de levering weigeren als de leeftijd niet kan worden aangetoond of als de klant zichtbaar onder invloed is. Bij weigering zijn geen kosten verschuldigd.</p>
<h2>3. Bestellen en bevestiging</h2><p>Een bestelling komt tot stand zodra wij de prijs en de verwachte aankomsttijd via WhatsApp of telefoon hebben bevestigd. Bezorgtijden zijn indicatief; wij spannen ons in om binnen de aangegeven tijd te leveren, maar kunnen hierover geen garantie geven.</p>
<h2>4. Prijzen en betaling</h2><p>Prijzen zijn inclusief btw en, binnen Amsterdam, inclusief bezorging. Eventuele toeslagen voor adressen buiten Amsterdam worden vooraf gemeld. Betaling vindt plaats bij aflevering, per PIN, contant of via een betaalverzoek.</p>
<h2>5. Annulering</h2><p>U kunt een bestelling kosteloos annuleren totdat de koerier is vertrokken. Daarna kunnen wij redelijke kosten in rekening brengen.</p>
<h2>6. Product en gebruik</h2><p>Wij leveren uitsluitend originele, verzegelde Fastgas Wegwerp Tanks. Controleer het zegel bij aflevering. Het product is bedoeld voor gebruik door volwassenen op privélocaties; de klant is zelf verantwoordelijk voor naleving van de geldende wet- en regelgeving en voor verantwoord gebruik volgens de instructies op deze website.</p>
<h2>7. Aansprakelijkheid</h2><p>Wij zijn niet aansprakelijk voor schade die voortvloeit uit onjuist, onzorgvuldig of onwettig gebruik van het product, noch voor gevolgschade. Onze aansprakelijkheid is in alle gevallen beperkt tot het factuurbedrag van de betreffende bestelling.</p>
<h2>8. Klachten</h2><p>Klachten kunt u binnen 48 uur na levering melden via <a href="/contact/">contact</a>. Wij streven ernaar iedere klacht binnen vijf werkdagen af te handelen.</p>
<h2>9. Toepasselijk recht</h2><p>Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam.</p>
<p><em>Laatst bijgewerkt: 26 oktober 2026.</em></p>
</div></section>`,
});
pages.push({
  path: '/privacy/', crumbs: [{ name: 'Privacy' }], hero: 'plain', heroActions: false,
  title: 'Privacyverklaring – Lachgas Dienst Amsterdam', desc: 'Privacyverklaring van Lachgas Dienst Amsterdam: welke gegevens wij verwerken bij een bestelling, hoe lang wij ze bewaren en wat uw rechten zijn. Geen tracking cookies.',
  eyebrow: 'Juridisch', h1: 'Privacy &amp; cookies', lead: 'Wij verwerken zo min mogelijk gegevens en gebruiken geen tracking cookies.',
  body: `<section class="section"><div class="container prose">
<h2>Welke gegevens verwerken wij?</h2><p>Bij een bestelling verwerken wij uw naam (indien opgegeven), telefoonnummer of WhatsApp-nummer, bezorgadres en de inhoud van uw bestelling. Via het contactformulier verwerken wij uw naam, e-mailadres, eventueel telefoonnummer en uw bericht.</p>
<h2>Waarvoor gebruiken wij deze gegevens?</h2><p>Uitsluitend om uw bestelling te bezorgen, contact met u op te nemen over de levering en uw vragen te beantwoorden. Wij gebruiken uw gegevens niet voor marketing en verkopen ze nooit aan derden.</p>
<h2>Bewaartermijn</h2><p>Bestelgegevens in WhatsApp en telefoon worden uiterlijk 30 dagen na levering verwijderd. Berichten via het contactformulier bewaren wij zolang nodig om uw vraag af te handelen, met een maximum van 12 maanden.</p>
<h2>Derden</h2><p>WhatsApp (Meta Platforms) verwerkt berichten volgens zijn eigen privacybeleid. Het contactformulier wordt verwerkt door Formspree. Deze website wordt gehost in de EU. Wij delen geen gegevens met andere partijen, tenzij wettelijk verplicht.</p>
<h2>Cookies</h2><p>Deze website plaatst geen tracking- of advertentiecookies en gebruikt geen analytics van derden. Alleen technisch noodzakelijke functies (zoals het onthouden van een geopend menu) worden lokaal in uw browser uitgevoerd.</p>
<h2>Uw rechten</h2><p>U heeft recht op inzage, correctie en verwijdering van uw gegevens. Stuur een verzoek naar <a href="mailto:${SITE.email}">${SITE.email}</a>; wij reageren binnen vier weken. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.</p>
<p><em>Laatst bijgewerkt: 26 oktober 2026.</em></p>
</div></section>`,
});

// ---------------------------------------------------------------- write
function writeFile(rel, content) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

pages.forEach((p) => {
  const rel = p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html';
  writeFile(rel, render(p));
});

// 404
writeFile('404.html', `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pagina niet gevonden – ${SITE.name}</title><meta name="description" content="Deze pagina bestaat niet. Ga terug naar de homepage van Lachgas Dienst Amsterdam of bestel direct via WhatsApp."><meta name="robots" content="noindex"><meta name="theme-color" content="#0a1428"><link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg"><style>${CSS}</style></head>
<body>${header('')}<main id="main"><header class="hero"><div class="container"><p class="eyebrow">Fout 404</p><h1>Pagina niet gevonden</h1><p class="lead">Deze pagina bestaat niet (meer). Onze koerier rijdt gewoon door; kies hieronder waar u heen wilt.</p></div></header>
<section class="section"><div class="container prose"><h2>Verder op ${SITE.name}</h2><div class="city-grid"><a href="/">Homepage</a><a href="/lachgas-amsterdam/">Lachgas Amsterdam</a><a href="/lachgas-tanks/">Fastgas tanks</a><a href="/lachgas-bestellen-amsterdam/">Bestellen</a><a href="/bezorggebied/">Bezorggebied</a><a href="/lachgas-prijzen-amsterdam/">Prijzen</a><a href="/contact/">Contact</a></div></div></section>${ctaStrip()}</main>${footer('nl')}${fabMarkup('nl')}<script src="/assets/js/widget.js?v=${JS_V}" defer></script></body></html>
`);

// sitemap
const prio = (p) => p.path === '/' ? '1.0' : /^\/(lachgas-amsterdam|lachgas-tanks|lachgas-bezorgen-amsterdam|lachgas-bestellen-amsterdam|product)/.test(p.path) ? '0.9' : /^\/lachgas-amsterdam-/.test(p.path) ? '0.8' : /^\/(algemene-voorwaarden|privacy)/.test(p.path) ? '0.3' : '0.7';
writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.filter((p) => !p.noindex).map((p) => `  <url>
    <loc>${abs(p.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${prio(p)}</priority>${p.hreflang ? '\n' + p.hreflang.map(([l, h]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(h)}"/>`).join('\n') : ''}
  </url>`).join('\n')}
</urlset>
`);

writeFile('robots.txt', `User-agent: *
Allow: /
Disallow: /_build/

Sitemap: ${SITE.url}/sitemap.xml
`);

writeFile('llms.txt', `# ${SITE.name}

> 24/7 lachgas bezorgdienst in Amsterdam en omstreken. Originele, verzegelde Fastgas Wegwerp Tanks (2KG, 4KG, 10KG) binnen 20-30 minuten bezorgd. Bestellen via WhatsApp (${SITE.waDisplay}) of telefoon (${SITE.telDisplay}), betalen bij aflevering. Uitsluitend 18+.

## Belangrijkste pagina's
- [Lachgas Amsterdam](${SITE.url}/lachgas-amsterdam/): hoofdpagina over lachgas kopen en bezorgen in Amsterdam
- [Fastgas tanks](${SITE.url}/lachgas-tanks/): assortiment 2KG, 4KG, 10KG
- [Lachgas bestellen](${SITE.url}/lachgas-bestellen-amsterdam/): zo werkt bestellen
- [Prijzen](${SITE.url}/lachgas-prijzen-amsterdam/): prijsopbouw
- [Bezorggebied](${SITE.url}/bezorggebied/): alle stadsdelen, buurten en plaatsen
- [Veelgestelde vragen](${SITE.url}/veelgestelde-vragen/)
- [Veilig gebruik](${SITE.url}/lachgas-veilig-gebruiken/)
- [Is lachgas verboden?](${SITE.url}/is-lachgas-verboden/)
- [English](${SITE.url}/nitrous-oxide-delivery-amsterdam/)
`);

writeFile('.htaccess', `# ${SITE.name} — static site
RewriteEngine On

# Canonical host: non-www -> www, http -> https
RewriteCond %{HTTP_HOST} ^lachgasdienstamsterdam\\.nl$ [NC]
RewriteRule ^(.*)$ https://www.lachgasdienstamsterdam.nl/$1 [L,R=301]
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://www.lachgasdienstamsterdam.nl/$1 [L,R=301]

# Trailing slash for directory URLs
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^(.+[^/])$ /$1/ [L,R=301]

DirectoryIndex index.html
ErrorDocument 404 /404.html

# Keep build sources private
RedirectMatch 404 ^/_build/

AddType image/webp .webp
AddType image/svg+xml .svg

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://formspree.io; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'self'"
</IfModule>
`);

console.log(`Built ${pages.length} pages + 404, sitemap.xml, robots.txt, llms.txt, .htaccess into ${OUT}`);
