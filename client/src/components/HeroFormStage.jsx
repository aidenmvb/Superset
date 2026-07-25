import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';

/**
 * Filled stage background + three transparent product cutouts as real components.
 * Idle: products sit still in still-life positions (no float, no boxes).
 * Hover: that cutout scales/pops — not a rectangular photo window.
 */
const STAGE = '/images/hero/hero-stage.jpg?v=1';

const PRODUCTS = [
  {
    id: 'injectable',
    label: 'Injectable',
    note: 'Lyophilized research vials',
    image: '/images/hero/cutout-vial.png?v=1',
    // Position/size as % of stage — matches still-life trio layout
    // left, bottom of product group, width of hit area
    style: {
      left: '32%',
      bottom: '18%',
      width: '14%',
      zIndex: 2,
    },
    imgMaxH: '42vh',
  },
  {
    id: 'nasal',
    label: 'Nasal',
    note: 'Research spray delivery',
    image: '/images/hero/cutout-nasal.png?v=1',
    style: {
      left: '43%',
      bottom: '16%',
      width: '15%',
      zIndex: 3,
    },
    imgMaxH: '52vh',
  },
  {
    id: 'topical',
    label: 'Topical',
    note: 'Serum · topical research',
    image: '/images/hero/cutout-topical.png?v=1',
    style: {
      left: '55%',
      bottom: '16%',
      width: '15%',
      zIndex: 2,
    },
    imgMaxH: '48vh',
  },
];

export default function HeroFormStage({ className }) {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const onActivate = useCallback(
    (id) => {
      setActive(id);
      const el = document.getElementById(`form-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('form-section-glow');
        void el.offsetWidth;
        el.classList.add('form-section-glow');
        window.setTimeout(() => el.classList.remove('form-section-glow'), 1500);
        return;
      }
      navigate(`/catalog?application=${id}`);
    },
    [navigate]
  );

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden bg-ink', className)}
      aria-label="Vantril injectable vial, nasal spray, and topical serum"
    >
      {/* Filled stage — products removed, never scales */}
      <img
        src={STAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={1280}
        height={720}
        fetchPriority="high"
        draggable={false}
      />

      {/* Type scrim — left only */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[32%] bg-gradient-to-r from-ink/65 via-ink/20 to-transparent sm:w-[26%]"
        aria-hidden
      />

      {/* Dim non-active products slightly when one is hovered */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 transition-colors duration-400',
          active ? 'bg-ink/15' : 'bg-transparent'
        )}
        aria-hidden
      />

      {/* Three cutout product icons */}
      {PRODUCTS.map((product) => {
        const isOn = active === product.id;
        const dim = active && !isOn;

        return (
          <button
            key={product.id}
            type="button"
            className={cn(
              'absolute flex flex-col items-center border-0 bg-transparent p-0 outline-none',
              'cursor-pointer transition-[opacity,filter] duration-400',
              dim && 'opacity-45 saturate-75'
            )}
            style={{
              left: product.style.left,
              bottom: product.style.bottom,
              width: product.style.width,
              zIndex: isOn ? 10 : product.style.zIndex,
            }}
            onMouseEnter={() => setActive(product.id)}
            onMouseLeave={() => setActive((cur) => (cur === product.id ? null : cur))}
            onFocus={() => setActive(product.id)}
            onBlur={() => setActive((cur) => (cur === product.id ? null : cur))}
            onClick={() => onActivate(product.id)}
            aria-label={`${product.label} — ${product.note}. Click to browse.`}
          >
            {/* Soft contact glow on hover only — not a rectangular box */}
            <span
              className={cn(
                'pointer-events-none absolute bottom-[8%] left-1/2 h-[18%] w-[90%] -translate-x-1/2 rounded-full bg-white/25 blur-2xl transition-opacity duration-400',
                isOn ? 'opacity-80' : 'opacity-0'
              )}
              aria-hidden
            />

            {/* The cutout itself — this is the component that scales */}
            <img
              src={product.image}
              alt={`Vantril ${product.label}`}
              draggable={false}
              className={cn(
                'relative w-full object-contain object-bottom',
                'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
                'drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]',
                isOn ? 'scale-110 drop-shadow-[0_28px_48px_rgba(0,0,0,0.55)]' : 'scale-100'
              )}
              style={{ maxHeight: product.imgMaxH }}
            />

            {/* Form name — hover only, HTML type (not a photo sticker) */}
            <span
              className={cn(
                'mt-3 text-center transition duration-300',
                isOn ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              )}
            >
              <span className="block font-logo text-sm font-bold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-base">
                {product.label}
              </span>
              <span className="mt-0.5 block text-xs text-white/70">{product.note}</span>
              <span className="mt-1 block font-logo text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Click to browse →
              </span>
            </span>
          </button>
        );
      })}

      <p
        className={cn(
          'pointer-events-none absolute bottom-5 left-1/2 z-[4] -translate-x-1/2 text-center font-logo text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 transition duration-300 sm:bottom-7',
          active ? 'opacity-0' : 'opacity-100'
        )}
      >
        Hover a package · click to shop
      </p>
    </div>
  );
}
