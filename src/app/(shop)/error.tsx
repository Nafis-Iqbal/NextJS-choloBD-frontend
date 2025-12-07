"use client"; // must be a Client Component!

import { useEffect } from "react";

export default function Error({ error, reset }: {
  error: Error & { digest?: string },
  reset: () => void,
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded">
      <h2 className="text-lg font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-700">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
