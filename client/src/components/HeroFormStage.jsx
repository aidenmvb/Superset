import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';

/**
 * Still-life hero:
 * Hover → focus zoom. Click → form info panel (demo/infographic), then store CTA.
 */

const IMG_W = 1920;
const IMG_H = 1080;
const STILL = '/images/hero/forms-still-life-hd.jpg?v=1';

const PRODUCTS = [
  {
    id: 'injectable',
    label: 'Injectable',
    note: 'Lyophilized research vials',
    storePath: '/catalog?application=injectable',
    zone: { left: 31.0, top: 33.0, width: 13.0, height: 44.0 },
    accent: 'from-indigo-500 to-violet-600',
    chip: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    accentText: 'text-indigo-300',
    image: '/images/hero/cutout-vial.png?v=8',
    headline: 'Lyophilized for the bench',
    summary:
      'Injectable research peptides ship as freeze-dried powders in sealed glass vials. Labs reconstitute them under protocol — not for human use.',
    facts: [
      { k: 'Form', v: 'Lyophilized powder in glass vial' },
      { k: 'Use case', v: 'In vitro reconstitution & assay prep' },
      { k: 'Labeling', v: 'Mass / purity callouts on packaging' },
      { k: 'Storage', v: 'Follow product page cold-chain notes' },
    ],
    steps: [
      'Confirm compound & mass on the product page',
      'Order the vial size your protocol needs',
      'Reconstitute only under lab SOPs',
      'Log lot / serial for your records',
    ],
  },
  {
    id: 'nasal',
    label: 'Nasal',
    note: 'Research spray delivery',
    storePath: '/catalog?application=nasal',
    zone: { left: 42.5, top: 18.0, width: 13.5, height: 60.0 },
    accent: 'from-sky-500 to-cyan-500',
    chip: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
    accentText: 'text-sky-300',
    image: '/images/hero/cutout-nasal.png?v=8',
    headline: 'Spray format for nasal models',
    summary:
      'Nasal research compounds ship in spray packaging designed for delivery models — labeled as research form, not a consumer product.',
    facts: [
      { k: 'Form', v: 'Metered / spray research packaging' },
      { k: 'Use case', v: 'Nasal delivery research models' },
      { k: 'Labeling', v: 'Clear “nasal research” form callout' },
      { k: 'Handling', v: 'See listing for volume & storage' },
    ],
    steps: [
      'Filter store → Nasal',
      'Review volume & composition specs',
      'Add to cart with your lab ship-to',
      'Document lot for study tracking',
    ],
  },
  {
    id: 'topical',
    label: 'Topical',
    note: 'Serum · topical research',
    storePath: '/catalog?application=topical',
    zone: { left: 53.5, top: 22.0, width: 14.5, height: 56.0 },
    accent: 'from-fuchsia-500 to-rose-500',
    chip: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30',
    accentText: 'text-fuchsia-300',
    image: '/images/hero/cutout-topical.png?v=8',
    headline: 'Serum form for apply-on models',
    summary:
      'Topical research compounds are packaged as serums for apply-on-skin laboratory models — research use only, not cosmetics or drugs.',
    facts: [
      { k: 'Form', v: 'Serum / liquid topical research' },
      { k: 'Use case', v: 'Apply-on research & formulation models' },
      { k: 'Labeling', v: 'Topical serum callouts on glass' },
      { k: 'Volume', v: 'Listed per product (e.g. mL / fl oz)' },
    ],
    steps: [
      'Open Topical in the store',
      'Check volume, purity, and notes',
      'Order for your lab address',
      'Keep packaging serials for verify',
    ],
  },
];

function coverLayout(cw, ch) {
  const scale = Math.max(cw / IMG_W, ch / IMG_H);
  const dw = IMG_W * scale;
  const dh = IMG_H * scale;
  return {
    scale,
    ox: (cw - dw) / 2,
    oy: (ch - dh) / 2,
    dw,
    dh,
  };
}

function zoneToScreen(zone, layout) {
  const { scale, ox, oy } = layout;
  return {
    left: ox + (zone.left / 100) * IMG_W * scale,
    top: oy + (zone.top / 100) * IMG_H * scale,
    width: (zone.width / 100) * IMG_W * scale,
    height: (zone.height / 100) * IMG_H * scale,
  };
}

function originForProduct(zone) {
  const cx = zone.left + zone.width / 2;
  const cy = zone.top + zone.height / 2;
  return `${cx}% ${cy}%`;
}

