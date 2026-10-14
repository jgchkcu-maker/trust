// ---- Настройки магазина ----
// Username менеджера в Telegram без @. Пока пусто: ссылки ведут на t.me/ без чата.
const TG_USERNAME = '';
const TG_BASE = TG_USERNAME ? `https://t.me/${TG_USERNAME}` : 'https://t.me/';
const PRICE = '0 000 ₽';            // TODO: заменить на реальные цены
const TOTAL_PLACEHOLDER = '00 000 ₽';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const OUT_OF_STOCK = ['XS'];        // TODO: размеры, которых нет в наличии
const CATS = ['Все', 'Куртки', 'Кроссовки', 'Худи', 'Кофты', 'Свитшоты', 'Кепки', 'Шапки', 'Ботинки'];
const SEASONS = ['Все', 'Зима', 'Демисезон', 'Лето'];
const SEASON_CATS = ['Куртки', 'Шапки'];
const TIKTOK = 'https://www.tiktok.com/@trust.style';
const MAP_URL = 'https://2gis.ru/krasnoyarsk/search/' + encodeURIComponent('Карла Маркса 125');

const PRODUCTS = [
  { id: 'p1', name: 'Пуховик стёганый, чёрный', cat: 'Куртки', season: 'Демисезон', img: 'img/jacket-black.webp', pos: '50% 50%' },
  { id: 'p2', name: 'Пуховик оверсайз, лайм', cat: 'Куртки', season: 'Зима', img: 'img/puffer-lime.webp', pos: '50% 50%' },
  { id: 'p3', name: 'Зип-худи с принтом, washed black', cat: 'Худи', season: '', img: 'img/hoodie-print.webp', pos: '50% 50%' },
  { id: 'p4', name: 'Зип-худи, графит', cat: 'Худи', season: '', img: 'img/hoodie-graphite.webp', pos: '50% 50%' },
  { id: 'p5', name: 'Пуховик с капюшоном, принт «крылья»', cat: 'Куртки', season: 'Зима', img: 'img/puffer-wings.webp', pos: '50% 50%' },
  { id: 'p6', name: 'Кроссовки на массивной подошве, белые', cat: 'Кроссовки', season: '', img: 'img/sneakers-white.webp', pos: '48% 52%' }
];

// TODO: заменить на реальные отзывы покупателей (Telegram / TikTok)
const REVIEWS = [
  { source: 'Telegram', item: 'пуховик стёганый, чёрный', photos: ['img/jacket-black.webp', 'img/puffer-wings.webp'] },
  { source: 'TikTok', item: 'кроссовки на массивной подошве', photos: [] },
  { source: 'Telegram', item: 'зип-худи, графит', photos: [] }
];

const ICONS = {
  bag: '<path d="M5.5 8h13l-1 12h-11l-1-12z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  bagPlus: '<path d="M5.5 8h13l-1 12h-11l-1-12z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path d="M12 11.5v5M9.5 14h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tg: '<path d="M21 3L3 10.5l7 2.5 2.5 7L21 3z"/><path d="M10 13l4-4"/>',
  tt: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  route: '<path d="M3 11l18-8-8 18-2-8-8-2z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/>'
};

function svg(name, size = 20, sw = 2) {
  const fill = name === 'star' ? 'currentColor' : 'none';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function plural(n) {
  const m10 = n % 10, m100 = n % 100;
  const word = (m10 === 1 && m100 !== 11) ? 'товар' : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'товара' : 'товаров';
  return `${n} ${word}`;
}

function tgUrl(text) {
  if (!text || !TG_USERNAME) return TG_BASE;
  return `${TG_BASE}?text=${encodeURIComponent(text)}`;
}
