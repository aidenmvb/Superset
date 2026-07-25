import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';

/**
 * Still-life mapped hero:
 * - Empty stage (same lighting as the photo)
 * - Three cutouts extracted from forms-still-life.jpg
 * - Positions measured in the 1280×720 photo space, projected with object-cover math
 * Idle ≈ original still-life. Hover scales that cutout only.
 */

const IMG_W = 1280;
const IMG_H = 720;
const STAGE = '/images/hero/hero-stage.jpg?v=2';

/** Measured from forms-still-life.jpg (see layout.json) */
const PRODUCTS = [
  {
    id: 'injectable',
    label: 'Injectable',
    note: 'Lyophilized research vials',
    image: '/images/hero/cutout-vial.png?v=4',
    // pixel box in still-life space
    box: [399, 284, 546, 555],
  },
  {
    id: 'nasal',
    label: 'Nasal',
    note: 'Research spray delivery',
    image: '/images/hero/cutout-nasal.png?v=4',
    box: [551, 130, 710, 565],
  },
  {
    id: 'topical',
    label: 'Topical',
    note: 'Serum · topical research',
    image: '/images/hero/cutout-topical.png?v=4',
    box: [732, 165, 870, 565],
  },
];

/** Same math as CSS object-cover + object-center */
function coverLayout(cw, ch) {
  const scale = Math.max(cw / IMG_W, ch / IMG_H);
  const dw = IMG_W * scale;
  const dh = IMG_H * scale;
  const ox = (cw - dw) / 2;
  const oy = (ch - dh) / 2;
  return { scale, ox, oy, dw, dh };
}

function boxToScreen(box, layout) {
  const [x0, y0, x1, y1] = box;
  const { scale, ox, oy } = layout;
  return {
    left: ox + x0 * scale,
    top: oy + y0 * scale,
    width: (x1 - x0) * scale,
    height: (y1 - y0) * scale,
  };
}

export default function HeroFormStage({ className }) {
  const stageRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(null);
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

  const layout = size.w > 0 ? coverLayout(size.w, size.h) : null;

  return (
    <div
      ref={stageRef}
      className={cn('absolute inset-0 overflow-hidden bg-ink', className)}
      aria-label="Vantril injectable vial, nasal spray, and topical serum"
    >
      {/* Stage plate — same cover geometry as cutout map */}
      {layout && (
        <img
          src={STAGE}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none"
          style={{
            width: layout.dw,
            height: layout.dh,
            left: layout.ox,
            top: layout.oy,
          }}
          width={IMG_W}
          height={IMG_H}
          fetchPriority="high"
        />
      )}

      {/* Soft holds for type */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-ink/65"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-ink/60 via-ink/15 to-transparent sm:w-[24%]"
        aria-hidden
      />

      {layout &&
        PRODUCTS.map((product) => {
          const rect = boxToScreen(product.box, layout);
          const isOn = active === product.id;
          const dim = Boolean(active && !isOn);

          return (
            <button
              key={product.id}
              type="button"
              className={cn(
                'absolute border-0 bg-transparent p-0 outline-none',
                'cursor-pointer transition-[opacity,filter] duration-400',
                dim && 'opacity-40 saturate-75'
              )}
              style={{
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                zIndex: isOn ? 12 : 4,
              }}
              onMouseEnter={() => setActive(product.id)}
              onMouseLeave={() => setActive((cur) => (cur === product.id ? null : cur))}
              onFocus={() => setActive(product.id)}
              onBlur={() => setActive((cur) => (cur === product.id ? null : cur))}
              onClick={() => onActivate(product.id)}
              aria-label={`${product.label} — ${product.note}. Click to browse.`}
            >
              {/* Soft under-glow on hover only — not a rectangular ring */}
              <span
                className={cn(
                  'pointer-events-none absolute bottom-[6%] left-1/2 h-[22%] w-[110%] -translate-x-1/2 rounded-full bg-white/20 blur-2xl transition-opacity duration-400',
                  isOn ? 'opacity-90' : 'opacity-0'
                )}
                aria-hidden
              />

              {/* Cutout component — scales on hover */}
              <img
                src={product.image}
                alt={`Vantril ${product.label}`}
                draggable={false}
                className={cn(
                  'absolute inset-0 h-full w-full object-contain object-bottom',
                  'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
                  'drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)]',
                  isOn ? 'scale-110 drop-shadow-[0_28px_50px_rgba(0,0,0,0.55)]' : 'scale-100'
                )}
              />

              {/* Label on hover only */}
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 text-center transition duration-300',
                  isOn ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                )}
              >
                <span className="block font-logo text-sm font-bold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:text-base">
                  {product.label}
                </span>
                <span className="mt-0.5 block text-xs text-white/70">{product.note}</span>
              </span>
            </button>
          );
        })}

      <p
        className={cn(
          'pointer-events-none absolute bottom-5 left-1/2 z-[5] -translate-x-1/2 text-center font-logo text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 transition duration-300 sm:bottom-7',
          active ? 'opacity-0' : 'opacity-100'
        )}
      >
        Hover a package · click to shop
      </p>
    </div>
  );
}
