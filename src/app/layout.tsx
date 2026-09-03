import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import StorefrontShell from '@/components/StorefrontShell';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ebanzo | Premium Personalized Photo Gifting & Laser Cut Keepsakes',
  description: 'Custom acrylic fridge magnets, personalized keychains, car charms, and tabletop photo stands. Fused with Japanese UV print technology and delivered across India.',
  keywords: 'personalized photo gifts, custom fridge magnets, acrylic keychains, car hanging charm, tabletop photo stand, ebanzo gifts india',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-stone-900 selection:bg-violet-600 selection:text-white">
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
