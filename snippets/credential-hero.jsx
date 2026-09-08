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
 *  - issuerHref: string         — link to issuer (optional)
 *  - issuerVerified: boolean    — show verified badge (optional)
 *  - status: "active" | "beta" | "deprecated"
 *  - id: number                 — credential schema ID
 *  - sybilResistance: boolean | "some" — whether uniqueness is enforced
 *  - sybilResistanceDescription: string — tooltip on the Yes tag
 *  - validityPeriod: string     — e.g. "10 years or document expiry"
 *  - sourceCodeHref: string     — GitHub URL, or "coming-soon"
 */
export const CredentialHero = ({
  title,
  description,
  image,
  bgColor = "#1a1a2e",
  issuerName,
  issuerHref,
  issuerVerified,
  status,
  id,
  sybilResistance,
  sybilResistanceDescription,
  validityPeriod,
  sourceCodeHref,
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
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="building" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              Issued by
            </span>
            <span className="inline-flex items-center gap-1">
              {issuerVerified && (
                <Tooltip tip="Verified issuer">
                  <span className="inline-flex items-center cursor-help" style={{ height: "20px" }}>
                    <Icon icon="circle-check" iconType="solid" size={14} color="#3b82f6" />
                  </span>
                </Tooltip>
              )}
              {issuerHref ? (
                <a
                  href={issuerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
                >
                  {issuerName}
                </a>
              ) : (
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {issuerName}
                </span>
              )}
            </span>
          </div>
        )}
        {status && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="signal" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              Status
            </span>
            {status === "active" && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                Active
              </span>
            )}
            {status === "beta" && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                Beta
              </span>
            )}
            {status === "deprecated" && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                Deprecated
              </span>
            )}
          </div>
        )}
        {id != null && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="hashtag" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              ID
            </span>
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
              {id}
            </span>
          </div>
        )}
        {sybilResistance != null && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="shield-check" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              Sybil resistance
            </span>
            {sybilResistance === "some" ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                  Some
                </span>
                {sybilResistanceDescription && (
                  <Tooltip tip={sybilResistanceDescription}>
                    <span className="cursor-help text-zinc-400 dark:text-zinc-500">
                      <Icon icon="circle-info" size={14} />
                    </span>
                  </Tooltip>
                )}
              </span>
            ) : sybilResistance ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                  Yes
                </span>
                {sybilResistanceDescription && (
                  <Tooltip tip={sybilResistanceDescription}>
                    <span className="cursor-help text-zinc-400 dark:text-zinc-500">
                      <Icon icon="circle-info" size={14} />
                    </span>
                  </Tooltip>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-500/20 ring-inset dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-500/20">
                No
              </span>
            )}
          </div>
        )}
        {validityPeriod && (
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-3.5 text-[14px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="clock" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1">
                Validity period
                <Tooltip tip="The default duration period of the credential. Generally the maximum recommended sybil resistance window.">
                  <span className="cursor-help text-zinc-400 dark:text-zinc-500">
                    <Icon icon="circle-info" size={12} />
                  </span>
                </Tooltip>
              </span>
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {validityPeriod}
            </span>
          </div>
        )}
        {sourceCodeHref && (
          <div className="flex items-center gap-3 px-6 py-3.5 text-[14px] md:px-8">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Icon icon="code" size={16} />
            </span>
            <span className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
              SDK Reference
            </span>
            {sourceCodeHref === "coming-soon" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                <Icon icon="lock" size={11} />
                Coming soon
              </span>
            ) : (
              <a
                href={sourceCodeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
              >
                {sourceCodeHref.split("/").pop()}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
};

export default CredentialHero;
