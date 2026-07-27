import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Satisfy, Ubuntu_Mono } from "next/font/google";

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
    default: "CholoBD — Travel & Tours in Bangladesh",
    template: "%s | CholoBD",
  },
  description:
    "Plan trips, book hotels, activities, guides, and tour packages across Bangladesh. CholoBD is your travel companion for discovering destinations and managing bookings.",
  keywords: [
    "CholoBD",
    "Bangladesh travel",
    "tour packages",
    "hotel booking",
    "trip planner",
    "tour spots",
    "activity booking",
    "guides",
    "tourism Bangladesh",
  ],
  authors: [{ name: "CholoBD" }],
  applicationName: "CholoBD",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "CholoBD",
    title: "CholoBD — Travel & Tours in Bangladesh",
    description:
      "Discover destinations, build tours, and book hotels, activities, and guides across Bangladesh with CholoBD.",
    images: [
      {
        url: "/CholoBD-Logo.png",
        alt: "CholoBD logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CholoBD — Travel & Tours in Bangladesh",
    description:
      "Discover destinations, build tours, and book hotels, activities, and guides across Bangladesh with CholoBD.",
    images: ["/CholoBD-Logo.png"],
  },
  icons: {
    icon: [{ url: "/cholobd-icon.png", type: "image/png" }],
    apple: [{ url: "/cholobd-icon.png", type: "image/png" }],
    shortcut: "/cholobd-icon.png",
  },
  other: {
    "theme-color": "#2A9D8F",
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

