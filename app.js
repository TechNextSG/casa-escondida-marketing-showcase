(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

// ── Reveal on scroll ──
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.rv,.rvl,.rvr').forEach(function(el){ io.observe(el); });

// ── Nav scrolled state + progress bar + back-to-top ──
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

// ── Marquee: duplicate for seamless loop ──
(function(){ var mq=document.getElementById('mq'); if(mq) mq.innerHTML += mq.innerHTML; })();

// ── Count-up numbers ──
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

// ── Content gallery filter ──
(function(){
  var filters = document.getElementById('ecoFilters'), grid = document.getElementById('ecoGrid');
  if(!filters || !grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.eco-card'));
  filters.addEventListener('click', function(e){
    var btn = e.target.closest('.eco-filter'); if(!btn) return;
    filters.querySelectorAll('.eco-filter').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var cat = btn.getAttribute('data-cat');
    cards.forEach(function(c){
      var show = (cat==='all' || c.getAttribute('data-cat')===cat);
      c.classList.toggle('hide', !show);
    });
  });
})();

// ── Before/After slider ──
(function(){
  var ba = document.getElementById('ba1'); if(!ba) return;
  var after = ba.querySelector('.after'), h = ba.querySelector('.handle'), drag=false;
  function set(clientX){
    var r = ba.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (clientX-r.left)/r.width));
    after.style.clipPath = 'inset(0 '+((1-p)*100).toFixed(1)+'% 0 0)';
    h.style.left = (p*100).toFixed(1)+'%';
  }
  ba.addEventListener('mousedown', function(e){ drag=true; set(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', function(e){ if(drag) set(e.clientX); });
  window.addEventListener('mouseup', function(){ drag=false; });
  ba.addEventListener('touchstart', function(e){ set(e.touches[0].clientX); }, {passive:true});
  ba.addEventListener('touchmove', function(e){ set(e.touches[0].clientX); }, {passive:true});
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
