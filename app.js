(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var fine   = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

// ── Ambient day <-> night cycle (slow) — recolours the whole site + shows orbs ──
(function(){
  var root = document.documentElement;
  var isNight = /[?&]night/.test(location.search);   // ?night forces night (demo/verify)
  if(isNight) root.classList.add('night');
  setInterval(function(){
    isNight = !isNight;
    root.classList.toggle('night', isNight);
  }, 13000);
})();

// ── Reveal on scroll ──
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
}, {threshold:.12});
document.querySelectorAll('.rv,.rvl,.rvr').forEach(function(el){ io.observe(el); });

// ── Nav scrolled + progress bar + back-to-top ──
var nav = document.getElementById('nav'), bar = document.getElementById('pg-bar'), toTop = document.getElementById('toTop');
function onScroll(){
  var st = window.pageYOffset || document.documentElement.scrollTop;
  var h = document.documentElement.scrollHeight - window.innerHeight;
  if(nav) nav.classList.toggle('scrolled', st > 40);
  if(bar) bar.style.width = (h>0 ? (st/h*100) : 0) + '%';
  if(toTop) toTop.classList.toggle('show', st > 640);
}
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:reduce?'auto':'smooth'}); });

// ── Reduced motion: freeze hero video ──
if(reduce){ var hv=document.querySelector('.hero-video'); if(hv){ hv.removeAttribute('autoplay'); try{hv.pause();}catch(e){} } }

// ── Marquee seamless loop ──
(function(){ var mq=document.getElementById('mq'); if(mq) mq.innerHTML += mq.innerHTML; })();

// ── Count-up ──
function countUp(el){
  var target = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix')||'';
  var dec = (target % 1 !== 0) ? 1 : 0;
  if(reduce){ el.textContent = target.toFixed(dec)+suf; return; }
  var start=null, dur=1400;
  function step(t){ if(!start)start=t; var p=Math.min((t-start)/dur,1); var e=1-Math.pow(1-p,3);
    el.textContent = (target*e).toFixed(dec)+suf;
    if(p<1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec)+suf; }
  requestAnimationFrame(step);
}
var kio = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); kio.unobserve(e.target); } });
}, {threshold:.6});
document.querySelectorAll('[data-count]').forEach(function(el){ kio.observe(el); });

// ── 3D tilt + spotlight on interactive cards (site-wide) ──
if(fine && !reduce){
  function applyTilt(card){
    if(card.dataset.tiltReady) return; card.dataset.tiltReady = '1';
    card.classList.add('tilt');
    var spot = card.querySelector(':scope > .spot');
    if(!spot){
      if(getComputedStyle(card).position === 'static') card.style.position = 'relative';
      spot = document.createElement('div'); spot.className = 'spot';
      card.insertBefore(spot, card.firstChild);
    }
    var big = card.classList.contains('phone') || card.classList.contains('browser');
    var amt = big ? 4 : 7;
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left)/r.width, py = (e.clientY - r.top)/r.height;
      card.style.transform = 'perspective(900px) rotateY('+((px-.5)*amt).toFixed(2)+'deg) rotateX('+((.5-py)*amt).toFixed(2)+'deg) translateY(-4px)';
      spot.style.setProperty('--mx',(px*100)+'%'); spot.style.setProperty('--my',(py*100)+'%');
    });
    card.addEventListener('mouseleave', function(){ card.style.transform=''; });
  }
  var sel = '.tilt, .stat-card, .cap-card, .swot-card, .plan-card, .panel, .rtable-wrap, .takeaway';
  document.querySelectorAll(sel).forEach(applyTilt);
}

// ── Lightbox ──
(function(){
  var lb = document.getElementById('lightbox'); if(!lb) return;
  var img = document.getElementById('lbImg'), cap = document.getElementById('lbCap'), close = document.getElementById('lbClose');
  function open(src, caption){ img.src = src; cap.textContent = caption||''; lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function shut(){ lb.classList.remove('open'); document.body.style.overflow=''; setTimeout(function(){ if(!lb.classList.contains('open')) img.src=''; }, 300); }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-lightbox]');
    if(t){ var src = t.getAttribute('data-lightbox'); if(src){ e.preventDefault(); open(src, t.getAttribute('data-cap')); } return; }
  });
  close.addEventListener('click', shut);
  lb.addEventListener('click', function(e){ if(e.target===lb) shut(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') shut(); });
})();

// ── Before/After slider (guarded) ──
(function(){
  var ba = document.getElementById('ba1'); if(!ba) return;
  var after = ba.querySelector('.after'), h = ba.querySelector('.handle'), drag=false;
  function set(clientX){ var r = ba.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (clientX-r.left)/r.width));
    after.style.clipPath = 'inset(0 '+((1-p)*100).toFixed(1)+'% 0 0)'; h.style.left = (p*100).toFixed(1)+'%'; }
  ba.addEventListener('mousedown', function(e){ drag=true; set(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', function(e){ if(drag) set(e.clientX); });
  window.addEventListener('mouseup', function(){ drag=false; });
  ba.addEventListener('touchstart', function(e){ set(e.touches[0].clientX); }, {passive:true});
  ba.addEventListener('touchmove', function(e){ set(e.touches[0].clientX); }, {passive:true});
})();

// ── Content gallery filter (guarded — research page) ──
(function(){
  var filters = document.getElementById('ecoFilters'), grid = document.getElementById('ecoGrid');
  if(!filters || !grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.eco-card'));
  filters.addEventListener('click', function(e){
    var btn = e.target.closest('.eco-filter'); if(!btn) return;
    filters.querySelectorAll('.eco-filter').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var cat = btn.getAttribute('data-cat');
    cards.forEach(function(c){ c.classList.toggle('hide', !(cat==='all' || c.getAttribute('data-cat')===cat)); });
  });
})();

// ── Video reels/clips: autoplay muted while in view, pause off-screen ──
(function(){
  var boxes = [].slice.call(document.querySelectorAll('[data-video]'));
  if(!boxes.length) return;
  function play(box){ var v=box.querySelector('video'); if(!v) return; box.classList.add('playing'); var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
  function stop(box){ var v=box.querySelector('video'); if(!v) return; box.classList.remove('playing'); try{v.pause();}catch(e){} }
  // click toggles play/pause (mobile / manual control)
  boxes.forEach(function(box){ box.addEventListener('click', function(){ var v=box.querySelector('video'); if(!v)return; if(v.paused) play(box); else stop(box); }); });
  if(reduce) return; // reduced motion: show the poster frame, no autoplay
  var vio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) play(e.target); else stop(e.target); }); }, {threshold:.3});
  boxes.forEach(function(b){ vio.observe(b); });
})();

// ── Smooth in-page anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var id = a.getAttribute('href'); if(id.length<2) return;
    var t = document.querySelector(id); if(!t) return;
    e.preventDefault();
    t.scrollIntoView({behavior:reduce?'auto':'smooth', block:'start'});
  });
});
})();
