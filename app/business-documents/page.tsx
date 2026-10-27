import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Download, FileText, Snowflake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Documents | Jadan Holdings',
  description: 'Read or download the Jadan Holdings pitch deck and B2B business plan.',
};

const businessDocuments = [
  {
    id: 'pitch-deck',
    title: 'Jadan Holdings pitch deck',
    description: 'An introduction to Jadan Holdings and its cold-storage partnership opportunity.',
    downloadName: 'jadan-holdings-pitch-deck.pdf',
  },
  {
    id: 'business-plan',
    title: 'Master B2B business plan',
    description: 'The business plan covering the B2B model, rent-to-own approach, and local suppliers.',
    downloadName: 'jadan-holdings-business-plan.pdf',
  },
];

export default function BusinessDocumentsPage() {
  return (
    <main className="opportunity-site">
      <header className="op-nav">
        <Link className="op-brand" href="/" aria-label="Jadan Holdings home">
          <span className="op-brand-mark"><Snowflake size={24} strokeWidth={1.8} /></span>
          <span><strong>JADAN HOLDINGS</strong><small>COLD STORAGE SOLUTIONS</small></span>
        </Link>
        <nav className="op-nav-links" aria-label="Main navigation">
          <Link href="/#approach">Our approach</Link>
          <Link href="/#opportunities">Opportunities</Link>
          <Link href="/business-documents" aria-current="page">Documents</Link>
        </nav>
        <Link className="op-nav-cta" href="/#contact">Start a conversation <ArrowRight size={16} /></Link>
      </header>

      <section className="op-documents op-documents-page">
        <Link className="op-documents-back" href="/"><ArrowLeft size={15} /> Back to Jadan Holdings</Link>
        <div className="op-section-heading">
          <div><span className="op-section-kicker">SPONSORSHIP & INVESTOR MATERIALS</span><h1>Business documents.</h1></div>
          <p>Read the pitch deck and business plan below. Download either document with the Jadan Holdings watermark included on every page.</p>
        </div>
        <div className="op-document-grid">
          {businessDocuments.map((document) => (
            <article className="op-document-card" key={document.id}>
              <div className="op-document-heading">
                <span className="op-document-icon"><FileText size={20} /></span>
                <div><h2>{document.title}</h2><p>{document.description}</p></div>
                <a className="op-document-download" href={`/api/documents/${document.id}?download=1`} download={document.downloadName} aria-label={`Download ${document.title} with Jadan watermark`}>
                  <Download size={16} /><span>Download PDF</span>
                </a>
              </div>
              <iframe
                className="op-document-reader"
                src={`/api/documents/${document.id}`}
                title={`PDF reader: ${document.title}`}
                loading="lazy"
              />
            </article>
          ))}
        </div>
      </section>

      <footer className="op-footer">
        <Link className="op-footer-home" href="/"><ArrowLeft size={15} /> Jadan Holdings home</Link>
        <p>Respectful service. Accountable operations. Trusted partnerships.</p>
        <Link href="/#contact">Business enquiries <ArrowRight size={14} /></Link>
      </footer>
    </main>
  );
}
