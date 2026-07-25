import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const next = location.state?.from || '/account';

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      const detail = err.details?.join?.(' ') || err.message;
      setError(detail || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section className="pb-20 pt-10">
      <Container className="max-w-md">
        <PageTitle>Sign in</PageTitle>
        <Lead className="mb-6">Access your researcher account to track orders and saved addresses.</Lead>
        <form onSubmit={onSubmit} className="rounded-2xl border border-paper-line bg-white p-6 shadow-sm">
          {error && <Alert>{error}</Alert>}
          <div className="mb-4">
            <Label>
              Email
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Label>
          </div>
          <div className="mb-5">
            <Label>
              Password
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Label>
          </div>
          <Button type="submit" full disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="mt-4 text-center text-sm text-graphite-soft">
            New here?{' '}
            <Link to="/account/register" className="font-semibold text-teal-deep hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </Container>
    </Section>
  );
}
