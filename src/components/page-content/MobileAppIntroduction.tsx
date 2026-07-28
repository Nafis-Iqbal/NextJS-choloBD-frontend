"use client";

import React from "react";
import Link from "next/link";

interface MobileAppIntroductionProps {
  className?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  previewImageUrl?: string;
}

const DEFAULT_PLAY_STORE_URL = "https://play.google.com/store";
const DEFAULT_APP_STORE_URL = "https://www.apple.com/app-store/";
const DEFAULT_PREVIEW_IMAGE_URL =
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80&auto=format&fit=crop";

function buildQrImage(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
}

export const MobileAppIntroduction: React.FC<MobileAppIntroductionProps> = ({
  className = "",
  playStoreUrl = DEFAULT_PLAY_STORE_URL,
  appStoreUrl = DEFAULT_APP_STORE_URL,
  previewImageUrl = DEFAULT_PREVIEW_IMAGE_URL
}) => {
  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="mobile-app">
      <div className="w-full flex flex-col items-center text-center font-sans">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-semibold theme-text">
            Your All-in-One CholoBD Travel App
          </h2>
          <p className="mt-3 text-sm md:text-base theme-text-muted leading-relaxed">
            Discover destinations, explore stays and activities, keep trip plans organized,
            and carry your cashless travel experience with you wherever the journey goes.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <StoreBadge
            href={appStoreUrl}
            icon="apple"
            topText="Download on the"
            bottomText="App Store"
          />

          <div className="z-20 rounded-xl border border-[var(--theme-border-subtle)] bg-white p-2 shadow-sm hover:scale-250 transition-transform duration-300">
            <img
              src={buildQrImage(playStoreUrl)}
              alt="QR code for Google Play download"
              className="h-14 w-14 md:h-16 md:w-16"
            />
          </div>

          <StoreBadge
            href={playStoreUrl}
            icon="google-play"
            topText="Get it on"
            bottomText="Google Play"
          />
        </div>

        <div className="mt-8 w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-[2rem]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--theme-bg)]/90 z-10 pointer-events-none" />
            <div className="rounded-[2rem] overflow-hidden">
              <img
                src={previewImageUrl}
                alt="Wide mobile app preview for CholoBD"
                className="w-full h-[260px] md:h-[380px] lg:h-[460px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StoreBadge = ({
  href,
  icon,
  topText,
  bottomText
}: {
  href: string;
  icon: "apple" | "google-play";
  topText: string;
  bottomText: string;
}) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl bg-black px-4 py-2 text-left text-white shadow-sm transition-transform hover:scale-[1.02]"
    >
      <div className="flex items-center gap-2.5">
        {icon === "apple" ? <AppleIcon /> : <GooglePlayIcon />}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/75">{topText}</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-white">{bottomText}</div>
        </div>
      </div>
    </Link>
  );
};

const AppleIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-white">
      <path d="M15.684 12.342c.012 2.93 2.57 3.905 2.598 3.918-.022.068-.407 1.389-1.341 2.756-.807 1.183-1.645 2.363-2.964 2.389-1.296.024-1.713-.771-3.196-.771-1.484 0-1.947.747-3.172.795-1.271.047-2.241-1.271-3.055-2.448-1.664-2.406-2.935-6.797-1.226-9.767.849-1.474 2.366-2.406 4.013-2.43 1.248-.024 2.425.843 3.196.843.771 0 2.219-1.042 3.739-.889.636.026 2.419.257 3.565 1.936-.092.057-2.129 1.243-2.157 3.668ZM13.626 4.392c.676-.818 1.132-1.953 1.008-3.087-.973.039-2.149.647-2.849 1.464-.625.72-1.171 1.874-1.022 2.981 1.086.084 2.186-.55 2.863-1.358Z" />
    </svg>
  );
};

const GooglePlayIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path fill="#34A853" d="M3.2 2.6c-.27.29-.43.72-.43 1.28v16.23c0 .56.16.99.43 1.28l.07.07L12.4 12 3.27 2.53l-.07.07Z" />
      <path fill="#4285F4" d="M15.45 15.08 12.4 12l3.05-3.08.07.04 3.62 2.06c1.03.58 1.03 1.53 0 2.12l-3.62 2.06-.07-.06Z" />
      <path fill="#FBBC04" d="M15.52 15.02 12.4 12 3.2 21.4c.43.46 1.13.52 1.91.08l10.41-5.92" />
      <path fill="#EA4335" d="M15.52 8.98 5.11 3.06c-.78-.44-1.48-.38-1.91.08L12.4 12l3.12-3.02Z" />
    </svg>
  );
};
