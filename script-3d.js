/* =====================================================
   AGcoding — 3D Experience Script
   Three.js hero · GSAP scroll · custom cursor · tilt
   ===================================================== */

(function () {
  'use strict';

  /* ── Custom cursor ──────────────────────────────── */
  var cursor     = document.getElementById('cursor');
  var cursorRing = document.getElementById('cursor-ring');
  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var gx = mx, gy = my;  // glow position, lags behind

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    // Dot snaps immediately via CSS left/top
    if (cursor) {
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    }
  });

  // Glow follows with a very smooth, slow lag
  (function glowLoop() {
    gx += (mx - gx) * 0.07;
    gy += (my - gy) * 0.07;
    if (cursorRing) {
      cursorRing.style.left = gx + 'px';
      cursorRing.style.top  = gy + 'px';
    }
    requestAnimationFrame(glowLoop);
  })();

  document.querySelectorAll('a, button, .tech-pill-3d, .proj-card-3d, .svc-card-3d').forEach(function(el) {
    el.addEventListener('mouseenter', function() { document.body.classList.add('hovering'); });
    el.addEventListener('mouseleave', function() { document.body.classList.remove('hovering'); });
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
    var camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 100);
    // Camera offset left so the orbital system sits right-of-centre,
    // leaving the hero text visible on the left
    camera.position.set(-1.8, 0.2, 7);
    camera.lookAt(1.2, 0, 0);

    /* ── Lights ── */
    var keyLight = new THREE.PointLight(0x00e676, 4, 22);
    keyLight.position.set(2, 3, 5);
    scene.add(keyLight);
    var fillLight = new THREE.PointLight(0x00bcd4, 2, 18);
    fillLight.position.set(-4, -1, 4);
    scene.add(fillLight);
    var rimLight = new THREE.PointLight(0xffffff, 0.4, 10);
    rimLight.position.set(0, -3, 2);
    scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0x112211, 0.8));

    var GREEN = 0x00e676;
    var TEAL  = 0x00bcd4;

    /* ═══════════════════════════════════════════════
       ORBITAL SYSTEM — central phone + rings + satellites
       ═══════════════════════════════════════════════ */

    var system = new THREE.Group();
    system.position.set(2.0, 0, 0);   // push right so text is clear
    system.scale.setScalar(0.88);
    scene.add(system);

    /* ── 1. Central phone ── */
    var phone = new THREE.Group();

    // Body — dark gloss box
    phone.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.48, 0.09),
      new THREE.MeshStandardMaterial({
        color: 0x0d1117, metalness: 0.85, roughness: 0.15,
        transparent: true, opacity: 0.95
      })
    ));

    // Edge highlight — thin bright border
    var edgeMat = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.7 });
    var ew = 0.36, eh = 0.74;
    var edgePts = [
      new THREE.Vector3(-ew,  eh, 0.046), new THREE.Vector3( ew,  eh, 0.046),
      new THREE.Vector3( ew, -eh, 0.046), new THREE.Vector3(-ew, -eh, 0.046),
      new THREE.Vector3(-ew,  eh, 0.046)
    ];
    phone.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(edgePts), edgeMat));

    // Screen glass fill
    phone.add(new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 1.40),
      new THREE.MeshStandardMaterial({
        color: 0x001a0a, metalness: 0, roughness: 1,
        transparent: true, opacity: 0.85, side: THREE.DoubleSide
      })
    ));

    // Screen glow (emissive plane on top)
    phone.add(new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 1.40),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
    ));

    // Dynamic scanline (animated in loop)
    var scanline = new THREE.Mesh(
      new THREE.PlaneGeometry(0.64, 0.004),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.55 })
    );
    scanline.position.z = 0.047;
    phone.add(scanline);

    // Camera notch
    var notch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.002, 20),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    notch.rotation.x = Math.PI / 2;
    notch.position.set(0, 0.70, 0.046);
    phone.add(notch);

    // Home indicator
    var homeBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.006, 0.001),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.5 })
    );
    homeBar.position.set(0, -0.66, 0.047);
    phone.add(homeBar);

    // UI content lines on screen
    var uiLines = [
      { w: 0.38, x:  0.00, y:  0.44, o: 0.55 },
      { w: 0.26, x: -0.06, y:  0.34, o: 0.25 },
      { w: 0.52, x:  0.00, y:  0.18, o: 0.12 },
      { w: 0.44, x:  0.00, y:  0.10, o: 0.12 },
      { w: 0.48, x:  0.00, y:  0.02, o: 0.12 },
    ];
    uiLines.forEach(function(l) {
      var pts = [new THREE.Vector3(-l.w/2+l.x, l.y, 0.048), new THREE.Vector3(l.w/2+l.x, l.y, 0.048)];
      phone.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: l.o })
      ));
    });

    // Mini card on screen
    var cardPts = [
      new THREE.Vector3(-0.22, -0.12, 0.048), new THREE.Vector3( 0.22, -0.12, 0.048),
      new THREE.Vector3( 0.22, -0.50, 0.048), new THREE.Vector3(-0.22, -0.50, 0.048),
      new THREE.Vector3(-0.22, -0.12, 0.048)
    ];
    phone.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(cardPts),
      new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.30 })
    ));
    phone.add(new THREE.Mesh(
      new THREE.PlaneGeometry(0.44, 0.38),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.025, side: THREE.DoubleSide })
    ));
    // place card mesh at center of card area
    phone.children[phone.children.length-1].position.set(0, -0.31, 0.047);

    // Side buttons (left)
    [0.28, 0.10, -0.06].forEach(function(y) {
      phone.add(new THREE.Mesh(
        new THREE.BoxGeometry(0.005, 0.10, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1a2a1a, metalness: 0.9, roughness: 0.1 })
      )).position.set(-0.365, y, 0);
    });

    system.add(phone);

    /* ── 2. Orbital rings ── */
    var ringDefs = [
      // [radius, tube, rotX, rotY, rotZ, color, opacity, speed]
      [ 2.6, 0.004, Math.PI*0.30,  0.15, 0,           GREEN, 0.25, 0.12 ],
      [ 3.2, 0.003, Math.PI*0.55, -0.20, Math.PI*0.1, TEAL,  0.18, -0.08 ],
      [ 2.0, 0.005, Math.PI*0.10,  0.40, Math.PI*0.05,GREEN, 0.20, 0.18 ],
    ];
    var rings = [];
    ringDefs.forEach(function(d) {
      var torus = new THREE.Mesh(
        new THREE.TorusGeometry(d[0], d[1], 2, 160),
        new THREE.MeshBasicMaterial({ color: d[6+1], transparent: true, opacity: d[6] })
      );
      torus.rotation.x = d[2];
      torus.rotation.y = d[3];
      torus.rotation.z = d[4];
      torus.userData.speed = d[7];
      system.add(torus);
      rings.push(torus);
    });

    /* ── 3. Orbital satellite cards ── */
    // Each satellite: small UI fragment that travels on one of the rings
    var satellites = [];
    var satDefs = [
      // [ring idx, angle offset, size, label lines]
      [ 0, 0.0,   0.38, 0.24, 3 ],
      [ 0, 3.3,   0.32, 0.20, 2 ],
      [ 1, 1.2,   0.34, 0.22, 3 ],
      [ 1, 4.5,   0.30, 0.18, 2 ],
      [ 2, 0.8,   0.36, 0.22, 2 ],
      [ 2, 3.8,   0.28, 0.18, 3 ],
    ];

    satDefs.forEach(function(d, idx) {
      var ring = rings[d[0]];
      var w = d[2], h = d[3];
      var card = new THREE.Group();

      // Card face
      card.add(new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
      ));
      // Card border
      var hw = w/2, hh = h/2;
      var cp = [
        new THREE.Vector3(-hw, hh,0), new THREE.Vector3(hw, hh,0),
        new THREE.Vector3(hw,-hh,0), new THREE.Vector3(-hw,-hh,0),
        new THREE.Vector3(-hw, hh,0)
      ];
      card.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(cp),
        new THREE.LineBasicMaterial({ color: idx%2===0 ? GREEN : TEAL, transparent: true, opacity: 0.55 })
      ));
      // Content lines
      for (var li = 0; li < d[4]; li++) {
        var lw = (w - 0.06) * (0.55 + Math.random() * 0.40);
        var lpts = [
          new THREE.Vector3(-lw/2, hh - 0.05 - li*0.055, 0.001),
          new THREE.Vector3( lw/2, hh - 0.05 - li*0.055, 0.001)
        ];
        card.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(lpts),
          new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: li===0?0.50:0.18 })
        ));
      }

      card.userData = {
        ringIdx:  d[0],
        angle:    d[1],
        speed:    0.10 + Math.random() * 0.08,  // orbit speed
        ring:     ring,
        radius:   ringDefs[d[0]][0],
        rotX:     ringDefs[d[0]][2],
        rotY:     ringDefs[d[0]][3],
        rotZ:     ringDefs[d[0]][4],
      };
      system.add(card);
      satellites.push(card);
    });

    /* ── 4. Atmosphere particles ── */
    var atmCount = 250;
    var atmPos   = new Float32Array(atmCount * 3);
    for (var i = 0; i < atmCount; i++) {
      // Distribute in a sphere around the system
      var theta = Math.random() * Math.PI * 2;
      var phi   = Math.acos(2 * Math.random() - 1);
      var r     = 1.5 + Math.random() * 3.5;
      atmPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      atmPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      atmPos[i*3+2] = r * Math.cos(phi) - 1;
    }
    var atmGeo = new THREE.BufferGeometry();
    atmGeo.setAttribute('position', new THREE.BufferAttribute(atmPos, 3));
    system.add(new THREE.Points(atmGeo,
      new THREE.PointsMaterial({ color: GREEN, size: 0.03, transparent: true, opacity: 0.30 })
    ));

    /* ── Mouse parallax ── */
    var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    document.addEventListener('mousemove', function(e) {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 1.2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
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

      // Mouse-driven camera drift
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      // Whole system drifts with mouse + slow auto-rotation
      system.rotation.y = currentX * 0.4 + t * 0.04;
      system.rotation.x = currentY * 0.25;

      // Scanline animation on phone screen
      scanline.position.y = -0.68 + ((t * 0.4) % 1.36);

      // Rotate the orbital rings at their own speeds
      rings.forEach(function(ring) {
        ring.rotation.z += ring.userData.speed * 0.008;
      });

      // Move satellite cards along their orbital paths
      satellites.forEach(function(sat) {
        var u = sat.userData;
        u.angle += u.speed * 0.008;

        // Position on a tilted circle (matching its ring)
        var r = u.radius;
        var a = u.angle;
        // Point on XZ circle, then apply the ring's rotation matrix
        var local = new THREE.Vector3(r * Math.cos(a), 0, r * Math.sin(a));
        local.applyEuler(new THREE.Euler(u.rotX, u.rotY, u.rotZ));
        sat.position.copy(local);

        // Face toward the phone (billboard-ish)
        sat.lookAt(0, 0, 0);
        sat.rotateY(Math.PI); // flip to face outward
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

    // 3D experience is always dark — no toggle
    applyTheme('dark');

    if (themeBtn) themeBtn.addEventListener('click', function() {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  })();

})();
