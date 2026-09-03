(function () {
  const catalog = window.DJCrosshair.catalog;
  const categories = window.DJCrosshair.categories;
  const renderSvg = window.DJCrosshair.renderSvg;
  const getStyle = window.DJCrosshair.get;

  const SWATCHES = [
    '#F4F7FB', '#3EE0FF', '#7CFF6B', '#FF3B3B', '#FF8A1F',
    '#FFE14A', '#FF4DA8', '#B85CFF', '#2EF2C4', '#4D8BFF'
  ];

  const defaults = {
    styleId: 28,
    size: 100,
    opacity: 92,
    color: '#3EE0FF',
    customEnabled: true,
    defaultEnabled: false,
    aimOnly: true,
    hideInFirstPerson: false,
    hitmarker: true
  };

  const state = Object.assign({}, defaults);
  let category = 'all';
  let query = '';
  let saveTimer = null;
  let previewMode = false;

  const els = {
    app: document.getElementById('app'),
    crosshair: document.getElementById('crosshair'),
    hitmarker: document.getElementById('hitmarker'),
    preview: document.getElementById('previewStage'),
    styleName: document.getElementById('styleName'),
    styleMeta: document.getElementById('styleMeta'),
    grid: document.getElementById('grid'),
    cats: document.getElementById('cats'),
    search: document.getElementById('search'),
    size: document.getElementById('size'),
    opacity: document.getElementById('opacity'),
    sizeValue: document.getElementById('sizeValue'),
    opacityValue: document.getElementById('opacityValue'),
    color: document.getElementById('color'),
    swatches: document.getElementById('swatches'),
    resetBtn: document.getElementById('resetBtn'),
    closeBtn: document.getElementById('closeBtn'),
    customEnabled: document.getElementById('customEnabled'),
    defaultEnabled: document.getElementById('defaultEnabled'),
    aimOnly: document.getElementById('aimOnly'),
    hideInFirstPerson: document.getElementById('hideInFirstPerson'),
    hitmarkerToggle: document.getElementById('hitmarker')
  };

  function inGame() {
    return typeof GetParentResourceName === 'function';
  }

  function resourceName() {
    try {
      return GetParentResourceName();
    } catch (err) {
      return 'dj-crosshair';
    }
  }

  function nui(name, payload) {
    if (!inGame()) {
      return Promise.resolve({ ok: true });
    }
    return fetch('https://' + resourceName() + '/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload || {})
    }).then(function (res) {
      return res.json().catch(function () { return { ok: true }; });
    }).catch(function () {
      return { ok: false };
    });
  }

  function applySettings(next) {
    Object.assign(state, next || {});
    if (state.color) state.color = String(state.color).toUpperCase();
    syncControls();
    renderOverlay();
    renderLibrary();
    renderPreview();
  }

  function currentStyle() {
    return getStyle(Number(state.styleId));
  }

  function overlayScale() {
    return Math.max(40, Math.min(220, Number(state.size) || 100)) / 100;
  }

  function overlayOpacity() {
    return Math.max(0.15, Math.min(1, (Number(state.opacity) || 92) / 100));
  }

  function renderOverlay() {
    const style = currentStyle();
    const size = Math.round(84 * overlayScale());
    els.crosshair.innerHTML = renderSvg(style, {
      size: size,
      opacity: overlayOpacity(),
      color: state.color || style.color
    });
    els.crosshair.style.width = size + 'px';
    els.crosshair.style.height = size + 'px';
  }

  function renderPreview() {
    const style = currentStyle();
    els.preview.innerHTML = renderSvg(style, {
      size: 120,
      opacity: overlayOpacity(),
      color: state.color || style.color
    });
    els.styleName.textContent = style.name;
    els.styleMeta.textContent = 'Style ' + style.id + ' · ' + style.category;
  }

  function filtered() {
    return catalog.filter(function (item) {
      const catOk = category === 'all' || item.category === category;
      const q = query.trim().toLowerCase();
      const textOk = !q || String(item.id).includes(q) || item.name.toLowerCase().includes(q) || item.category.includes(q);
      return catOk && textOk;
    });
  }

  function renderLibrary() {
    const items = filtered();
    els.grid.innerHTML = items.map(function (item) {
      const selected = item.id === Number(state.styleId) ? ' selected' : '';
      return (
        '<button class="tile' + selected + '" type="button" data-id="' + item.id + '" title="' + item.name + '">' +
        renderSvg(item, { size: 58, color: state.color || item.color }) +
        '</button>'
      );
    }).join('');
  }

  function renderCats() {
    els.cats.innerHTML = categories.map(function (item) {
      const active = item.id === category ? ' active' : '';
      return '<button class="cat' + active + '" type="button" data-cat="' + item.id + '">' + item.label + '</button>';
    }).join('');
  }

  function renderSwatches() {
    els.swatches.innerHTML = SWATCHES.map(function (hex) {
      return '<button class="swatch" type="button" data-color="' + hex + '" style="background:' + hex + '" aria-label="' + hex + '"></button>';
    }).join('');
  }

  function syncControls() {
    els.size.value = String(state.size);
    els.opacity.value = String(state.opacity);
    els.sizeValue.textContent = state.size + '%';
    els.opacityValue.textContent = state.opacity + '%';
    els.color.value = (state.color || '#3EE0FF').toLowerCase();
    els.customEnabled.checked = !!state.customEnabled;
    els.defaultEnabled.checked = !!state.defaultEnabled;
    els.aimOnly.checked = !!state.aimOnly;
    els.hideInFirstPerson.checked = !!state.hideInFirstPerson;
    els.hitmarkerToggle.checked = !!state.hitmarker;
  }

  function persist(kind) {
    const payload = {
      styleId: Number(state.styleId),
      size: Number(state.size),
      opacity: Number(state.opacity),
      color: state.color,
      customEnabled: !!state.customEnabled,
      defaultEnabled: !!state.defaultEnabled,
      aimOnly: !!state.aimOnly,
      hideInFirstPerson: !!state.hideInFirstPerson,
      hitmarker: !!state.hitmarker
    };
    nui(kind || 'preview', payload);
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      nui('save', payload);
    }, 180);
  }

  function selectStyle(id) {
    const style = getStyle(Number(id));
    state.styleId = style.id;
    state.color = style.color;
    syncControls();
    renderOverlay();
    renderPreview();
    renderLibrary();
    persist();
  }

  function setMenu(open) {
    els.app.classList.toggle('hidden', !open);
  }

  function setVisible(visible) {
    els.crosshair.classList.toggle('hidden', !visible || !state.customEnabled);
  }

  function showHitmarker() {
    els.hitmarker.classList.remove('show');
    void els.hitmarker.offsetWidth;
    els.hitmarker.classList.add('show');
  }

  function notify(text) {
    const node = document.createElement('div');
    node.className = 'notify';
    node.textContent = text;
    document.body.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 1600);
  }

  els.grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-id]');
    if (!button) return;
    selectStyle(button.getAttribute('data-id'));
  });

  els.cats.addEventListener('click', function (event) {
    const button = event.target.closest('[data-cat]');
    if (!button) return;
    category = button.getAttribute('data-cat');
    renderCats();
    renderLibrary();
  });

  els.search.addEventListener('input', function () {
    query = els.search.value;
    renderLibrary();
  });

  els.size.addEventListener('input', function () {
    state.size = Number(els.size.value);
    els.sizeValue.textContent = state.size + '%';
    renderOverlay();
    renderPreview();
    persist();
  });

  els.opacity.addEventListener('input', function () {
    state.opacity = Number(els.opacity.value);
    els.opacityValue.textContent = state.opacity + '%';
    renderOverlay();
    renderPreview();
    persist();
  });

  els.color.addEventListener('input', function () {
    state.color = els.color.value.toUpperCase();
    renderOverlay();
    renderPreview();
    renderLibrary();
    persist();
  });

  els.swatches.addEventListener('click', function (event) {
    const button = event.target.closest('[data-color]');
    if (!button) return;
    state.color = button.getAttribute('data-color').toUpperCase();
    els.color.value = state.color.toLowerCase();
    renderOverlay();
    renderPreview();
    renderLibrary();
    persist();
  });

  ['customEnabled', 'defaultEnabled', 'aimOnly', 'hideInFirstPerson'].forEach(function (key) {
    els[key].addEventListener('change', function () {
      state[key] = els[key].checked;
      renderOverlay();
      setVisible(true);
      persist();
    });
  });

  els.hitmarkerToggle.addEventListener('change', function () {
    state.hitmarker = els.hitmarkerToggle.checked;
    persist();
  });

  els.closeBtn.addEventListener('click', function () {
    if (previewMode) {
      setMenu(false);
      return;
    }
    nui('close');
    setMenu(false);
  });

  els.resetBtn.addEventListener('click', function () {
    if (previewMode) {
      applySettings(defaults);
      return;
    }
    nui('reset').then(function (res) {
      applySettings(res.settings || defaults);
    });
  });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !els.app.classList.contains('hidden')) {
      if (previewMode) {
        setMenu(false);
      } else {
        nui('close');
        setMenu(false);
      }
    }
  });

  window.addEventListener('message', function (event) {
    const data = event.data || {};
    if (data.action === 'openMenu') {
      applySettings(data.settings || state);
      setVisible(true);
      setMenu(true);
    }
    if (data.action === 'closeMenu') {
      setMenu(false);
    }
    if (data.action === 'setSettings') {
      applySettings(data.settings || state);
    }
    if (data.action === 'setVisible') {
      setVisible(!!data.visible);
    }
    if (data.action === 'hitmarker') {
      showHitmarker();
    }
    if (data.action === 'notify' && data.text) {
      notify(data.text);
    }
  });

  renderCats();
  renderSwatches();
  applySettings(state);

  if (!inGame()) {
    previewMode = true;
    document.body.classList.add('preview-mode');
    setVisible(true);
    setMenu(true);
  }
})();
