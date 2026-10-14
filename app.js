const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const state = {
  cat: 'Все', season: 'Все',
  cart: [],            // [{ id, size }]
  removed: null,       // { item, index } для отмены удаления
  product: null, productSize: '',
  tgBack: 'product', tgText: '',
  sheet: null, lastFocus: null,
  revFilter: 'Все'
};

const prod = (id) => PRODUCTS.find((p) => p.id === id);
const inCart = (id) => state.cart.some((i) => i.id === id);

/* ---------- каталог ---------- */

function renderFilters() {
  $('#catChips').innerHTML = CATS.map((c) =>
    `<button class="chip" data-act="cat" data-val="${c}" aria-pressed="${state.cat === c}">${c}</button>`).join('');
  const showSeason = SEASON_CATS.includes(state.cat);
  const sc = $('#seasonChips');
  sc.hidden = !showSeason;
  sc.innerHTML = showSeason ? SEASONS.map((s) =>
    `<button class="chip sm" data-act="season" data-val="${s}" aria-pressed="${state.season === s}">${s}</button>`).join('') : '';
}

function setCat(c) {
  state.cat = c;
  if (!SEASON_CATS.includes(c)) state.season = 'Все';
  renderFilters();
  renderGrid();
}

function filtered() {
  return PRODUCTS.filter((p) =>
    (state.cat === 'Все' || p.cat === state.cat) &&
    (state.season === 'Все' || p.season === state.season));
}

function cardHTML(p) {
  const added = inCart(p.id);
  return `<article class="card">
    <div class="card-media">
      <button class="card-open" data-act="openProduct" data-id="${p.id}" aria-label="Открыть карточку: ${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy" style="object-position:${p.pos}"></button>
      ${p.season ? `<span class="tag small">${p.season}</span>` : ''}
      <button class="add${added ? ' added' : ''}" data-act="add" data-id="${p.id}" aria-label="${added ? 'В корзине' : 'Добавить в корзину'}">${added ? svg('check', 20, 2.4) : svg('plus', 20, 2.4)}</button>
    </div>
    <div class="card-info"><span class="card-name">${esc(p.name)}</span><span class="card-price">${PRICE}</span></div>
  </article>`;
}

