import { useState } from 'react';
import { Container, SectionTitle } from './ui';

const FAQS = [
  {
    q: 'Are these products for human use?',
    a: 'No. All products are sold strictly for laboratory and in vitro research use only. They are not for human or veterinary consumption, not dietary supplements, and not intended to diagnose, treat, cure, or prevent any disease.',
  },
  {
    q: 'What is the difference between injectable, topical, and nasal items?',
    a: 'These labels describe the research application form in the catalog. Injectable research items are typically lyophilized powders for lab reconstitution protocols. Topical items are intended for apply-on-skin research models. Nasal items support nasal research delivery models. None are for human use.',
  },
  {
    q: 'How do I verify a batch serial?',
    a: 'Open Test & verify in the top navigation, enter the serial printed on your vial or packaging, and we check it live against our database. Serials are managed in the admin dashboard.',
  },
  {
    q: 'Can I send peptides to a lab for testing?',
    a: 'Yes. On the Test & verify page you can find partner testing labs near you (location or ZIP), select a lab, and submit a request for HPLC purity, MS identity, and related assays. Our team follows up with shipping instructions.',
  },
  {
    q: 'What purity should I expect?',
    a: 'Typical research lots target ≥98–99% purity with identity confirmation available for documentation. Always review the product specs on the store page for the listing you order.',
  },
  {
    q: 'Who can purchase from Vireon?',
    a: 'Purchasers must be 21+ and buying for legitimate laboratory research purposes. You confirm this when entering the site and again at checkout.',
  },
  {
    q: 'How is inventory handled?',
    a: 'Catalog stock comes from our live API and database. When a paid order completes, inventory is updated in real time — not from mock data.',
  },
  {
    q: 'How do shipping and cold-chain work?',
    a: 'Research compounds ship according to product requirements. For third-party testing requests, we provide packing and chain-of-custody guidance after your request is reviewed.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="border-t border-paper-line bg-gradient-to-b from-white via-mint/40 to-sky/30 py-12 sm:py-16">
      <Container wide className="max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
            Support
          </p>
          <SectionTitle>Frequently asked questions</SectionTitle>
          <p className="mx-auto mt-2 max-w-lg text-sm text-graphite-soft">
            Quick answers about research use, product routes, verification, and testing.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-paper-line bg-white shadow-sm">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={i > 0 ? 'border-t border-paper-line' : ''}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-mint/40 sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-sm font-semibold text-ink sm:text-base">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg font-light transition ${
                      isOpen
                        ? 'border-teal bg-teal text-white'
                        : 'border-paper-line bg-paper-dim text-teal-deep'
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-graphite-soft sm:px-6">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
