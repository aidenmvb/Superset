/** Tiny className joiner — prefer Tailwind utilities over custom CSS. */
export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ');
}
