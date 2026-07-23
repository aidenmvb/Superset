import { useCallback, useEffect, useState } from 'react';
import {
  adminCreateSerial,
  adminDeleteSerial,
  adminDocs,
  adminImportCsv,
  adminListSerials,
  adminLogin,
  adminLogout,
  adminMe,
} from '../api';
import {
  Alert,
  Button,
  Card,
  Container,
  Eyebrow,
  Input,
  Label,
  PageTitle,
  Section,
  Textarea,
} from '../components/ui';

const TOKEN_KEY = 'vireon-admin-token';

const SAMPLE_CSV = `serial_number,product_name,quantity,purity,lot_code,status,notes
VR-24S-1187,Semax,5mg,99.4%,VR-24S-1187,active,HPLC + MS verified
VR-24N-0552,BPC-157,5mg,99.1%,VR-24N-0552,active,Endotoxin pass
VR-24P-0901,TB-500,5mg,98.9%,VR-24P-0901,active,Independent lab verified
`;

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [email, setEmail] = useState('admin@status.inc');
  const [password, setPassword] = useState('');
  const [me, setMe] = useState(null);
  const [serials, setSerials] = useState([]);
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    serialNumber: '',
    productName: '',
    quantity: '',
    purity: '',
    lotCode: '',
    status: 'active',
    notes: '',
  });

  const load = useCallback(
    async (tok = token) => {
      if (!tok) return;
      const [meRes, listRes, docsRes] = await Promise.all([
        adminMe(tok),
        adminListSerials(tok, search),
        adminDocs(tok),
      ]);
      setMe(meRes);
      setSerials(listRes.serials || []);
      setDocs(docsRes);
    },
    [token, search]
  );

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    load(token).catch((err) => {
      console.error(err);
      localStorage.removeItem(TOKEN_KEY);
      setToken('');
      setError('Session expired. Sign in again.');
    });
  }, [token, load]);

  async function onLogin(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await adminLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setPassword('');
      setMessage('Signed in');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  async function onLogout() {
    try {
      if (token) await adminLogout(token);
    } catch {
      /* ignore */
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setMe(null);
    setSerials([]);
  }

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await adminCreateSerial(token, form);
      setMessage(`Saved serial ${form.serialNumber}`);
      setForm({
        serialNumber: '',
        productName: '',
        quantity: '',
        purity: '',
        lotCode: '',
        status: 'active',
        notes: '',
      });
      await load();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  }

  async function onImportPaste(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await adminImportCsv(token, csvText);
      setMessage(res.message + (res.warnings?.length ? ` (${res.warnings.length} warnings)` : ''));
      if (res.warnings?.length) console.warn(res.warnings);
      await load();
    } catch (err) {
      setError(err.message || 'Import failed');
    }
  }

  async function onUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setMessage('');
    try {
      const text = await file.text();
      setCsvText(text);
      const res = await adminImportCsv(token, text);
      setMessage(`Uploaded ${file.name}: ${res.message}`);
      await load();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  }

  async function onDelete(serial) {
    if (!confirm(`Delete serial ${serial}?`)) return;
    try {
      await adminDeleteSerial(token, serial);
      setMessage(`Deleted ${serial}`);
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  if (!token) {
    return (
      <Section>
        <Container className="max-w-md">
          <Eyebrow>ADMIN</Eyebrow>
          <PageTitle>Admin sign-in</PageTitle>
          <p className="mb-6 text-sm text-graphite-soft">
            Batch serial management. Default account: <code>admin@status.inc</code>
          </p>
          {error && <Alert>{error}</Alert>}
          <Card className="p-6">
            <form className="grid gap-4" onSubmit={onLogin}>
              <Label>
                Email
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </Label>
              <Label>
                Password
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Label>
              <Button type="submit">Sign in</Button>
            </form>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-10">
      <Container>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>ADMIN · /admin</Eyebrow>
            <PageTitle>Batch serial dashboard</PageTitle>
            <p className="font-mono text-sm text-graphite-soft">
              Signed in as {me?.email} · {me?.serialCount ?? serials.length} serials in database
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onLogout}>
            Sign out
          </Button>
        </div>

        {error && <Alert>{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create single */}
          <Card className="p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Create serial number</h2>
            <form className="grid gap-3" onSubmit={onCreate}>
              <Label>
                Serial number *
                <Input
                  required
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  placeholder="VR-24S-1187"
                />
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Label>
                  Product name
                  <Input
                    value={form.productName}
                    onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                    placeholder="Semax"
                  />
                </Label>
                <Label>
                  Quantity
                  <Input
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="5mg"
                  />
                </Label>
                <Label>
                  Purity
                  <Input
                    value={form.purity}
                    onChange={(e) => setForm((f) => ({ ...f, purity: e.target.value }))}
                    placeholder="99.4%"
                  />
                </Label>
                <Label>
                  Lot code
                  <Input
                    value={form.lotCode}
                    onChange={(e) => setForm((f) => ({ ...f, lotCode: e.target.value }))}
                    placeholder="VR-24S-1187"
                  />
                </Label>
              </div>
              <Label>
                Status
                <Input
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  placeholder="active | inactive | recalled"
                />
              </Label>
              <Label>
                Notes
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Label>
              <Button type="submit">Save serial</Button>
            </form>
          </Card>

          {/* CSV paste + upload */}
          <Card className="p-6">
            <h2 className="mb-2 font-display text-lg font-semibold">CSV import</h2>
            <p className="mb-4 text-sm text-graphite-soft">
              Paste a serial list or upload a <code>.csv</code> file. Duplicates update existing rows.
            </p>
            <form className="grid gap-3" onSubmit={onImportPaste}>
              <Label>
                Serial CSV
                <Textarea
                  rows={10}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="font-mono text-xs"
                />
              </Label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Import pasted CSV</Button>
                <label className="inline-flex cursor-pointer items-center border border-ink px-4 py-3 font-mono text-[13px] tracking-wide hover:bg-ink hover:text-paper">
                  Upload CSV file
                  <input type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onUploadFile} />
                </label>
              </div>
            </form>
          </Card>
        </div>

        {/* Docs */}
        <Card className="mt-8 p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Documentation — how serial CSV works</h2>
          <div className="space-y-3 text-sm text-graphite-soft">
            <p>
              Public customers use <strong>Verify your batch</strong> on the storefront. That calls{' '}
              <code>POST /api/batches/verify</code> against the live <code>batch_serials</code> table —
              not mock data.
            </p>
            <p>
              <strong>Required column:</strong> <code>serial_number</code> (aliases: serial, sn, batch,
              lot, code).
            </p>
            <p>
              <strong>Optional columns:</strong> product_name (or product/compound), quantity (or qty /
              vial_size), purity, lot_code, status, notes.
            </p>
            <p>
              <strong>Quantity</strong> is free text so you can put packaging sizes like <code>5mg</code>{' '}
              or counts like <code>10 vials</code> in the same CSV field.
            </p>
            <p>
              <strong>Status:</strong> use <code>active</code> for valid serials. Set{' '}
              <code>inactive</code> or <code>recalled</code> to make public verify fail for that code.
            </p>
            <p>
              <strong>Headerless CSV</strong> is allowed. Each line is treated as:{' '}
              <code>serial_number, quantity, product_name, purity, lot_code</code>.
            </p>
            <pre className="overflow-x-auto border border-paper-line bg-paper-dim p-4 font-mono text-xs text-ink">
              {docs?.csv?.example || SAMPLE_CSV}
            </pre>
            <ul className="list-disc space-y-1 pl-5">
              {(docs?.csv?.notes || []).map((n) => (
                <li key={n}>{n}</li>
              ))}
              {!docs && (
                <>
                  <li>Duplicate serial_number values upsert (update) the existing row.</li>
                  <li>Admin login: admin@status.inc (password set via ADMIN_PASSWORD env).</li>
                  <li>Dashboard URL: /admin</li>
                </>
              )}
            </ul>
          </div>
        </Card>

        {/* Serial list */}
        <Card className="mt-8 p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Registered serials</h2>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                load();
              }}
            >
              <Input
                placeholder="Search serial / product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56"
              />
              <Button type="submit" variant="ghost" size="sm">
                Search
              </Button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-paper-line text-graphite-soft">
                  <th className="py-2 pr-3 font-medium">Serial</th>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Qty</th>
                  <th className="py-2 pr-3 font-medium">Purity</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Checks</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {serials.map((s) => (
                  <tr key={s.id} className="border-b border-paper-line/80">
                    <td className="py-2.5 pr-3 font-semibold text-ink">{s.serialNumber}</td>
                    <td className="py-2.5 pr-3">{s.productName || '—'}</td>
                    <td className="py-2.5 pr-3">{s.quantity || '—'}</td>
                    <td className="py-2.5 pr-3">{s.purity || '—'}</td>
                    <td className="py-2.5 pr-3">{s.status}</td>
                    <td className="py-2.5 pr-3">{s.verifiedCount}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        className="text-vireon-red underline"
                        onClick={() => onDelete(s.serialNumber)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {serials.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-graphite-soft">
                      No serials yet. Create one or import a CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
