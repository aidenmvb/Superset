import { useEffect, useState } from 'react';
import { Button, LogoMark } from './ui';

const KEY = 'vireon-age-gate';

export default function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function accept() {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden p-4">
      {/* Bold animated backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-teal-deep to-[#f43f5e]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.45),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(244,63,94,0.35),transparent_40%)]" />
      <div className="animate-pulse-glow pointer-events-none absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-violet/40 blur-3xl" />
      <div className="animate-pulse-glow pointer-events-none absolute -right-10 bottom-1/4 h-72 w-72 rounded-full bg-cyan/35 blur-3xl" />

      <div className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl shadow-ink/40">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-animated-gradient" />

        <div className="mx-auto mb-5 flex justify-center">
          <LogoMark className="h-14 w-12" />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-deep">
          Age & research confirmation
        </p>
        <h2 className="mb-3 font-display text-2xl font-semibold text-ink">
          Make sure you&apos;re 21+
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-graphite-soft">
          These products are <strong className="text-ink">only for research purposes</strong> — for
          qualified laboratories and in vitro use. Not for human or veterinary consumption.
        </p>

        <div className="mb-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-mint to-sky p-4 text-left text-sm text-ink">
          <p className="mb-2 font-semibold text-teal-deep">By continuing you confirm:</p>
          <ul className="list-disc space-y-1.5 pl-5 text-graphite">
            <li>You are at least 21 years of age</li>
            <li>You are purchasing for legitimate laboratory research only</li>
            <li>You will not use these products in humans or animals</li>
          </ul>
        </div>

        <Button
          type="button"
          full
          size="lg"
          className="bg-animated-gradient border-0 shadow-lg shadow-teal/30"
          onClick={accept}
        >
          I am 21+ · Research use only
        </Button>

        <button
          type="button"
          className="mt-4 text-xs font-medium text-graphite-soft underline underline-offset-2 hover:text-ink"
          onClick={() => {
            window.location.href = 'https://www.google.com';
          }}
        >
          Exit site
        </button>

        <p className="mt-5 text-[11px] leading-relaxed text-graphite-soft">
          Products have not been evaluated by the FDA and are not intended to diagnose, treat, cure,
          or prevent any disease.
        </p>
      </div>
    </div>
  );
}
