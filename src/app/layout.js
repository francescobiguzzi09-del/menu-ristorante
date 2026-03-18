import "./globals.css";

export const metadata = {
  title: "SmartMenu AI",
  description: "Aggiornato magicamente con l'IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        {children}
      </body>
    </html>
  );
}
