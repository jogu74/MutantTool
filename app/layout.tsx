import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Mutant UA Tool",
  description: "Privat kampanjverktyg för Mutant: Undergångens arvtagare"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
