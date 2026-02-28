import React from "react";

/**
 * Mintlify-safe quickstart wrapper:
 * - No hooks or client-side state.
 * - Uses whatever code block you pass as children (CodeGroup / fenced code).
 * - Mintlify handles syntax highlighting with Shiki.
 */
export const Quickstart = ({
  title = "Developer quickstart",
  description = "Make your first API request in minutes. Learn the basics of the platform.",
  buttonHref = "/docs/get-started",
  buttonLabel = "Get started",
  children,
}) => {
  return (
    <div className="not-prose rounded-3xl bg-zinc-100 p-6 md:p-8 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(280px,1fr)_minmax(360px,1.45fr)] md:items-start">
        <div>
          <h3 className="m-0 text-2xl leading-tight font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="mt-3 max-w-[560px] text-[16px] leading-7 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>

        <div className="quickstart-code min-w-0">{children}</div>
      </div>

      <div className="mt-6 md:mt-4">
        <a
          href={buttonHref}
          className="inline-flex items-center justify-center rounded-full border border-transparent bg-zinc-950 px-6 py-3 text-[16px] font-medium !text-white no-underline transition-colors hover:bg-black dark:border-zinc-700 dark:bg-zinc-800 dark:!text-zinc-100 dark:hover:bg-zinc-700"
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
};

export default Quickstart;
