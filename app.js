(() => {
  const $ = id => document.getElementById(id);
  const A = 'assets/';
  const el = (t, props = {}, ...kids) => { const n = Object.assign(document.createElement(t), props); n.append(...kids); return n; };

  /* ---- hero sprites: file, project, then left/bottom/width on desktop, then on phone ---- */
  const sprites = [
    ['cat-grey', 'Meow Block', '6%', '80%', '11%', '62%', '265px', '34%'],
    ['cat-orange', 'Meow Block', '87%', '82%', '9%', '4%', '270px', '30%'],
    ['drop-blue', 'Water Match Factory', '33%', '40px', '13%', '0%', '50px', '25%'],
    ['drop-pink', 'Water Match Factory', '71%', '34px', '13%', '77%', '50px', '22%'],
    ['cubes', 'Color Toy Block', '83%', '50px', '17%', '56%', '20px', '30%'],
    ['cats', 'Meow Block', '45%', '30px', '28%', '22%', '62px', '52%'],
    ['cat-yarn', 'Meow Block', '67%', '18px', '8%', '17%', '22px', '19%']];
  const stage = $('stage');
  sprites.forEach(([f, label, ...pos]) => {
    const b = el('button', { className: 'spr', type: 'button', ariaLabel: label + ' sprite, use arrow keys to move' },
      el('span', { textContent: label }), el('img', { src: `${A}sprites/${f}.webp`, alt: '', draggable: false }));
    ['--x', '--b', '--w', '--mx', '--mb', '--mw'].forEach((k, i) => b.style.setProperty(k, pos[i]));
    const place = (l, t) => {
      b.style.bottom = 'auto';
      b.style.left = Math.max(-20, Math.min(stage.clientWidth - b.offsetWidth + 20, l)) + 'px';
      b.style.top = Math.max(-20, Math.min(stage.clientHeight - b.offsetHeight + 20, t)) + 'px';
    };
    let d;
    b.addEventListener('click', () => { b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); setTimeout(() => b.classList.remove('hop'), 600); });
    b.onpointerdown = e => { d = [e.clientX - b.offsetLeft, e.clientY - b.offsetTop]; b.classList.add('on'); b.setPointerCapture(e.pointerId); };
    b.onpointermove = e => { if (d) place(e.clientX - d[0], e.clientY - d[1]); };
    b.onpointerup = b.onpointercancel = () => { d = null; b.classList.remove('on'); };
    b.onkeydown = e => {
      const m = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
      if (m) { e.preventDefault(); place(b.offsetLeft + m[0], b.offsetTop + m[1]); }
    };
    stage.append(b);
  });

  /* ---- lists: newest first; inside one year the order of projects.js is kept ---- */
  const all = ['game', 'illustration'].flatMap(t => PROJECTS.filter(p => p.type === t).sort((a, b) => b.year - a.year));
  function render(box, list, big) {
    box.replaceChildren();
    for (const y of [...new Set(list.map(p => p.year))]) {
      const items = list.filter(p => p.year === y), n = items.length;
      const lead = n === 1 || (big && n === 4) ? 1 : 0;   // one wide card
      const rest = n - lead;
      const halves = rest % 3 === 2 ? 2 : rest % 3 === 1 ? 4 : 0; // keeps every row full
      const grid = el('div', { className: 'grid' });
      items.forEach((p, i) => {
        const c = i < lead ? 'card full' : i - lead < halves ? 'card half' : 'card';
        grid.append(el('a', { className: c, href: '#' + p.id },
          el('span', { className: 'shot' }, el('img', { src: `${A}covers/${p.id}.webp`, alt: '', loading: 'lazy' }), ...(p.award ? [el('b', { textContent: p.award })] : [])),
          el('strong', { textContent: p.title }),
          el('small', { textContent: [p.period !== String(p.year) && p.period, p.tags.join(', ')].filter(Boolean).join(' · ') })));
      });
      box.append(el('div', { className: 'year' }, el('h3', { textContent: y }), grid));
    }
  }
  const games = all.filter(p => p.type === 'game');
  render($('gameList'), games, true);
  render($('illusList'), all.filter(p => p.type === 'illustration'), false);

  ['All', ...new Set(games.flatMap(p => p.tags))].forEach((t, i) => {
    const b = el('button', { type: 'button', textContent: t, ariaPressed: String(!i) });
    b.onclick = () => {
      [...$('filters').children].forEach(x => { x.ariaPressed = String(x === b); });
      render($('gameList'), i ? games.filter(p => p.tags.includes(t)) : games, true);
    };
    $('filters').append(b);
  });

  $('copyMail').onclick = async e => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText('dq.spaghetti@gmail.com'); b.textContent = 'Copied'; }
    catch { getSelection().selectAllChildren(document.querySelector('.mail')); b.textContent = 'Press Ctrl+C'; }
    setTimeout(() => { b.textContent = 'Copy email'; }, 1800);
  };

  /* ---- project viewer, one shareable link per project (#meow-block) ---- */
  const v = $('viewer');
  let cur = -1, back = 0;
  function show() {
    cur = all.findIndex(p => '#' + p.id === location.hash);
    if (cur < 0) { if (v.open) { v.close(); scrollTo({ top: back, behavior: 'instant' }); } return; }
    const p = all[cur];
    const dl = el('dl', { className: 'facts' });
    [['Year', p.period], ['Type', p.tags.join(', ')], ['Role', p.role], ['Genre', p.genre], ['Award', p.award]]
      .filter(x => x[1]).forEach(([k, t]) => dl.append(el('div', {}, el('dt', { textContent: k }), el('dd', { textContent: t }))));
    const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const m = el('div', { className: 'media ' + (p.layout || '') });
    p.media.forEach(([f, w, h]) => {
      const src = `${A}projects/${f}`;
      const n = f.endsWith('.mp4')
        ? el('video', { src, width: w, height: h, muted: true, loop: true, autoplay: !still, controls: still, playsInline: true })
        : el('img', { width: w, height: h, alt: `${p.title} artwork`, loading: 'lazy', src });
      if (w > h) n.className = 'wide';
      m.append(n);
    });
    $('vBody').replaceChildren(el('h2', { id: 'vTitle', textContent: p.title }), el('p', { className: 'desc', textContent: p.desc }), dl, m);
    if (!v.open) { back = scrollY; v.showModal(); }
    v.scrollTop = 0;
  }
  const go = d => location.replace('#' + all[(cur + d + all.length) % all.length].id);
  const close = () => { history.pushState(null, '', location.pathname + location.search); show(); };
  $('vPrev').onclick = () => go(-1);
  $('vNext').onclick = () => go(1);
  $('vClose').onclick = close;
  v.addEventListener('cancel', e => { e.preventDefault(); close(); });
  addEventListener('hashchange', show);
  addEventListener('popstate', show);
  show();
})();
