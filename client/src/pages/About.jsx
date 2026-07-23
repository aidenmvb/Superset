import { Container, Lead, PageTitle, Section, SectionTitle } from '../components/ui';

export default function About() {
  return (
    <Section className="pb-20 pt-10">
      <Container className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-deep">
          Quality
        </p>
        <PageTitle>Our quality commitment</PageTitle>
        <Lead className="mb-10">
          From catalog to checkout, every step is designed for research teams that need purity,
          documentation, and reliable fulfillment.
        </Lead>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {[
            ['US operations', 'Catalog, support, and quality process managed for research buyers.'],
            ['High purity', 'Typical lots target ≥98–99% with identity confirmation.'],
            ['Batch serials', 'Register serials in admin; customers verify on the storefront.'],
            ['Live inventory', 'Stock and orders run through a real API and database.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-paper-line bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{t}</h3>
              <p className="text-sm text-graphite-soft">{d}</p>
            </div>
          ))}
        </div>

        <SectionTitle className="mb-3 text-xl">Intended use</SectionTitle>
        <p className="mb-6 text-sm leading-relaxed text-graphite-soft">
          All materials are sold strictly for laboratory research. They are not drugs, not food
          additives, and not intended for human or veterinary use. Buyers must be 21+ and capable of
          handling research chemicals safely.
        </p>

        <SectionTitle className="mb-3 text-xl">Handling</SectionTitle>
        <p className="text-sm leading-relaxed text-graphite-soft">
          Store lyophilized material frozen, protected from light and moisture. Reconstitute
          according to your lab protocol.
        </p>
      </Container>
    </Section>
  );
}
