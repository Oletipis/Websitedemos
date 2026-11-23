/* Shared motion layer for the hospitality demos. Respects reduced motion. */
(function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var d = document;

  var css = [
    '.an-bar{position:fixed;top:0;left:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);z-index:999;pointer-events:none}',
    '.an-w{display:inline-block;opacity:0;transform:translateY(.55em) rotate(2deg);animation:anW .9s cubic-bezier(.2,.7,.2,1) forwards}',
    '@keyframes anW{to{opacity:1;transform:none}}',
    '.an-in{opacity:0;transform:translateY(22px);animation:anW 1s cubic-bezier(.2,.7,.2,1) forwards}',
    '.an-kb{animation:anKb 18s ease-in-out infinite alternate;will-change:transform}',
    '@keyframes anKb{from{scale:1.02}to{scale:1.12}}',
    '.an-up{opacity:0;transform:translateY(34px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}',
    '.an-up.an-on{opacity:1;transform:none}',
    '.an-img{clip-path:inset(0 0 100% 0);transform:scale(1.14);transition:clip-path 1.2s cubic-bezier(.7,0,.2,1),transform 1.8s cubic-bezier(.2,.7,.2,1)}',
    '.an-img.an-on{clip-path:inset(0 0 0 0);transform:scale(1)}',
    '.an-hov{transition:translate .35s ease,box-shadow .35s ease}',
    '.an-hov:hover{translate:0 -6px;box-shadow:0 22px 44px rgba(0,0,0,.16)}',
    '.an-hov img{transition:scale .9s cubic-bezier(.2,.7,.2,1)}',
    '.an-hov:hover img{scale:1.06}',
    '.btn,button.btn,a.btn{transition:translate .25s ease,box-shadow .25s ease,background .3s,color .3s}',
    '.btn:hover{translate:0 -2px;box-shadow:0 10px 24px rgba(0,0,0,.18)}',
    '.an-pulse{animation:anP 2.6s ease-out infinite}',
    '@keyframes anP{0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}'
  ].join('');
  var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);

  /* scroll progress bar in the page's accent colour */
  var accent = '#c9a96e', b0 = d.querySelector('.btn');
  if (b0) { var bg = getComputedStyle(b0).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') accent = bg; }
  var bar = d.createElement('div'); bar.className = 'an-bar'; bar.style.background = accent; d.body.appendChild(bar);

  /* hero: word by word headline, then the rest of the hero copy */
  var hero = d.querySelector('.hero') || d.querySelector('header + section, section');
  var h1 = d.querySelector('h1');
  var k = 0;
  if (h1) {
    (function split(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var s = d.createElement('span'); s.className = 'an-w'; s.textContent = p;
            s.style.animationDelay = (0.15 + k++ * 0.07) + 's'; frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') split(n);
      });
    })(h1);
    var box = h1.parentNode, after = false, j = 0;
    [].slice.call(box.children).forEach(function(c){
      if (c === h1) { after = true; return; }
      c.classList.add('an-in');
      c.style.animationDelay = after ? (0.35 + k * 0.07 + j++ * 0.12) + 's' : '0s';
    });
  }

  /* hero photo: slow zoom plus gentle parallax */
  var heroImg = hero && hero.querySelector('img');
  if (heroImg) {
    heroImg.classList.add('an-kb');
    var wrapP = heroImg;
    addEventListener('scroll', function(){
      var y = scrollY; if (y < innerHeight * 1.2) wrapP.style.translate = '0 ' + (y * 0.22) + 'px';
    }, {passive: true});
  }

  /* staggered reveals for grids of cards */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('an-on'); io.unobserve(e.target); } });
  }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});

  var groups = '.cards,.tiles,.rooms,.houses,.now,.near,.grid,.grid3,.stats,.facts .wrap,.facts,.list,.timeline,.tl,.menu-list,.chips,.amen,.pk,.packages,.practice,.values,.posts,.people,.areas,.team,.services,.insights,.row2';
  d.querySelectorAll(groups).forEach(function(g){
    if (hero && hero.contains(g)) return;
    [].slice.call(g.children).forEach(function(c, i){
      if (c.classList.contains('wrap')) return;
      if (c.classList.contains('rv') || c.classList.contains('reveal')) { c.style.transitionDelay = (i * 0.09) + 's'; return; }
      c.classList.add('an-up'); c.style.transitionDelay = (i * 0.09) + 's'; io.observe(c);
    });
  });

  /* lift on hover for cards */
  d.querySelectorAll('.cd,.tile,.rm,.h,.poster,.card,.room,.pkg,.dish,.fav,.area,.post,.value,.person,.member').forEach(function(c){ c.classList.add('an-hov'); });

  /* photos below the hero wipe in */
  d.querySelectorAll('img').forEach(function(im){
    if (hero && hero.contains(im)) return;
    if (im.closest('header,footer,.logo') || im.hasAttribute('data-noanim')) return;
    if (im.naturalWidth && im.naturalWidth < 80) return;
    im.loading = 'eager'; im.classList.add('an-img');
    var par = im.parentNode;
    var po = new IntersectionObserver(function(es){ if (es[0].isIntersecting) { im.classList.add('an-on'); po.disconnect(); } }, {threshold: .12});
    po.observe(par);
  });

  /* numbers count up */
  d.querySelectorAll('.facts b,.stats b,.stats strong,.facts strong,.near b').forEach(function(el){
    if (el.children.length) return;
    var m = el.textContent.match(/^(\s*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length;
    if (end === 0) return;
    el.textContent = m[1] + (0).toFixed(dec) + m[3];
    var o = new IntersectionObserver(function(es){
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t){
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + (end * e).toFixed(dec) + m[3];
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, {threshold: .6});
    o.observe(el);
  });

  /* floating WhatsApp buttons pulse */
  d.querySelectorAll('.wa-float,.waf,.fab,a.wa,a[class*="float"]').forEach(function(f){ f.classList.add('an-pulse'); });

  /* progress bar */
  function prog(){ var h = d.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; }
  addEventListener('scroll', prog, {passive: true}); prog();
})();
