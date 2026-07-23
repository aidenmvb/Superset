export function formatMoney(amount) {
  const value = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatMoneyFromCents(cents) {
  return formatMoney((Number(cents) || 0) / 100);
}
