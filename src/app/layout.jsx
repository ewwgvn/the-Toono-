import "./globals.css";

export const metadata = {
  title: "The TOONO — Бүтээлчдийн Зах",
  description: "The TOONO — Монгол бүтээлчдийн дижитал зах",
};

export const viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=5.0,user-scalable=yes,viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ background: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
