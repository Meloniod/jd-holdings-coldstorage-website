import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Management Portal | Jadan Holdings',
  description: 'Internal cold storage operations management portal.',
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
