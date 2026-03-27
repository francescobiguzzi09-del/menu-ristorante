import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: "SmartMenu AI",
  description: "Aggiornato magicamente con l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
