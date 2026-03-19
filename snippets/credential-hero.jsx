import React from "react";

/**
 * Hero card for credential issuer documentation pages.
 * Mintlify-safe: no hooks, no client-side state.
 *
 * IMPORTANT: Tailwind classes MUST be string literals in className
 * props — Mintlify only prefixes classes it can statically analyze.
 * Never use variables for className values.
 *
 * Props:
 *  - title: string              — credential display name
 *  - description: string        — one-sentence summary
 *  - image: string              — path to thumbnail image
 *  - bgColor: string            — hex color for the banner background
 *  - issuerName: string         — who issues this credential
 *  - status: "Active" | "Beta" | "Deprecated"
 *  - credentialType: string     — e.g. "TFH Credential"
 *  - protocolVersion: string    — e.g. "World ID 4.0"
 *  - sourceCodeHref: string     — GitHub URL (optional)
 *  - sourceCodeLabel: string    — link text, defaults to "Source"
 */
export const CredentialHero = ({
  title,
  description,
  image,
  bgColor = "#1a1a2e",
  issuerName,
  status,
  credentialType,
  protocolVersion,
  sourceCodeHref,
  sourceCodeLabel = "Source",
}) => {
  return (
    <div className="not-prose rounded-3xl bg-zinc-100 dark:bg-zinc-900">
      {/* Banner */}
      <div
        className="relative overflow-hidden rounded-t-3xl px-6 py-8 md:px-8 md:py-10"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h2 className="m-0 text-2xl font-semibold text-white sm:text-3xl">
              {title}
            </h2>
            {description && (
              <p className="m-0 mt-2 max-w-[420px] text-[15px] leading-relaxed text-white/75">
                {description}
              </p>
            )}
          </div>
          {image && (
            <img
              src={image}
              alt={title}
              className="hidden h-28 w-auto rounded-xl object-contain shadow-lg shadow-black/30 sm:block"
            />
          )}
        </div>
      </div>

      {/* Metadata table */}
      <div>
        {issuerName && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="building" size={16} />
            </span>
            <span className="w-28 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Issued by</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{issuerName}</span>
          </div>
        )}
        {status && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="circle-check" size={16} />
            </span>
            <span className="w-28 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Status</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
          </div>
        )}
        {credentialType && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="tag" size={16} />
            </span>
            <span className="w-28 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Type</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{credentialType}</span>
          </div>
        )}
        {protocolVersion && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="code" size={16} />
            </span>
            <span className="w-28 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">Protocol</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{protocolVersion}</span>
          </div>
        )}
        {sourceCodeHref && (
          <div className="flex items-center gap-3 px-6 py-3.5 text-[14px] md:px-8">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="github" iconType="brands" size={16} />
            </span>
            <span className="w-28 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">{sourceCodeLabel}</span>
            <a
              href={sourceCodeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
            >
              {sourceCodeHref.split("/").pop()}
            </a>
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
};

export default CredentialHero;
