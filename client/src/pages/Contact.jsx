import { useState } from 'react';
import { submitContact } from '../api';
import {
  Alert,
  Button,
  Container,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
  Textarea,
} from '../components/ui';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      await submitContact(form);
      setStatus({ type: 'ok', text: 'Message sent. We will get back to you soon.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'err', text: err.message || 'Could not send message.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section className="pb-20 pt-10">
      <Container className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">Contact</p>
          <PageTitle>Talk with support</PageTitle>
          <Lead className="mb-6">
            Questions about products, orders, or shipping? Send a message and our team will respond.
          </Lead>
          <ul className="space-y-2 text-sm text-graphite-soft">
            <li>Orders & shipping: include your order number when possible</li>
            <li>Product specs: reference the product name on the store page</li>
            <li>Account help: use the email on your researcher account</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-paper-line bg-white p-6 shadow-sm">
          {status.text && (
            <Alert className="mb-4" variant={status.type === 'ok' ? 'success' : undefined}>
              {status.text}
            </Alert>
          )}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Label>
              Name
              <Input value={form.name} onChange={update('name')} required />
            </Label>
            <Label>
              Email
              <Input type="email" value={form.email} onChange={update('email')} required />
            </Label>
          </div>
          <Label className="mb-4">
            Subject
            <Input value={form.subject} onChange={update('subject')} />
          </Label>
          <Label className="mb-5">
            Message
            <Textarea value={form.message} onChange={update('message')} rows={5} required />
          </Label>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </Container>
    </Section>
  );
}
