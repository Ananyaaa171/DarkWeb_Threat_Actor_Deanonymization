import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Dark Web Deanonymizer — Threat Actor Intelligence Platform',
  description: 'Authorized cybersecurity threat intelligence & cross-persona deanonymization platform for Smart India Hackathon.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
