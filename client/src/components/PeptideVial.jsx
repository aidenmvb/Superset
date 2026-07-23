/**
 * Realistic research peptide vial visual (CSS) with gentle motion.
 * Looks like an in-person lyophilized vial / topical / nasal unit.
 */
export default function PeptideVial({
  product,
  size = 'md',
  animate = true,
  className = '',
}) {
  const color = product?.imageColor || '#4f46e5';
  const route = product?.applicationRoute || 'injectable';
  const label =
    product?.name?.split('(')[0]?.trim()?.slice(0, 14) || product?.vialSize || 'Research';
  const dose = product?.vialSize || '';
  const purity = product?.purity || '';

  const dims =
    size === 'lg'
      ? { wrap: 'h-64 w-36', body: 'w-[5.5rem]', cap: 'w-14 h-5' }
      : size === 'sm'
        ? { wrap: 'h-36 w-20', body: 'w-12', cap: 'w-9 h-3' }
        : { wrap: 'h-48 w-28 sm:h-52 sm:w-32', body: 'w-[4.5rem] sm:w-20', cap: 'w-11 h-4 sm:w-12 sm:h-4' };

  if (route === 'topical') {
    return (
      <div
        className={`relative flex ${dims.wrap} items-end justify-center ${animate ? 'animate-vial-float' : ''} ${className}`}
        aria-hidden
      >
        <div className="pointer-events-none absolute bottom-2 h-3 w-20 rounded-full bg-ink/15 blur-md" />
        {/* Dropper bottle */}
        <div className="relative flex flex-col items-center">
          <div
            className={`${animate ? 'animate-vial-shine' : ''} relative z-10 h-7 w-6 rounded-t-full border border-white/40 shadow-md`}
            style={{
              background: `linear-gradient(145deg, #e2e8f0, ${color}aa 40%, #64748b)`,
            }}
          />
          <div className="z-10 -mt-0.5 h-2 w-4 rounded-sm bg-slate-600" />
          <div
            className={`relative ${dims.body} h-28 overflow-hidden rounded-2xl border border-white/50 shadow-[0_18px_36px_-12px_rgba(15,23,42,0.45)] sm:h-32`}
            style={{
              background: `linear-gradient(160deg, rgba(255,255,255,0.55) 0%, ${color}33 45%, ${color}88 100%)`,
            }}
          >
            <div className="absolute inset-y-2 left-1 w-1.5 rounded-full bg-white/50" />
            <div className="absolute inset-x-2 bottom-0 h-[55%] rounded-t-lg opacity-90" style={{ background: `linear-gradient(180deg, ${color}55, ${color})` }} />
            <div className="absolute inset-x-0 top-6 px-1 text-center">
              <div className="truncate text-[8px] font-bold uppercase tracking-wide text-ink/70 sm:text-[9px]">
                {label}
              </div>
              <div className="mt-0.5 text-[8px] font-semibold text-ink/50">{dose}</div>
            </div>
            <div className="absolute bottom-2 inset-x-0 text-center text-[8px] font-semibold text-white/90">
              Topical
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (route === 'nasal') {
    return (
      <div
        className={`relative flex ${dims.wrap} items-end justify-center ${animate ? 'animate-vial-float' : ''} ${className}`}
        aria-hidden
      >
        <div className="pointer-events-none absolute bottom-2 h-3 w-16 rounded-full bg-ink/15 blur-md" />
        <div className="relative flex flex-col items-center">
          {/* Spray tip */}
          <div className="z-20 h-3 w-2.5 rounded-t-sm bg-slate-500" />
          <div
            className="z-10 h-6 w-10 rounded-md border border-white/30 shadow"
            style={{ background: `linear-gradient(180deg, #cbd5e1, ${color})` }}
          />
          <div
            className={`relative ${dims.body} h-28 overflow-hidden rounded-b-3xl rounded-t-lg border border-white/40 shadow-[0_18px_36px_-12px_rgba(15,23,42,0.45)] sm:h-32`}
            style={{
              background: `linear-gradient(165deg, rgba(255,255,255,0.65) 0%, ${color}28 50%, ${color}70 100%)`,
            }}
          >
            <div className="absolute inset-y-3 left-1.5 w-1 rounded-full bg-white/55" />
            {/* liquid fill */}
            <div
              className={`absolute inset-x-0 bottom-0 h-[48%] ${animate ? 'animate-liquid-sway' : ''}`}
              style={{
                background: `linear-gradient(180deg, ${color}66, ${color}cc)`,
                borderTop: '1px solid rgba(255,255,255,0.35)',
              }}
            />
            <div className="absolute inset-x-1 top-5 rounded bg-white/75 px-1 py-1 text-center shadow-sm">
              <div className="truncate text-[8px] font-bold uppercase tracking-wide text-ink sm:text-[9px]">
                {label}
              </div>
              <div className="text-[7px] font-medium text-graphite-soft">{dose} · Nasal</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: classic lyophilized research vial
  return (
    <div
      className={`relative flex ${dims.wrap} items-end justify-center ${animate ? 'animate-vial-float' : ''} ${className}`}
      aria-hidden
    >
      {/* Soft ground shadow */}
      <div className="pointer-events-none absolute bottom-1 h-2.5 w-16 rounded-full bg-ink/20 blur-md sm:w-20" />

      <div className="relative flex flex-col items-center">
        {/* Flip-off / rubber stopper stack */}
        <div
          className={`${dims.cap} relative z-20 rounded-t-md border border-white/25 shadow-md`}
          style={{
            background: `linear-gradient(180deg, #94a3b8 0%, ${color} 45%, #1e1b4b 100%)`,
          }}
        >
          <div className="absolute inset-x-1 top-0.5 h-0.5 rounded-full bg-white/40" />
        </div>
        <div className="relative z-10 -mt-px h-2.5 w-7 rounded-sm bg-gradient-to-b from-rose-200 to-rose-400 shadow-sm sm:w-8" />
        <div className="z-10 -mt-px h-1.5 w-6 rounded-b-sm bg-slate-600 sm:w-7" />

        {/* Glass body */}
        <div
          className={`relative ${dims.body} h-[9.5rem] overflow-hidden rounded-b-[1.35rem] border border-white/50 shadow-[0_22px_40px_-14px_rgba(15,23,42,0.5)] sm:h-44 ${
            animate ? 'animate-vial-shine' : ''
          }`}
          style={{
            background: `
              linear-gradient(105deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 28%, transparent 42%),
              linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(241,245,249,0.75) 52%, ${color}33 100%)
            `,
          }}
        >
          {/* Left specular highlight */}
          <div className="absolute inset-y-3 left-[7%] w-[14%] rounded-full bg-gradient-to-r from-white/70 to-transparent opacity-80" />
          {/* Right edge tint */}
          <div
            className="absolute inset-y-4 right-0 w-[18%] opacity-40"
            style={{ background: `linear-gradient(270deg, ${color}55, transparent)` }}
          />

          {/* Paper label band */}
          <div className="absolute inset-x-[8%] top-[18%] z-10 overflow-hidden rounded-sm border border-slate-200/80 bg-white/90 px-1 py-1.5 shadow-sm backdrop-blur-[1px]">
            <div className="truncate text-center text-[8px] font-bold uppercase tracking-[0.08em] text-ink sm:text-[9px]">
              {label}
            </div>
            <div className="mt-0.5 text-center text-[7px] font-semibold text-graphite-soft sm:text-[8px]">
              {dose}
              {purity ? ` · ${purity}` : ''}
            </div>
            <div
              className="mx-auto mt-1 h-0.5 w-8 rounded-full"
              style={{ background: color }}
            />
          </div>

          {/* Lyophilized powder cake */}
          <div className="absolute inset-x-[12%] bottom-[8%] z-[5]">
            <div
              className="relative mx-auto h-10 overflow-hidden rounded-b-xl rounded-t-lg border border-white/40 sm:h-12"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 40%, ${color}22 100%),
                  repeating-linear-gradient(
                    115deg,
                    transparent,
                    transparent 2px,
                    rgba(148,163,184,0.12) 2px,
                    rgba(148,163,184,0.12) 3px
                  )
                `,
                boxShadow: `inset 0 2px 6px rgba(255,255,255,0.8), inset 0 -4px 10px ${color}33, 0 4px 10px rgba(15,23,42,0.12)`,
              }}
            >
              {/* Crystalline peaks */}
              <div className="absolute inset-x-1 top-0 h-2 rounded-t bg-gradient-to-b from-white to-transparent opacity-80" />
              <div className="absolute left-[18%] top-1 h-1.5 w-1.5 rounded-full bg-white/90 shadow-sm" />
              <div className="absolute right-[22%] top-2 h-1 w-1 rounded-full bg-white/70" />
              <div className="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-slate-300/30 blur-[1px]" />
            </div>
          </div>

          {/* Bottom glass thickness */}
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-slate-300/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
