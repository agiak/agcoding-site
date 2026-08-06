// =====================================================
//  AGcoding — Agent Studio interactions
// =====================================================
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // ── Theme toggle ────────────────────────────────
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ag-theme', next); } catch (e) {}
    });
  }

  // ── Nav scrolled state + progress bar ───────────
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progressBar');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 20);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile menu ─────────────────────────────────
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  // ── Scroll reveal (IntersectionObserver + jump sweep) ──
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('in'); }, d);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });

    // Instantly reveal anything at/above the current viewport — covers
    // hash-landing (#work) or fast jump-nav where IO never sees an
    // intersecting frame for elements scrolled past.
    function sweepInView() {
      var vh = window.innerHeight;
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.9) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }
    // Run several times after load — the browser's hash-scroll can land
    // after load fires, so a single sweep can miss it (race).
    function sweepBurst() { [60, 300, 700].forEach(function (t) { setTimeout(sweepInView, t); }); }
    window.addEventListener('load', sweepBurst);
    window.addEventListener('hashchange', sweepBurst);
    sweepBurst();
  }

  // ── Cursor glow (fine pointer only) ─────────────
  var fine = window.matchMedia('(pointer: fine)').matches;
  var glow = document.getElementById('cursorGlow');
  if (fine && glow && !reduce) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy, active = false;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!active) { active = true; document.body.classList.add('cursor-active'); }
    });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  // ── Agent console typing ────────────────────────
  var body = document.getElementById('consoleBody');
  if (body) {
    var LINES = [
      { html: '<span class="prompt">$</span> agcoding init --native', cls: '' },
      { html: '<span class="ok">✓</span> scoping product &amp; flows', cls: '' },
      { html: '<span class="ok">✓</span> architecting Kotlin + Swift', cls: '' },
      { html: '<span class="ok">✓</span> building native screens', cls: '' },
      { html: '<span class="ok">✓</span> running tests <span class="dim">— all green</span>', cls: '' },
      { html: '<span class="ok">✓</span> submitting to Play Store &amp; App Store', cls: '' },
      { html: '<span class="dim">→</span> status', cls: '' },
      { html: '● live on store', cls: 'live' }
    ];
    if (reduce) {
      body.innerHTML = LINES.map(function (l) {
        return '<span class="cline show ' + l.cls + '">' + l.html + '</span>';
      }).join('');
    } else {
      var caret = document.createElement('span');
      caret.className = 'caret';
      var timers = [];
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function run() {
        body.innerHTML = '';
        var i = 0;
        function nextLine() {
          if (i >= LINES.length) {
            body.appendChild(caret);
            timers.push(setTimeout(function () { clearTimers(); run(); }, 4200));
            return;
          }
          var l = LINES[i];
          var span = document.createElement('span');
          span.className = 'cline ' + l.cls;
          span.innerHTML = l.html;
          body.appendChild(span);
          body.appendChild(caret);
          requestAnimationFrame(function () { span.classList.add('show'); });
          i++;
          timers.push(setTimeout(nextLine, 620));
        }
        nextLine();
      }
      // start once the console scrolls into view
      var started = false;
      var cio = new IntersectionObserver(function (entries) {
        if (started || !entries[0].isIntersecting) return;
        started = true; cio.disconnect(); run();
      }, { threshold: 0.3 });
      cio.observe(body);
    }
  }

  // ── Subtle mesh parallax (GSAP if present) ──────
  function initParallax() {
    if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    var meshes = [
      { el: '.mesh-a', y: 120 },
      { el: '.mesh-b', y: -90 },
      { el: '.mesh-c', y: 70 }
    ];
    meshes.forEach(function (m) {
      if (!document.querySelector(m.el)) return;
      gsap.to(m.el, {
        yPercent: m.y / 6,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
      });
    });
  }
  if (document.readyState === 'complete') initParallax();
  else window.addEventListener('load', initParallax);

  window.__agReady = true;
})();