function FormInfoPanel({ product, onClose, onShop }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-info-title"
    >
      <button
        type="button"
        className="absolute inset-0 border-0 bg-ink/70 backdrop-blur-md"
        aria-label="Close form info"
        onClick={onClose}
      />

      <div className="relative z-[1] max-h-[min(88svh,720px)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-ink/95 shadow-2xl shadow-black/50 sm:max-w-xl">
        <div className={cn('h-1.5 w-full bg-gradient-to-r', product.accent)} />

        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={cn(
                  'inline-flex rounded-full border px-2.5 py-0.5 font-logo text-[10px] font-bold uppercase tracking-[0.18em]',
                  product.chip
                )}
              >
                {product.label} form
              </span>
              <h2
                id="form-info-title"
                className="mt-3 font-electric text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
              >
                {product.headline}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-[15px]">{product.summary}</p>

          {/* Mini demo / infographic strip */}
          <div className="mt-6 grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:gap-5 sm:p-5">
            <div className="flex h-28 w-20 items-end justify-center sm:h-32 sm:w-24">
              <img
                src={product.image}
                alt=""
                className="max-h-full max-w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
            </div>
            <div className="min-w-0">
              <p className={cn('font-logo text-[10px] font-bold uppercase tracking-[0.2em]', product.accentText)}>
                At a glance
              </p>
              <ul className="mt-2 space-y-2">
                {product.facts.map((f) => (
                  <li key={f.k} className="flex gap-2 text-xs sm:text-sm">
                    <span className="shrink-0 font-semibold text-white/40">{f.k}</span>
                    <span className="text-white/75">{f.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5">
            <p className="font-logo text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              How labs use this form
            </p>
            <ol className="mt-3 space-y-2.5">
              {product.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm text-white/70">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white',
                      product.accent
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/90 sm:text-xs">
            Research use only. Not for human or veterinary use. Not intended to diagnose, treat, cure,
            or prevent any disease.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onShop}
              className={cn(
                'flex-1 rounded-full bg-gradient-to-r px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 sm:flex-none',
                product.accent
              )}
            >
              Shop {product.label.toLowerCase()} →
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroFormStage({ className }) {
  const stageRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(null);
  const [infoId, setInfoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const layout = size.w > 0 ? coverLayout(size.w, size.h) : null;
  const activeProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === active) ?? null,
    [active]
  );
  const infoProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === infoId) ?? null,
    [infoId]
  );

  const focusPoint = useMemo(() => {
    if (!layout || !activeProduct || !size.w) return null;
    const rect = zoneToScreen(activeProduct.zone, layout);
    return {
      cx: ((rect.left + rect.width / 2) / size.w) * 100,
      cy: ((rect.top + rect.height / 2) / size.h) * 100,
    };
  }, [layout, activeProduct, size.w, size.h]);

  const closeInfo = useCallback(() => setInfoId(null), []);

  return (
    <div
      ref={stageRef}
      className={cn('absolute inset-0 overflow-hidden bg-ink', className)}
      aria-label="Vantril injectable vial, nasal spray, and topical serum"
    >
      {layout && (
        <div
          className="absolute"
          style={{
            width: layout.dw,
            height: layout.dh,
            left: layout.ox,
            top: layout.oy,
            transformOrigin: activeProduct
              ? originForProduct(activeProduct.zone)
              : '50% 50%',
            transform: activeProduct && !infoProduct ? 'scale(1.38)' : 'scale(1)',
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          <img
            src={STILL}
            alt="Vantril research peptides — injectable, nasal, and topical"
            draggable={false}
            className="h-full w-full max-w-none select-none object-cover"
            width={IMG_W}
            height={IMG_H}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}

      {focusPoint && !infoProduct && (
        <>
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(
                ellipse 42% 55% at ${focusPoint.cx}% ${focusPoint.cy}%,
                transparent 0%,
                transparent 28%,
                rgba(11, 16, 32, 0.35) 52%,
                rgba(11, 16, 32, 0.62) 78%,
                rgba(11, 16, 32, 0.78) 100%
              )`,
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 backdrop-blur-[3px] transition-opacity duration-500"
            style={{
              WebkitMaskImage: `radial-gradient(
                ellipse 40% 52% at ${focusPoint.cx}% ${focusPoint.cy}%,
                transparent 0%,
                transparent 32%,
                black 68%,
                black 100%
              )`,
              maskImage: `radial-gradient(
                ellipse 40% 52% at ${focusPoint.cx}% ${focusPoint.cy}%,
                transparent 0%,
                transparent 32%,
                black 68%,
                black 100%
              )`,
            }}
            aria-hidden
          />
        </>
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/55 transition-opacity duration-500',
          (activeProduct || infoProduct) && 'opacity-50'
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-ink/50 via-ink/12 to-transparent transition-opacity duration-500 sm:w-[22%]',
          (activeProduct || infoProduct) && 'opacity-40'
        )}
        aria-hidden
      />

      {layout &&
        PRODUCTS.map((product) => {
          const rect = zoneToScreen(product.zone, layout);
          const isOn = active === product.id && !infoProduct;

          return (
            <button
              key={product.id}
              type="button"
              className={cn(
                'absolute border-0 bg-transparent p-0 outline-none cursor-pointer',
                'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
              style={{
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                zIndex: isOn ? 12 : 5,
              }}
              onMouseEnter={() => !infoProduct && setActive(product.id)}
              onMouseLeave={() => setActive((cur) => (cur === product.id ? null : cur))}
              onFocus={() => !infoProduct && setActive(product.id)}
              onBlur={() => setActive((cur) => (cur === product.id ? null : cur))}
              onClick={() => {
                setActive(product.id);
                setInfoId(product.id);
              }}
              aria-label={`${product.label} — learn about this form`}
            >
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-max -translate-x-1/2 text-center transition duration-300',
                  isOn ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                )}
              >
                <span className="rounded-2xl border border-white/15 bg-ink/65 px-4 py-2.5 shadow-xl backdrop-blur-md">
                  <span className="block font-logo text-sm font-bold uppercase tracking-[0.16em] text-white sm:text-[15px]">
                    {product.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/70">{product.note}</span>
                  <span className="mt-1.5 block font-logo text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Click for details →
                  </span>
                </span>
              </span>
            </button>
          );
        })}

      <p
        className={cn(
          'pointer-events-none absolute bottom-5 left-1/2 z-[6] -translate-x-1/2 text-center font-logo text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 transition duration-300 sm:bottom-7',
          active || infoProduct ? 'opacity-0' : 'opacity-100'
        )}
      >
        Hover a package · click for form details
      </p>

      {infoProduct && (
        <FormInfoPanel
          product={infoProduct}
          onClose={closeInfo}
          onShop={() => navigate(infoProduct.storePath)}
        />
      )}
    </div>
  );
}
