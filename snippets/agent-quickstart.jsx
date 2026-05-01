/**
 * Agent quickstart card.
 *
 * Single exported component — Mintlify's MDX compiler treats other top-level
 * PascalCase identifiers as missing MDX components and throws at render time,
 * so all helper markup is inlined.
 *
 * Theming uses Tailwind's `dark:` variants so the card adapts to the docs
 * theme automatically.
 */

export const AgentQuickstart = ({
  title = "How to get started",
  productName = "World ID",
  skillUrl = "world.id/SKILL.md",
}) => {
  const agentPrompt = `Read ${skillUrl} and add ${productName} to my app`;

  // Mintlify-style copy icon (matches the fenced code-block copy button).
  const copyIcon = (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );

  const onCopy = (e) => {
    try {
      navigator.clipboard.writeText(agentPrompt);
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
    <div className="not-prose flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-7 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-2xl font-medium leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
          Tell your coding agent to:
        </p>
      </div>
      <div
        className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ backgroundColor: "#0B0C0E" }} />
        <pre
          className="relative m-0 overflow-x-auto bg-transparent px-4 py-3 font-mono text-sm leading-6"
          style={{ color: "#1F2328" }}
        >
          <code className="bg-transparent p-0 text-inherit dark:!text-[#D4D4D4]">
            <span>Read </span>
            <a
              href={`https://${skillUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-700 dark:decoration-zinc-500 dark:hover:decoration-zinc-200"
            >
              {skillUrl}
            </a>
            <span>{` and add ${productName} to my app`}</span>
          </code>
        </pre>
        <button
          type="button"
          aria-label="Copy"
          onClick={onCopy}
          className="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-gray-600/5 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-gray-200/5 dark:hover:text-zinc-200"
        >
          <span data-copy-icon className="inline-flex">{copyIcon}</span>
          <span data-copy-tick style={{ display: "none" }} className="text-emerald-600 dark:text-emerald-400">✓</span>
        </button>
      </div>
    </div>
  );
};

export default AgentQuickstart;
