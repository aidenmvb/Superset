import { Container, SectionTitle } from './ui';

const STORIES = [
  {
    quote:
      'As a partner affiliate I send people to Vireon because the store is clean, serial verify is real, and customers stop asking me “is this legit?” The experience sells itself.',
    name: 'Marcus R.',
    role: 'Affiliate partner',
    tag: 'Affiliate',
    focus: 'Partner program',
    initials: 'MR',
    accent: 'from-teal to-violet',
  },
  {
    quote:
      'Our lab ordered BPC-157 and TB-500 for in-vitro assays. Packaging matched the specs, purity docs were easy to find, and restocking through the site is faster than our old supplier.',
    name: 'Dr. Elena K.',
    role: 'Research director · Midwest biotech lab',
    tag: 'Lab client',
    focus: 'Injectable research',
    initials: 'EK',
    accent: 'from-violet to-cyan',
  },
  {
    quote:
      'I’ve promoted a few peptide shops. This is the first one where the batch checker actually works and the topical / nasal / injectable split is clear for my audience. Conversion went up after I switched.',
    name: 'Jordan P.',
    role: 'Content affiliate',
    tag: 'Affiliate',
    focus: 'Audience trust',
    initials: 'JP',
    accent: 'from-cyan to-teal',
  },
  {
    quote:
      'We use GHK-Cu serum and Matrixyl only in topical dermal models. Receiving actual dropper packaging (not mystery vials) made protocol setup simpler for the technicians.',
    name: 'Aisha N.',
    role: 'Formulation research associate',
    tag: 'Researcher',
    focus: 'Topical / face apply',
    initials: 'AN',
    accent: 'from-teal to-cyan',
  },
  {
    quote:
      'Ordered Semax and Selank nasal kits for controlled nasal delivery studies. Spray units arrived intact, labels were clean, and support answered our chain-of-custody questions same day.',
    name: 'Chris L.',
    role: 'Independent research group',
    tag: 'Researcher',
    focus: 'Nasal research',
    initials: 'CL',
    accent: 'from-violet to-teal',
  },
  {
    quote:
      'What I tell my affiliate network: the site feels premium, age gate and research disclaimers are front-and-center, and people can verify lots themselves. That transparency is why I stick with them.',
    name: 'Sofia M.',
    role: 'Affiliate · wellness education channel',
    tag: 'Affiliate',
    focus: 'Transparency',
    initials: 'SM',
    accent: 'from-cyan to-violet',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-y border-paper-line bg-gradient-to-b from-paper-dim/80 via-white to-sky/30 py-14 sm:py-16">
      <Container wide>
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
            Hear from people
          </p>
          <SectionTitle className="text-2xl md:text-3xl">
            Affiliates & researchers who use Vireon
          </SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-graphite-soft">
            Real feedback from affiliate partners and laboratory teams about packaging, specs,
            verification, and how the store fits into research workflows. For laboratory research
            use only — not medical advice or personal use claims.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STORIES.map((item) => (
            <article
              key={item.name + item.role}
              className="flex h-full flex-col rounded-2xl border border-paper-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-lg sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex rounded-full bg-gradient-to-r ${item.accent} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`}
                >
                  {item.tag}
                </span>
                <span className="text-[11px] font-medium text-graphite-soft">{item.focus}</span>
              </div>

              <div className="mb-3 text-2xl leading-none text-teal/40" aria-hidden>
                “
              </div>
              <p className="flex-1 text-sm leading-relaxed text-graphite">
                {item.quote}
              </p>

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
                <div className="ml-auto flex gap-0.5 text-amber" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-xs">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-graphite-soft">
          Testimonials describe service, packaging, and research logistics. Products are sold strictly
          for laboratory / in-vitro research — not for human consumption.
        </p>
      </Container>
    </section>
  );
}
