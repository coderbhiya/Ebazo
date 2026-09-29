import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import StorefrontShell from '@/components/StorefrontShell';
import { pageMetadata } from '@/lib/seo';

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

// Site-wide fallback; every storefront page sets its own title / description (lib/seo.ts)
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ebanzo.com'),
    keywords: 'personalized photo gifts, acrylic photo frame, custom fridge magnets, acrylic keychains, car hanging, photo stand, ebanzo gifts india',
    ...(await pageMetadata('/')),
  };
}

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before hydration */}
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-white text-stone-900 selection:bg-violet-600 selection:text-white"
      >
        <AuthProvider>
          <CartProvider>
            <StorefrontShell>{children}</StorefrontShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
