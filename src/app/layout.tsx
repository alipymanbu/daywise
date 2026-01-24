import type { Metadata } from 'next';
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: 'DayWise',
  description: 'Plan your day with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider defaultTheme="system">
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
            toastStyle={{
              padding: "14px 16px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
              fontSize: "0.95rem",
            }}
            bodyStyle={{ margin: 0 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
