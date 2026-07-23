import db from './db.js';
import { randomUUID } from 'crypto';

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = randomUUID().slice(0, 6).toUpperCase();
  return `SS-${y}${m}${d}-${rand}`;
}

/**
 * Price cart lines from the live SQLite catalog (never trust client prices).
 */
export function priceCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'At least one order item is required' };
  }

  const productStmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const lineItems = [];
  let subtotalCents = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    if (!item.productId || !Number.isInteger(qty) || qty < 1) {
      return { error: 'Each item needs productId and quantity >= 1' };
    }

    const product = productStmt.get(Number(item.productId));
    if (!product) {
      return { error: `Product ${item.productId} not found` };
    }
    if (product.stock < qty) {
      return { error: `${product.name} only has ${product.stock} in stock` };
    }

    const lineTotal = product.price_cents * qty;
    subtotalCents += lineTotal;
    lineItems.push({
      product,
      quantity: qty,
      unitPriceCents: product.price_cents,
      lineTotalCents: lineTotal,
    });
  }

  const shippingCents = subtotalCents >= 15000 ? 0 : 999;
  const totalCents = subtotalCents + shippingCents;

  return { lineItems, subtotalCents, shippingCents, totalCents };
}

export function findOrderByPaymentIntent(paymentIntentId) {
  if (!paymentIntentId) return null;
  return db
    .prepare('SELECT * FROM orders WHERE stripe_payment_intent_id = ?')
    .get(paymentIntentId);
}

export function mapOrder(order, items = null) {
  const payload = {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    shippingCity: order.shipping_city,
    shippingState: order.shipping_state,
    shippingZip: order.shipping_zip,
    shippingCountry: order.shipping_country,
    notes: order.notes,
    status: order.status,
    paymentStatus: order.payment_status,
    stripePaymentIntentId: order.stripe_payment_intent_id,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
    subtotal: order.subtotal_cents / 100,
    shipping: order.shipping_cents / 100,
    total: order.total_cents / 100,
    researchUseAck: Boolean(order.research_use_ack),
    createdAt: order.created_at,
  };

  if (items) {
    payload.items = items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      vialSize: item.vial_size,
      unitPriceCents: item.unit_price_cents,
      unitPrice: item.unit_price_cents / 100,
      quantity: item.quantity,
      lineTotalCents: item.line_total_cents,
      lineTotal: item.line_total_cents / 100,
    }));
  }

  return payload;
}

export function getOrderItems(orderId) {
  return db
    .prepare(
      `
      SELECT id, product_id, product_name, vial_size, unit_price_cents,
             quantity, line_total_cents
      FROM order_items
      WHERE order_id = ?
    `
    )
    .all(orderId);
}

/**
 * Persist a paid order and decrement stock. Idempotent on payment intent id.
 */
export function createPaidOrder({
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  shippingCity,
  shippingState,
  shippingZip,
  shippingCountry = 'US',
  notes,
  researchUseAck,
  items,
  paymentIntentId,
  paymentStatus = 'paid',
  status = 'paid',
}) {
  const existing = findOrderByPaymentIntent(paymentIntentId);
  if (existing) {
    return {
      alreadyExists: true,
      order: mapOrder(existing, getOrderItems(existing.id)),
    };
  }

  const priced = priceCartItems(items);
  if (priced.error) {
    return { error: priced.error };
  }

  const { lineItems, subtotalCents, shippingCents, totalCents } = priced;
  const orderNumber = generateOrderNumber();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_number, customer_name, customer_email, customer_phone,
      shipping_address, shipping_city, shipping_state, shipping_zip,
      shipping_country, notes, status, payment_status, stripe_payment_intent_id,
      subtotal_cents, shipping_cents, total_cents, research_use_ack
    ) VALUES (
      @order_number, @customer_name, @customer_email, @customer_phone,
      @shipping_address, @shipping_city, @shipping_state, @shipping_zip,
      @shipping_country, @notes, @status, @payment_status, @stripe_payment_intent_id,
      @subtotal_cents, @shipping_cents, @total_cents, 1
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (
      order_id, product_id, product_name, vial_size,
      unit_price_cents, quantity, line_total_cents
    ) VALUES (
      @order_id, @product_id, @product_name, @vial_size,
      @unit_price_cents, @quantity, @line_total_cents
    )
  `);

  const updateStock = db.prepare(
    `UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ?`
  );

  const orderId = db.transaction(() => {
    // Re-check stock inside transaction
    for (const line of lineItems) {
      const fresh = db.prepare('SELECT stock FROM products WHERE id = ?').get(line.product.id);
      if (!fresh || fresh.stock < line.quantity) {
        throw new Error(`Insufficient stock for ${line.product.name}`);
      }
    }

    const orderResult = insertOrder.run({
      order_number: orderNumber,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_phone: customerPhone?.trim() || null,
      shipping_address: shippingAddress.trim(),
      shipping_city: shippingCity.trim(),
      shipping_state: shippingState.trim(),
      shipping_zip: shippingZip.trim(),
      shipping_country: (shippingCountry || 'US').trim(),
      notes: notes?.trim() || null,
      status,
      payment_status: paymentStatus,
      stripe_payment_intent_id: paymentIntentId,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
    });

    const id = Number(orderResult.lastInsertRowid);
    for (const line of lineItems) {
      insertItem.run({
        order_id: id,
        product_id: line.product.id,
        product_name: line.product.name,
        vial_size: line.product.vial_size,
        unit_price_cents: line.unitPriceCents,
        quantity: line.quantity,
        line_total_cents: line.lineTotalCents,
      });
      updateStock.run(line.quantity, line.product.id);
    }
    return id;
  })();

  const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  return {
    alreadyExists: false,
    order: mapOrder(created, getOrderItems(orderId)),
  };
}
