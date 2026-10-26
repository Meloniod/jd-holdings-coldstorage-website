import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partnerships & Investment Opportunities | JD Holdings',
  description: 'Explore business partnerships, service enquiries, and potential investment conversations with JD Holdings Cold Storage Solutions.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'JD Holdings | Partnerships & Investment Opportunities',
    description: 'Start a conversation about cold-storage service partnerships, operational collaboration, and potential investment opportunities.',
    type: 'website',
  },
};

export default function OpportunitiesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
