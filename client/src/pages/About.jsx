import { Container, Lead, PageTitle, Section } from '../components/ui';

export default function About() {
  return (
    <Section className="pb-20 pt-10">
      <Container className="max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">Quality</p>
        <PageTitle>Research standards, clearly presented</PageTitle>
        <Lead className="mb-8">
          Vantril supplies high-purity research peptides for qualified laboratories. From catalog to
          checkout, every step is designed for teams that need clear specs and reliable fulfillment.
        </Lead>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {[
            ['Purity focus', 'Typical lots target ≥98–99% purity with identity confirmation available.'],
            ['Form clarity', 'Injectable, topical, and nasal listings are labeled and packaged distinctly.'],
            ['Secure checkout', 'Card payments processed securely with full order confirmation.'],
            ['Researcher accounts', 'Save addresses and review order history from your account portal.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-display text-sm font-semibold text-ink">{t}</h3>
              <p className="text-sm leading-relaxed text-graphite-soft">{d}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-paper-line bg-paper-dim/60 p-5 text-sm leading-relaxed text-graphite">
          <p className="font-semibold text-ink">Research use only</p>
          <p className="mt-2">
            All materials are sold strictly for laboratory research. They are not drugs, not food
            supplements, and not for human or veterinary use. Buyers are responsible for handling
            research chemicals safely.
          </p>
        </div>
      </Container>
    </Section>
  );
}
