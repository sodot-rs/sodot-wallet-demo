'use client';

import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { MantineProvider } from '@mantine/core';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import NetworkTable from './ui/networkTable';

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang='en'>
      <head>
        <Script
          src='https://apis.google.com/js/client.js'
          strategy='beforeInteractive'
          onLoad={() => {}}
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{
          background: 'linear-gradient(180deg, #f2e2f8,#f7edfa, #faf5fb)',
          backgroundSize: 'cover',
          height: '100vh',
          margin: 0,
          overflow: 'hidden',
        }}
      >
        <Toaster />
        <MantineProvider>
          {children}
          <NetworkTable />
        </MantineProvider>
      </body>
    </html>
  );
}
