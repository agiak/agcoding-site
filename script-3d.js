/* =====================================================
   AGcoding — 3D Experience Script
   Three.js hero · GSAP scroll · custom cursor · tilt
   ===================================================== */

(function () {
  'use strict';

  /* ── Custom cursor ──────────────────────────────── */
  var cursor     = document.getElementById('cursor');
  var cursorRing = document.getElementById('cursor-ring');
  var mx = window.innerWidth/2, my = window.innerHeight/2;
  var rx = mx, ry = my;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    if (cursor) { cursor.style.left = mx+'px'; cursor.style.top = my+'px'; }
  });

  // ring follows with lag
  (function ringLoop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (cursorRing) {
      cursorRing.style.left = rx+'px';
      cursorRing.style.top  = ry+'px';
    }
    requestAnimationFrame(ringLoop);
  })();

  document.querySelectorAll('a,button,.tech-pill-3d,.proj-card-3d').forEach(function(el) {
    el.addEventListener('mouseenter', function(){ document.body.classList.add('hovering'); });
    el.addEventListener('mouseleave', function(){ document.body.classList.remove('hovering'); });
  });

  /* ── Progress bar ───────────────────────────────── */
  var bar = document.getElementById('progressBar');
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX('+(h>0?y/h:0)+')';
    if (nav) nav.classList.toggle('scrolled', y > 60);
  }, { passive: true });

  /* ── Three.js hero scene ────────────────────────── */
  (function initThree() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var W = canvas.offsetWidth, H = canvas.offsetHeight;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W/H, 0.1, 100);
    camera.position.set(0, 0, 6);

    /* ── Lights ── */
    var keyLight = new THREE.PointLight(0x00e676, 3, 20);
    keyLight.position.set(4, 4, 6);
    scene.add(keyLight);
    var fillLight = new THREE.PointLight(0x00bcd4, 1.5, 16);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0x00e676, 0.06));

    var meshes = [];
    var GREEN = 0x00e676;
    var TEAL  = 0x00bcd4;

    /* ── Helper: draw a rect outline ── */
    function rectLine(w, h, z, color, opacity) {
      var hw = w/2, hh = h/2;
      var pts = [
        new THREE.Vector3(-hw,  hh, z),
        new THREE.Vector3( hw,  hh, z),
        new THREE.Vector3( hw, -hh, z),
        new THREE.Vector3(-hw, -hh, z),
        new THREE.Vector3(-hw,  hh, z),
      ];
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity })
      );
    }

    /* ── Helper: horizontal rule ── */
    function hLine(x0, x1, y, z, color, opacity) {
      var pts = [new THREE.Vector3(x0,y,z), new THREE.Vector3(x1,y,z)];
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity })
      );
    }

    /* ── Build a floating UI panel ──
       Think: abstract app screen — a glowing glass card with
       inner layout lines. No phone chrome, no fake hardware. */
    function makePanel(w, h, depth, rows) {
      var g = new THREE.Group();

      // Solid fill — barely visible glass
      g.add(new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.03, side: THREE.DoubleSide })
      ));

      // Outer border — crisp line rect
      g.add(rectLine(w, h, 0, GREEN, 0.5));

      // Subtle inner border offset
      g.add(rectLine(w - 0.06, h - 0.06, 0.001, GREEN, 0.12));

      // Corner accents — short L-shaped lines at each corner
      var cSize = 0.12, hw = w/2, hh = h/2;
      var corners = [[-hw,hh],[hw,hh],[hw,-hh],[-hw,-hh]];
      corners.forEach(function(c, i) {
        var sx = c[0] < 0 ? 1 : -1;
        var sy = c[1] < 0 ? 1 : -1;
        var pts1 = [new THREE.Vector3(c[0], c[1], 0.002), new THREE.Vector3(c[0]+sx*cSize, c[1], 0.002)];
        var pts2 = [new THREE.Vector3(c[0], c[1], 0.002), new THREE.Vector3(c[0], c[1]+sy*cSize, 0.002)];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts1),
          new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9 })));
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2),
          new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9 })));
      });

      // Layout content rows
      var rowDefs = rows || [
        { x0: -hw+0.12, x1:  0.1,    y: hh-0.18, op: 0.6  }, // heading
        { x0: -hw+0.12, x1: -0.1,    y: hh-0.28, op: 0.25 }, // subheading
        { x0: -hw+0.12, x1:  hw-0.14,y: hh-0.45, op: 0.15 }, // body
        { x0: -hw+0.12, x1:  0.2,    y: hh-0.53, op: 0.15 },
        { x0: -hw+0.12, x1:  hw-0.14,y: hh-0.61, op: 0.15 },
      ];
      rowDefs.forEach(function(r) {
        g.add(hLine(r.x0, r.x1, r.y, 0.003, GREEN, r.op));
      });

      // Small stat badge (bottom-right corner area)
      if (depth > 0) {
        g.add(rectLine(0.28, 0.14, 0.003, TEAL, 0.3));
        var badge = new THREE.Group();
        badge.position.set(hw - 0.24, -hh + 0.18, 0);
        badge.add(rectLine(0.28, 0.14, 0, TEAL, 0.25));
        badge.add(hLine(-0.09, 0.09, 0.02, 0, TEAL, 0.5));
        badge.add(hLine(-0.09, 0.04, -0.04, 0, TEAL, 0.3));
        g.add(badge);
      }

      return g;
    }

    /* ── Place panels ── */
    //  [x,  y,   z,    w,   h,  rotY,  rotX, scale, hasStats]
    var panelDefs = [
      [ 3.6,  0.6, -0.8,  1.6, 2.4,  -0.32,  0.05,  1.0,  true  ],
      [-3.4,  0.4, -1.2,  1.4, 2.2,   0.38, -0.04,  0.85, false ],
      [ 2.0, -2.2, -2.0,  1.2, 1.8,  -0.45,  0.10,  0.70, false ],
      [-1.8, -2.0, -1.6,  1.1, 1.7,   0.28,  0.06,  0.75, true  ],
      [ 0.0,  2.8, -3.2,  1.8, 2.6,   0.08, -0.05,  0.55, false ],
    ];
    panelDefs.forEach(function(d) {
      var panel = makePanel(d[3], d[4], d[8] ? 1 : 0);
      panel.position.set(d[0], d[1], d[2]);
      panel.rotation.y = d[5];
      panel.rotation.x = d[6];
      panel.scale.setScalar(d[7]);
      panel.userData = {
        floatAmp:   0.10 + Math.random() * 0.10,
        floatSpeed: 0.30 + Math.random() * 0.35,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: d[1],
      };
      scene.add(panel);
      meshes.push(panel);
    });

    /* ── Dot grid (depth field) ── */
    var dotCount = 300;
    var dotPos   = new Float32Array(dotCount * 3);
    for (var i = 0; i < dotCount; i++) {
      dotPos[i*3]   = (Math.random()-0.5) * 24;
      dotPos[i*3+1] = (Math.random()-0.5) * 16;
      dotPos[i*3+2] = (Math.random()-0.5) * 10 - 4;
    }
    var dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    scene.add(new THREE.Points(dotGeo,
      new THREE.PointsMaterial({ color: GREEN, size: 0.035, transparent: true, opacity: 0.35 })
    ));

    /* ── Particle field (pCount kept as alias for resize logic) ── */
    var pCount = dotCount;
    var pPositions = dotPos;

    /* ── Mouse parallax ── */
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    document.addEventListener('mousemove', function(e) {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    /* ── Resize ── */
    window.addEventListener('resize', function() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      camera.aspect = W/H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });

    /* ── Animate ── */
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      scene.rotation.y = currentX * 0.5;
      scene.rotation.x = currentY * 0.3;

      meshes.forEach(function(m) {
        var u = m.userData;
        // panels only gently float — no spin (looks cleaner)
        m.position.y = u.baseY + Math.sin(t * u.floatSpeed + u.floatOffset) * u.floatAmp;
      });

      renderer.render(scene, camera);
    }
    animate();
  })();

  /* ── GSAP scroll reveals ────────────────────────── */
  (function initGSAP() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // fromTo so the end state is always explicit (opacity:1, transform:none)
    document.querySelectorAll('[data-3d-reveal]').forEach(function(el) {
      var dir   = el.getAttribute('data-3d-reveal');
      var delay = parseFloat(el.getAttribute('data-delay') || 0);

      var fromVars = { opacity: 0, ease: 'power3.out' };
      if      (dir === 'left')  { fromVars.x = -50; fromVars.y = 0; }
      else if (dir === 'right') { fromVars.x =  50; fromVars.y = 0; }
      else if (dir === 'scale') { fromVars.scale = 0.88; fromVars.y = 0; }
      else                      { fromVars.y = 50; }

      var toVars = { opacity: 1, x: 0, y: 0, scale: 1, duration: 1, delay: delay, ease: 'power3.out' };

      if (typeof ScrollTrigger !== 'undefined') {
        gsap.fromTo(el, fromVars, Object.assign({}, toVars, {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }));
      } else {
        // CSS fallback via IntersectionObserver
        var obs = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) { el.classList.add('revealed'); obs.disconnect(); }
        }, { threshold: 0.1 });
        obs.observe(el);
      }
    });

    // stagger process steps
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo('.pstep-3d',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.1, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: '.process-grid-3d', start: 'top 80%', once: true }
        }
      );
      document.querySelectorAll('.pstep-3d').forEach(function(el) {
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: function() { el.classList.add('active'); }
        });
      });
    }
  })();

  /* ── Metric count-up (re-used from render.js) ─── */
  // render.js handles this; script-3d just initialises reveal for metrics
  document.querySelectorAll('.metric-3d').forEach(function(el) {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { el.classList.add('in-view'); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
  });

  /* ── 3D tilt on project cards ───────────────────── */
  document.querySelectorAll('.proj-card-3d').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width  - 0.5;
      var y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = 'perspective(800px) rotateY('+( x*10)+'deg) rotateX('+(-y*6)+'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  /* ── Service card radial glow ───────────────────── */
  document.querySelectorAll('.svc-card-3d').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
      card.style.setProperty('--my', ((e.clientY - r.top)/r.height*100)+'%');
    });
  });

  /* ── Mobile menu ────────────────────────────────── */
  var ham = document.getElementById('hamburger');
  var mm  = document.getElementById('mobileMenu');
  if (ham) {
    ham.addEventListener('click', function() {
      var open = mm.classList.toggle('open');
      ham.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mm.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mm.classList.remove('open'); ham.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Theme toggle ────────────────────────────────── */
  (function(){
    var themeBtn  = document.getElementById('themeBtn');
    var themeIcon = document.getElementById('themeIcon');
    var root      = document.documentElement;
    var navLogo   = document.getElementById('navLogo');
    var sunSVG  = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>';
    var moonSVG = '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>';

    function applyTheme(t) {
      root.setAttribute('data-theme', t);
      // logo: cream on dark, ink on light
      if (navLogo) navLogo.src = t === 'dark' ? 'assets/logo-cream.png' : 'assets/logo-ink.png';
      if (themeIcon) themeIcon.innerHTML = t === 'dark' ? moonSVG : sunSVG;
      // tint hero canvas overlay for light mode readability
      var overlay = document.querySelector('.hero-vignette');
      if (overlay) {
        overlay.style.background = t === 'dark'
          ? 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,6,8,0.85) 100%)'
          : 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(244,244,240,0.80) 100%)';
      }
      try { localStorage.setItem('ag-theme', t); } catch(e) {}
    }

    var saved = 'dark';
    try { saved = localStorage.getItem('ag-theme') || 'dark'; } catch(e) {}
    applyTheme(saved);

    if (themeBtn) themeBtn.addEventListener('click', function() {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  })();

})();
