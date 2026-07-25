import { getProductImage, getProductImageAlt } from '../lib/productImages';

/**
 * Full-bleed product packaging photo — image fills the entire frame edge-to-edge.
 */
export default function ProductPhoto({
  product,
  size = 'md',
  animate = false,
  showCaption = false,
  className = '',
}) {
  const src = getProductImage(product);
  const alt = getProductImageAlt(product);

  const height =
    size === 'lg'
      ? 'aspect-square min-h-[280px] sm:min-h-[360px]'
      : size === 'sm'
        ? 'aspect-square min-h-[120px]'
        : 'aspect-square min-h-[200px] sm:min-h-[240px]';

  return (
    <div
      className={`relative w-full overflow-hidden bg-paper-dim ${height} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04] ${
          animate ? 'animate-vial-float' : ''
        }`}
        width={800}
        height={800}
      />

      {showCaption && product?.vialSize && (
        <div className="absolute bottom-3 left-0 right-0 z-[2] flex flex-wrap justify-center gap-1.5 px-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-paper-line sm:text-xs">
            {product.vialSize}
          </span>
          {product.purity && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:text-xs">
              {product.purity}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
