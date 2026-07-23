import { useCallback, useEffect, useState } from 'react';
import { geocodeZip, getLabs, getLabsNearby, submitTestRequest } from '../api';
import {
  Alert,
  Button,
  Card,
  Container,
  Input,
  Label,
  LoadingText,
  Textarea,
} from './ui';

const TEST_OPTIONS = [
  'HPLC purity',
  'MS / LC-MS identity',
  'Endotoxin (research)',
  'Residual solvents',
  'Full CoA packet',
];

/**
 * Labs near you + send-for-testing form.
 * Embedded in Store so “Test peptides” and nearby labs are one experience.
 */
export default function LabTestingPanel({ id = 'testing' }) {
  const [labs, setLabs] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [zip, setZip] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    compoundName: '',
    lotOrSerial: '',
    quantity: '',
    notes: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    testTypes: ['HPLC purity', 'MS / LC-MS identity'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLabs();
      setLabs(res.labs);
      setOrigin(null);
      setStatus(`Full network · ${res.count} partner testing labs`);
    } catch (err) {
      setError(err.message || 'Failed to load labs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function findNear(lat, lng, label = 'your location') {
    setLoading(true);
    setError('');
    setLocating(false);
    try {
      let res = await getLabsNearby({ lat, lng, radius: 800, limit: 20 });
      if (!res.count) {
        res = await getLabsNearby({ lat, lng, radius: 3000, limit: 12 });
        setStatus(`Closest labs to ${label} (nationwide).`);
      } else {
        setStatus(`${res.count} labs near ${label} (within ${res.radiusMiles} mi).`);
      }
      setLabs(res.labs);
      setOrigin(res.origin);
    } catch (err) {
      setError(err.message || 'Nearby search failed');
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Enter a ZIP code instead.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => findNear(pos.coords.latitude, pos.coords.longitude, 'you'),
      (err) => {
        setLocating(false);
        setError(err.message || 'Allow location access or enter a ZIP.');
      },
      { enableHighAccuracy: false, timeout: 12000 }
    );
  }

  async function searchZip(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const geo = await geocodeZip(zip.trim());
      await findNear(geo.lat, geo.lng, `ZIP ${geo.zip}`);
      setForm((f) => ({
        ...f,
        shippingZip: geo.zip || f.shippingZip,
        shippingCity: geo.city || f.shippingCity,
        shippingState: geo.state || f.shippingState,
      }));
    } catch (err) {
      setError(err.message || 'ZIP lookup failed');
      setLoading(false);
    }
  }

  function toggleTestType(type) {
    setForm((f) => {
      const has = f.testTypes.includes(type);
      return {
        ...f,
        testTypes: has ? f.testTypes.filter((t) => t !== type) : [...f.testTypes, type],
      };
    });
  }

  async function onSubmitRequest(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    setError('');
    try {
      const res = await submitTestRequest({
        labId: selectedLab?.id,
        ...form,
        testTypes: form.testTypes,
      });
      setSubmitMsg(res.message);
      setForm((f) => ({
        ...f,
        compoundName: '',
        lotOrSerial: '',
        quantity: '',
        notes: '',
      }));
    } catch (err) {
      setError(err.message || 'Could not submit test request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id={id} className="scroll-mt-28 border-t border-paper-line bg-paper-dim/40">
      <Container wide className="py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
              Labs & testing
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Labs near you · Send for testing
            </h2>
            <p className="mt-2 text-sm text-graphite-soft">
              Find a partner lab near you and request HPLC/MS testing for research compounds —
              paired with serial verification on this same page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={useMyLocation} disabled={locating || loading} size="sm">
              {locating ? 'Locating…' : 'Use my location'}
            </Button>
            <Button type="button" variant="ghost" onClick={loadAll} size="sm">
              Show all labs
            </Button>
          </div>
        </div>

        <Card className="mb-6 p-4 sm:p-5">
          <form onSubmit={searchZip} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Label className="flex-1">
              ZIP code
              <Input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g. 78701"
                inputMode="numeric"
                pattern="[0-9]{5}(-[0-9]{4})?"
                required
              />
            </Label>
            <Button type="submit" disabled={loading}>
              Find labs near ZIP
            </Button>
          </form>
          {status && <p className="mt-3 text-sm font-medium text-teal-deep">{status}</p>}
          {origin && (
            <p className="mt-1 text-xs text-graphite-soft">
              Origin {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
            </p>
          )}
        </Card>

        {error && <Alert>{error}</Alert>}
        {submitMsg && <Alert variant="success">{submitMsg}</Alert>}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-3 flex items-end justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">
                {origin ? 'Labs near you' : 'Partner testing labs'}
              </h3>
              <span className="text-xs font-semibold text-graphite-soft">
                {loading ? '…' : `${labs.length} labs`}
              </span>
            </div>
            {loading && <LoadingText>Loading labs…</LoadingText>}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {labs.map((lab) => {
                const active = selectedLab?.id === lab.id;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => setSelectedLab(lab)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-teal bg-mint shadow-md'
                        : 'border-paper-line bg-white hover:border-violet/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-sm font-semibold text-ink">{lab.name}</div>
                        <div className="mt-0.5 text-xs text-graphite-soft">{lab.fullAddress}</div>
                      </div>
                      {lab.distanceMiles != null && (
                        <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                          {lab.distanceMiles} mi
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-graphite">{lab.services}</p>
                    <p className="mt-1 text-[11px] text-graphite-soft">⏱ {lab.turnaround}</p>
                  </button>
                );
              })}
            </div>
            {!loading && labs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-paper-line p-8 text-center text-sm text-graphite-soft">
                No labs found. Try another ZIP or show all labs.
              </div>
            )}
          </div>

          <Card className="h-fit p-5 lg:sticky lg:top-28">
            <h3 className="mb-1 font-display text-lg font-semibold text-ink">Send for testing</h3>
            <p className="mb-4 text-sm text-graphite-soft">
              {selectedLab
                ? `Lab: ${selectedLab.name}`
                : 'Optional: select a lab, or we’ll match one for you.'}
            </p>
            <form className="grid gap-3" onSubmit={onSubmitRequest}>
              <Label>
                Name *
                <Input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                />
              </Label>
              <Label>
                Email *
                <Input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                />
              </Label>
              <Label>
                Compound *
                <Input
                  required
                  placeholder="e.g. BPC-157"
                  value={form.compoundName}
                  onChange={(e) => setForm((f) => ({ ...f, compoundName: e.target.value }))}
                />
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Label>
                  Lot / serial
                  <Input
                    value={form.lotOrSerial}
                    onChange={(e) => setForm((f) => ({ ...f, lotOrSerial: e.target.value }))}
                  />
                </Label>
                <Label>
                  Quantity
                  <Input
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  />
                </Label>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-graphite-soft">Tests</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEST_OPTIONS.map((type) => {
                    const on = form.testTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleTestType(type)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          on
                            ? 'border-teal bg-teal text-white'
                            : 'border-paper-line bg-white text-graphite-soft'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Label className="col-span-3 sm:col-span-1">
                  City
                  <Input
                    value={form.shippingCity}
                    onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                  />
                </Label>
                <Label>
                  State
                  <Input
                    value={form.shippingState}
                    onChange={(e) => setForm((f) => ({ ...f, shippingState: e.target.value }))}
                  />
                </Label>
                <Label>
                  ZIP
                  <Input
                    value={form.shippingZip}
                    onChange={(e) => setForm((f) => ({ ...f, shippingZip: e.target.value }))}
                  />
                </Label>
              </div>
              <Label>
                Notes
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Label>
              <Button type="submit" disabled={submitting} full>
                {submitting ? 'Submitting…' : 'Submit test request'}
              </Button>
              <p className="text-[11px] text-graphite-soft">
                Research compounds only. Shipping instructions follow after review.
              </p>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}
