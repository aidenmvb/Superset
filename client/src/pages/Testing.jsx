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
  PageTitle,
  Textarea,
} from '../components/ui';

const TEST_OPTIONS = [
  'HPLC purity',
  'MS / LC-MS identity',
  'Endotoxin (research)',
  'Residual solvents',
  'Full CoA packet',
];

export default function Testing() {
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
      setStatus(`Showing all ${res.count} partner testing labs in the network.`);
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
      const res = await getLabsNearby({ lat, lng, radius: 800, limit: 20 });
      setLabs(res.labs);
      setOrigin(res.origin);
      setStatus(
        res.count
          ? `Found ${res.count} lab${res.count === 1 ? '' : 's'} near ${label} (within ${res.radiusMiles} mi).`
          : `No labs within range of ${label}. Showing closest network partners instead.`
      );
      if (!res.count) {
        const all = await getLabs();
        // still compute distance client-side-ish via nearby with huge radius
        const far = await getLabsNearby({ lat, lng, radius: 3000, limit: 12 });
        setLabs(far.labs);
        setStatus(`Showing the ${far.count} closest labs to ${label} nationwide.`);
      }
    } catch (err) {
      setError(err.message || 'Nearby search failed');
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser. Enter a ZIP code instead.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        findNear(pos.coords.latitude, pos.coords.longitude, 'your location');
      },
      (err) => {
        setLocating(false);
        setError(
          err.message ||
            'Could not read your location. Allow location access or enter a ZIP code.'
        );
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
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-paper-line bg-gradient-to-br from-ink via-ink-soft to-teal-deep text-white">
        <Container wide className="py-10 sm:py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan">
            Third-party testing
          </p>
          <PageTitle className="mb-3 text-white">Send your peptides for testing</PageTitle>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Find a partner analytical lab near you, then submit a request to ship research peptides
            for HPLC purity, mass-spec identity, and related confirmation tests. Labs and requests
            are stored in the live database.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={useMyLocation}
              disabled={locating || loading}
              className="border-0 bg-white text-ink hover:bg-mint"
            >
              {locating ? 'Locating…' : 'Use my location'}
            </Button>
            <Button type="button" variant="ghost" onClick={loadAll} className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              Show all labs
            </Button>
          </div>
        </Container>
      </div>

      <Container wide className="py-8">
        {/* ZIP search */}
        <Card className="mb-8 p-5">
          <h2 className="mb-1 font-display text-lg font-semibold text-ink">Labs near a ZIP code</h2>
          <p className="mb-4 text-sm text-graphite-soft">
            Enter your ZIP and we&apos;ll rank partner testing labs by distance.
          </p>
          <form onSubmit={searchZip} className="flex max-w-md flex-col gap-2 sm:flex-row">
            <Input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 78701"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              required
            />
            <Button type="submit" disabled={loading}>
              Find labs
            </Button>
          </form>
          {status && <p className="mt-3 text-sm font-medium text-teal-deep">{status}</p>}
          {origin && (
            <p className="mt-1 text-xs text-graphite-soft">
              Search origin: {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
            </p>
          )}
        </Card>

        {error && <Alert>{error}</Alert>}
        {submitMsg && <Alert variant="success">{submitMsg}</Alert>}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Lab list */}
          <div>
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-ink">
                {origin ? 'Labs near you' : 'Partner testing network'}
              </h2>
              <span className="text-xs font-semibold text-graphite-soft">
                {loading ? '…' : `${labs.length} labs`}
              </span>
            </div>

            {loading && <LoadingText>Loading labs…</LoadingText>}

            <div className="space-y-3">
              {labs.map((lab) => {
                const active = selectedLab?.id === lab.id;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => setSelectedLab(lab)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-teal bg-mint shadow-md shadow-teal/10'
                        : 'border-paper-line bg-white hover:border-cyan/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base font-semibold text-ink">{lab.name}</h3>
                        <p className="mt-0.5 text-sm text-graphite-soft">{lab.fullAddress}</p>
                      </div>
                      {lab.distanceMiles != null && (
                        <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">
                          {lab.distanceMiles} mi
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-graphite">{lab.services}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-graphite-soft">
                      <span>⏱ {lab.turnaround}</span>
                      {lab.acceptsShipments ? <span>✓ Accepts shipments</span> : null}
                      {lab.phone ? <span>{lab.phone}</span> : null}
                    </div>
                  </button>
                );
              })}
              {!loading && labs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-paper-line p-8 text-center text-sm text-graphite-soft">
                  No labs found. Try another ZIP or show the full network.
                </div>
              )}
            </div>
          </div>

          {/* Request form */}
          <div>
            <Card className="sticky top-24 p-5">
              <h2 className="mb-1 font-display text-lg font-semibold text-ink">
                Request testing
              </h2>
              <p className="mb-4 text-sm text-graphite-soft">
                {selectedLab
                  ? `Selected lab: ${selectedLab.name}`
                  : 'Select a lab on the left, or submit without one and we will match you.'}
              </p>

              <form className="grid gap-3" onSubmit={onSubmitRequest}>
                <Label>
                  Your name *
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
                  Phone
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  />
                </Label>
                <Label>
                  Compound / product name *
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
                      placeholder="e.g. 5mg"
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </Label>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-graphite-soft">Tests requested</p>
                  <div className="flex flex-wrap gap-2">
                    {TEST_OPTIONS.map((type) => {
                      const on = form.testTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleTestType(type)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
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
                    rows={3}
                    placeholder="Cold-chain needs, preferred turnaround, research use statement…"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </Label>

                <Button type="submit" disabled={submitting} full>
                  {submitting ? 'Submitting…' : 'Submit test request'}
                </Button>
                <p className="text-[11px] leading-relaxed text-graphite-soft">
                  For laboratory research compounds only. Shipping instructions and chain-of-custody
                  details are emailed after review. Partner labs perform independent analysis — results
                  are not medical advice.
                </p>
              </form>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 grid gap-3 md:grid-cols-4">
          {[
            ['1', 'Find a lab', 'Use your location or ZIP to rank partner testing labs by distance.'],
            ['2', 'Submit a request', 'Tell us the compound, lot/serial, and which assays you need.'],
            ['3', 'Ship the sample', 'We send packing and chain-of-custody instructions for research materials.'],
            ['4', 'Get results', 'The lab reports HPLC/MS (and other selected) results back to you.'],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-paper-line bg-paper-dim/50 p-4">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-teal to-cyan text-sm font-bold text-white">
                {n}
              </div>
              <h3 className="font-display text-sm font-semibold text-ink">{t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-graphite-soft sm:text-sm">{d}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
