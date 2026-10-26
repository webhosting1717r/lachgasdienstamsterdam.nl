/* Lachgas Dienst Amsterdam — shared behaviour: floating WhatsApp/call widget,
   mobile nav toggle, header elevation, deferred font swap, contact form. */
(function () {
  var WHATSAPP_NUMBER = '16474935191';
  var PHONE_NUMBER = '+31684695184';
  var WHATSAPP_TEXT = encodeURIComponent('Hoi, ik wil graag lachgas bestellen in Amsterdam.');
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    var node = document.createElement(tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function fabItem(href, cls, iconSrc, label, target) {
    var a = el('a', { class: 'fab-item ' + cls, href: href });
    if (target) { a.setAttribute('target', target); a.setAttribute('rel', 'noopener'); }
    a.appendChild(el('img', { class: 'fab-icon', src: iconSrc, alt: '', width: '22', height: '22' }));
    var span = document.createElement('span');
    span.textContent = label;
    a.appendChild(span);
    return a;
  }

  function plusIcon() {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M12 5v14M5 12h14');
    svg.appendChild(path);
    return svg;
  }

  function injectFab() {
    // The widget is normally already in the HTML (painted with the first frame); build it only as a fallback.
    var wrap = document.getElementById('contact-fab');
    var toggle = wrap && document.getElementById('fab-toggle');
    if (!wrap || !toggle) {
      wrap = el('div', { class: 'contact-fab', id: 'contact-fab' });
      var menu = el('div', { class: 'fab-menu' });
      menu.appendChild(fabItem('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + WHATSAPP_TEXT, 'wa', '/assets/img/icon-whatsapp.svg', 'WhatsApp bestellen', '_blank'));
      menu.appendChild(fabItem('tel:' + PHONE_NUMBER, 'call', '/assets/img/icon-call.svg', 'Bel direct'));
      wrap.appendChild(menu);
      toggle = el('button', { class: 'fab-main', id: 'fab-toggle', type: 'button', 'aria-label': 'Contactopties tonen', 'aria-expanded': 'false' });
      toggle.appendChild(plusIcon());
      wrap.appendChild(toggle);
      document.body.appendChild(wrap);
    }
    toggle.addEventListener('click', function () {
      var open = wrap.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Contactopties verbergen' : 'Contactopties tonen');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { wrap.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  function wireNavToggle() {
    var btn = document.getElementById('nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function wireHeaderElevation() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    var apply = function () { header.classList.toggle('scrolled', window.scrollY > 8); ticking = false; };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  function swapDeferredStyles() {
    var links = document.querySelectorAll('link[data-defer-style]');
    for (var i = 0; i < links.length; i++) { links[i].media = 'all'; links[i].removeAttribute('data-defer-style'); }
  }

  function wireContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;
    var status = document.createElement('p');
    status.className = 'form-status';
    form.appendChild(status);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = 'Bezig met versturen …';
      status.className = 'form-status';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (r.ok) { form.reset(); status.textContent = 'Bedankt! Uw bericht is verstuurd. We reageren zo snel mogelijk.'; status.className = 'form-status success'; }
          else { status.textContent = 'Versturen mislukt. Probeer het opnieuw of stuur ons een WhatsApp.'; status.className = 'form-status error'; }
        })
        .catch(function () { status.textContent = 'Versturen mislukt. Probeer het opnieuw of stuur ons een WhatsApp.'; status.className = 'form-status error'; });
    });
  }

  function init() {
    // Read layout (scrollY) before any DOM writes to avoid a forced reflow.
    wireHeaderElevation();
    swapDeferredStyles();
    wireNavToggle();
    wireContactForm();
    injectFab();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
