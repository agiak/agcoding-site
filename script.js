// AGcoding — scroll motion + interactions (vanilla)
(function(){
  'use strict';

  /* marquee fill */
  var mq = document.getElementById('mqTrack');
  if(mq){
    var items = ['Android development','iOS development','Native performance','Google Play','App Store','Kotlin & Swift','End-to-end delivery','Startups & product teams'];
    var html = '';
    for(var r=0;r<2;r++){ items.forEach(function(t){ html += '<span class="mq-item">'+t+'</span>'; }); }
    mq.innerHTML = html;
  }

  /* scroll progress bar */
  var bar = document.getElementById('progressBar');
  /* nav scrolled state */
  var nav = document.getElementById('nav');

  function onScroll(){
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if(bar) bar.style.transform = 'scaleX(' + (h>0 ? y/h : 0) + ')';
    if(nav) nav.classList.toggle('scrolled', y > 30);
    // parallax (skip in calm mode)
    var calm = document.documentElement.getAttribute('data-motion') === 'calm';
    for(var i=0;i<plx.length;i++){
      var el = plx[i];
      var sp = calm ? 0 : parseFloat(el.dataset.parallax);
      el.style.transform = 'translate3d(0,' + (y*sp) + 'px,0)';
    }
  }
  var plx = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  window.addEventListener('scroll', function(){ window.requestAnimationFrame(onScroll); }, {passive:true});

  /* reveal on scroll (with motion respect) */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if(reduce){
    reveals.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          if(e.target.hasAttribute('data-count')) countUp(e.target);
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
    // catch already-visible
    setTimeout(function(){
      reveals.forEach(function(el){
        if(el.getBoundingClientRect().top < window.innerHeight){
          el.classList.add('in');
          if(el.hasAttribute('data-count')) countUp(el);
        }
      });
    }, 60);
  }

  /* number count-up */
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.round(target * eased);
      el.firstChild.nodeValue = val + '';
      if(p < 1) window.requestAnimationFrame(step);
      else el.firstChild.nodeValue = target + '';
    }
    if(reduce){ el.firstChild.nodeValue = target + suffix; return; }
    window.requestAnimationFrame(step);
  }

  /* hero 3D tilt on mouse */
  var stage = document.getElementById('heroVisual');
  if(stage && !reduce && window.matchMedia('(pointer:fine)').matches){
    var tilt = stage.querySelectorAll('[data-tilt]');
    stage.addEventListener('mousemove', function(e){
      if(document.documentElement.getAttribute('data-motion') === 'calm') return;
      var r = stage.getBoundingClientRect();
      var dx = (e.clientX - r.left)/r.width - 0.5;
      var dy = (e.clientY - r.top)/r.height - 0.5;
      tilt.forEach(function(el){
        var d = parseFloat(el.dataset.tilt);
        el.style.transform = el.dataset.base + ' translate(' + (dx*d) + 'px,' + (dy*d) + 'px)';
      });
    });
    stage.addEventListener('mouseleave', function(){
      tilt.forEach(function(el){ el.style.transform = el.dataset.base; });
    });
  }

  /* mobile menu */
  var ham = document.getElementById('hamburger');
  var mm = document.getElementById('mobileMenu');
  if(ham){
    ham.addEventListener('click', function(){
      var open = mm.classList.toggle('open');
      ham.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mm.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mm.classList.remove('open'); ham.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  onScroll();
})();



// ── THEME TOGGLE (vanilla) ────────────────────────────────
(function(){
  var root = document.documentElement;
  var navLogo = document.getElementById('navLogo');
  var themeIcon = document.getElementById('themeIcon');
  var themeBtn = document.getElementById('themeBtn');

  var sunSVG = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>';
  var moonSVG = '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (navLogo) navLogo.src = theme === 'dark' ? 'assets/logo-cream.png' : 'assets/logo-ink.png';
    if (themeIcon) themeIcon.innerHTML = theme === 'dark' ? moonSVG : sunSVG;
    try { localStorage.setItem('ag-theme', theme); } catch(e) {}
  }

  // restore saved preference
  var saved = 'light';
  try { saved = localStorage.getItem('ag-theme') || 'light'; } catch(e) {}
  applyTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }
})();
