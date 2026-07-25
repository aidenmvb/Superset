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
    'border-transparent bg-gradient-to-r from-teal to-violet text-white shadow-md shadow-indigo-500/25 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:hover:opacity-50',
  ghost:
    'border-paper-line bg-white text-ink hover:border-teal/50 hover:bg-mint hover:text-teal-deep disabled:opacity-50',
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

const controlClass =
  'w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-normal text-ink outline-none transition placeholder:text-slate-400 hover:border-teal/40 focus:border-teal focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

export function Input({ className, ...props }) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(controlClass, className)} {...props} />;
}

/**
 * Form label. Use as:
 *   <Label>Email <Input ... /></Label>
 * First child text is the caption; remaining nodes are controls (not muted).
 */
export function Label({ className, children, ...props }) {
  const kids = Array.isArray(children) ? children.filter((c) => c != null && c !== false) : [children];
  // If single React element only, render as control without caption split
  if (kids.length === 1 && typeof kids[0] === 'object') {
    return (
      <label className={cn('flex flex-col gap-1.5', className)} {...props}>
        {kids[0]}
      </label>
    );
  }
  const [first, ...rest] = kids;
  return (
    <label className={cn('flex flex-col gap-1.5', className)} {...props}>
      <span className="block text-xs font-medium leading-none text-graphite-soft">{first}</span>
      <div className="contents text-sm font-normal text-ink">{rest}</div>
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

/** Abstract hexagon + molecule mark — bold for header branding. */
export function LogoMark({ className, light }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-9 shrink-0 drop-shadow-md', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="4" y1="0" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={light ? '#e0e7ff' : '#4338ca'} />
          <stop offset="0.45" stopColor={light ? '#ddd6fe' : '#7c3aed'} />
          <stop offset="1" stopColor={light ? '#fda4af' : '#e11d48'} />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Hexagon shield — fuller, bolder fill */}
      <path
        d="M20 1.5L36.5 11V29.5L20 39L3.5 29.5V11L20 1.5Z"
        fill={`url(#${uid}-fill)`}
        filter={`url(#${uid}-soft)`}
        stroke={light ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.65)'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 6.5L31.5 13.2V27.3L20 34L8.5 27.3V13.2L20 6.5Z"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Molecule — thicker bonds + nodes */}
      <g stroke="rgba(255,255,255,0.95)" strokeWidth="2.1" strokeLinecap="round">
        <line x1="20" y1="14.5" x2="13.5" y2="21.2" />
        <line x1="20" y1="14.5" x2="26.5" y2="21.2" />
        <line x1="13.5" y1="21.2" x2="20" y2="28.2" />
        <line x1="26.5" y1="21.2" x2="20" y2="28.2" />
        <line x1="13.5" y1="21.2" x2="26.5" y2="21.2" />
      </g>
      <path
        d="M20 10.8L23.6 14.4L20 18L16.4 14.4L20 10.8Z"
        fill="none"
        stroke="white"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="14.5" r="2.5" fill="white" />
      <circle cx="13.5" cy="21.2" r="2.35" fill="white" />
      <circle cx="26.5" cy="21.2" r="2.35" fill="white" />
      <circle cx="20" cy="28.2" r="2.6" fill="white" />
    </svg>
  );
}

export function Logo({ className, light }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3',
        light ? 'text-white' : 'text-ink',
        className
      )}
    >
      <LogoMark light={light} className="h-11 w-10 sm:h-12 sm:w-11" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-logo text-[1.35rem] font-bold tracking-[-0.03em] sm:text-[1.55rem]',
            light ? 'text-white' : 'text-ink'
          )}
        >
          Vantril
        </span>
        <span
          className={cn(
            'mt-0.5 font-logo text-[0.62rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.68rem]',
            light ? 'text-white/75' : 'text-teal-deep/80'
          )}
        >
          Research
        </span>
      </span>
    </span>
  );
}
