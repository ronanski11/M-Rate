// layout.jsx
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import NProgressProvider from "@/providers/nprogress-provider";

export const metadata = {
  title: "M-Rate",
  description: "M-Rate is a modern web app for rating movies.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "M-Rate",
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className={` antialiased`}>
        <NProgressProvider>
          <div className="mx-auto" style={{ maxWidth: "1400px" }}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </div>
        </NProgressProvider>
      </body>
    </html>
  );
}
