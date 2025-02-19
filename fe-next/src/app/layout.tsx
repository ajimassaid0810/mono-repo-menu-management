// src/app/layout.tsx
import { Providers } from '../../../fe-next/src/redux/provider';
import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'Management Menu',
  description: 'Redux setup in Next.js 14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
