import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '700'],
});

export const metadata = {
  title: "SmartMenu AI — Menù digitale per ristoranti",
  description: "Crea il tuo menù digitale in 2 minuti. Scatta una foto, l'AI fa il resto. QR code, traduzione automatica e allergeni inclusi. Usato da 500+ ristoranti italiani.",
  keywords: "menù digitale ristorante, qr code menù ristorante, menù digitale gratis, menù digitale con ordini tavolo",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
