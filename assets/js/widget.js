/* Lachgas Dienst Amsterdam — shared behaviour: mobile nav toggle,
   header elevation, deferred font swap, contact form. */
(function () {
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
          else { status.textContent = 'Versturen mislukt. Probeer het opnieuw of stuur ons een e-mail.'; status.className = 'form-status error'; }
        })
        .catch(function () { status.textContent = 'Versturen mislukt. Probeer het opnieuw of stuur ons een e-mail.'; status.className = 'form-status error'; });
    });
  }

  function init() {
    // Read layout (scrollY) before any DOM writes to avoid a forced reflow.
    wireHeaderElevation();
    swapDeferredStyles();
    wireNavToggle();
    wireContactForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
