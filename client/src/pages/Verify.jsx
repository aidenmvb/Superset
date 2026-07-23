import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LabTestingPanel from '../components/LabTestingPanel';
import VerifyBatchSection from '../components/VerifyBatchSection';
import { Container, PageTitle } from '../components/ui';

/**
 * Combined Test peptides + Verify batch page.
 * Serial verification and lab testing live together — same feature family.
 */
export default function Verify() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="bg-white">
      <div className="border-b border-paper-line bg-gradient-to-br from-mint via-white to-sky">
        <Container wide className="py-8 sm:py-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
            Test & verify
          </p>
          <PageTitle className="mb-2">Test peptides · Verify batch</PageTitle>
          <p className="max-w-2xl text-sm leading-relaxed text-graphite-soft sm:text-base">
            Confirm a serial against our database, find a partner lab near you, and request
            third-party HPLC/MS testing — one place for everything that proves what&apos;s in the
            vial.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#verify"
              className="rounded-full bg-gradient-to-r from-teal to-violet px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Verify a serial
            </a>
            <a
              href="#testing"
              className="rounded-full border border-paper-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-mint"
            >
              Labs near you · Send for testing
            </a>
          </div>
        </Container>
      </div>

      <VerifyBatchSection id="verify" />
      <LabTestingPanel id="testing" />
    </div>
  );
}
