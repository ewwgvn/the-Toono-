import "./globals.css";

export const metadata = {
  title: "Үлгэр — Бүтээлчдийн Зах",
  description: "Үлгэр — Монгол бүтээлчдийн дижитал зах",
  openGraph: {
    title: "Үлгэр",
    description: "Монгол бүтээлчдийн дижитал зах — Fashion, Art, Design",
    url: "https://the-toono.vercel.app",
    siteName: "Үлгэр",
    type: "website",
    images: [
      {
        url: "https://the-toono.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Үлгэр",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Үлгэр",
    description: "Монгол бүтээлчдийн дижитал зах",
    images: ["https://the-toono.vercel.app/og-image.png"],
  },
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
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preload" href="/fonts/Stardom-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body style={{ background: "#FFFFFF", fontFamily: "'Helvetica Neue', Arial, system-ui, sans-serif" }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
