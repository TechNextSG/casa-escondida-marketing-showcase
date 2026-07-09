(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var fine   = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

// ── Plankton / star field ──
(function(){var s=document.getElementById('stars');if(!s)return;var h='';for(var i=0;i<60;i++){var sz=(Math.sin(i*7.3)*0.5+0.5)*2+1;var x=(i*37)%100;var y=(i*53)%100;var d=2.5+(i%5);h+='<span style="left:'+x+'%;top:'+y+'%;width:'+sz.toFixed(1)+'px;height:'+sz.toFixed(1)+'px;--d:'+d+'s;--delay:'+(i%7)*0.4+'s"></span>';}s.innerHTML=h;})();

// ── Damask line pattern on dark ocean sections (subtle teal, matching the main site) ──
(function(){
  var svg="<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><g fill='none' stroke='rgba(77,194,232,0.10)' stroke-width='0.85' stroke-linecap='round' stroke-linejoin='round'><path d='M90,8 L172,90 L90,172 L8,90 Z'/><path d='M90,36 L144,90 L90,144 L36,90 Z'/><circle cx='90' cy='90' r='26'/><circle cx='90' cy='90' r='15'/><circle cx='90' cy='90' r='5' fill='rgba(77,194,232,0.07)'/><ellipse cx='90' cy='54' rx='8' ry='20'/><ellipse cx='126' cy='90' rx='20' ry='8'/><ellipse cx='90' cy='126' rx='8' ry='20'/><ellipse cx='54' cy='90' rx='20' ry='8'/><path d='M90,64 Q100,52 90,36 Q80,52 90,64'/><path d='M116,90 Q128,100 144,90 Q128,80 116,90'/><path d='M90,116 Q100,128 90,144 Q80,128 90,116'/><path d='M64,90 Q52,100 36,90 Q52,80 64,90'/><path d='M108,72 Q125,55 140,40 Q148,52 136,64 Q124,70 108,72Z'/><path d='M72,108 Q55,125 40,140 Q52,148 64,136 Q70,124 72,108Z'/><path d='M108,108 Q125,125 140,140 Q128,148 116,136 Q110,124 108,108Z'/><path d='M72,72 Q55,55 40,40 Q52,28 64,44 Q70,56 72,72Z'/><circle cx='90' cy='0' r='7'/><circle cx='180' cy='90' r='7'/><circle cx='90' cy='180' r='7'/><circle cx='0' cy='90' r='7'/><circle cx='0' cy='0' r='5'/><circle cx='180' cy='0' r='5'/><circle cx='0' cy='180' r='5'/><circle cx='180' cy='180' r='5'/><path d='M0,0 Q22,18 18,38 Q14,54 28,60'/><path d='M180,0 Q158,18 162,38 Q166,54 152,60'/><path d='M0,180 Q22,162 18,142 Q14,126 28,120'/><path d='M180,180 Q158,162 162,142 Q166,126 152,120'/></g></svg>";
  var enc='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
  document.querySelectorAll('section,footer').forEach(function(el){
    if(el.classList.contains('hero-bg'))return;
    var bg=el.getAttribute('style')||'';
    if(!/#071427|#0c2038|#04080f/.test(bg))return;
    var cur=getComputedStyle(el).backgroundImage;
    if(cur && cur!=='none'){ el.style.backgroundImage=enc+', '+cur; el.style.backgroundSize='180px 180px, auto'; el.style.backgroundRepeat='repeat, no-repeat'; }
    else { el.style.backgroundImage=enc; el.style.backgroundSize='180px 180px'; el.style.backgroundRepeat='repeat'; }
  });
})();

// ── Respect reduced-motion: freeze hero video on its poster ──
if(reduce){var hv=document.querySelector('.hero-video');if(hv){hv.autoplay=false;hv.removeAttribute('autoplay');try{hv.pause();}catch(e){}}}

// ── Showcase videos (if any): autoplay only while in view ──
(function(){
  var cards=[].slice.call(document.querySelectorAll('.vid-card'));
  if(!cards.length)return;
  if(reduce){cards.forEach(function(c){var v=c.querySelector('video');if(v){v.autoplay=false;v.removeAttribute('autoplay');try{v.pause();}catch(e){}}});return;}
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){
    var v=e.target.querySelector('video');if(!v)return;
    if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    else{v.pause();}
  });},{threshold:.35});
  cards.forEach(function(c){if(c.querySelector('video'))vio.observe(c);});
})();

// ── Marquee: duplicate track for seamless loop ──
(function(){var mq=document.getElementById('mq');if(mq)mq.innerHTML+=mq.innerHTML;})();

// ── Reveal on scroll (all variants) ──
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-s').forEach(function(el){io.observe(el);});

// ── Scroll progress bar + back-to-top + nav active link ──
var prog=document.getElementById('progress'), toTop=document.getElementById('toTop'), nav=document.getElementById('nav');
var sections=[].slice.call(document.querySelectorAll('section[id]'));
var navLinks=[].slice.call(document.querySelectorAll('#nav a[href^="#"]'));
function onScroll(){
  var st=window.pageYOffset||document.documentElement.scrollTop;
  var h=document.documentElement.scrollHeight-window.innerHeight;
  if(prog)prog.style.width=(h>0?(st/h*100):0)+'%';
  if(toTop)toTop.classList.toggle('show',st>600);
  if(nav)nav.style.background= st>40 ? 'rgba(4,8,15,.92)' : 'rgba(4,8,15,.55)';
  var cur='';
  sections.forEach(function(s){ if(st>=s.offsetTop-140) cur=s.id; });
  navLinks.forEach(function(a){ a.classList.toggle('nav-active', a.getAttribute('href')==='#'+cur); });
}
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
if(toTop)toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});

