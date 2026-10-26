import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JD Holdings | Cold Storage Solutions & Partnerships',
  description: 'Explore JD Holdings cold-storage service partnerships, business enquiries, and potential investor opportunities.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'JD Holdings | Cold Storage Solutions & Partnerships',
    description: 'Start a conversation about cold-storage partnerships, operational collaboration, and potential investment opportunities.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-ZA"><body>{children}</body></html>;
}
