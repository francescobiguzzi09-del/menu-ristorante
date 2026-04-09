import { Inter, Playfair_Display, Space_Mono, Outfit, Quicksand } from "next/font/google";
import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' });

export const metadata = {
  title: "SmartMenu AI",
  description: "Aggiornato magicamente con l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} ${outfit.variable} ${quicksand.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
