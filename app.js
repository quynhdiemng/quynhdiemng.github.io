(() => {
  const $ = id => document.getElementById(id);
  const A = 'assets/';
  const el = (t, props = {}, ...kids) => { const n = Object.assign(document.createElement(t), props); n.append(...kids); return n; };

  /* ---- hero sprites: file, project, left, bottom, width (all % of the stage) ---- */
  const sprites = [
    ['cubes', 'Color Toy Block', '56%', '62%', '40%'],
    ['cat-grey', 'Meow Block', '4%', '60%', '36%'],
    ['drop-blue', 'Water Match Factory', '-2%', '22%', '28%'],
    ['drop-pink', 'Water Match Factory', '76%', '20%', '26%'],
    ['cats', 'Meow Block', '19%', '14%', '60%'],
    ['cat-orange', 'Meow Block', '67%', '0%', '25%'],
    ['cat-yarn', 'Meow Block', '8%', '0%', '20%']];
  const stage = $('stage');
  sprites.forEach(([f, label, ...pos]) => {
    const b = el('button', { className: 'spr', type: 'button', ariaLabel: label + ' sprite, use arrow keys to move' },
      el('span', { textContent: label }), el('img', { src: `${A}sprites/${f}.webp`, alt: '', draggable: false }));
    ['--x', '--b', '--w'].forEach((k, i) => b.style.setProperty(k, pos[i]));
    const place = (l, t) => {
      b.style.bottom = 'auto';
      b.style.left = Math.max(-20, Math.min(stage.clientWidth - b.offsetWidth + 20, l)) + 'px';
      b.style.top = Math.max(-20, Math.min(stage.clientHeight - b.offsetHeight + 20, t)) + 'px';
    };
    let d;
    b.addEventListener('click', () => { b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); setTimeout(() => b.classList.remove('hop'), 600); });
    b.onpointerdown = e => { if (e.pointerType === 'touch') return; d = [e.clientX - b.offsetLeft, e.clientY - b.offsetTop]; b.classList.add('on'); b.setPointerCapture(e.pointerId); };
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
  function render(box, list, lead) {
    box.replaceChildren(...list.map((p, i) => el('a', { className: lead && !i ? 'tile lead-tile' : 'tile', href: '#' + p.id },
      el('span', { className: 'shot' },
        el('img', { src: `${A}covers/${p.id}.webp`, alt: '', loading: 'lazy' }),
        ...(p.award ? [el('span', { className: 'award', textContent: p.award })] : [])),
      el('span', { className: 'cap' },
        el('strong', {}, p.title + '\u00a0', el('i', { textContent: '↗', ariaHidden: 'true' })), el('em', { textContent: p.year }),
        el('small', { textContent: p.tags.slice(0, 3).join(', ') })))));
  }
  const games = all.filter(p => p.type === 'game'), illus = all.filter(p => p.type === 'illustration');
  render($('gameList'), games, true);
  render($('illusList'), illus, false);
  $('nGames').textContent = games.length;
  $('nIllus').textContent = illus.length;

  ['All', ...new Set(games.flatMap(p => p.tags))].forEach((t, i) => {
    const list = i ? games.filter(p => p.tags.includes(t)) : games;
    const b = el('button', { type: 'button', ariaPressed: String(!i) }, t, el('i', { textContent: list.length }));
    b.onclick = () => {
      $('filters').querySelectorAll('button').forEach(x => { x.ariaPressed = String(x === b); });
      render($('gameList'), list, !i);
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
    $('vBody').replaceChildren(el('h2', { id: 'vTitle', textContent: p.title }), el('p', { className: 'desc', textContent: p.desc }), dl, m,
      el('button', { type: 'button', className: 'v-next', onclick: () => go(1) }, el('span', { className: 'mono', textContent: 'Next project' }), all[(cur + 1) % all.length].title + ' →'));
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
