import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/Toast';

export const metadata = {
  title: "SmartMenu AI",
  description: "Aggiornato magicamente con l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
