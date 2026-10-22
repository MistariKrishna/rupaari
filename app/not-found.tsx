import Link from 'next/link';

export default function NotFound() {
  return (
    <section style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '140px 24px', textAlign: 'center' }}>
      <span style={{ font: '300 48px var(--font-serif), serif', color: '#5A1520' }}>This thread has come loose.</span>
      <span style={{ font: '300 16px var(--font-sans), sans-serif' }}>The page you were looking for isn’t here.</span>
      <Link href="/sarees" className="cta cta-dark">EXPLORE SAREES →</Link>
    </section>
  );
}
