// Reads CONTENT from content.js and populates the agent-studio page.
(function () {
  if (typeof CONTENT === 'undefined') return;
  var C = CONTENT;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var SVC_ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>'
  ];

  // ── Marquee ───────────────────────────────────────
  var mq = document.getElementById('mqTrack');
  if (mq) {
    var items = ['Android development', 'iOS development', 'Native performance', 'Google Play', 'App Store', 'Kotlin & Swift', 'End-to-end delivery', 'Startups & product teams'];
    var html = '';
    for (var r = 0; r < 2; r++) items.forEach(function (t) { html += '<span class="mq-item">' + esc(t) + '</span>'; });
    mq.innerHTML = html;
  }

  // ── Metrics (labels + count-up targets) ───────────
  var metricEls = document.querySelectorAll('.metric');
  (C.metrics || []).forEach(function (m, i) {
    var el = metricEls[i];
    if (!el) return;
    var lbl = el.querySelector('.metric-label');
    if (lbl) lbl.textContent = m.label;
    var numEl = el.querySelector('.metric-num');
    if (!numEl) return;
    var match = m.number.match(/^(\d+\.?\d*)(.*)$/);
    if (match) {
      var suffix = match[2] || '';
      numEl.innerHTML = '0' + (suffix ? '<span class="v">' + esc(suffix) + '</span>' : '');
      numEl._countTarget = parseFloat(match[1]);
    } else {
      numEl.innerHTML = '<span class="v">' + esc(m.number) + '</span>';
    }
  });

  // count-up on scroll into view
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.metric-num').forEach(function (numEl) {
    if (numEl._countTarget === undefined) return;
    if (reduce) { numEl.firstChild.nodeValue = numEl._countTarget + ''; return; }
    var fired = false;
    var obs = new IntersectionObserver(function (entries) {
      if (fired || !entries[0].isIntersecting) return;
      fired = true; obs.disconnect();
      var target = numEl._countTarget, dur = 1500, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        numEl.firstChild.nodeValue = Math.round(target * eased) + '';
        if (p < 1) requestAnimationFrame(step);
        else numEl.firstChild.nodeValue = target + '';
      }
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    obs.observe(numEl);
  });

  // ── Services ──────────────────────────────────────
  var svcGrid = document.getElementById('services-grid');
  if (svcGrid && C.services && C.services.cards) {
    svcGrid.innerHTML = C.services.cards.map(function (card, i) {
      var feats = card.features.map(function (f) {
        return '<div class="svc-feat"><span class="svc-check">' + CHECK + '</span>' + esc(f) + '</div>';
      }).join('');
      return '<div class="svc-card reveal" data-reveal="up"' + (i ? ' data-delay="100"' : '') + '>' +
        '<div class="svc-icon">' + (SVC_ICONS[i] || SVC_ICONS[0]) + '</div>' +
        '<div class="svc-tag">' + esc(card.tag) + '</div>' +
        '<h3 class="svc-title">' + esc(card.title) + '</h3>' +
        '<p class="svc-desc">' + esc(card.desc) + '</p>' +
        '<div class="svc-feats">' + feats + '</div>' +
        '</div>';
    }).join('');
  }

  // ── Process ───────────────────────────────────────
  var procGrid = document.getElementById('process-grid');
  if (procGrid && C.process && C.process.steps) {
    procGrid.innerHTML = C.process.steps.map(function (s, i) {
      return '<div class="pstep reveal" data-reveal="up" data-delay="' + (i * 90) + '">' +
        '<div class="pstep-line"></div>' +
        '<span class="pn">' + esc(s.n) + '</span>' +
        '<h4>' + esc(s.title) + '</h4>' +
        '<p>' + esc(s.desc) + '</p>' +
        '</div>';
    }).join('');
  }

  // ── Projects ──────────────────────────────────────
  var projGrid = document.getElementById('proj-cards');
  if (projGrid && C.work && C.work.projects) {
    projGrid.innerHTML = C.work.projects.map(function (proj, i) {
      var isLive = proj.status === 'live';
      var chips = proj.chips.map(function (c) { return '<span class="pchip">' + esc(c) + '</span>'; }).join('');
      var link = proj.link
        ? '<a href="' + esc(proj.link.url) + '" target="_blank" rel="noopener" class="proj-link">' + esc(proj.link.label) + '</a>'
        : '';
      return '<div class="proj-card reveal" data-reveal="up" data-delay="' + (i * 90) + '">' +
        '<div class="proj-idx">' + esc(proj.idx) + '</div>' +
        '<div class="proj-status ' + (isLive ? 'live' : '') + '"><span class="pdot"></span>' + esc(proj.status_label) + '</div>' +
        '<h3 class="proj-title">' + esc(proj.title) + '</h3>' +
        '<p class="proj-desc">' + esc(proj.desc) + '</p>' +
        '<div class="proj-chips">' + chips + '</div>' +
        '<div class="proj-foot">' +
          '<div class="proj-metas">' +
            '<span class="pmeta">Platform: <strong>' + esc(proj.platform) + '</strong></span>' +
            '<span class="pmeta">Status: <strong' + (isLive ? ' style="color:var(--accent)"' : '') + '>' + esc(proj.status_text) + '</strong></span>' +
          '</div>' + link +
        '</div>' +
        '</div>';
    }).join('');
  }

  // ── Tech pills ────────────────────────────────────
  var techGrid = document.getElementById('tech-grid');
  if (techGrid && C.tech && C.tech.pills) {
    techGrid.innerHTML = C.tech.pills.map(function (t) {
      return '<span class="tech-pill">' + esc(t) + '</span>';
    }).join('');
  }
})();
