import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { brand } from '../config/product';
import './globals.css';
export const metadata: Metadata = { title: brand.name, description: brand.tagline.en, robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
