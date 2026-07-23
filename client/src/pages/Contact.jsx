import { useState } from 'react';
import { submitContact } from '../api';
import {
  Alert,
  Button,
  Card,
  Container,
  Eyebrow,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
  Textarea,
} from '../components/ui';

const initial = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await submitContact(form);
      setStatus({ type: 'success', text: res.message });
      setForm(initial);
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.details?.join('. ') || err.message || 'Failed to send message',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section>
      <Container className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>CONTACT</Eyebrow>
          <PageTitle>Talk to the research desk</PageTitle>
          <Lead className="mb-6">
            Questions about COAs, bulk quotes, or shipping? Messages are stored in the backend
            database via <code>POST /api/contact</code>.
          </Lead>
          <ul className="list-disc space-y-2 pl-5 text-graphite-soft">
            <li>Email: research@vireon.example</li>
            <li>Hours: Mon–Fri, 9am–5pm PT</li>
            <li>COA requests: include product name and lot preference</li>
          </ul>
        </div>

        <Card className="grid gap-4 p-6">
          <form className="grid gap-4" onSubmit={onSubmit}>
            {status.text && (
              <Alert variant={status.type === 'success' ? 'success' : 'error'}>{status.text}</Alert>
            )}
            <Label>
              Name *
              <Input required value={form.name} onChange={(e) => update('name', e.target.value)} />
            </Label>
            <Label>
              Email *
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </Label>
            <Label>
              Subject
              <Input value={form.subject} onChange={(e) => update('subject', e.target.value)} />
            </Label>
            <Label>
              Message *
              <Textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
              />
            </Label>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </Button>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