// ── Count-up KPIs ──
function countUp(el){
  var target=parseFloat(el.getAttribute('data-count')), suf=el.getAttribute('data-suffix')||'';
  var dec=(target%1!==0)?1:0;
  el.classList.add('kpi-pop');
  if(reduce){el.textContent=target.toFixed(dec)+suf;return;}
  var start=null, dur=1500;
  function step(t){ if(!start)start=t; var p=Math.min((t-start)/dur,1); var e=1-Math.pow(1-p,3);
    el.textContent=(target*e).toFixed(dec)+suf; if(p<1)requestAnimationFrame(step); else el.textContent=target.toFixed(dec)+suf; }
  requestAnimationFrame(step);
}
var kio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);kio.unobserve(e.target);}});},{threshold:.6});
document.querySelectorAll('[data-count]').forEach(function(el){kio.observe(el);});

if(fine && !reduce){
  // ── Cursor glow ──
  var glow=document.getElementById('cursor-glow'), gx=0,gy=0,cx=0,cy=0,glowOn=false;
  document.addEventListener('mousemove',function(e){gx=e.clientX;gy=e.clientY;if(!glowOn){glowOn=true;glow.style.opacity='1';}});
  document.addEventListener('mouseleave',function(){glowOn=false;glow.style.opacity='0';});
  (function loop(){cx+=(gx-cx)*.15;cy+=(gy-cy)*.15;glow.style.left=cx+'px';glow.style.top=cy+'px';requestAnimationFrame(loop);})();

  // ── Card 3D tilt + spotlight (every card type) ──
  document.querySelectorAll('.pillar-card, .r-card, .vid-card, .panel, .ai-card, .icard').forEach(function(card){
    var isVid=card.classList.contains('vid-card');
    var spot=null;
    if(!isVid){spot=document.createElement('div');spot.className='spot';card.insertBefore(spot,card.firstChild);}
    var amt=card.classList.contains('panel')?4:isVid?5:card.classList.contains('ai-card')?6:8;
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      card.style.transform='perspective(850px) rotateY('+((px-.5)*amt).toFixed(2)+'deg) rotateX('+((.5-py)*amt).toFixed(2)+'deg) translateY(-6px)';
      if(spot){spot.style.setProperty('--mx',(px*100)+'%');spot.style.setProperty('--my',(py*100)+'%');}
    });
    card.addEventListener('mouseleave',function(){card.style.transform='';});
  });

  // ── Magnetic buttons ──
  document.querySelectorAll('.btn').forEach(function(b){
    b.classList.add('mag');
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.35-2).toFixed(1)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });

  // ── Hero parallax on mouse ──
  var hero=document.getElementById('hero-inner');
  if(hero){document.querySelector('.hero-bg').addEventListener('mousemove',function(e){
    var dx=(e.clientX/window.innerWidth-.5), dy=(e.clientY/window.innerHeight-.5);
    hero.style.transform='translate('+(dx*-16).toFixed(1)+'px,'+(dy*-12).toFixed(1)+'px)';});}
}

// ── Ripple on buttons (all devices) ──
document.querySelectorAll('.btn').forEach(function(b){
  b.addEventListener('click',function(e){var r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),
    rp=document.createElement('span');rp.className='ripple';rp.style.width=rp.style.height=d+'px';
    rp.style.left=(e.clientX-r.left-d/2)+'px';rp.style.top=(e.clientY-r.top-d/2)+'px';
    b.appendChild(rp);setTimeout(function(){rp.remove();},650);});
});

// ── Before/After slider (drag to reveal) ──
(function(){
  var ba=document.getElementById('ba1');if(!ba)return;
  var after=ba.querySelector('.after'),h=ba.querySelector('.handle'),drag=false;
  function set(clientX){var r=ba.getBoundingClientRect();var p=Math.max(0,Math.min(1,(clientX-r.left)/r.width));
    after.style.clipPath='inset(0 '+((1-p)*100).toFixed(1)+'% 0 0)';h.style.left=(p*100).toFixed(1)+'%';}
  ba.addEventListener('mousedown',function(e){drag=true;set(e.clientX);e.preventDefault();});
  window.addEventListener('mousemove',function(e){if(drag)set(e.clientX);});
  window.addEventListener('mouseup',function(){drag=false;});
  ba.addEventListener('touchstart',function(e){set(e.touches[0].clientX);},{passive:true});
  ba.addEventListener('touchmove',function(e){set(e.touches[0].clientX);},{passive:true});
})();

// ── Capability cards link to their detail sections ──
(function(){
  var ids=['svc-social','svc-editing','svc-seo','svc-geo','svc-ads','svc-analytics','svc-reviews'];
  document.querySelectorAll('#pillars .pillar-card').forEach(function(card,i){
    if(!ids[i])return;var t=document.getElementById(ids[i]);if(!t)return;
    card.style.cursor='pointer';
    card.addEventListener('click',function(){t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});});
  });
})();
})();
