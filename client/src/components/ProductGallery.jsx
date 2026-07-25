import { useCallback, useEffect, useState } from 'react';
import { getProductGallery, getProductImageAlt } from '../lib/productImages';
import { cn } from '../lib/cn';

/**
 * Four branded packaging photos (labels on glass) + lightbox.
 */
export default function ProductGallery({ product, className = '' }) {
  const images = getProductGallery(product);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const accent = product?.imageColor || '#4f46e5';

  useEffect(() => {
    setActive(0);
    setLightbox(false);
  }, [product?.slug, product?.id]);

  const go = useCallback(
    (dir) => {
      setActive((i) => {
        const next = i + dir;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  const src = images[active] || images[0];
  const alt = getProductImageAlt(product, active);

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <div className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-paper-line bg-paper-dim shadow-sm transition hover:border-teal/40">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-inset"
          aria-label="Open larger product photos"
        >
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]"
            width={800}
            height={800}
          />
        </button>

        <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold text-white shadow backdrop-blur">
          {active + 1} / {images.length} · Enlarge
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-paper-line bg-white px-2.5 py-1.5 text-lg font-bold text-ink shadow-sm"
              onClick={() => go(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-paper-line bg-white px-2.5 py-1.5 text-lg font-bold text-ink shadow-sm"
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 5 distinct branded packaging thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'aspect-square overflow-hidden rounded-xl border bg-white p-1 transition',
              i === active
                ? 'border-teal ring-2 ring-teal/30'
                : 'border-paper-line hover:border-teal/40'
            )}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === active ? 'true' : undefined}
          >
            <img
              src={img}
              alt={getProductImageAlt(product, i)}
              className="h-full w-full object-cover object-center"
              width={120}
              height={120}
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Product photos"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-20 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink shadow"
            onClick={() => setLightbox(false)}
          >
            Close
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-lg font-bold text-ink shadow sm:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-lg font-bold text-ink shadow sm:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
          <div
            className="relative max-h-[85vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl bg-ink shadow-2xl">
              <img
                src={src}
                alt={alt}
                className="max-h-[75vh] w-auto max-w-full object-cover object-center"
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-white">
              {product?.name} · Vantril packaging · Photo {active + 1} of {images.length}
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={`lb-${img}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-lg border-2 bg-white',
                    i === active
                      ? 'border-white ring-2 ring-teal'
                      : 'border-white/40 opacity-80 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
