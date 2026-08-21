(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  window.addEventListener('load', function(){
    var pre = document.querySelector('.preloader');
    if(pre){
      setTimeout(function(){ pre.classList.add('done'); }, 350);
    }
  });

  /* ---------- scroll progress ---------- */
  var progress = document.querySelector('.progress');
  function updateProgress(){
    if(!progress) return;
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  }

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector('.nav');
  function onScroll(){
    if(nav){
      if(window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.nav-burger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if(burger && mobileMenu){
    burger.addEventListener('click', function(){
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('open');
      if(nav) nav.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        if(nav) nav.classList.remove('menu-open');
      });
    });
  }

  /* ---------- custom cursor ---------- */
  if(!reduceMotion && window.matchMedia('(pointer: fine)').matches){
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if(dot && ring){
      var mx=0,my=0, rx=0, ry=0;
      window.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
      });
      (function loop(){
        rx += (mx-rx)*0.15;
        ry += (my-ry)*0.15;
        ring.style.transform = 'translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a, button, .sector-card, .feature').forEach(function(el){
        el.addEventListener('mouseenter', function(){ ring.classList.add('is-active'); });
        el.addEventListener('mouseleave', function(){ ring.classList.remove('is-active'); });
      });
    }
  }

  /* ---------- magnetic buttons ---------- */
  if(!reduceMotion && window.matchMedia('(pointer: fine)').matches){
    document.querySelectorAll('.btn-primary').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2;
        var y = e.clientY - r.top - r.height/2;
        btn.style.transform = 'translate('+x*0.18+'px,'+y*0.3+'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var groups = {};
    revealEls.forEach(function(el){
      var group = el.getAttribute('data-group');
      if(!group) return;
      groups[group] = groups[group] || 0;
      el.style.setProperty('--d', (groups[group]*80) + 'ms');
      groups[group]++;
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold:0.4 });
    counters.forEach(function(el){ cio.observe(el); });
  }
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.round(target * eased);
      el.textContent = val + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- hero particle network canvas ---------- */
  var canvas = document.querySelector('.hero canvas');
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h, dpr;

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.parentElement.offsetWidth;
      h = canvas.parentElement.offsetHeight;
      canvas.width = w*dpr;
      canvas.height = h*dpr;
      canvas.style.width = w+'px';
      canvas.style.height = h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = Math.min(70, Math.floor((w*h)/18000));
      particles = [];
      for(var i=0;i<count;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          vx: (Math.random()-0.5)*0.25,
          vy: (Math.random()-0.5)*0.25
        });
      }
    }

    var accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c9a24b';
    function hexToRgba(hex, a){
      hex = hex.replace('#','');
      var r = parseInt(hex.substring(0,2),16);
      var g = parseInt(hex.substring(2,4),16);
      var b = parseInt(hex.substring(4,6),16);
      return 'rgba('+r+','+g+','+b+','+a+')';
    }

    function tick(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(function(p){
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > w) p.vx *= -1;
        if(p.y < 0 || p.y > h) p.vy *= -1;
      });
      for(var i=0;i<particles.length;i++){
        for(var j=i+1;j<particles.length;j++){
          var a = particles[i], b = particles[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var dist = Math.sqrt(dx*dx+dy*dy);
          if(dist < 140){
            ctx.strokeStyle = hexToRgba(accentColor, (1 - dist/140) * 0.18);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(function(p){
        ctx.fillStyle = hexToRgba(accentColor, 0.55);
        ctx.beginPath();
        ctx.arc(p.x,p.y,1.6,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    tick();
  }

  /* ---------- gallery picker + lightbox ---------- */
  var pickBtns = document.querySelectorAll('.gallery-pick');
  if(pickBtns.length){
    var sets = document.querySelectorAll('.gallery-set');
    pickBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        pickBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-target');
        sets.forEach(function(s){
          s.classList.toggle('active', s.getAttribute('data-set') === target);
        });
        var display = document.getElementById('gallery-display');
        if(display) display.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
  }

  var lightbox = document.querySelector('.lightbox');
  if(lightbox){
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('.lightbox-cap');
    document.querySelectorAll('.gallery-set .gallery-item img').forEach(function(img){
      img.addEventListener('click', function(){
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.alt;
        lightbox.classList.add('open');
      });
    });
    function closeLightbox(){ lightbox.classList.remove('open'); lbImg.src = ''; }
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });
  }

})();
