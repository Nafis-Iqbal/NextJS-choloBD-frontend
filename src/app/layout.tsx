import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Satisfy, Ubuntu_Mono, Fredericka_the_Great } from "next/font/google";

import { ClientProviders } from "@/providers/ClientProviders";

import NotificationPopUp from "@/components/modals/NotificationPopUpModal";
import LoadingModal from "@/components/modals/LoadingContentModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ubuntuMono = Ubuntu_Mono({
  weight: "400",
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
});

const satisfy = Satisfy({
  weight: "400",
  variable: "--font-satisfy",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Suit Up! - Premium E-Commerce Experience",
    template: "%s | Suit Up!"
  },
  description: "Discover premium products at Suit Up! Your one-stop destination for quality goods, exceptional service, and unbeatable prices.",
  keywords: ["e-commerce", "online shopping", "premium products", "suit up", "quality goods"],
  authors: [{ name: "Nafis Iqbal" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Suit Up! - Premium E-Commerce Experience',
    description: 'Discover premium products at Suit Up! Your one-stop destination for quality goods and exceptional service.',
    images: ['/TIcon.PNG'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suit Up! - Premium E-Commerce Experience',
    description: 'Discover premium products at Suit Up! Your one-stop destination for quality goods and exceptional service.',
  },
  icons: {
    icon: 'favicon.ico',
    apple: 'favicon.ico',
  },
  other: {
    'theme-color': '#00FF99',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${satisfy.className} ${geistSans.variable} ${geistMono.variable} ${ubuntuMono.variable} antialiased scroll-smooth`}>
      <body className="overflow-x-hidden">
        <main>
          <ClientProviders>
              <NotificationPopUp/>
              <LoadingModal/>
              {children}
          </ClientProviders>
        </main>
      </body>
    </html>
  );
}

