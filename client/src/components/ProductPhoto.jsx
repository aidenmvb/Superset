import { getProductImage, getProductImageAlt } from '../lib/productImages';

/**
 * Real glass research-vial photo in a soft circular frame
 * that blends into the card (no hard rectangular edges).
 */
export default function ProductPhoto({
  product,
  size = 'md',
  animate = true,
  showCaption = true,
  className = '',
}) {
  const src = getProductImage(product);
  const alt = getProductImageAlt(product);
  const accent = product?.imageColor || '#4f46e5';

  const shell =
    size === 'lg'
      ? 'min-h-[340px] sm:min-h-[420px] p-6 sm:p-10'
      : size === 'sm'
        ? 'min-h-[140px] p-3'
        : 'min-h-[220px] sm:min-h-[260px] p-5 sm:p-7';

  const circle =
    size === 'lg'
      ? 'h-[280px] w-[280px] sm:h-[340px] sm:w-[340px]'
      : size === 'sm'
        ? 'h-28 w-28'
        : 'h-[160px] w-[160px] sm:h-[190px] sm:w-[190px]';

  return (
    <div
      className={`relative flex ${shell} w-full flex-col items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `
          radial-gradient(circle at 50% 48%, ${accent}22 0%, transparent 55%),
          radial-gradient(ellipse 90% 70% at 50% 100%, ${accent}14 0%, transparent 55%),
          linear-gradient(180deg, #f8f7ff 0%, #ffffff 55%, #fff7f9 100%)
        `,
      }}
    >
      {/* Outer soft halo — full circle blend into card */}
      <div
        className={`pointer-events-none absolute rounded-full blur-2xl opacity-50 ${
          size === 'lg' ? 'h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]' : 'h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]'
        }`}
        style={{
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
        }}
      />

      {/* Circular photo well */}
      <div
        className={`relative z-[1] ${circle} ${animate ? 'animate-vial-float' : ''}`}
      >
        {/* Soft ring matching accent */}
        <div
          className="absolute -inset-1 rounded-full opacity-70"
          style={{
            background: `conic-gradient(from 200deg, ${accent}55, #f43f5e44, #8b5cf655, ${accent}55)`,
            filter: 'blur(6px)',
          }}
        />

        <div className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-white/80">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full scale-110 object-cover object-center transition duration-500 group-hover:scale-[1.16]"
            width={640}
            height={640}
          />

          {/* Radial edge blend — photo melts into the circle rim / card */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(
                  circle at 50% 45%,
                  transparent 42%,
                  rgba(255,255,255,0.15) 58%,
                  rgba(248,247,255,0.75) 78%,
                  rgba(255,255,255,0.95) 100%
                )
              `,
            }}
          />
          {/* Color-matched wash so studio backdrop matches site */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light opacity-50"
            style={{
              background: `radial-gradient(circle at 40% 30%, ${accent}33, transparent 65%)`,
            }}
          />
          {/* Soft specular edge for depth */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_24px_8px_rgba(255,255,255,0.55)]" />
        </div>
      </div>

      {showCaption && product?.vialSize && (
        <div className="relative z-[2] mt-4 flex flex-wrap justify-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-paper-line backdrop-blur sm:text-xs">
            {product.vialSize}
          </span>
          {product.purity && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur sm:text-xs">
              {product.purity}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
