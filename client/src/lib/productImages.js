/**
 * Photorealistic product packaging by application route:
 *  - injectable → glass lyophilized vial
 *  - topical    → face serum dropper bottle
 *  - nasal      → nasal spray bottle
 */

const BASE = '/images/products';

const VIAL = {
  lavender: `${BASE}/vial-lavender.jpg`,
  indigo: `${BASE}/vial-indigo.jpg`,
  rose: `${BASE}/vial-rose.jpg`,
  violet: `${BASE}/vial-violet.jpg`,
  amber: `${BASE}/vial-amber.jpg`,
};

/** Face / topical serum dropper bottles */
const SERUM = {
  violet: `${BASE}/dropper-violet.jpg`,
  rose: `${BASE}/dropper-rose.jpg`,
};

/** Nasal spray bottles */
const NASAL = {
  blue: `${BASE}/nasal-blue.jpg`,
  violet: `${BASE}/nasal-violet.jpg`,
};

function hashSlug(slug) {
  const s = String(slug || '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Explicit packaging photo per product */
const BY_SLUG = {
  // Injectable research — glass lyophilized vials
  'bpc-157': VIAL.indigo,
  'tb-500': VIAL.violet,
  'cjc-1295-no-dac': VIAL.violet,
  ipamorelin: VIAL.lavender,
  semaglutide: VIAL.rose,
  tirzepatide: VIAL.rose,
  'mots-c': VIAL.amber,
  epithalon: VIAL.lavender,
  'melanotan-ii': VIAL.violet,

  // Topical / face apply — serum dropper bottles
  'ghk-cu': SERUM.violet,
  'ghk-cu-serum': SERUM.violet,
  argireline: SERUM.violet,
  'matrixyl-3000': SERUM.rose,
  'snap-8': SERUM.rose,

  // Nasal research — nasal spray bottles
  selank: NASAL.blue,
  semax: NASAL.blue,
  'semax-nasal-kit': NASAL.blue,
  'selank-nasal-kit': NASAL.violet,
  'oxytocin-nasal': NASAL.violet,
  'dihexa-nasal': NASAL.violet,
};

function pickByRoute(product) {
  const route = String(product?.applicationRoute || 'injectable').toLowerCase();
  const c = String(product?.imageColor || '').toLowerCase();
  const slug = product?.slug || '';

  if (route === 'topical') {
    // warmer / coral accents → rose serum; otherwise violet serum
    if (c.includes('f4') || c.includes('e1') || c.includes('db') || c.includes('ea') || c.includes('f5')) {
      return SERUM.rose;
    }
    if (slug) {
      return [SERUM.violet, SERUM.rose][hashSlug(slug) % 2];
    }
    return SERUM.violet;
  }

  if (route === 'nasal') {
    if (c.includes('a8') || c.includes('8b') || c.includes('63') || c.includes('93')) {
      return NASAL.violet;
    }
    if (slug) {
      return [NASAL.blue, NASAL.violet][hashSlug(slug) % 2];
    }
    return NASAL.blue;
  }

  // injectable vials
  if (c.includes('db') || c.includes('e1') || c.includes('f4')) return VIAL.rose;
  if (c.includes('ea') || c.includes('f5') || c.includes('f59')) return VIAL.amber;
  if (c.includes('93') || c.includes('7c') || c.includes('8b') || c.includes('a8')) return VIAL.violet;
  if (c.includes('4f') || c.includes('37') || c.includes('2563') || c.includes('1d4e')) return VIAL.indigo;
  if (slug) {
    const list = Object.values(VIAL);
    return list[hashSlug(slug) % list.length];
  }
  return VIAL.lavender;
}

/**
 * Resolve packaging photo for a product from the live API.
 */
export function getProductImage(product) {
  if (!product) return VIAL.lavender;
  if (product.imageUrl) return product.imageUrl;
  if (product.slug && BY_SLUG[product.slug]) return BY_SLUG[product.slug];
  return pickByRoute(product);
}

export function getProductImageAlt(product) {
  const name = product?.name || 'Research peptide';
  const route = String(product?.applicationRoute || 'injectable').toLowerCase();
  if (route === 'topical') {
    return `${name} — topical face serum dropper bottle for laboratory research`;
  }
  if (route === 'nasal') {
    return `${name} — nasal research spray bottle`;
  }
  return `${name} — clear glass research vial with lyophilized powder`;
}
