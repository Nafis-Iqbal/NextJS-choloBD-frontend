"use client";

import { FaExclamationCircle, FaInbox, FaSpinner } from "react-icons/fa";

type EmptyStateKind = "loading" | "error" | "empty";

function resolveStateKind(displayMessage: string): EmptyStateKind {
  const msg = displayMessage.toLowerCase();
  if (msg.includes("error")) return "error";
  if (msg.includes("loading")) return "loading";
  return "empty";
}

export const NoContentTableRow = ({
  displayMessage,
  tdColSpan: _tdColSpan,
}: {
  displayMessage: string;
  tdColSpan: number;
}) => {
  const kind = resolveStateKind(displayMessage);

  const icon =
    kind === "loading" ? (
      <FaSpinner
        className="text-3xl md:text-4xl theme-text-teal animate-spin"
        aria-hidden
      />
    ) : kind === "error" ? (
      <FaExclamationCircle
        className="text-3xl md:text-4xl"
        style={{ color: "var(--theme-red)" }}
        aria-hidden
      />
    ) : (
      <FaInbox className="text-3xl md:text-4xl theme-text-teal" aria-hidden />
    );

  const accentBorder =
    kind === "error"
      ? "color-mix(in srgb, var(--theme-red) 55%, transparent)"
      : "color-mix(in srgb, var(--theme-teal) 45%, transparent)";

  const panelBg =
    kind === "error"
      ? "color-mix(in srgb, var(--theme-red) 10%, var(--theme-card-bg))"
      : "color-mix(in srgb, var(--theme-teal) 8%, var(--theme-card-bg))";

  return (
    <div
      className="flex flex-1 w-full min-h-full self-stretch items-center justify-center px-4 py-8"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl px-6 py-8 text-center theme-outline"
        style={{
          backgroundColor: panelBg,
          borderColor: accentBorder,
          boxShadow: "0 8px 24px color-mix(in srgb, var(--theme-text) 8%, transparent)",
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              kind === "error"
                ? "color-mix(in srgb, var(--theme-red) 18%, transparent)"
                : "color-mix(in srgb, var(--theme-teal) 16%, transparent)",
          }}
        >
          {icon}
        </div>

        <p
          className={`text-base md:text-lg font-semibold tracking-wide ${
            kind === "error" ? "" : "theme-text"
          }`}
          style={kind === "error" ? { color: "var(--theme-red)" } : undefined}
        >
          {displayMessage}
        </p>

        {kind === "empty" && (
          <p className="text-sm theme-text-subtle max-w-xs">
            Nothing to show here yet. Try adjusting filters or check back later.
          </p>
        )}
        {kind === "loading" && (
          <p className="text-sm theme-text-muted">Please wait a moment…</p>
        )}
        {kind === "error" && (
          <p className="text-sm theme-text-subtle max-w-xs">
            Something went wrong while loading this list. Try refreshing.
          </p>
        )}
      </div>
    </div>
  );
};
