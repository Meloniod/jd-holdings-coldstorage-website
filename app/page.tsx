'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, BadgeCheck, Building2, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardCheck, FileText, Handshake, Mail, MapPin, ShieldCheck,
  Snowflake, Users, Warehouse, X
} from 'lucide-react';

type LeadForm = {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  consent: boolean;
};

const initialForm: LeadForm = {
  name: '', organisation: '', email: '', phone: '',
  interest: 'Business partnership', message: '', consent: false,
};

const opportunities = [
  {
    number: '01',
    icon: Warehouse,
    title: 'Facility & service partnerships',
    description: 'Explore facility partnerships, referral relationships, and service collaborations that can strengthen mortuary cold-storage access and continuity.',
    tag: 'Operational partners',
  },
  {
    number: '02',
    icon: CircleDollarSign,
    title: 'Investor conversations',
    description: 'Start a confidential, exploratory conversation about funding needs, infrastructure opportunities, and the conditions required for responsible growth.',
    tag: 'Capital & growth',
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Client & referral enquiries',
    description: 'Discuss cold-storage service requirements, referral processes, service-level expectations, and potential ways to work together.',
    tag: 'Service enquiries',
  },
];

const principles = [
  { icon: ShieldCheck, title: 'Respectful by design', copy: 'Sensitive operations call for discretion, clear procedures, and accountable handling of information.' },
  { icon: ClipboardCheck, title: 'Operational visibility', copy: 'A structured workflow can support traceable intake, storage allocation, release checks, and administration.' },
  { icon: Users, title: 'Partnership-led growth', copy: 'Sustainable service delivery depends on trusted relationships with facilities, professionals, and funding partners.' },
];

