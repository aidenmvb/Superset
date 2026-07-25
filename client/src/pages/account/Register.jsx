import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../authContext';
import {
  Alert,
  Button,
  Container,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
} from '../../components/ui';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    orgName: '',
    phone: '',
    ageConfirmed: false,
    researchUseAck: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/account', { replace: true });
  }, [isAuthenticated, navigate]);

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/account', { replace: true });
    } catch (err) {
      const detail = err.details?.join?.(' ') || err.message;
      setError(detail || 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section className="pb-20 pt-10">
      <Container className="max-w-lg">
        <PageTitle>Create researcher account</PageTitle>
        <Lead className="mb-6">
          Save shipping details, track orders, and check out faster. For qualified researchers 21+.
        </Lead>
        <form onSubmit={onSubmit} className="rounded-2xl border border-paper-line bg-white p-6 shadow-sm">
          {error && <Alert>{error}</Alert>}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Label>
              Full name
              <Input value={form.name} onChange={update('name')} required autoComplete="name" />
            </Label>
            <Label>
              Lab / organization
              <Input value={form.orgName} onChange={update('orgName')} autoComplete="organization" />
            </Label>
          </div>
          <div className="mb-4">
            <Label>
              Email
              <Input type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
            </Label>
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Label>
              Password
              <Input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </Label>
            <Label>
              Phone (optional)
              <Input type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" />
            </Label>
          </div>
          <label className="mb-3 flex items-start gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.ageConfirmed}
              onChange={update('ageConfirmed')}
              required
            />
            I am 21 years of age or older.
          </label>
          <label className="mb-5 flex items-start gap-2 text-sm text-graphite">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.researchUseAck}
              onChange={update('researchUseAck')}
              required
            />
            I confirm I am purchasing for laboratory research use only — not for human or veterinary
            use.
          </label>
          <Button type="submit" full disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="mt-4 text-center text-sm text-graphite-soft">
            Already have an account?{' '}
            <Link to="/account/login" className="font-semibold text-teal-deep hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Container>
    </Section>
  );
}
