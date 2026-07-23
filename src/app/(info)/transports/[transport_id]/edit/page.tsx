"use client";

import Link from "next/link";
import { use } from "react";
import { FeatureUnderDevelopment } from "@/components/placeholder-components/FeatureUnderDevelopment";

export default function EditTransportPage({
  params,
}: {
  params: Promise<{ transport_id: string }>;
}) {
  const { transport_id } = use(params);

  return (
    <div className="flex flex-col p-2 font-sans mt-5 theme-text">
      <div className="md:ml-6 flex flex-col space-y-4 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold theme-text">Edit Transport</h1>
          <p className="theme-text-muted mt-2 text-sm">
            Editing transport{" "}
            <span className="theme-text-teal font-mono">{transport_id}</span> is
            not available yet.
          </p>
        </div>

        <FeatureUnderDevelopment moduleName="Edit Transport" />

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={`/transports/${transport_id}`}
            className="theme-text-teal font-medium"
          >
            ← Transport details
          </Link>
          <Link href="/transports" className="theme-text-muted font-medium">
            Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
