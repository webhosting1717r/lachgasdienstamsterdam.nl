/* Lachgas Dienst Amsterdam — shared behaviour: floating WhatsApp button,
   mobile nav toggle, header elevation, deferred font swap, contact form. */
(function () {
  var WHATSAPP_NUMBER = '447441484380';
  var WHATSAPP_TEXT = encodeURIComponent('Hoi, ik wil graag lachgas bestellen in Amsterdam.');

  function el(tag, attrs) {
    var node = document.createElement(tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function injectFab() {
    // The button is normally already in the HTML (painted with the first frame); build it only as a fallback.
    if (document.getElementById('contact-fab')) return;
    var a = el('a', {
      class: 'contact-fab fab-single', id: 'contact-fab',
      href: 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + WHATSAPP_TEXT,
      target: '_blank', rel: 'noopener', 'aria-label': 'WhatsApp bestellen'
    });
    a.appendChild(el('img', { class: 'fab-icon', src: '/assets/img/icon-whatsapp.svg', alt: '', width: '60', height: '60' }));
    document.body.appendChild(a);
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
