import { Container, SectionTitle } from './ui';

const STORIES = [
  {
    quote:
      'Clear product pages, accurate packaging, and fast restocking. Exactly what our lab needs from a research supplier.',
    name: 'Elena K.',
    role: 'Lab manager',
    initials: 'EK',
    accent: 'from-teal to-violet',
  },
  {
    quote:
      'Specs are easy to find and the injectable / topical / nasal split is obvious. Ordering is straightforward.',
    name: 'Marcus R.',
    role: 'Research buyer',
    initials: 'MR',
    accent: 'from-violet to-cyan',
  },
  {
    quote:
      'Checkout was smooth and support answered our shipping questions the same day. We will reorder.',
    name: 'Aisha N.',
    role: 'Formulation associate',
    initials: 'AN',
    accent: 'from-cyan to-teal',
  },
  {
    quote:
      'I recommend Vantril to other research buyers — clean store, solid documentation, no runaround.',
    name: 'Jordan P.',
    role: 'Affiliate partner',
    initials: 'JP',
    accent: 'from-teal to-cyan',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-y border-paper-line bg-gradient-to-b from-paper-dim/80 via-white to-sky/30 py-14 sm:py-16">
      <Container wide>
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
            Hear from buyers
          </p>
          <SectionTitle className="text-2xl md:text-3xl">Trusted by research teams</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-graphite-soft">
            Feedback from researchers and partners on packaging, ordering, and support.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STORIES.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-paper-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-md sm:p-6"
            >
              <p className="flex-1 text-sm leading-relaxed text-graphite">“{item.quote}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-paper-line pt-4">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.accent} text-xs font-bold text-white shadow-sm`}
                >
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold text-ink">{item.name}</div>
                  <div className="truncate text-xs text-graphite-soft">{item.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-graphite-soft">
          Products are sold for laboratory research only — not for human consumption.
        </p>
      </Container>
    </section>
  );
}
