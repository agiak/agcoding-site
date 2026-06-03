// Reads CONTENT from content.js and populates the 3D page.
(function () {
  if (typeof CONTENT === 'undefined') return;
  var C = CONTENT;

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Marquee ───────────────────────────────────────
  var mq = document.getElementById('mqTrack');
  if (mq) {
    var items = ['Android development','iOS development','Native performance','Google Play','App Store','Kotlin & Swift','End-to-end delivery','Startups & product teams'];
    var html = '';
    for (var r = 0; r < 2; r++) {
      items.forEach(function(t){ html += '<span class="mq-item">'+t+'</span>'; });
    }
    mq.innerHTML = html;
  }

  // ── Metrics ───────────────────────────────────────
  var metricEls = document.querySelectorAll('.metric-3d');
  C.metrics.forEach(function(m, i) {
    var el = metricEls[i];
    if (!el) return;
    el.querySelector('.metric-label-3d').textContent = m.label;
    var numEl = el.querySelector('.metric-num-3d');
    if (!numEl) return;
    var match = m.number.match(/^(\d+\.?\d*)(.*)$/);
    if (match) {
      var countTarget = parseFloat(match[1]);
      var suffix = match[2] || '';
      numEl.innerHTML = '0' + (suffix ? '<span class="v">' + esc(suffix) + '</span>' : '');
      numEl._countTarget = countTarget;
      numEl._countSuffix = suffix;
    } else {
      numEl.innerHTML = '<span class="v">' + esc(m.number) + '</span>';
    }
  });

  // count-up when scrolled into view
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.metric-num-3d').forEach(function(numEl) {
    if (numEl._countTarget === undefined) return;
    if (reduce) { numEl.firstChild.nodeValue = numEl._countTarget + ''; return; }
    var fired = false;
    var obs = new IntersectionObserver(function(entries) {
      if (fired || !entries[0].isIntersecting) return;
      fired = true; obs.disconnect();
      var target = numEl._countTarget, dur = 1600, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        numEl.firstChild.nodeValue = Math.round(target * eased) + '';
        if (p < 1) requestAnimationFrame(step);
        else numEl.firstChild.nodeValue = target + '';
      }
      requestAnimationFrame(step);
    }, { threshold: 0.2 });
    obs.observe(numEl);
  });

  // ── Projects ──────────────────────────────────────
  var container = document.getElementById('proj-cards-3d');
  if (container && C.work && C.work.projects) {
    container.innerHTML = C.work.projects.map(function(proj, i) {
      var delay = i > 0 ? ' data-delay="'+(i*0.12)+'"' : '';
      var statusStyle = proj.status === 'live' ? ' style="color:var(--green)"' : '';
      var chips = proj.chips.map(function(c){ return '<span class="pchip-3d">'+esc(c)+'</span>'; }).join('');
      var link = proj.link
        ? '<a href="'+proj.link.url+'" target="_blank" class="proj-link-3d">'+esc(proj.link.label)+' →</a>'
        : '';
      var dotCls = proj.status === 'live' ? 'pdot-3d' : 'pdot-3d';
      return '<div class="proj-card-3d" data-3d-reveal="up"'+delay+'>' +
        '<div class="proj-idx-3d">'+esc(proj.idx)+'</div>' +
        '<div class="proj-status-3d '+proj.status+'"><span class="'+dotCls+'"></span>'+esc(proj.status_label)+'</div>' +
        '<h3 class="proj-title-3d">'+esc(proj.title)+'</h3>' +
        '<p class="proj-desc-3d">'+esc(proj.desc)+'</p>' +
        '<div class="proj-chips-3d">'+chips+'</div>' +
        '<div class="proj-foot-3d">' +
          '<div class="proj-metas-3d">' +
            '<span class="pmeta-3d">Platform: <strong>'+esc(proj.platform)+'</strong></span>' +
            '<span class="pmeta-3d">Status: <strong'+statusStyle+'>'+esc(proj.status_text)+'</strong></span>' +
          '</div>' + link +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ── Tech pills ────────────────────────────────────
  var techGrid = document.getElementById('tech-grid-3d');
  if (techGrid && C.tech && C.tech.pills) {
    techGrid.innerHTML = C.tech.pills.map(function(t){
      return '<span class="tech-pill-3d">'+esc(t)+'</span>';
    }).join('');
  }

})();
