import "./globals.css";

export const metadata = {
  title: "The TOONO — Бүтээлчдийн Зах",
  description: "The TOONO — Монгол бүтээлчдийн дижитал зах",
  openGraph: {
    title: "The TOONO",
    description: "Монгол бүтээлчдийн дижитал зах — Fashion, Art, Design",
    url: "https://the-toono.vercel.app",
    siteName: "The TOONO",
    type: "website",
    images: [
      {
        url: "https://the-toono.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "The TOONO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The TOONO",
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
        <link rel="apple-touch-icon" href="/icon.svg" />
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
