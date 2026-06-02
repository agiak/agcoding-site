// Reads CONTENT from content.js and populates the page.
// Only text/data changes should be made in content.js — not here.
(function () {
  if (typeof CONTENT === 'undefined') return;
  var C = CONTENT;

  function set(sel, html, attr) {
    var el = document.querySelector(sel);
    if (!el) return;
    if (attr) el.setAttribute(attr, html);
    else el.innerHTML = html;
  }
  function setAll(sel, fn) {
    document.querySelectorAll(sel).forEach(fn);
  }
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Meta ──────────────────────────────────────────────────
  document.title = C.meta.title;
  setAll('a[href^="mailto:"]', function(a){ a.href = 'mailto:' + C.meta.email; if(a.classList.contains('mm-mail')||a.classList.contains('contact-email')) a.childNodes[a.childNodes.length-1].nodeValue = C.meta.email; });

  // ── Hero ──────────────────────────────────────────────────
  set('.pill', '<span class="pill-dot"></span>' + esc(C.hero.pill));
  set('h1', C.hero.heading.join('<br>'));
  set('.hero-sub', esc(C.hero.sub));
  set('a.btn-primary', C.hero.cta_primary);
  set('a.btn-ghost', esc(C.hero.cta_ghost));
  set('.tech-label', esc(C.hero.tech_label));

  var heroTech = document.querySelector('.hero-tech');
  if (heroTech) {
    heroTech.innerHTML = '<span class="tech-label">' + esc(C.hero.tech_label) + '</span>' +
      C.hero.tech.map(function(t){ return '<span class="tchip">' + esc(t) + '</span>'; }).join('');
  }

  // ── Metrics ───────────────────────────────────────────────
  var metricEls = document.querySelectorAll('.metric');
  C.metrics.forEach(function(m, i) {
    var el = metricEls[i];
    if (!el) return;
    el.querySelector('.metric-label').textContent = m.label;
    var numEl = el.querySelector('.metric-num');
    if (!numEl) return;
    var match = m.number.match(/^(\d+\.?\d*)(.*)$/);
    if (match) {
      var num = match[1];
      var suffix = match[2] || '';
      numEl.setAttribute('data-count', num);
      numEl.setAttribute('data-suffix', suffix);
      numEl.innerHTML = '0' + (suffix ? '<span class="v">' + esc(suffix) + '</span>' : '');
    } else {
      numEl.removeAttribute('data-count');
      numEl.removeAttribute('data-suffix');
      numEl.innerHTML = '<span class="v">' + esc(m.number) + '</span>';
    }
  });

  // ── Services ──────────────────────────────────────────────
  var s = C.services;
  set('#services .eyebrow', esc(s.eyebrow));
  set('#services .sec-title', esc(s.heading));
  set('#services .sec-sub', esc(s.sub));

  var svcCards = document.querySelectorAll('.svc-card');
  s.cards.forEach(function(card, i) {
    var el = svcCards[i];
    if (!el) return;
    el.querySelector('.svc-tag').textContent = card.tag;
    el.querySelector('.svc-title').textContent = card.title;
    el.querySelector('.svc-desc').textContent = card.desc;
    var feats = el.querySelectorAll('.svc-feat');
    card.features.forEach(function(feat, j) {
      if (feats[j]) feats[j].lastChild.nodeValue = feat;
    });
  });

  // ── Process ───────────────────────────────────────────────
  var p = C.process;
  set('#process .eyebrow', esc(p.eyebrow));
  set('#process .sec-title', esc(p.heading));

  var steps = document.querySelectorAll('.pstep');
  p.steps.forEach(function(step, i) {
    var el = steps[i];
    if (!el) return;
    el.querySelector('h4').textContent = step.title;
    el.querySelector('p').textContent = step.desc;
  });

  // ── Work ──────────────────────────────────────────────────
  var w = C.work;
  set('#work .eyebrow', esc(w.eyebrow));
  set('#work .sec-title', w.heading);

  var projCards = document.querySelectorAll('.proj-card');
  w.projects.forEach(function(proj, i) {
    var el = projCards[i];
    if (!el) return;
    el.querySelector('.proj-title').textContent = proj.title;
    el.querySelector('.proj-desc').textContent = proj.desc;
    el.querySelector('.proj-status').innerHTML = '<span class="pdot"></span>' + esc(proj.status_label);
    el.querySelector('.proj-status').className = 'proj-status ' + proj.status;

    var chips = el.querySelector('.proj-chips');
    if (chips) chips.innerHTML = proj.chips.map(function(c){ return '<span class="pchip">' + esc(c) + '</span>'; }).join('');

    var metas = el.querySelector('.proj-metas');
    if (metas) {
      var statusStyle = proj.status === 'live' ? ' style="color:var(--green)"' : '';
      metas.innerHTML = '<span class="pmeta">Platform: <strong>' + esc(proj.platform) + '</strong></span>' +
        '<span class="pmeta">Status: <strong' + statusStyle + '>' + esc(proj.status_text) + '</strong></span>';
    }

    var foot = el.querySelector('.proj-foot');
    if (foot && proj.link) {
      var existing = foot.querySelector('.proj-link');
      if (!existing) {
        var a = document.createElement('a');
        a.href = proj.link.url; a.target = '_blank'; a.className = 'proj-link';
        a.textContent = proj.link.label;
        foot.appendChild(a);
      } else {
        existing.href = proj.link.url;
        existing.textContent = proj.link.label;
      }
    }
  });

  // ── Tech ──────────────────────────────────────────────────
  set('#tech .eyebrow', esc(C.tech.eyebrow));
  set('#tech .sec-title', C.tech.heading);

  var techRow = document.querySelector('.tech-row');
  if (techRow) {
    techRow.innerHTML = C.tech.pills.map(function(t){ return '<span class="tech-pill">' + esc(t) + '</span>'; }).join('');
  }

  // ── Contact ───────────────────────────────────────────────
  var ct = C.contact;
  set('#contact .eyebrow', esc(ct.eyebrow));
  set('.contact-title', ct.heading);
  set('.contact-text', esc(ct.sub));
  set('.cc-head', esc(ct.card_head));

  var cpRows = document.querySelectorAll('.cp-row');
  ct.card_rows.forEach(function(row, i) {
    var el = cpRows[i];
    if (!el) return;
    var val = el.querySelector('.cp-val');
    if (val) { val.textContent = row.value; val.classList.toggle('acc', !!row.accent); }
    var lbl = el.querySelector('.cp-label');
    if (lbl) lbl.lastChild.nodeValue = row.label;
  });

  // ── Footer ────────────────────────────────────────────────
  var f = C.footer;
  set('.foot-brand p', esc(f.tagline));
  set('.foot-copy', esc(f.copy));
  var copies = document.querySelectorAll('.foot-copy');
  if (copies[1]) copies[1].textContent = f.sub;

})();
