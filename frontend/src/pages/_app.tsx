import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
      console.error('❌ NEXT_PUBLIC_API_URL environment variable is not set!');
      console.error('Please set NEXT_PUBLIC_API_URL in your environment variables.');
    }
  }, []);

  return <Component {...pageProps} />;
}