import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';

export function Container({ className, children, as: Tag = 'div', wide }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-3 sm:px-5 lg:px-6',
        wide ? 'max-w-[1600px]' : 'max-w-6xl',
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Section({ className, muted, children, id }) {
  return (
    <section
      id={id}
      className={cn('py-8 md:py-10', muted && 'bg-white/60', className)}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ className, light, children }) {
  return (
    <p
      className={cn(
        'mb-3 text-xs font-semibold uppercase tracking-[0.14em]',
        light ? 'text-emerald-200' : 'text-teal-deep',
        className
      )}
    >
      {children}
    </p>
  );
}

export function Lead({ className, children }) {
  return (
    <p className={cn('max-w-xl text-base leading-relaxed text-graphite-soft', className)}>
      {children}
    </p>
  );
}

const buttonVariants = {
  solid:
    'border-transparent bg-gradient-to-r from-teal to-violet text-white shadow-md shadow-indigo-500/25 hover:from-teal-deep hover:to-teal disabled:opacity-50',
  ghost:
    'border-paper-line bg-white text-ink hover:border-teal/40 hover:bg-mint disabled:opacity-50',
  teal: 'border-transparent bg-ink text-white hover:bg-ink-soft disabled:opacity-50',
  danger:
    'border-vireon-red/30 bg-white text-vireon-red hover:bg-red-50',
};

export function Button({
  as: Tag = 'button',
  variant = 'solid',
  size = 'md',
  className,
  full,
  children,
  ...props
}) {
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <Tag
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-tight transition active:scale-[0.98]',
        buttonVariants[variant] || buttonVariants.solid,
        sizes[size],
        full && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function ButtonLink({ to, variant = 'solid', size = 'md', className, full, children }) {
  return (
    <Button as={Link} to={to} variant={variant} size={size} className={className} full={full}>
      {children}
    </Button>
  );
}

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-paper-line bg-white shadow-sm shadow-slate-900/5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Pill({ muted, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        muted
          ? 'bg-slate-100 text-graphite-soft'
          : 'bg-mint text-teal-deep',
        className
      )}
    >
      {children}
    </span>
  );
}

export function Alert({ variant = 'error', className, children }) {
  return (
    <div
      className={cn(
        'mb-4 rounded-xl border px-4 py-3 text-sm',
        variant === 'success'
          ? 'border-emerald-200 bg-mint text-teal-deep'
          : 'border-red-200 bg-red-50 text-vireon-red',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-emerald-100',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-emerald-100',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children }) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-xs font-medium text-graphite-soft', className)}>
      {children}
    </label>
  );
}

export function Fieldset({ legend, className, children }) {
  return (
    <fieldset className={cn('m-0 rounded-2xl border border-paper-line bg-white p-4', className)}>
      {legend && (
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-graphite-soft">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

export function Chip({ active, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        active
          ? 'border-teal bg-teal text-white shadow-sm'
          : 'border-paper-line bg-white text-graphite-soft hover:border-teal/30 hover:text-ink',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageTitle({ className, children }) {
  return (
    <h1 className={cn('mb-2 font-display text-3xl font-semibold tracking-tight md:text-4xl', className)}>
      {children}
    </h1>
  );
}

export function SectionTitle({ className, children }) {
  return (
    <h2 className={cn('font-display text-2xl font-semibold tracking-tight md:text-3xl', className)}>
      {children}
    </h2>
  );
}

export function Muted({ className, children }) {
  return <p className={cn('text-sm text-graphite-soft', className)}>{children}</p>;
}

export function LoadingText({ children = 'Loading…' }) {
  return <p className="text-sm text-graphite-soft">{children}</p>;
}

export function SummaryRow({ label, value, strong, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-1.5 text-sm',
        strong && 'mt-2 text-base font-semibold',
        className
      )}
    >
      <span className={strong ? 'text-ink' : 'text-graphite-soft'}>{label}</span>
      <span className={cn(strong ? 'text-ink' : 'text-graphite', 'text-right')}>{value}</span>
    </div>
  );
}

/** Abstract hexagon + molecule mark (original SVG — not a lettermark). */
export function LogoMark({ className, light }) {
  // Unique ids so header + footer marks don't clash gradients
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8 shrink-0 drop-shadow-md', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="6" y1="2" x2="34" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor={light ? '#c7d2fe' : '#4f46e5'} />
          <stop offset="0.48" stopColor={light ? '#ddd6fe' : '#8b5cf6'} />
          <stop offset="1" stopColor={light ? '#fda4af' : '#f43f5e'} />
        </linearGradient>
        <linearGradient id={`${uid}-glow`} x1="12" y1="10" x2="28" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Hexagon shield body */}
      <path
        d="M20 2.5L35 11.2V28.8L20 37.5L5 28.8V11.2L20 2.5Z"
        fill={`url(#${uid}-fill)`}
        stroke={light ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)'}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Inner hexagon rim */}
      <path
        d="M20 7.2L30.5 13.2V26.8L20 32.8L9.5 26.8V13.2L20 7.2Z"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Molecule nodes + bonds */}
      <g stroke={`url(#${uid}-glow)`} strokeWidth="1.6" strokeLinecap="round">
        <line x1="20" y1="15.2" x2="14.2" y2="21.5" />
        <line x1="20" y1="15.2" x2="25.8" y2="21.5" />
        <line x1="14.2" y1="21.5" x2="20" y2="28" />
        <line x1="25.8" y1="21.5" x2="20" y2="28" />
        <line x1="14.2" y1="21.5" x2="25.8" y2="21.5" />
      </g>
      {/* Top diamond accent */}
      <path
        d="M20 11.5L23.2 14.7L20 17.9L16.8 14.7L20 11.5Z"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="15.2" r="2.1" fill="white" fillOpacity="0.95" />
      <circle cx="14.2" cy="21.5" r="2" fill="white" fillOpacity="0.9" />
      <circle cx="25.8" cy="21.5" r="2" fill="white" fillOpacity="0.9" />
      <circle cx="20" cy="28" r="2.2" fill="white" fillOpacity="0.95" />
    </svg>
  );
}

export function Logo({ className, light }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight',
        light ? 'text-white' : 'text-ink',
        className
      )}
    >
      <LogoMark light={light} className="h-9 w-8" />
      Vireon
    </span>
  );
}
