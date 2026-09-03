(function (root) {
  const COLORS = {
    white: '#F4F7FB',
    ice: '#D7EEFF',
    cyan: '#3EE0FF',
    aqua: '#7EF6FF',
    lime: '#7CFF6B',
    mint: '#3DFFB0',
    red: '#FF3B3B',
    crimson: '#FF5A6A',
    orange: '#FF8A1F',
    amber: '#FFC14A',
    yellow: '#FFE14A',
    pink: '#FF4DA8',
    magenta: '#FF3DDC',
    purple: '#B85CFF',
    violet: '#8B7CFF',
    teal: '#2EF2C4',
    gold: '#F0B429',
    blue: '#4D8BFF'
  };

  const COLOR_LIST = Object.values(COLORS);

  function colorAt(index) {
    return COLOR_LIST[index % COLOR_LIST.length];
  }

  function dot(r) {
    return [{ t: 'circle', cx: 50, cy: 50, r: r, fill: true }];
  }

  function ring(r, w) {
    return [{ t: 'circle', cx: 50, cy: 50, r: r, fill: false, sw: w }];
  }

  function cross(gap, len, w) {
    return [
      { t: 'line', x1: 50, y1: 50 - gap - len, x2: 50, y2: 50 - gap, sw: w },
      { t: 'line', x1: 50, y1: 50 + gap, x2: 50, y2: 50 + gap + len, sw: w },
      { t: 'line', x1: 50 - gap - len, y1: 50, x2: 50 - gap, y2: 50, sw: w },
      { t: 'line', x1: 50 + gap, y1: 50, x2: 50 + gap + len, y2: 50, sw: w }
    ];
  }

  function xhair(gap, len, w) {
    const u = Math.SQRT1_2;
    function arm(dirX, dirY) {
      const x1 = 50 + dirX * gap;
      const y1 = 50 + dirY * gap;
      return {
        t: 'line',
        x1: x1,
        y1: y1,
        x2: x1 + dirX * len,
        y2: y1 + dirY * len,
        sw: w
      };
    }
    return [arm(-u, -u), arm(u, -u), arm(-u, u), arm(u, u)];
  }

  function bars(gap, len, w, vertical) {
    if (vertical) {
      return [
        { t: 'line', x1: 50, y1: 50 - gap - len, x2: 50, y2: 50 - gap, sw: w },
        { t: 'line', x1: 50, y1: 50 + gap, x2: 50, y2: 50 + gap + len, sw: w }
      ];
    }
    return [
      { t: 'line', x1: 50 - gap - len, y1: 50, x2: 50 - gap, y2: 50, sw: w },
      { t: 'line', x1: 50 + gap, y1: 50, x2: 50 + gap + len, y2: 50, sw: w }
    ];
  }

  function tee(gap, len, w, stem) {
    const arms = bars(gap, len, w, false);
    if (stem === 'down') {
      arms.push({ t: 'line', x1: 50, y1: 50 + gap, x2: 50, y2: 50 + gap + len, sw: w });
    } else if (stem === 'up') {
      arms.push({ t: 'line', x1: 50, y1: 50 - gap - len, x2: 50, y2: 50 - gap, sw: w });
    }
    return arms;
  }

  function brackets(gap, len, w) {
    const s = gap;
    const l = len;
    return [
      { t: 'path', d: `M ${50 - s - l} ${50 - s} L ${50 - s} ${50 - s} L ${50 - s} ${50 - s - l}`, sw: w },
      { t: 'path', d: `M ${50 + s + l} ${50 - s} L ${50 + s} ${50 - s} L ${50 + s} ${50 - s - l}`, sw: w },
      { t: 'path', d: `M ${50 - s - l} ${50 + s} L ${50 - s} ${50 + s} L ${50 - s} ${50 + s + l}`, sw: w },
      { t: 'path', d: `M ${50 + s + l} ${50 + s} L ${50 + s} ${50 + s} L ${50 + s} ${50 + s + l}`, sw: w }
    ];
  }

  function diamond(size, w, fill) {
    const s = size;
    return [{
      t: 'poly',
      points: `${50},${50 - s} ${50 + s},${50} ${50},${50 + s} ${50 - s},${50}`,
      fill: !!fill,
      sw: w
    }];
  }

  function square(size, w, fill) {
    return [{
      t: 'rect',
      x: 50 - size,
      y: 50 - size,
      w: size * 2,
      h: size * 2,
      fill: !!fill,
      sw: w
    }];
  }

  function chevron(spread, drop, w) {
    return [{
      t: 'path',
      d: `M ${50 - spread} ${50 - drop} L 50 ${50 + drop} L ${50 + spread} ${50 - drop}`,
      sw: w
    }];
  }

  function burst(count, inner, outer, w) {
    const items = [];
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count - Math.PI / 2;
      items.push({
        t: 'line',
        x1: 50 + Math.cos(a) * inner,
        y1: 50 + Math.sin(a) * inner,
        x2: 50 + Math.cos(a) * outer,
        y2: 50 + Math.sin(a) * outer,
        sw: w
      });
    }
    return items;
  }

  function arcs(r, w, sweep, count) {
    const items = [];
    const step = 360 / count;
    for (let i = 0; i < count; i += 1) {
      const start = i * step - sweep / 2;
      items.push({ t: 'arc', cx: 50, cy: 50, r: r, start: start, sweep: sweep, sw: w });
    }
    return items;
  }

  function triangle(size, w, fill) {
    return [{
      t: 'poly',
      points: `${50},${50 - size} ${50 + size},${50 + size} ${50 - size},${50 + size}`,
      fill: !!fill,
      sw: w
    }];
  }

  function hex(size, w) {
    const pts = [];
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${50 + Math.cos(a) * size},${50 + Math.sin(a) * size}`);
    }
    return [{ t: 'poly', points: pts.join(' '), fill: false, sw: w }];
  }

  function pill(x, y, w, h, sw, rot) {
    return [{ t: 'rect', x: x, y: y, w: w, h: h, rx: Math.min(w, h) / 2, fill: true, sw: sw || 0, rot: rot || 0 }];
  }

  const KINDS = {
    dot: function (p) { return dot(p.r); },
    halo: function (p) { return dot(p.r).concat(ring(p.ring, p.w)); },
    dualring: function (p) { return ring(p.inner, p.w).concat(ring(p.outer, p.w)); },
    cross: function (p) { return cross(p.gap, p.len, p.w); },
    crossdot: function (p) { return cross(p.gap, p.len, p.w).concat(dot(p.r)); },
    x: function (p) { return xhair(p.gap, p.len, p.w); },
    xdot: function (p) { return xhair(p.gap, p.len, p.w).concat(dot(p.r)); },
    hbars: function (p) { return bars(p.gap, p.len, p.w, false); },
    vbars: function (p) { return bars(p.gap, p.len, p.w, true); },
    tee: function (p) { return tee(p.gap, p.len, p.w, p.stem); },
    teedot: function (p) { return tee(p.gap, p.len, p.w, p.stem).concat(dot(p.r)); },
    circle: function (p) { return ring(p.r, p.w); },
    circledot: function (p) { return ring(p.r, p.w).concat(dot(p.dot)); },
    circlecross: function (p) { return ring(p.r, p.w).concat(cross(p.gap, p.len, p.cw)); },
    brackets: function (p) { return brackets(p.gap, p.len, p.w); },
    bracketsdot: function (p) { return brackets(p.gap, p.len, p.w).concat(dot(p.r)); },
    diamond: function (p) { return diamond(p.size, p.w, p.fill); },
    diamonddot: function (p) { return diamond(p.size, p.w, false).concat(dot(p.r)); },
    square: function (p) { return square(p.size, p.w, p.fill); },
    squaredot: function (p) { return square(p.size, p.w, false).concat(dot(p.r)); },
    chevron: function (p) { return chevron(p.spread, p.drop, p.w); },
    chevrondot: function (p) { return chevron(p.spread, p.drop, p.w).concat(dot(p.r)); },
    burst: function (p) { return burst(p.count, p.inner, p.outer, p.w); },
    burstdot: function (p) { return burst(p.count, p.inner, p.outer, p.w).concat(dot(p.r)); },
    arcs: function (p) { return arcs(p.r, p.w, p.sweep, p.count); },
    arcsdot: function (p) { return arcs(p.r, p.w, p.sweep, p.count).concat(dot(p.dot)); },
    triangle: function (p) { return triangle(p.size, p.w, p.fill); },
    hex: function (p) { return hex(p.size, p.w); },
    hexdot: function (p) { return hex(p.size, p.w).concat(dot(p.r)); },
    pluscircle: function (p) { return ring(p.r, p.w).concat(cross(p.gap, p.len, p.cw)); },
    pills: function (p) {
      return []
        .concat(pill(50 - p.w / 2, 50 - p.gap - p.len, p.w, p.len, 0))
        .concat(pill(50 - p.w / 2, 50 + p.gap, p.w, p.len, 0))
        .concat(pill(50 - p.gap - p.len, 50 - p.w / 2, p.len, p.w, 0))
        .concat(pill(50 + p.gap, 50 - p.w / 2, p.len, p.w, 0));
    }
  };

  const SPECS = [
    { name: 'Micro Dot', cat: 'classic', kind: 'dot', p: { r: 1.35 } },
    { name: 'Soft Dot', cat: 'classic', kind: 'dot', p: { r: 2.05 } },
    { name: 'Bold Dot', cat: 'classic', kind: 'dot', p: { r: 2.8 } },
    { name: 'Heavy Dot', cat: 'classic', kind: 'dot', p: { r: 3.5 } },
    { name: 'Halo Pin', cat: 'classic', kind: 'halo', p: { r: 1.5, ring: 5.4, w: 1.15 } },
    { name: 'Halo Dot', cat: 'classic', kind: 'halo', p: { r: 2.1, ring: 6.6, w: 1.3 } },
    { name: 'Halo Ring', cat: 'classic', kind: 'halo', p: { r: 1.7, ring: 8.2, w: 1.45 } },
    { name: 'Target Pin', cat: 'classic', kind: 'halo', p: { r: 2.4, ring: 9.4, w: 1.2 } },
    { name: 'Twin Ring', cat: 'classic', kind: 'dualring', p: { inner: 4.2, outer: 8.4, w: 1.2 } },
    { name: 'Orbit', cat: 'classic', kind: 'dualring', p: { inner: 3.4, outer: 10.2, w: 1.35 } },
    { name: 'Pulse', cat: 'classic', kind: 'dualring', p: { inner: 5.6, outer: 9.8, w: 1.5 } },
    { name: 'Core Ring', cat: 'classic', kind: 'circledot', p: { r: 6.5, w: 1.3, dot: 1.6 } },
    { name: 'Needle Cross', cat: 'cross', kind: 'cross', p: { gap: 1.8, len: 7.2, w: 1.15 } },
    { name: 'Tight Cross', cat: 'cross', kind: 'cross', p: { gap: 2.4, len: 8.4, w: 1.35 } },
    { name: 'Classic Cross', cat: 'cross', kind: 'cross', p: { gap: 3.4, len: 9.5, w: 1.55 } },
    { name: 'Open Cross', cat: 'cross', kind: 'cross', p: { gap: 5.2, len: 10.2, w: 1.5 } },
    { name: 'Wide Cross', cat: 'cross', kind: 'cross', p: { gap: 6.8, len: 11.5, w: 1.6 } },
    { name: 'Thin Long', cat: 'cross', kind: 'cross', p: { gap: 3.8, len: 14.5, w: 1.15 } },
    { name: 'Thick Short', cat: 'cross', kind: 'cross', p: { gap: 3.2, len: 7.4, w: 2.3 } },
    { name: 'Tactical Plus', cat: 'cross', kind: 'cross', p: { gap: 4.4, len: 8.8, w: 1.8 } },
    { name: 'CS Gap', cat: 'cross', kind: 'crossdot', p: { gap: 3.6, len: 8.6, w: 1.45, r: 1.15 } },
    { name: 'Dot Plus', cat: 'cross', kind: 'crossdot', p: { gap: 4.8, len: 9.4, w: 1.4, r: 1.55 } },
    { name: 'Pin Plus', cat: 'cross', kind: 'crossdot', p: { gap: 2.6, len: 7.8, w: 1.25, r: 1.05 } },
    { name: 'Range Plus', cat: 'cross', kind: 'crossdot', p: { gap: 6.2, len: 10.5, w: 1.55, r: 1.35 } },
    { name: 'Fine X', cat: 'cross', kind: 'x', p: { gap: 2.4, len: 7.8, w: 1.2 } },
    { name: 'Open X', cat: 'cross', kind: 'x', p: { gap: 4.6, len: 9.2, w: 1.45 } },
    { name: 'Heavy X', cat: 'cross', kind: 'x', p: { gap: 3.2, len: 8.4, w: 2.1 } },
    { name: 'X Dot', cat: 'cross', kind: 'xdot', p: { gap: 4.2, len: 8.6, w: 1.4, r: 1.3 } },
    { name: 'Horizon', cat: 'cross', kind: 'hbars', p: { gap: 4.2, len: 10.5, w: 1.5 } },
    { name: 'Horizon Wide', cat: 'cross', kind: 'hbars', p: { gap: 6.4, len: 12.2, w: 1.7 } },
    { name: 'Drop Bars', cat: 'cross', kind: 'vbars', p: { gap: 3.8, len: 9.6, w: 1.45 } },
    { name: 'Drop Long', cat: 'cross', kind: 'vbars', p: { gap: 5.6, len: 12.4, w: 1.55 } },
    { name: 'T Down', cat: 'tactical', kind: 'tee', p: { gap: 3.6, len: 9.2, w: 1.5, stem: 'down' } },
    { name: 'T Up', cat: 'tactical', kind: 'tee', p: { gap: 3.6, len: 9.2, w: 1.5, stem: 'up' } },
    { name: 'T Pin', cat: 'tactical', kind: 'teedot', p: { gap: 4.2, len: 8.8, w: 1.4, stem: 'down', r: 1.2 } },
    { name: 'Inverted Pin', cat: 'tactical', kind: 'teedot', p: { gap: 4.2, len: 8.8, w: 1.4, stem: 'up', r: 1.2 } },
    { name: 'Thin Circle', cat: 'circle', kind: 'circle', p: { r: 8.2, w: 1.15 } },
    { name: 'Mid Circle', cat: 'circle', kind: 'circle', p: { r: 10.4, w: 1.45 } },
    { name: 'Bold Circle', cat: 'circle', kind: 'circle', p: { r: 9.2, w: 2.15 } },
    { name: 'Small Circle', cat: 'circle', kind: 'circle', p: { r: 6.1, w: 1.35 } },
    { name: 'Circle Pin', cat: 'circle', kind: 'circledot', p: { r: 8.8, w: 1.35, dot: 1.4 } },
    { name: 'Circle Core', cat: 'circle', kind: 'circledot', p: { r: 11.2, w: 1.5, dot: 1.85 } },
    { name: 'Scope', cat: 'circle', kind: 'circlecross', p: { r: 12.4, w: 1.3, gap: 2.2, len: 5.4, cw: 1.2 } },
    { name: 'Aperture', cat: 'circle', kind: 'circlecross', p: { r: 10.6, w: 1.45, gap: 3.4, len: 6.2, cw: 1.35 } },
    { name: 'Arc Four', cat: 'circle', kind: 'arcs', p: { r: 9.4, w: 1.6, sweep: 42, count: 4 } },
    { name: 'Arc Six', cat: 'circle', kind: 'arcs', p: { r: 10.2, w: 1.45, sweep: 28, count: 6 } },
    { name: 'Arc Pin', cat: 'circle', kind: 'arcsdot', p: { r: 9.8, w: 1.5, sweep: 36, count: 4, dot: 1.3 } },
    { name: 'Broken Ring', cat: 'circle', kind: 'arcs', p: { r: 8.6, w: 1.8, sweep: 58, count: 4 } },
    { name: 'Corners', cat: 'tactical', kind: 'brackets', p: { gap: 4.2, len: 6.4, w: 1.45 } },
    { name: 'Box Corners', cat: 'tactical', kind: 'brackets', p: { gap: 6.2, len: 7.2, w: 1.6 } },
    { name: 'Tight Brackets', cat: 'tactical', kind: 'brackets', p: { gap: 3.1, len: 5.2, w: 1.3 } },
    { name: 'Bracket Pin', cat: 'tactical', kind: 'bracketsdot', p: { gap: 5.1, len: 6.4, w: 1.4, r: 1.25 } },
    { name: 'Chevron', cat: 'tactical', kind: 'chevron', p: { spread: 8.4, drop: 3.6, w: 1.6 } },
    { name: 'Wide Chevron', cat: 'tactical', kind: 'chevron', p: { spread: 11.2, drop: 4.4, w: 1.75 } },
    { name: 'Drop V', cat: 'tactical', kind: 'chevrondot', p: { spread: 7.6, drop: 3.2, w: 1.5, r: 1.2 } },
    { name: 'Diamond', cat: 'geo', kind: 'diamond', p: { size: 7.2, w: 1.45, fill: false } },
    { name: 'Solid Diamond', cat: 'geo', kind: 'diamond', p: { size: 4.6, w: 0, fill: true } },
    { name: 'Diamond Pin', cat: 'geo', kind: 'diamonddot', p: { size: 8.4, w: 1.4, r: 1.2 } },
    { name: 'Box', cat: 'geo', kind: 'square', p: { size: 6.8, w: 1.4, fill: false } },
    { name: 'Solid Box', cat: 'geo', kind: 'square', p: { size: 3.6, w: 0, fill: true } },
    { name: 'Box Pin', cat: 'geo', kind: 'squaredot', p: { size: 8.2, w: 1.35, r: 1.15 } },
    { name: 'Triangle', cat: 'geo', kind: 'triangle', p: { size: 7.4, w: 1.45, fill: false } },
    { name: 'Hex', cat: 'geo', kind: 'hex', p: { size: 8.6, w: 1.4 } },
    { name: 'Hex Pin', cat: 'geo', kind: 'hexdot', p: { size: 9.2, w: 1.35, r: 1.2 } },
    { name: 'Burst 6', cat: 'styled', kind: 'burst', p: { count: 6, inner: 4.2, outer: 10.4, w: 1.3 } },
    { name: 'Burst 8', cat: 'styled', kind: 'burst', p: { count: 8, inner: 4.6, outer: 10.8, w: 1.25 } },
    { name: 'Star Burst', cat: 'styled', kind: 'burstdot', p: { count: 8, inner: 5.2, outer: 11.4, w: 1.2, r: 1.35 } },
    { name: 'Pills', cat: 'styled', kind: 'pills', p: { gap: 3.8, len: 8.6, w: 2.3 } },
    { name: 'Open Pills', cat: 'styled', kind: 'pills', p: { gap: 5.6, len: 9.4, w: 2.05 } },
    { name: 'Plus Circle', cat: 'hybrid', kind: 'pluscircle', p: { r: 11.6, w: 1.35, gap: 2.4, len: 5.6, cw: 1.25 } }
  ];

  const VARIANT_COLORS = [
    COLORS.cyan, COLORS.lime, COLORS.red, COLORS.white, COLORS.orange,
    COLORS.pink, COLORS.purple, COLORS.yellow, COLORS.teal, COLORS.gold,
    COLORS.blue, COLORS.magenta
  ];

  function polarize(spec, index) {
    const copy = JSON.parse(JSON.stringify(spec));
    copy.color = VARIANT_COLORS[index % VARIANT_COLORS.length];
    return copy;
  }

  function tweakParams(spec, slot) {
    const next = polarize(spec, slot);
    const p = next.p;
    const wave = 1 + ((slot % 5) - 2) * 0.06;
    Object.keys(p).forEach(function (key) {
      if (typeof p[key] === 'number' && key !== 'count') {
        p[key] = Math.round(p[key] * wave * 100) / 100;
      }
    });
    if (slot % 4 === 1 && p.w) p.w = Math.max(1.05, p.w + 0.25);
    if (slot % 4 === 2 && p.gap) p.gap = Math.max(1.4, p.gap + 0.8);
    if (slot % 4 === 3 && p.len) p.len = Math.max(5.2, p.len + 1.1);
    return next;
  }

  function buildCatalog() {
    const list = [];
    let id = 1;
    const usedNames = {};

    function add(spec) {
      const builder = KINDS[spec.kind];
      if (!builder) return;
      let name = spec.name;
      if (usedNames[name]) {
        name = spec.name + ' ' + (usedNames[name] + 1);
      }
      usedNames[spec.name] = (usedNames[spec.name] || 0) + 1;
      list.push({
        id: id,
        name: name,
        category: spec.cat,
        color: spec.color || colorAt(id),
        outline: '#05070A',
        elements: builder(spec.p)
      });
      id += 1;
    }

    SPECS.forEach(function (spec, index) {
      add(polarize(spec, index));
    });

    let slot = 0;
    while (list.length < 175) {
      const spec = SPECS[slot % SPECS.length];
      const variant = tweakParams(spec, slot + 3);
      const colorName = Object.keys(COLORS).find(function (key) {
        return COLORS[key] === variant.color;
      }) || 'Tone';
      variant.name = spec.name + ' ' + colorName.charAt(0).toUpperCase() + colorName.slice(1);
      add(variant);
      slot += 1;
    }

    return list.slice(0, 175);
  }

  function polarToCartesian(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(el) {
    const start = polarToCartesian(el.cx, el.cy, el.r, el.start);
    const end = polarToCartesian(el.cx, el.cy, el.r, el.start + el.sweep);
    const large = el.sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${el.r} ${el.r} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  function elementMarkup(el, color, outline, extra) {
    const sw = (el.sw || 0) + extra;
    const filled = !!el.fill;
    const fill = filled && extra === 0 ? color : (filled && extra > 0 ? outline : 'none');
    const stroke = (!filled || extra > 0 || (el.sw || 0) > 0) ? (extra > 0 ? outline : color) : 'none';
    const width = filled && extra === 0 && !el.sw ? 0 : Math.max(sw, extra > 0 ? extra : 0);
    const rot = el.rot
      ? ` transform="rotate(${el.rot} ${el.cx || (el.x + el.w / 2)} ${el.cy || (el.y + el.h / 2)})"`
      : '';

    if (el.t === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" />`;
    }
    if (el.t === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${extra > 0 ? outline : color}" stroke-width="${sw}" />`;
    }
    if (el.t === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${el.rx || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${rot} />`;
    }
    if (el.t === 'poly') {
      return `<polygon points="${el.points}" fill="${fill}" stroke="${extra > 0 ? outline : color}" stroke-width="${Math.max(width, 1.1)}" />`;
    }
    if (el.t === 'path' || el.t === 'arc') {
      const d = el.t === 'arc' ? arcPath(el) : el.d;
      return `<path d="${d}" fill="none" stroke="${extra > 0 ? outline : color}" stroke-width="${sw}" />`;
    }
    return '';
  }

  function renderSvg(style, options) {
    const opts = options || {};
    const size = opts.size || 72;
    const opacity = opts.opacity == null ? 1 : opts.opacity;
    const color = opts.color || style.color;
    const outline = style.outline || '#05070A';
    const outlinePass = style.elements.map(function (el) {
      return elementMarkup(el, color, outline, 2.15);
    }).join('');
    const colorPass = style.elements.map(function (el) {
      return elementMarkup(el, color, outline, 0);
    }).join('');

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="' +
      size +
      '" height="' +
      size +
      '" style="opacity:' +
      opacity +
      '" aria-hidden="true">' +
      '<g stroke-linecap="round" stroke-linejoin="round">' +
      outlinePass +
      colorPass +
      '</g></svg>'
    );
  }

  const CATALOG = buildCatalog();
  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'classic', label: 'Classic' },
    { id: 'cross', label: 'Cross' },
    { id: 'circle', label: 'Circle' },
    { id: 'tactical', label: 'Tactical' },
    { id: 'geo', label: 'Geo' },
    { id: 'hybrid', label: 'Hybrid' },
    { id: 'styled', label: 'Styled' }
  ];

  root.DJCrosshair = {
    catalog: CATALOG,
    categories: CATEGORIES,
    renderSvg: renderSvg,
    get: function (id) {
      return CATALOG.find(function (item) { return item.id === id; }) || CATALOG[0];
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
