import { LogoMark } from './ui';
import { cn } from '../lib/cn';

/**
 * Bold Vantril brand seal for product photos — logo + name.
 * High contrast so it always reads on packaging shots.
 */
export default function BrandLabel({ size = 'md', className = '', light = false }) {
  const sizes = {
    xs: {
      wrap: 'gap-0.5 rounded-md px-1.5 py-0.5',
      mark: 'h-3 w-2.5',
      text: 'text-[8px] leading-none tracking-[0.04em]',
    },
    sm: {
      wrap: 'gap-1 rounded-lg px-2 py-1',
      mark: 'h-4 w-3.5',
      text: 'text-[10px] leading-none tracking-[0.06em]',
    },
    md: {
      wrap: 'gap-1.5 rounded-xl px-2.5 py-1.5',
      mark: 'h-5 w-4',
      text: 'text-[11px] leading-none tracking-[0.08em] sm:text-xs',
    },
    lg: {
      wrap: 'gap-2 rounded-xl px-3.5 py-2',
      mark: 'h-7 w-6',
      text: 'text-sm leading-none tracking-[0.1em]',
    },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={cn(
        'pointer-events-none inline-flex items-center border font-display font-bold uppercase shadow-lg',
        s.wrap,
        light
          ? 'border-white/40 bg-gradient-to-r from-teal via-violet to-cyan text-white shadow-black/30'
          : 'border-indigo-200/80 bg-gradient-to-r from-white via-white to-mint text-ink shadow-black/15 ring-1 ring-teal/20',
        className
      )}
      aria-label="Vantril"
    >
      <LogoMark light={light} className={cn(s.mark, 'shrink-0 drop-shadow-none')} />
      <span className={s.text}>Vantril</span>
    </span>
  );
}