export default function OpportunitiesPage() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'local' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setStatusMessage('');

    const lead = {
      ...form,
      source: 'Jadan Holdings opportunities website',
      submittedAt: new Date().toISOString(),
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `lead-${Date.now()}`,
    };

    const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        if (!response.ok) throw new Error('The lead service returned an error.');
        setStatus('success');
        setStatusMessage('Thank you. Your enquiry has been sent to our team.');
        setForm(initialForm);
      } catch {
        setStatus('error');
        setStatusMessage('We could not send your enquiry right now. Please try again later or use the contact route provided to you.');
      }
      return;
    }

    // Local fallback is for preview/testing only; it does not notify the business.
    try {
      const key = 'jd-holdings-website-leads-preview';
      const existing = JSON.parse(window.localStorage.getItem(key) || '[]') as unknown[];
      window.localStorage.setItem(key, JSON.stringify([...existing, lead]));
      setStatus('local');
      setStatusMessage('Preview only: this enquiry is saved in this browser and has not been sent to Jadan Holdings. Configure NEXT_PUBLIC_LEAD_ENDPOINT before publishing the form.');
      setForm(initialForm);
    } catch {
      setStatus('error');
      setStatusMessage('This browser could not save the preview enquiry. Please try again.');
    }
  }

  return (
    <main className="opportunity-site">
      <header className="op-nav">
        <a className="op-brand" href="#top" aria-label="Jadan Holdings home">
          <span className="op-brand-mark"><Snowflake size={24} strokeWidth={1.8} /></span>
          <span><strong>JADAN HOLDINGS</strong><small>COLD STORAGE SOLUTIONS</small></span>
        </a>
        <nav className="op-nav-links" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#opportunities">Opportunities</a>
          <Link href="/business-documents">Documents</Link>
          <a href="#contact">Contact</a>
        </nav>
        <a className="op-nav-cta" href="#contact">Start a conversation <ArrowRight size={16} /></a>
      </header>

      <section className="op-hero" id="top">
        <div className="op-hero-grid">
          <div className="op-hero-copy">
            <div className="op-eyebrow"><span /> INFRASTRUCTURE · CARE · ACCOUNTABILITY</div>
            <h1>Building trusted pathways for <em>essential care.</em></h1>
            <p className="op-hero-intro">Jadan Holdings is opening conversations with service partners, facilities, and potential investors around responsible mortuary cold-storage solutions and the operational systems that support them.</p>
            <div className="op-hero-actions">
              <a className="op-button op-button-light" href="#contact">Discuss an opportunity <ArrowRight size={17} /></a>
              <a className="op-text-link" href="#approach">Explore our approach <ArrowDownRight size={17} /></a>
            </div>
            <div className="op-trust-line"><ShieldCheck size={17} /><span>Professional, discreet, partnership-focused conversations</span></div>
          </div>
          <div className="op-hero-art" aria-label="Abstract illustration of temperature-controlled storage infrastructure">
            <div className="op-art-glow" />
            <div className="op-art-frame">
              <div className="op-art-top"><span>CONTROLLED ENVIRONMENT</span><span className="op-status-dot" /> <span>CONCEPT</span></div>
              <div className="op-cold-room">
                <div className="op-room-light" />
                <div className="op-room-unit"><div /><div /><div /><div /></div>
                <div className="op-room-floor" />
                <div className="op-temp-badge"><Snowflake size={20} /><span><small>ENVIRONMENT</small><strong>Temperature controlled</strong></span></div>
              </div>
              <div className="op-art-bottom"><span>CARE IN EVERY DETAIL</span><span>JD / 01</span></div>
            </div>
            <div className="op-floating-note"><BadgeCheck size={19} /><span><strong>Process-led operations</strong><small>Designed around traceability</small></span></div>
          </div>
        </div>
        <div className="op-hero-foot"><span>01 / A MORE CONNECTED APPROACH</span><span>Scroll to explore <ChevronRight size={15} /></span></div>
      </section>

      <section className="op-intro-strip" id="approach">
        <div><span className="op-section-kicker">OUR APPROACH</span><h2>Essential services deserve <em>thoughtful infrastructure.</em></h2></div>
        <p>We believe dependable cold-storage services are supported by clear processes, accountable teams, and the right operational partnerships. We welcome conversations with organisations that share that focus.</p>
      </section>

      <section className="op-principles">
        {principles.map((item, index) => {
          const Icon = item.icon;
          return <article className="op-principle" key={item.title}><div className="op-principle-top"><Icon size={22} /><span>0{index + 1}</span></div><h3>{item.title}</h3><p>{item.copy}</p></article>;
        })}
      </section>

      <section className="op-opportunities" id="opportunities">
        <div className="op-section-heading"><div><span className="op-section-kicker">WAYS TO WORK TOGETHER</span><h2>Opportunity starts<br />with a conversation.</h2></div><p>Whether you represent a facility, are exploring a service relationship, or want to understand potential investment opportunities, tell us what you have in mind.</p></div>
        <div className="op-opportunity-grid">
          {opportunities.map((item) => {
            const Icon = item.icon;
            return <article className="opportunity-card" key={item.number}><div className="op-card-meta"><span>{item.number}</span><Icon size={23} /></div><span className="op-card-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.description}</p><a href="#contact" onClick={() => update('interest', item.number === '01' ? 'Facility or service partnership' : item.number === '02' ? 'Investment opportunity' : 'Client or referral enquiry')}>Explore this path <ArrowRight size={16} /></a></article>;
          })}
        </div>
        <div className="op-investor-note"><div className="op-investor-icon"><Building2 size={23} /></div><div><strong>For potential investors</strong><p>We welcome initial discussions to understand strategic fit, experience, investment criteria, and information requirements. Any investment opportunity is subject to due diligence, appropriate approvals, and definitive documentation. No financial return is promised or implied.</p></div><div className="op-investor-actions"><Link href="/business-documents" className="op-investor-documents"><FileText size={15} />View business documents</Link><a href="#contact">Make an introduction <ArrowRight size={16} /></a></div></div>
      </section>

      <section className="op-contact-section" id="contact">
        <div className="op-contact-copy">
          <span className="op-section-kicker">LET&apos;S CONNECT</span>
          <h2>Tell us what a<br /><em>partnership could look like.</em></h2>
          <p>Share a few details and the kind of opportunity you would like to discuss. Please do not include sensitive personal, patient, or case information in this form.</p>
          <div className="op-contact-detail"><span><Mail size={18} /></span><div><strong>Business enquiries</strong><small>Use the form to introduce your organisation and goals.</small></div></div>
          <div className="op-contact-detail"><span><MapPin size={18} /></span><div><strong>South Africa</strong><small>Location and service coverage can be discussed during initial contact.</small></div></div>
          <div className="op-contact-security"><ShieldCheck size={18} /><span>Enquiries are intended for business development. Do not submit confidential documents, identity numbers, or payment details.</span></div>
        </div>
        <form className="op-lead-form" onSubmit={handleSubmit}>
          <div className="op-form-heading"><span>ENQUIRY FORM</span><span>01 — 06</span></div>
          <h3>Start a conversation</h3>
          <p>Fields marked with * are required.</p>
          <div className="op-form-grid">
            <label>Full name *<input required maxLength={120} autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></label>
            <label>Organisation<input maxLength={160} autoComplete="organization" value={form.organisation} onChange={(e) => update('organisation', e.target.value)} placeholder="Company or organisation" /></label>
            <label>Business email *<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@company.co.za" /></label>
            <label>Phone number<input type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+27 ..." /></label>
            <label className="op-form-wide">I am interested in *<select required value={form.interest} onChange={(e) => update('interest', e.target.value)}><option>Business partnership</option><option>Facility or service partnership</option><option>Investment opportunity</option><option>Client or referral enquiry</option><option>Technology or operational collaboration</option><option>Other business enquiry</option></select></label>
            <label className="op-form-wide">Tell us a little about your enquiry *<textarea required minLength={10} maxLength={2000} rows={4} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="What would you like to explore together?" /></label>
          </div>
          <label className="op-consent"><input type="checkbox" required checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I agree that Jadan Holdings may use these details to respond to this business enquiry. *</span></label>
          <button className="op-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending enquiry…' : 'Send business enquiry'} <ArrowRight size={17} /></button>
          {statusMessage && <div className={`op-form-status ${status}`} role="status"><span>{status === 'success' ? <CheckCircle2 size={18} /> : status === 'error' ? <X size={18} /> : <BadgeCheck size={18} />}</span><p>{statusMessage}</p></div>}
          <small className="op-form-privacy">By submitting, you confirm the information is accurate and relates to a business enquiry.</small>
        </form>
      </section>

      <footer className="op-footer">
        <a className="op-brand op-footer-brand" href="#top"><span className="op-brand-mark"><Snowflake size={22} /></span><span><strong>JADAN HOLDINGS</strong><small>COLD STORAGE SOLUTIONS</small></span></a>
        <p>Respectful service. Accountable operations. Trusted partnerships.</p>
        <div><span>© {new Date().getFullYear()} Jadan Holdings</span><Link href="/portal">Operations portal <ArrowRight size={14} /></Link></div>
      </footer>
      <a className="op-mobile-cta" href="#contact">Discuss an opportunity <ArrowRight size={16} /></a>
    </main>
  );
}
