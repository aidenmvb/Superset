import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
// Link used in overview empty state
import {
  authChangePassword,
  createAccountAddress,
  deleteAccountAddress,
  getAccountAddresses,
  getAccountOrders,
} from '../../api';
import { useAuth } from '../../authContext';
import { formatMoneyFromCents } from '../../format';
import {
  Alert,
  Button,
  ButtonLink,
  Container,
  Input,
  Label,
  Lead,
  LoadingText,
  PageTitle,
  Section,
} from '../../components/ui';

export default function AccountHome() {
  const { user, token, loading, isAuthenticated, updateProfile, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({ name: '', phone: '', orgName: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [addr, setAddr] = useState({
    label: 'Shipping',
    name: '',
    line1: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    isDefault: true,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        orgName: user.orgName || '',
      });
      setAddr((a) => ({ ...a, name: user.name || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function load() {
      try {
        const [o, a] = await Promise.all([
          getAccountOrders(token),
          getAccountAddresses(token),
        ]);
        if (!cancelled) {
          setOrders(o.orders || []);
          setAddresses(a.addresses || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load account.');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <Section>
        <Container>
          <LoadingText>Loading account…</LoadingText>
        </Container>
      </Section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/login" replace />;
  }

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile(profile);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authChangePassword(token, passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function addAddress(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await createAccountAddress(token, addr);
      setAddresses((list) => [res.address, ...list.filter((x) => x.id !== res.address.id)]);
      setMessage('Address saved.');
      setAddr({
        label: 'Shipping',
        name: user.name || '',
        line1: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        isDefault: false,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAddress(id) {
    try {
      await deleteAccountAddress(token, id);
      setAddresses((list) => list.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const tabs = [
    ['overview', 'Overview'],
    ['orders', 'Orders'],
    ['addresses', 'Addresses'],
    ['profile', 'Profile'],
  ];

  return (
    <Section className="pb-20 pt-8">
      <Container wide>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <PageTitle>Your account</PageTitle>
            <Lead className="mb-0">Welcome back, {user.name || user.email}.</Lead>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/catalog" variant="ghost">
              Continue shopping
            </ButtonLink>
            <Button type="button" variant="ghost" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                tab === id
                  ? 'border-teal bg-teal text-white'
                  : 'border-paper-line bg-white text-graphite hover:border-teal/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <Alert>{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        {tab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm md:col-span-2">
              <h2 className="mb-3 font-display text-base font-semibold text-ink">Recent orders</h2>
              {!orders.length && (
                <p className="text-sm text-graphite-soft">
                  No orders yet.{' '}
                  <Link to="/catalog" className="font-semibold text-teal-deep hover:underline">
                    Browse the store
                  </Link>
                </p>
              )}
              <ul className="divide-y divide-paper-line">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.orderNumber} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <div className="font-semibold text-ink">{o.orderNumber}</div>
                      <div className="text-xs text-graphite-soft">
                        {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                      </div>
                    </div>
                    <div className="font-semibold text-ink">{formatMoneyFromCents(o.totalCents)}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h2 className="mb-2 font-display text-base font-semibold text-ink">Profile</h2>
              <p className="text-sm text-graphite-soft">{user.email}</p>
              {user.orgName && <p className="mt-1 text-sm text-graphite">{user.orgName}</p>}
              <p className="mt-4 text-xs text-graphite-soft">
                {addresses.length} saved address{addresses.length === 1 ? '' : 'es'}
              </p>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="overflow-hidden rounded-2xl border border-paper-line bg-white shadow-sm">
            {!orders.length && (
              <p className="p-6 text-sm text-graphite-soft">No orders yet.</p>
            )}
            {orders.map((o) => (
              <div key={o.orderNumber} className="border-b border-paper-line p-5 last:border-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-display font-semibold text-ink">{o.orderNumber}</div>
                    <div className="text-xs text-graphite-soft">
                      {new Date(o.createdAt).toLocaleString()} · {o.paymentStatus || o.status}
                    </div>
                  </div>
                  <div className="font-semibold text-ink">{formatMoneyFromCents(o.totalCents)}</div>
                </div>
                <ul className="text-sm text-graphite-soft">
                  {(o.items || []).map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.productName} ({item.vialSize})
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-graphite-soft">
                  Ship to {o.shippingAddress}, {o.shippingCity}, {o.shippingState} {o.shippingZip}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'addresses' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-paper-line bg-white p-4 shadow-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {a.label}
                      {a.isDefault ? ' · Default' : ''}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-vireon-red"
                      onClick={() => removeAddress(a.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-graphite">
                    {a.name}
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    <br />
                    {a.city}, {a.state} {a.zip}
                  </p>
                </div>
              ))}
              {!addresses.length && (
                <p className="text-sm text-graphite-soft">No saved addresses yet.</p>
              )}
            </div>
            <form onSubmit={addAddress} className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-display text-base font-semibold text-ink">Add address</h3>
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <Label>
                  Label
                  <Input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
                </Label>
                <Label>
                  Name
                  <Input value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
                </Label>
              </div>
              <Label className="mb-3">
                Address
                <Input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
              </Label>
              <div className="mb-3 grid gap-3 sm:grid-cols-3">
                <Label>
                  City
                  <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
                </Label>
                <Label>
                  State
                  <Input value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} required />
                </Label>
                <Label>
                  ZIP
                  <Input value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} required />
                </Label>
              </div>
              <label className="mb-4 flex items-center gap-2 text-sm text-graphite">
                <input
                  type="checkbox"
                  checked={addr.isDefault}
                  onChange={(e) => setAddr({ ...addr, isDefault: e.target.checked })}
                />
                Set as default shipping
              </label>
              <Button type="submit">Save address</Button>
            </form>
          </div>
        )}

        {tab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={saveProfile} className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-display text-base font-semibold text-ink">Profile</h3>
              <Label className="mb-3">
                Name
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </Label>
              <Label className="mb-3">
                Organization
                <Input
                  value={profile.orgName}
                  onChange={(e) => setProfile({ ...profile, orgName: e.target.value })}
                />
              </Label>
              <Label className="mb-4">
                Phone
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </Label>
              <p className="mb-4 text-xs text-graphite-soft">Email: {user.email}</p>
              <Button type="submit">Save profile</Button>
            </form>
            <form onSubmit={savePassword} className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-display text-base font-semibold text-ink">Change password</h3>
              <Label className="mb-3">
                Current password
                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </Label>
              <Label className="mb-4">
                New password
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  minLength={8}
                  required
                />
              </Label>
              <Button type="submit">Update password</Button>
            </form>
          </div>
        )}
      </Container>
    </Section>
  );
}
