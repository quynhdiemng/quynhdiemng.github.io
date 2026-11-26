(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const ease = 'cubic-bezier(.22,1,.36,1)';

  // Menu underline follows the section on screen
  const links = [...document.querySelectorAll('.bar nav a,.bar .cta')];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    const a = links.find(l => l.hash === '#' + e.target.id);
    if (e.isIntersecting) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  }), { rootMargin: '-45% 0px -54% 0px' });
  links.forEach(l => spy.observe(document.querySelector(l.hash)));

  // Strip of words: second copy makes the loop seamless
  const strip = document.querySelector('.marquee div');
  [...strip.children].forEach(s => { const c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); strip.append(c); });

  if (calm) return;

  // Hero: text rises, sprites pop in one after another
  document.querySelectorAll('.hero-text .kicker,.hero h1 span,.hero-text .lead').forEach((n, i) =>
    n.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: i * 90, easing: ease, fill: 'backwards' }));
  document.querySelectorAll('.spr').forEach((n, i) => {
    n.style.setProperty('--d', -i * 0.7 + 's');
    n.animate([{ opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.08, offset: 0.7 }, { opacity: 1, scale: 1 }], { duration: 650, delay: 250 + i * 110, easing: 'ease-out', fill: 'backwards' });
  });

  // Scroll: content is visible by default and only animates as it enters
  const io = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: k++ * 80, easing: ease, fill: 'backwards' });
    });
  });
  const watch = root => root.querySelectorAll('.kicker,.head,.filters,.tile,.about-text>*,.kit>div,.job,.mail,.cells>div').forEach(n => io.observe(n));
  watch(document);

  // Hero glow follows the pointer
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--gx', e.clientX - r.left + 'px');
    hero.style.setProperty('--gy', e.clientY - r.top + 'px');
  });

  // Numbers count up once
  const nums = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    nums.unobserve(e.target);
    const n = +e.target.textContent, t0 = performance.now();
    const tick = t => { const k = Math.max(0, Math.min(1, (t - t0) / 900)); e.target.textContent = Math.round(n * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  document.querySelectorAll('[data-n]').forEach(n => nums.observe(n));

  // Filtered results animate in again
  new MutationObserver(() => watch(document.getElementById('gameList'))).observe(document.getElementById('gameList'), { childList: true });

  // Project page slides up; Previous/Next fades in
  const v = document.getElementById('viewer');
  new MutationObserver(() => v.open && v.animate([{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400, easing: ease })).observe(v, { attributes: true, attributeFilter: ['open'] });
  const body = document.getElementById('vBody');
  new MutationObserver(() => body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 })).observe(body, { childList: true });
})();
