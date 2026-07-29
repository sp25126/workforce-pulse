import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workforce Pulse",
  description: "Employee productivity and activity insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Workforce Pulse</h1>
            <nav>
              {/* Future navigation items */}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
