/* 萬一手冊 site statistics (GoatCounter: no cookies, no personal data).
   Counts page views and a few anonymous steps so we can see where visitors stop:
   start -> paywall-shown -> click-buy -> unlock-try, plus pdf-download and guide-cta.
   Nothing the visitor types into the handbook is ever sent. */
(function () {
  var GC = 'https://wanyi.goatcounter.com/count';
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname) || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js'; s.setAttribute('data-goatcounter', GC);
  document.head.appendChild(s);

  var lang = /\/en\//.test(location.pathname) ? 'en-' : '';
  var guide = /\/guides\//.test(location.pathname);
  function ev(name, tries) {
    tries = tries || 0;
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: lang + name, title: lang + name, event: true });
    } else if (tries < 20) {
      setTimeout(function () { ev(name, tries + 1); }, 500);
    }
  }
  var ACT = { start: function (b) { return 'start-' + (b.getAttribute('data-mode') || 'over'); },
              tounlock: function () { return 'view-unlock'; },
              verify: function () { return 'unlock-try'; },
              pdf: function () { return 'pdf-download'; },
              backup: function () { return 'backup-download'; } };
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('a[href*="gumroad.com"]')) { ev('click-buy'); return; }
    if (guide && t.closest('.cta a, a.brand, .brand a')) { ev('guide-cta'); return; }
    var b = t.closest('[data-act]');
    if (b && ACT[b.getAttribute('data-act')]) ev(ACT[b.getAttribute('data-act')](b));
  }, true);

  if (!guide && window.MutationObserver) {
    var seen = false;
    var mo = new MutationObserver(function () {
      if (!seen && document.querySelector('a[href*="gumroad.com"]')) { seen = true; ev('paywall-shown'); mo.disconnect(); }
    });
    document.addEventListener('DOMContentLoaded', function () { mo.observe(document.body, { childList: true, subtree: true }); });
  }
})();
