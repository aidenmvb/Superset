/**
 * Real API client — all data comes from the Express + SQLite backend.
 * Do not replace these calls with hard-coded / mock product lists.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || data.details?.join?.(', ') || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export function getHealth() {
  return request('/api/health');
}

export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.application) qs.set('application', params.application);
  if (params.featured) qs.set('featured', 'true');
  if (params.q) qs.set('q', params.q);
  if (params.inStock) qs.set('inStock', 'true');
  const query = qs.toString();
  return request(`/api/products${query ? `?${query}` : ''}`);
}

export function getProductRoutes() {
  return request('/api/products/routes');
}

export function getLabsNearby({ lat, lng, radius = 500, limit = 15 }) {
  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    limit: String(limit),
  });
  return request(`/api/labs/nearby?${qs}`);
}

export function getLabs(params = {}) {
  const qs = new URLSearchParams();
  if (params.state) qs.set('state', params.state);
  if (params.city) qs.set('city', params.city);
  if (params.q) qs.set('q', params.q);
  const query = qs.toString();
  return request(`/api/labs${query ? `?${query}` : ''}`);
}

export function geocodeZip(zip) {
  return request(`/api/labs/geocode?zip=${encodeURIComponent(zip)}`);
}

export function submitTestRequest(payload) {
  return request('/api/labs/test-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProduct(idOrSlug) {
  return request(`/api/products/${encodeURIComponent(idOrSlug)}`);
}

export function getCategories() {
  return request('/api/categories');
}

export function createOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getOrder(orderNumber) {
  return request(`/api/orders/${encodeURIComponent(orderNumber)}`);
}

export function submitContact(payload) {
  return request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStripeConfig() {
  return request('/api/payments/config');
}

export function createPaymentIntent(payload) {
  return request('/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyBatchSerial(serialNumber) {
  return request('/api/batches/verify', {
    method: 'POST',
    body: JSON.stringify({ serialNumber }),
  });
}

function adminHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function adminLogin(email, password) {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout(token) {
  return request('/api/admin/logout', {
    method: 'POST',
    headers: adminHeaders(token),
  });
}

export function adminMe(token) {
  return request('/api/admin/me', {
    headers: adminHeaders(token),
  });
}

export function adminListSerials(token, q = '') {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return request(`/api/admin/serials${qs}`, {
    headers: adminHeaders(token),
  });
}

export function adminCreateSerial(token, payload) {
  return request('/api/admin/serials', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function adminImportCsv(token, csv) {
  return request('/api/admin/serials/import', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify({ csv }),
  });
}

export function adminDeleteSerial(token, serial) {
  return request(`/api/admin/serials/${encodeURIComponent(serial)}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
}

export function adminDocs(token) {
  return request('/api/admin/docs', {
    headers: adminHeaders(token),
  });
}

