import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'JD Holdings | Cold Storage Operations', description: 'Mortuary cold storage operations and case management portal demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-ZA"><body>{children}</body></html>; }
