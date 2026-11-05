/**
 * Mintlify-safe quickstart wrapper:
 * - No top-level helper components (Mintlify treats them as missing MDX components).
 * - Code block content comes from `children` (CodeGroup / fenced code).
 * - Optional `agentPrompt` renders an "OR / Read <skillUrl> and add <productName> to my app"
 *   row below the code, above the CTA. Pass null/undefined to hide.
 */
export const Quickstart = ({
  title = "Developer quickstart",
  description = "Make your first API request in minutes. Learn the basics of the platform.",
  buttonHref = "/docs/get-started",
  buttonLabel = "Get started",
  agentPrompt,
  children,
}) => {
  const promptCfg = agentPrompt
    ? {
        skillUrl: agentPrompt.skillUrl || "world.id/SKILL.md",
        productName: agentPrompt.productName || "World ID",
      }
    : null;
  const promptText = promptCfg
    ? `Read ${promptCfg.skillUrl} and add ${promptCfg.productName} to my app`
    : null;

  const copyIcon = (
    <img noZoom src="/icons/ui/copy.svg" alt="" width="16" height="16" className="block h-4 w-4 dark:brightness-0 dark:invert" />
  );

  const onCopy = (text) => (e) => {
    try {
      navigator.clipboard.writeText(text);
      const btn = e.currentTarget;
      const icon = btn.querySelector("[data-copy-icon]");
      const tick = btn.querySelector("[data-copy-tick]");
      if (icon && tick) {
        icon.style.display = "none";
        tick.style.display = "inline-flex";
        setTimeout(() => { icon.style.display = "inline-flex"; tick.style.display = "none"; }, 1200);
      }
    } catch (_) { /* no-op */ }
  };

  return (
    <div className="not-prose flex flex-col gap-8 rounded-3xl border border-[#f1f1f1] bg-white p-6 md:p-8 dark:border-[#333333] dark:bg-black">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 font-sans text-2xl font-[450] leading-[1.2] tracking-[-0.015em] text-[#1f1f1f] dark:text-white">{title}</h3>
          <p className="m-0 font-sans text-[17px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:text-[#b8b8b8]">{description}</p>
        </div>
        <div className="quickstart-code min-w-0">{children}</div>
      </div>

      {promptText ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10"></div>
            <span className="font-mono text-xs text-[#7d7d7d] dark:text-[#b8b8b8]">OR</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10"></div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="m-0 font-sans text-[17px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:text-[#b8b8b8]">
              Tell your coding agent to:
            </p>
            <div className="border-[#f1f1f1] bg-[#f5f5f5] text-[#1f1f1f] dark:text-white dark:border-[#333333] dark:bg-[#1f1f1f] group relative overflow-hidden rounded-xl border">
              <pre className="relative m-0 overflow-x-auto bg-transparent py-3 pl-4 pr-14 font-mono text-sm leading-6 text-[#1f1f1f] dark:text-white">
                <code className="bg-transparent p-0 text-inherit">
                  <span>Read </span>
                  <a
                    href={`https://${promptCfg.skillUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-inherit underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-700 dark:decoration-zinc-500 dark:hover:decoration-zinc-200"
                  >
                    {promptCfg.skillUrl}
                  </a>
                  <span>{` and add ${promptCfg.productName} to my app`}</span>
                </code>
              </pre>
              <button
                type="button"
                aria-label="Copy"
                onClick={onCopy(promptText)}
                className="text-[#1f1f1f] dark:text-white hover:bg-[#f1f1f1] dark:hover:bg-[#2b2b2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#007cfb] absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
              >
                <span data-copy-icon className="inline-flex">{copyIcon}</span>
                <span data-copy-tick style={{ display: "none" }}>
                  <img noZoom src="/icons/ui/check.svg" alt="" width="16" height="16" className="block h-4 w-4 dark:brightness-0 dark:invert" />
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <a
          href={buttonHref}
          className="box-border inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-3xl border-0 px-6 py-3 text-center font-sans text-[17px] font-[500] leading-[1.2] tracking-[-0.01em] no-underline md:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#007cfb] bg-[#1f1f1f] !text-white dark:bg-white dark:!text-[#1f1f1f] transition-opacity hover:opacity-[0.85]"
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
};

export default Quickstart;
