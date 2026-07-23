"use client";

import Link from "next/link";
import { FeatureUnderDevelopment } from "@/components/placeholder-components/FeatureUnderDevelopment";

export default function TransportsListPage() {
  return (
    <div className="flex flex-col p-2 font-sans mt-5 theme-text">
      <div className="md:ml-6 flex flex-col space-y-4 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold theme-text">Transports</h1>
          <p className="theme-text-muted mt-2 text-sm">
            Transport listings are not available yet.
          </p>
        </div>

        <FeatureUnderDevelopment moduleName="Transport Listings" />

        <Link href="/dashboard" className="theme-text-teal text-sm font-medium w-fit">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
