/**
 * Vantril product photography
 *
 * Home / Store cards → one consistent primary image per form (vial / serum / nasal)
 * Product detail gallery → 5 different studio shots of that packaging type
 */

const BASE = '/images/products/branded';

/** Same image for every injectable on home + store */
const PRIMARY = {
  injectable: `${BASE}/primary-vial.jpg`,
  topical: `${BASE}/primary-serum.jpg`,
  nasal: `${BASE}/primary-nasal.jpg`,
};

/** Distinct gallery shots (detail page only) */
const GALLERY = {
  injectable: [
    `${BASE}/vial-01-front.jpg`,
    `${BASE}/vial-02-angle.jpg`,
    `${BASE}/vial-03-closeup.jpg`,
    `${BASE}/vial-04-low.jpg`,
    `${BASE}/vial-05-high.jpg`,
  ],
  topical: [
    `${BASE}/serum-01-front.jpg`,
    `${BASE}/serum-02-pair.jpg`,
    `${BASE}/serum-03-diagonal.jpg`,
    `${BASE}/serum-04-upright.jpg`,
    `${BASE}/serum-05-wrap.jpg`,
  ],
  nasal: [
    `${BASE}/nasal-01-front.jpg`,
    `${BASE}/nasal-02-angle.jpg`,
    `${BASE}/nasal-03-closeup.jpg`,
    `${BASE}/nasal-04-front.jpg`,
    `${BASE}/nasal-05-pair.jpg`,
  ],
};

function routeKey(product) {
  const route = String(product?.applicationRoute || 'injectable').toLowerCase();
  if (route === 'topical') return 'topical';
  if (route === 'nasal') return 'nasal';
  return 'injectable';
}

/** Home / store / cart: identical primary shot per packaging type */
export function getProductImage(product) {
  if (!product) return PRIMARY.injectable;
  if (product.imageUrl) return product.imageUrl;
  return PRIMARY[routeKey(product)];
}

/** Product page only: five different photos of that packaging type */
export function getProductGallery(product) {
  const key = routeKey(product);
  const shots = GALLERY[key] || GALLERY.injectable;
  // Always 5 unique files; front shot matches the store primary
  return shots.slice(0, 5);
}

export function getProductImageAlt(product, index = 0) {
  const name = product?.name || 'Research peptide';
  const key = routeKey(product);
  const views = [
    'front packaging',
    'three-quarter angle',
    'label close-up',
    'studio angle',
    'alternate view',
  ];
  const view = views[index] || `view ${index + 1}`;
  if (key === 'topical') return `${name} — Vantril topical serum, ${view}`;
  if (key === 'nasal') return `${name} — Vantril nasal spray, ${view}`;
  return `${name} — Vantril research vial, ${view}`;
}
