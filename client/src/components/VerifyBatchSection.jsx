import { useState } from 'react';
import { Alert, Container } from './ui';

export default function VerifyBatchSection({ id = 'verify' }) {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function onVerify(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/batches/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: serial.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult(data);
        if (!data.message) setError(data.error || 'Verification failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Could not reach verification API');
    } finally {
      setLoading(false);
    }
  }

  const batch = result?.batch;

  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-paper-line bg-gradient-to-br from-ink via-teal-deep to-[#f43f5e]/80 py-12 text-white sm:py-14"
    >
      <Container wide className="grid items-start gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
            Serial verification
          </p>
          <h2 className="mb-3 font-display text-2xl font-semibold text-white md:text-3xl">
            Verify your batch serial
          </h2>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-300">
            Enter the serial on your vial or packaging. Serials are registered in admin and checked
            live against the database — part of the same Test & verify workflow as lab testing.
          </p>
          <form
            onSubmit={onVerify}
            className="flex max-w-md overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur"
          >
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. VR-24S-1187"
              className="min-w-0 flex-1 border-0 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/40"
              required
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="m-1 rounded-full bg-white px-5 text-sm font-semibold text-ink transition hover:bg-mint disabled:opacity-50"
            >
              {loading ? '…' : 'Verify'}
            </button>
          </form>
        </div>

        <div className="min-h-[200px] rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
          {!result && !error && (
            <div className="flex h-full min-h-[160px] items-center justify-center text-center text-sm text-slate-300">
              Enter a serial number to see its registration record.
            </div>
          )}
          {error && !result && (
            <Alert className="mb-0 border-rose-300/40 bg-rose-500/20 text-rose-100">{error}</Alert>
          )}
          {result && (
            <div>
              <div
                className={`mb-3 text-sm font-semibold ${
                  result.valid ? 'text-cyan' : 'text-amber'
                }`}
              >
                {result.valid ? 'Valid serial' : 'Not valid'}
              </div>
              <p className="mb-4 text-sm text-slate-300">{result.message}</p>
              {batch && (
                <div className="space-y-2 text-sm">
                  {[
                    ['Serial', batch.serialNumber],
                    ['Product', batch.productName || '—'],
                    ['Quantity', batch.quantity || '—'],
                    ['Purity', batch.purity || '—'],
                    ['Status', batch.status || '—'],
                    ['Checks', String(batch.verifiedCount ?? 0)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-4 border-b border-white/10 py-2 last:border-0"
                    >
                      <span className="text-slate-400">{k}</span>
                      <span className="font-medium text-white">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
