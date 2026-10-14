/* ---------- шторки, тост, действия ---------- */

function openSheet(name) {
  if (state.sheet) closeSheet();
  state.lastFocus = document.activeElement;
  state.sheet = name;
  const el = $('#sheet-' + name);
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  el.scrollTop = 0;
  $('#scrim').classList.add('open');
  document.body.classList.add('locked');
  requestAnimationFrame(() => {
    const f = el.querySelector('button:not([disabled]), a[href], select');
    if (f) f.focus({ preventScroll: true });
  });
}

function closeSheet() {
  if (!state.sheet) return;
  const el = $('#sheet-' + state.sheet);
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  state.sheet = null;
  $('#scrim').classList.remove('open');
  document.body.classList.remove('locked');
  if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus({ preventScroll: true });
}

let toastTimer = null;
let toastFn = null;

function toast(p, title, action, fn) {
  $('#toastImg').src = p.img;
  $('#toastImg').style.objectPosition = p.pos;
  $('#toastTitle').textContent = title;
  $('#toastSub').textContent = p.name;
  $('#toastBtn').textContent = action;
  toastFn = fn;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4500);
}

function hideToast() {
  $('#toast').classList.remove('show');
  toastFn = null;
  clearTimeout(toastTimer);
}

function jump(sel) {
  const el = $(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const { act, id, val } = el.dataset;
  switch (act) {
    case 'cat': setCat(val); break;
    case 'season': state.season = val; renderFilters(); renderGrid(); break;
    case 'reset': setCat('Все'); break;
    case 'catGo': setCat(val); closeSheet(); jump('#catalog'); break;
    case 'openProduct': openProduct(id); break;
    case 'add': addFromCard(id); break;
    case 'size': {
      state.productSize = val;
      const it = state.cart.find((i) => i.id === state.product);
      if (it) it.size = val;
      renderProduct();
      break;
    }
    case 'addCart': if (inCart(id)) openSheet('cart'); else addFromProduct(id); break;
    case 'tg': openTg('product'); break;
    case 'cartTg': openTg('cart'); break;
    case 'tgBack': openSheet(state.tgBack); break;
    case 'remove': removeFromCart(id); break;
    case 'open': openSheet(val); break;
    case 'close': closeSheet(); break;
    case 'scroll': closeSheet(); jump(val); break;
    case 'revFilter': state.revFilter = val; renderReviewsSheet(); break;
    case 'toastAction': { const fn = toastFn; hideToast(); if (fn) fn(); break; }
  }
});

document.addEventListener('change', (e) => {
  const sel = e.target.closest('[data-cart-size]');
  if (!sel) return;
  const it = state.cart.find((i) => i.id === sel.dataset.cartSize);
  if (it) {
    it.size = sel.value;
    renderCart();
  }
});

$('#scrim').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.sheet) closeSheet();
});

function init() {
  $('#menuCats').innerHTML = CATS.map((c) =>
    `<button class="chip" data-act="catGo" data-val="${c}">${c}</button>`).join('');
  renderFilters();
  renderGrid();
  refreshBadge();
  renderCart();
  $('#reviewRow').innerHTML = REVIEWS.map(reviewHTML).join('');
  renderReviewsSheet();
  $('#aboutSection').innerHTML = aboutHTML(false);
  $('#aboutSheetBody').innerHTML = aboutHTML(true);
  $$('[data-tg-link]').forEach((a) => { a.href = tgUrl(''); });
}

init();
