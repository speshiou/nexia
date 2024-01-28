import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Images | Nexia",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode,
  params: {
    lang: string,
  }
}>) {
  return (
    <html lang={params.lang}>
      <body className={`${inter.className} dark:bg-black`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
