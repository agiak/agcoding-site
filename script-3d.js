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
    var light1 = new THREE.PointLight(0x00e676, 2.5, 18);
    light1.position.set(3, 3, 5);
    scene.add(light1);
    var light2 = new THREE.PointLight(0x00bcd4, 1.2, 14);
    light2.position.set(-4, -2, 4);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0x00e676, 0.08));

    /* ── Phone builder ── */
    var meshes = [];

    function makePhone(scale, uiRows, showCard) {
      var g = new THREE.Group();
      var green = 0x00e676;

      // Body shell — solid very transparent
      var bodyGeo = new THREE.BoxGeometry(0.58, 1.18, 0.07);
      g.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({
        color: green, transparent: true, opacity: 0.05, shininess: 60
      })));
      // Body wireframe
      g.add(new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({
        color: green, wireframe: true, transparent: true, opacity: 0.28
      })));

      // Screen fill
      var screenGeo = new THREE.PlaneGeometry(0.44, 0.90);
      g.add(new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({
        color: green, transparent: true, opacity: 0.05, side: THREE.DoubleSide
      })));
      // Screen edge
      var edgePts = [
        new THREE.Vector3(-0.22,  0.45, 0.042),
        new THREE.Vector3( 0.22,  0.45, 0.042),
        new THREE.Vector3( 0.22, -0.45, 0.042),
        new THREE.Vector3(-0.22, -0.45, 0.042),
        new THREE.Vector3(-0.22,  0.45, 0.042),
      ];
      var edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
      g.add(new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({
        color: green, transparent: true, opacity: 0.55
      })));

      // Camera pill
      var camGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.001, 16);
      var cam = new THREE.Mesh(camGeo, new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: 0.5 }));
      cam.rotation.x = Math.PI / 2;
      cam.position.set(0, 0.505, 0.042);
      g.add(cam);

      // Home bar
      var barGeo = new THREE.BoxGeometry(0.14, 0.006, 0.001);
      var bar = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: 0.55 }));
      bar.position.set(0, -0.415, 0.042);
      g.add(bar);

      // UI rows (status bar + content lines)
      var rowDefs = uiRows || [
        { w: 0.32, x: -0.04, y: 0.30, o: 0.55 }, // title line
        { w: 0.22, x: -0.04, y: 0.20, o: 0.25 }, // subtitle
        { w: 0.36, x:  0.00, y: 0.08, o: 0.20 },
        { w: 0.28, x:  0.00, y: 0.00, o: 0.20 },
        { w: 0.34, x:  0.00, y:-0.08, o: 0.20 },
      ];
      rowDefs.forEach(function(r) {
        var rGeo = new THREE.BoxGeometry(r.w, 0.007, 0.001);
        var rMesh = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
          color: green, transparent: true, opacity: r.o
        }));
        rMesh.position.set(r.x, r.y, 0.043);
        g.add(rMesh);
      });

      // Optional floating card on screen
      if (showCard) {
        var cardPts = [
          new THREE.Vector3(-0.17, -0.14, 0.044),
          new THREE.Vector3( 0.17, -0.14, 0.044),
          new THREE.Vector3( 0.17, -0.38, 0.044),
          new THREE.Vector3(-0.17, -0.38, 0.044),
          new THREE.Vector3(-0.17, -0.14, 0.044),
        ];
        var cardGeo = new THREE.BufferGeometry().setFromPoints(cardPts);
        g.add(new THREE.Line(cardGeo, new THREE.LineBasicMaterial({
          color: green, transparent: true, opacity: 0.35
        })));
        // metric bar inside card
        var mGeo = new THREE.BoxGeometry(0.22, 0.006, 0.001);
        var mMesh = new THREE.Mesh(mGeo, new THREE.MeshBasicMaterial({
          color: green, transparent: true, opacity: 0.45
        }));
        mMesh.position.set(-0.025, -0.24, 0.045);
        g.add(mMesh);
        // small metric bar (shorter — like 87%)
        var mGeo2 = new THREE.BoxGeometry(0.16, 0.006, 0.001);
        var mMesh2 = new THREE.Mesh(mGeo2, new THREE.MeshBasicMaterial({
          color: green, transparent: true, opacity: 0.28
        }));
        mMesh2.position.set(-0.057, -0.28, 0.045);
        g.add(mMesh2);
      }

      g.scale.setScalar(scale || 1);
      return g;
    }

    /* ── Place phones in scene ── */
    var phoneDefs = [
      // [x, y, z, scale, rotY, rotZ, showCard]
      [ 3.4,  0.5, -1.2,  1.15,  -0.3,  0.08, true  ],
      [-3.2,  0.8, -1.5,  0.90,   0.4, -0.10, false ],
      [ 2.2, -2.0, -2.2,  0.70,  -0.5,  0.20, false ],
      [-1.6, -2.4, -1.8,  0.80,   0.3,  0.12, true  ],
      [ 0.2,  2.8, -2.8,  0.60,   0.1, -0.06, false ],
    ];
    phoneDefs.forEach(function(d) {
      var phone = makePhone(d[3], null, d[6]);
      phone.position.set(d[0], d[1], d[2]);
      phone.rotation.y = d[4];
      phone.rotation.z = d[5];
      phone.userData = {
        rotSpeed: [(Math.random()-0.5)*0.003, (Math.random()-0.5)*0.005, (Math.random()-0.5)*0.002],
        floatAmp:   0.12 + Math.random() * 0.12,
        floatSpeed: 0.35 + Math.random() * 0.4,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: d[1],
      };
      scene.add(phone);
      meshes.push(phone);
    });

    /* ── Floating code lines (look like source code) ── */
    var codeGroup = new THREE.Group();
    var codeDefs = [
      // [x, y, z, numLines, indent]
      [-5.5,  1.2, -3.5, 12, 0.3],
      [ 5.0, -1.0, -4.0, 10, 0.2],
    ];
    codeDefs.forEach(function(def) {
      var lineWidths = [0.55,0.38,0.60,0.28,0.48,0.35,0.52,0.42,0.38,0.58,0.32,0.46];
      var lineIndents = [0,0.12,0.24,0.24,0.36,0.24,0.12,0.24,0.36,0.12,0,0.12];
      for (var r = 0; r < def[3]; r++) {
        var indent = lineIndents[r % lineIndents.length] * def[4] / 0.3;
        var w = lineWidths[r % lineWidths.length];
        var pts = [new THREE.Vector3(indent, 0, 0), new THREE.Vector3(indent + w, 0, 0)];
        var geo = new THREE.BufferGeometry().setFromPoints(pts);
        var line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          color: 0x00e676, transparent: true, opacity: 0.10 + Math.random() * 0.08
        }));
        line.position.set(def[0], def[1] - r * 0.14, def[2]);
        codeGroup.add(line);
      }
    });
    scene.add(codeGroup);
    codeGroup.userData = {
      floatAmp: 0.08, floatSpeed: 0.22, floatOffset: 0.5, baseY: 0,
    };

    /* ── Particle field (data stream dots) ── */
    var pCount = 200;
    var pPositions = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount; i++) {
      pPositions[i*3]   = (Math.random()-0.5) * 22;
      pPositions[i*3+1] = (Math.random()-0.5) * 14;
      pPositions[i*3+2] = (Math.random()-0.5) * 8 - 4;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    var pMat = new THREE.PointsMaterial({ color: 0x00e676, size: 0.04, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(pGeo, pMat));

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

      // float the code line clusters
      var cu = codeGroup.userData;
      codeGroup.position.y = Math.sin(t * cu.floatSpeed + cu.floatOffset) * cu.floatAmp;

      meshes.forEach(function(m) {
        var u = m.userData;
        m.rotation.x += u.rotSpeed[0];
        m.rotation.y += u.rotSpeed[1];
        m.rotation.z += u.rotSpeed[2];
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
    var sunSVG    = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>';
    var moonSVG   = '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>';
    function applyTheme(t) {
      root.setAttribute('data-theme', t);
      if (navLogo) navLogo.src = 'assets/logo-cream.png'; // always cream on dark bg
      if (themeIcon) themeIcon.innerHTML = t==='dark' ? moonSVG : sunSVG;
      try { localStorage.setItem('ag-theme', t); } catch(e) {}
    }
    var saved = 'dark'; try { saved = localStorage.getItem('ag-theme') || 'dark'; } catch(e) {}
    applyTheme(saved);
    if (themeBtn) themeBtn.addEventListener('click', function() {
      applyTheme(root.getAttribute('data-theme')==='dark' ? 'light' : 'dark');
    });
  })();

})();