function renderGrid() {
  const list = filtered();
  $('#countLabel').textContent = plural(list.length);
  $('#grid').innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="empty-note"><p>В этой категории пока нет товаров.</p><button class="btn btn-ghost" data-act="reset">Показать всё</button></div>`;
}

/* ---------- корзина ---------- */

function refreshBadge() {
  const n = state.cart.length;
  const b = $('#cartBadge');
  b.hidden = n === 0;
  b.textContent = n;
  const m = $('#menuCount');
  m.hidden = n === 0;
  m.textContent = n;
}

function afterCartChange() {
  refreshBadge();
  renderGrid();
}

function addToCart(id, size = '') {
  state.cart.push({ id, size });
  afterCartChange();
}

function addFromCard(id) {
  if (inCart(id)) return openSheet('cart');
  addToCart(id);
  toast(prod(id), 'Добавлено в корзину', 'Открыть', () => openSheet('cart'));
}

function addFromProduct(id) {
  if (inCart(id)) return openSheet('cart');
  addToCart(id, state.productSize);
  renderProduct();
  toast(prod(id), 'Добавлено в корзину', 'Открыть', () => openSheet('cart'));
}

function removeFromCart(id) {
  const index = state.cart.findIndex((i) => i.id === id);
  if (index < 0) return;
  const [item] = state.cart.splice(index, 1);
  state.removed = { item, index };
  afterCartChange();
  renderCart();
  toast(prod(id), 'Товар удалён', 'Вернуть', undoRemove);
}

function undoRemove() {
  if (!state.removed) return;
  const { item, index } = state.removed;
  state.cart.splice(Math.min(index, state.cart.length), 0, item);
  state.removed = null;
  afterCartChange();
  renderCart();
  hideToast();
}

function renderCart() {
  const body = $('#sheet-cart .sheet-body');
  const n = state.cart.length;
  const head = `<div class="sheet-head"><div class="row-gap"><h2>Корзина</h2><span class="muted">${n ? plural(n) : ''}</span></div>
    <button class="icon-btn solid" data-act="close" aria-label="Закрыть">${svg('x', 20, 2)}</button></div>`;

  if (!n) {
    body.innerHTML = head + `
      <div class="empty">
        <div class="empty-ico">${svg('bag', 36, 1.6)}</div>
        <h3>Корзина пуста</h3>
        <p>Добавляйте вещи круглой кнопкой «+» на карточках в каталоге.</p>
      </div>
      <div class="stack"><button class="btn btn-accent" data-act="scroll" data-val="#catalog">Перейти в каталог</button></div>`;
    return;
  }

  const items = state.cart.map((i) => {
    const p = prod(i.id);
    return `<div class="cart-item">
      <img src="${p.img}" alt="" style="object-position:${p.pos}">
      <div class="cart-info">
        <span class="ci-name">${esc(p.name)}</span>
        <select class="select${i.size ? '' : ' need'}" data-cart-size="${p.id}" aria-label="Размер: ${esc(p.name)}">
          <option value="" disabled ${i.size ? '' : 'selected'}>Выбрать размер</option>
          ${SIZES.filter((s) => !OUT_OF_STOCK.includes(s)).map((s) => `<option value="${s}" ${s === i.size ? 'selected' : ''}>Размер ${s}</option>`).join('')}
        </select>
        <span class="ci-price">${PRICE}</span>
      </div>
      <button class="icon-btn solid" data-act="remove" data-id="${p.id}" aria-label="Удалить: ${esc(p.name)}">${svg('trash', 19, 1.9)}</button>
    </div>`;
  }).join('');

  const missing = state.cart.some((i) => !i.size);
  body.innerHTML = head + `
    <div>${items}</div>
    <div class="note flat">
      <span class="ico">${svg('pin', 20, 2)}</span>
      <div class="note-text"><strong>Где забрать</strong><span>г. Красноярск, Карла Маркса 125, ТЦ «Хамелеон»<br>Режим работы 11:00–20:00</span><span>Доставки нет — только самовывоз</span></div>
    </div>
    <div class="total"><span class="muted">Итого</span><span class="total-sum">${TOTAL_PLACEHOLDER}</span></div>
    <div class="stack">
      <button class="btn btn-accent" data-act="cartTg" ${missing ? 'disabled' : ''}>Оформить в Telegram</button>
      <p class="hint center">${missing ? 'Выберите размер у каждого товара' : 'Менеджер получит список товаров с размерами'}</p>
    </div>`;
}

/* ---------- карточка товара ---------- */

function openProduct(id) {
  state.product = id;
  const cur = state.cart.find((i) => i.id === id);
  state.productSize = cur ? cur.size : '';
  renderProduct();
  openSheet('product');
}

function renderProduct() {
  const p = prod(state.product);
  if (!p) return;
  const size = state.productSize;
  const added = inCart(p.id);
  $('#sheet-product .sheet-body').innerHTML = `
    <div class="ps-media">
      <img src="${p.img}" alt="${esc(p.name)}" style="object-position:${p.pos}">
      ${p.season ? `<span class="tag small">${p.season}</span>` : ''}
      <button class="icon-btn" data-act="close" aria-label="Закрыть">${svg('x', 20, 2)}</button>
    </div>
    <div class="ps-head">
      <div><h2>${esc(p.name)}</h2><span class="muted">${p.cat}</span></div>
      <span class="ps-price">${PRICE}</span>
    </div>
    <div class="sizes-head"><span class="label">Размер</span></div>
    <div class="sizes">${SIZES.map((s) => {
      const out = OUT_OF_STOCK.includes(s);
      return `<button class="size${s === size ? ' on' : ''}" data-act="size" data-val="${s}" ${out ? 'disabled' : ''} aria-pressed="${s === size}" aria-label="${out ? s + ', нет в наличии' : 'Размер ' + s}">${s}</button>`;
    }).join('')}</div>
    <p class="hint">${size ? `Выбран размер ${size}. Наличие подтвердит менеджер.` : 'Выберите размер, чтобы написать менеджеру.'}</p>
    <div class="ps-actions">
      <button class="round-btn${added ? ' on' : ''}" data-act="addCart" data-id="${p.id}" aria-label="${added ? 'В корзине' : 'Добавить в корзину'}">${added ? svg('check', 22, 2.2) : svg('bagPlus', 22, 1.8)}</button>
      <button class="btn btn-accent grow" data-act="tg" ${size ? '' : 'disabled'}>${size ? 'Написать в Telegram' : 'Выберите размер'}</button>
    </div>
    <div class="pickup-line"><span class="ico">${svg('pin', 16, 2)}</span><span>Самовывоз: Карла Маркса 125, ТЦ «Хамелеон» · 11:00–20:00</span></div>`;
}

/* ---------- Telegram ---------- */

function openTg(from) {
  state.tgBack = from;
  let text;
  if (from === 'product') {
    const p = prod(state.product);
    text = `Здравствуйте! Хочу забрать в магазине:\n${p.name} — размер ${state.productSize} — ${PRICE}`;
  } else {
    const lines = state.cart.map((i) => `— ${prod(i.id).name}, размер ${i.size}`);
    text = `Здравствуйте! Хочу забрать в магазине:\n${lines.join('\n')}`;
  }
  state.tgText = text;
  $('#sheet-tg .sheet-body').innerHTML = `
    <div class="sheet-head"><span class="label">Telegram</span>
      <button class="icon-btn solid" data-act="close" aria-label="Закрыть">${svg('x', 20, 2)}</button></div>
    <div class="tg-ico">${svg('tg', 24, 2)}</div>
    <h3 class="tg-title">Открываем Telegram</h3>
    <p class="muted tg-lead">Сообщение менеджеру уже готово. В чате его останется отправить.</p>
    <div class="bubble">${esc(text).replace(/\n/g, '<br>')}</div>
    <div class="stack">
      <a class="btn btn-accent" href="${tgUrl(text)}" target="_blank" rel="noopener">Перейти в чат</a>
      <button class="btn btn-ghost" data-act="tgBack">Назад</button>
    </div>`;
  openSheet('tg');
}

/* ---------- отзывы и «о нас» ---------- */

function reviewHTML(r) {
  return `<article class="rev">
    <div class="rev-top"><div class="av">?</div><div class="rev-who"><strong>[Имя покупателя]</strong><span>[дата] · ${r.source}</span></div></div>
    <div class="stars">${Array.from({ length: 5 }, () => svg('star', 14, 0)).join('')}</div>
    <p>[Текст отзыва: сюда вставляется реальный отзыв покупателя]</p>
    ${r.photos.length ? `<div class="rev-photos">${r.photos.map((src) => `<img src="${src}" alt="Фото покупателя">`).join('')}</div>` : ''}
    <span class="rev-item">Покупка: ${r.item}</span>
  </article>`;
}

function renderReviewsSheet() {
  const f = state.revFilter;
  const list = REVIEWS.filter((r) => f === 'Все' || (f === 'С фото' ? r.photos.length > 0 : r.source === f));
  $('#revFilters').innerHTML = ['Все', 'С фото', 'Telegram', 'TikTok'].map((x) =>
    `<button class="chip sm" data-act="revFilter" data-val="${x}" aria-pressed="${f === x}">${x}</button>`).join('');
  $('#reviewList').innerHTML = list.length ? list.map(reviewHTML).join('')
    : '<p class="hint">Пока нет отзывов с таким фильтром.</p>';
}

function aboutHTML(withHead) {
  return `${withHead ? `<div class="sheet-head"><span class="label">О нас</span>
      <button class="icon-btn solid" data-act="close" aria-label="Закрыть">${svg('x', 20, 2)}</button></div>` : ''}
    <div class="about-media"><img src="img/sneakers-white.webp" alt="Магазин TRUST STYLE"></div>
    <div class="about-title"><h2>TRUST STYLE</h2>
      <p class="muted">Молодёжная одежда и обувь в Красноярске. Выбирайте на сайте, примеряйте и забирайте в магазине.</p></div>
    <div class="info">
      <div class="info-row"><span class="ico">${svg('pin', 20, 2)}</span><div><small>Адрес</small><b>г. Красноярск, Карла Маркса 125, ТЦ «Хамелеон»</b></div></div>
      <div class="info-row"><span class="ico">${svg('clock', 20, 2)}</span><div><small>Режим работы</small><b>11:00 – 20:00</b></div></div>
      <div class="info-row"><span class="ico">${svg('tt', 20, 2)}</span><div><small>TikTok</small><b>@trust.style</b></div></div>
    </div>
    <div class="stack">
      <a class="btn btn-accent" href="${MAP_URL}" target="_blank" rel="noopener">${svg('route', 18, 2)}Построить маршрут</a>
      <div class="row-btns">
        <a class="btn btn-ghost" href="${TIKTOK}" target="_blank" rel="noopener">TikTok</a>
        <a class="btn btn-ghost" href="${TG_BASE}" target="_blank" rel="noopener">Telegram</a>
      </div>
    </div>`;
}
