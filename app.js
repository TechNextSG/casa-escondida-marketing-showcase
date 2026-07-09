(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var fine   = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

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

// ── AI "Generate" micro-interaction ──
(function(){
  var btn = document.getElementById('genBtn'), grid = document.getElementById('aiGrid');
  if(!btn || !grid) return;
  var pool = ['img/showcase/uw-2.webp','img/showcase/uw-4.jpg','img/showcase/uw-5.jpg','img/showcase/uw-7.webp','img/showcase/uw-8.webp','img/showcase/uw-10.webp','img/showcase/rf-2.jpg','img/showcase/rf-6.webp','img/showcase/uw-3.webp','img/showcase/rf-1.webp','img/showcase/rf-3.webp'];
  var caps = ['AI image — vivid macro','AI image — reef study','AI image — critter portrait','AI image — coral scene','AI image — signature species'];
  var pi = 0, ci = 0;
  btn.addEventListener('click', function(){
    var slot = grid.querySelector('.ai-card2[data-slot]:not(.filled)');
    if(!slot){ // all filled: reset slots to generate again
      grid.querySelectorAll('.ai-card2[data-slot]').forEach(function(s){ s.classList.remove('filled'); s.removeAttribute('data-lightbox'); var i=s.querySelector('img'); if(i) i.src=''; });
      slot = grid.querySelector('.ai-card2[data-slot]:not(.filled)');
    }
    if(!slot) return;
    var src = pool[pi % pool.length]; pi++;
    var cap = caps[ci % caps.length]; ci++;
    btn.classList.add('busy');
    if(reduce){ finish(); return; }
    slot.classList.add('generating');
    var im = slot.querySelector('img');
    // preload
    var pre = new Image(); pre.src = src;
    setTimeout(finish, 1150);
    function finish(){
      if(im) im.src = src;
      slot.classList.remove('generating');
      slot.classList.add('filled');
      slot.setAttribute('data-lightbox', src);
      slot.setAttribute('data-cap', cap);
      btn.classList.remove('busy');
    }
  });
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
