(() => {
  const $ = id => document.getElementById(id);
  const A = 'assets/';
  const el = (t, props = {}, ...kids) => { const n = Object.assign(document.createElement(t), props); n.append(...kids); return n; };

  /* ---- hero sprites: file, project, left, bottom, width (all % of the stage) ---- */
  const sprites = [
    // one Meow Block family on a shared floor: back row, the pile in the middle, front row (drawn in this order)
    ['cat-grey', 'Meow Block', '0%', '34%', '30%'],
    ['cat-white', 'Meow Block', '76%', '34%', '22%'],
    ['cats', 'Meow Block', '21%', '8%', '58%'],
    ['cat-yarn', 'Meow Block', '3%', '3%', '23%'],
    ['cat-orange', 'Meow Block', '68%', '3%', '31%']];
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
        el('img', { src: `${A}covers/${p.id}.webp?v=16`, alt: '', loading: 'lazy' }),
        ...(p.award ? [el('span', { className: 'award', textContent: p.award })] : [])),
      el('span', { className: 'cap' },
        el('strong', {}, p.title + '\u00a0', el('i', { ariaHidden: 'true', innerHTML: '<svg viewBox="0 0 12 12" width=".62em" height=".62em"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' })), el('em', { textContent: p.year }),
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
  const vo = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { rootMargin: '150px 0px' });
  let cur = -1, back = 0;
  function show() {
    cur = all.findIndex(p => '#' + p.id === location.hash);
    if (cur < 0) { if (v.open) { v.close(); scrollTo({ top: back, behavior: 'instant' }); } return; }
    const p = all[cur];
    const dl = el('dl', { className: 'facts' });
    [['Year', p.period], ['Type', p.tags.join(', ')], ['Role', p.role], ['Genre', p.genre], ['Award', p.award]]
      .filter(x => x[1]).forEach(([k, t]) => dl.append(el('div', {}, el('dt', { textContent: k }), el('dd', { textContent: t }))));
    const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    // store / play buttons: [[label, url], ...]
    const links = list => list && list.length ? [el('p', { className: 'links' }, ...list.map(([t, href]) =>
      el('a', { href, target: '_blank', rel: 'noopener', textContent: t + ' ' }, el('i', { ariaHidden: 'true', innerHTML: '<svg viewBox="0 0 12 12" width=".8em" height=".8em"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' }))))] : [];
    const item =([f, w, h, alpha, c]) => {
      if (!f) return el('span', { className: 'spacer' }); // empty slot that keeps a lone image small
      if (c) {
        // a w×h window cut from sheets stacked top to bottom (see crop() in projects.js)
        const box = el('span', { className: 'crop', role: 'img', ariaLabel: `${p.title} artwork` });
        box.style.aspectRatio = `${w}/${h}`;
        const inner = el('span', {}, ...c.files.map(s => el('img', { src: `${A}projects/${s}`, width: c.fw, height: c.fh, alt: '', loading: 'lazy' })));
        Object.assign(inner.style, { width: c.fw / w * 100 + '%', left: -c.x / w * 100 + '%', top: -c.y / h * 100 + '%' });
        box.append(inner);
        return box;
      }
      // ?v=2: artwork re-exported sharp from Figma, so browsers drop the old cached files
      const src = `${A}projects/${f}` + (f.endsWith('.webp') ? '?v=2' : '');
      if (f.endsWith('.mp4')) {
        // play only while on screen, so a project with many clips stays light
        const n = el('video', { src, width: w, height: h, muted: true, loop: true, controls: still, playsInline: true, preload: 'metadata' });
        if (!still) { if (vo) vo.observe(n); else n.autoplay = true; }
        return n;
      }
      return el('img', { width: w, height: h, alt: `${p.title} artwork`, loading: 'lazy', src, className: alpha ? 'alpha' : '' });
    };
    let m;
    if (p.sections) {
      // each row is one height; an item's share of the width is its width/height
      // optional third item of a section: { note: 'text', links: [[label, url]] }
      let num = 0; // only sections with a label are numbered
      m = el('div', {}, ...p.sections.map(([t, rows, o = {}]) => el('section', { className: 'sec' },
        ...(t ? [el('h3', {}, el('span', { textContent: String(++num).padStart(2, '0') }), t)] : []),
        ...(o.note ? [el('p', { className: 'sec-note', textContent: o.note })] : []), ...links(o.links),
        // shares are scaled up when they add up to less than 1, or flex leaves the row part empty
        // a row is never wider than its smallest picture allows, so small pictures are not blown up and blurred
        ...rows.map(r => { const sum = r.reduce((s, x) => s + x[1] / x[2], 0), k = Math.max(1, 1 / sum);
          const row = el('div', { className: 'row' }, ...r.map(x => { const n = item(x), r = x[1] / x[2]; n.style.setProperty('--a', (r * k).toFixed(3)); if (r < 1.2) n.classList.add(r < .6 ? 'tall' : 'mid'); return n; }));
          const real = r.filter(x => x[0]);
          if (real.length) row.style.maxWidth = Math.round(Math.min(...real.map(x => x[2])) * sum + 14 * (r.length - 1)) + 'px';
          return row; }))));
    } else {
      m = el('div', { className: 'media ' + (p.layout || '') });
      p.media.forEach(x => { const n = item(x); if (x[1] > x[2]) n.classList.add('wide'); m.append(n); });
    }
    $('vName').textContent = p.title;
    $('vBody').replaceChildren(el('h2', { id: 'vTitle', textContent: p.title }), el('p', { className: 'desc', textContent: p.desc }), ...links(p.links), dl, m,
      el('button', { type: 'button', className: 'v-next', onclick: () => go(1) }, el('span', { className: 'mono', textContent: 'Next project' }), all[(cur + 1) % all.length].title + ' →'));
    // every picture and clip in the project opens the large preview
    shots = [...$('vBody').querySelectorAll('.row>img,.row>.crop,.row>video,.media>img,.media>video')];
    shots.forEach((n, i) => {
      Object.assign(n, { tabIndex: 0, title: 'View larger' });
      n.classList.add('zoomable');
      n.onclick = () => zoomTo(i);
      n.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoomTo(i); } };
    });
    if (!v.open) { back = scrollY; v.showModal(); }
    v.scrollTop = 0;
  }

  /* ---- large preview of one picture, with previous / next inside the project ---- */
  const z = $('zoom');
  let shots = [], zi = 0, zFrom = null;
  function zoomTo(i) {
    if (!shots.length) return;
    zi = (i + shots.length) % shots.length;
    const src = shots[zi], n = src.cloneNode(true);
    n.removeAttribute('tabindex'); n.removeAttribute('title'); n.onclick = null;
    n.className = 'z-item' + (src.classList.contains('alpha') ? ' alpha' : '') + (src.classList.contains('crop') ? ' crop' : '');
    n.style.removeProperty('--a');
    n.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
    if (n.tagName === 'IMG') n.loading = 'eager';
    if (n.tagName === 'VIDEO') Object.assign(n, { controls: true, muted: true, autoplay: true, loop: true });
    // width / height of what is shown, so it can be fitted to the screen
    // (a crop keeps its own size in its aspect-ratio, e.g. "282 / 502")
    const [w, h] = src.classList.contains('crop') ? src.style.aspectRatio.split('/').map(Number)
      : [+src.getAttribute('width') || src.offsetWidth, +src.getAttribute('height') || src.offsetHeight];
    n.style.setProperty('--ar', (w / h).toFixed(4));
    n.style.setProperty('--nw', w + 'px'); // never shown larger than its real pixels
    $('zStage').classList.remove('full');
    $('zStage').replaceChildren(n);
    $('zCount').textContent = `${zi + 1} / ${shots.length}`;
    if (!z.open) { zFrom = src; z.showModal(); }
    z.scrollTop = 0;
  }
  const zClose = () => { z.close(); $('zStage').replaceChildren(); if (zFrom && shots[zi]) shots[zi].focus({ preventScroll: false }); };
  $('zClose').onclick = zClose;
  $('zPrev').onclick = () => zoomTo(zi - 1);
  $('zNext').onclick = () => zoomTo(zi + 1);
  z.addEventListener('cancel', e => { e.preventDefault(); zClose(); });
  z.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') zoomTo(zi - 1);
    if (e.key === 'ArrowRight') zoomTo(zi + 1);
  });
  // click the picture: fit to screen ⇄ full width; click the dark area: close
  $('zStage').addEventListener('click', e => {
    if (e.target === $('zStage')) return zClose();
    if (e.target.closest('video')) return;
    $('zStage').classList.toggle('full');
  });
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
