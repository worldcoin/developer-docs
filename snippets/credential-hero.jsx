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
    <div className="not-prose bg-[#f5f5f5] dark:bg-[#1f1f1f] rounded-3xl">
      {/* Banner */}
      <div
        className="relative overflow-hidden rounded-t-3xl px-6 py-8 md:px-8 md:py-10"
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="m-0 font-sans text-[27px] font-[400] leading-[1.2] tracking-[-0.015em] text-[#1f1f1f] dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="m-0 font-sans text-[17px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:text-[#b8b8b8] max-w-[420px]">
                {description}
              </p>
            )}
          </div>
          {image && (
            <img
              noZoom
              src={image}
              alt={title}
              className="h-auto w-44 shrink-0 object-contain"
            />
          )}
        </div>
      </div>

      {/* Metadata table */}
      <div>
        {issuerName && (
          <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-6 py-4 text-[15px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/building.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              Issued by
            </span>
            <span className="inline-flex items-center gap-1">
              {issuerVerified && (
                <Tooltip tip="Verified issuer">
                  <span className="inline-flex items-center cursor-help" style={{ height: "20px" }}>
                    <span aria-hidden="true" className="inline-block h-4 w-4 bg-[#007cfb]" style={{ mask: "url(/icons/ui/check-circle.svg) center / contain no-repeat" }} />
                  </span>
                </Tooltip>
              )}
              {issuerHref ? (
                <a
                  href={issuerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#1f1f1f] dark:text-white underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
                >
                  {issuerName}
                </a>
              ) : (
                <span className="font-medium text-[#1f1f1f] dark:text-white">
                  {issuerName}
                </span>
              )}
            </span>
          </div>
        )}
        {status && (
          <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-6 py-4 text-[15px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/antenna-signal.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              Status
            </span>
            {status === "active" && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                Active
              </span>
            )}
            {status === "beta" && (
              <span className="inline-flex items-center rounded-full bg-[#007cfb]/10 px-3 py-1 text-[15px] font-[500] text-[#007cfb]">
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
          <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-6 py-4 text-[15px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/hashtag.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              ID
            </span>
            <span className="font-mono font-medium text-[#1f1f1f] dark:text-white">
              {id}
            </span>
          </div>
        )}
        {sybilResistance != null && (
          <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-6 py-4 text-[15px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/shield-check.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              Sybil resistance
            </span>
            {sybilResistance === "some" ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
                  Some
                </span>
                {sybilResistanceDescription && (
                  <Tooltip tip={sybilResistanceDescription}>
                    <span className="cursor-help text-[#7d7d7d] dark:text-[#b8b8b8]">
                      <Icon src="/icons/ui/info-circle.svg" size={16} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
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
                    <span className="cursor-help text-[#7d7d7d] dark:text-[#b8b8b8]">
                      <Icon src="/icons/ui/info-circle.svg" size={16} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
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
          <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-6 py-4 text-[15px] last:border-b-0 md:px-8 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/clock.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              <span className="inline-flex items-center gap-1">
                Validity period
                <Tooltip tip="The default duration period of the credential. Generally the maximum recommended sybil resistance window.">
                  <span className="cursor-help text-[#7d7d7d] dark:text-[#b8b8b8]">
                    <Icon src="/icons/ui/info-circle.svg" size={16} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
                  </span>
                </Tooltip>
              </span>
            </span>
            <span className="font-medium text-[#1f1f1f] dark:text-white">
              {validityPeriod}
            </span>
          </div>
        )}
        {sourceCodeHref && (
          <div className="flex items-center gap-3 px-6 py-4 text-[15px] md:px-8">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon src="/icons/ui/code.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
            </span>
            <span className="w-28 shrink-0 font-[400] md:w-36 text-[#7d7d7d] dark:text-[#b8b8b8]">
              SDK Reference
            </span>
            {sourceCodeHref === "coming-soon" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[15px] font-[400] text-[#7d7d7d] dark:bg-[#2b2b2b] dark:text-[#b8b8b8]">
                <Icon src="/icons/ui/lock.svg" size={24} color="#1F1F1F" className="dark:brightness-0 dark:invert" />
                Coming soon
              </span>
            ) : (
              <a
                href={sourceCodeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1f1f1f] dark:text-white underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
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
