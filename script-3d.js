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

    /* ── Floating geometric meshes ── */
    var meshes = [];
    var geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(0.85, 0),
    ];
    var wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e676, wireframe: true, transparent: true, opacity: 0.35
    });
    var solidMat = new THREE.MeshPhongMaterial({
      color: 0x00e676, transparent: true, opacity: 0.06,
      shininess: 80,
    });
    var light1 = new THREE.PointLight(0x00e676, 2, 15);
    light1.position.set(3, 3, 5);
    scene.add(light1);
    var light2 = new THREE.PointLight(0x00bcd4, 1, 12);
    light2.position.set(-3, -2, 4);
    scene.add(light2);

    var positions = [
      [-3.2, 1.5, -1.5], [3.0, -1.2, -2],
      [2.2, 2.2, -3], [-2.5, -1.8, -2.5],
      [0.5, 2.8, -2], [-1.2, -3.0, -1],
    ];
    positions.forEach(function(pos, i) {
      var geo = geometries[i % geometries.length];
      var group = new THREE.Group();
      group.add(new THREE.Mesh(geo, solidMat.clone()));
      group.add(new THREE.Mesh(geo, wireMat.clone()));
      var s = 0.4 + Math.random() * 0.6;
      group.scale.setScalar(s);
      group.position.set(pos[0], pos[1], pos[2]);
      group.rotation.set(
        Math.random()*Math.PI*2,
        Math.random()*Math.PI*2,
        Math.random()*Math.PI*2
      );
      group.userData = {
        rotSpeed: [(Math.random()-.5)*.008, (Math.random()-.5)*.008, (Math.random()-.5)*.006],
        floatAmp: 0.15 + Math.random() * 0.15,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: pos[1],
      };
      scene.add(group);
      meshes.push(group);
    });

    /* ── Particle field ── */
    var pCount = 180;
    var pPositions = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount; i++) {
      pPositions[i*3]   = (Math.random()-0.5) * 20;
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
