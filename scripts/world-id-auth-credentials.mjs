// Present canonical credential data as cards without changing the agent table.
const heading = "## Credentials and authentication classes {#credentials-and-authentication-classes}";
const headers = ["Credential", "What it establishes", "Baseline `acr`"];
const baseline = {
  Orb: "`https://world.org/oidc/acr/orb`",
  "Selfie Check": "`https://world.org/oidc/acr/selfie`",
  Passkey: "The account's Orb or Selfie Check class, or no `acr` if it holds neither.",
};
const cards = [
  { source: "Orb", title: "Proof of Human", image: "/images/docs/credentials/proof-of-human.png", href: "/world-id/credentials/1" },
  { source: "Passkey", title: "Passkey", href: "#authentication-methods" },
  { source: "Selfie Check", title: "Proof of Presence", image: "/images/docs/credentials/proof-of-presence.png", href: "/world-id/credentials/11" },
];

function escapeHtml(text) {
  return text.replace(/[&<>"'{}]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
    "'": "&#39;", "{": "&#123;", "}": "&#125;",
  })[character]);
}

function inlineCode(text) {
  return text.split(/(`[^`]+`)/g).map((part) => part.startsWith("`") && part.endsWith("`")
    ? `<code>${escapeHtml(part.slice(1, -1))}</code>` : escapeHtml(part)).join("");
}

function renderCard(card, row) {
  const title = escapeHtml(card.title);
  const visual = card.image
    ? `<img noZoom src="${escapeHtml(card.image)}" alt="${title} credential card" className="w-full h-auto rounded-xl p-3" style={{ backgroundColor: "#F5F5F5" }} />`
    : `<div role="img" aria-label="Passkey credential card" className="flex w-full rounded-xl p-3" style={{ backgroundColor: "#F5F5F5", aspectRatio: "1119 / 744" }}>
          <div className="flex w-full flex-col justify-between rounded-xl border border-zinc-300 p-5 text-zinc-900 shadow-sm" style={{ backgroundColor: "#F2F3F5" }}>
            <Icon icon="key" size={32} />
            <span className="text-xl font-medium">Passkey</span>
          </div>
        </div>`;
  return `      <a href="${escapeHtml(card.href)}" className="block no-underline transition-transform duration-200 hover:-translate-y-0.5">
        ${visual}
        <h3 className="mt-5 mb-0 text-xl font-medium text-zinc-900 dark:text-zinc-100">${title}</h3>
        <p className="mt-2 text-base text-zinc-800 dark:text-zinc-300">${inlineCode(row[1])}</p>
        <p className="mt-4 mb-0 text-sm font-medium text-zinc-600 dark:text-zinc-400">Baseline <code>acr</code></p>
        <p className="mt-1 ${card.source === "Passkey" ? "break-words" : "break-all"} text-sm text-zinc-800 dark:text-zinc-300">${inlineCode(row[2])}</p>
      </a>`;
}

export function renderCredentialCards(content) {
  const matches = [...content.matchAll(/^## Credentials and authentication classes \{#credentials-and-authentication-classes\}$/gm)];
  if (matches.length !== 1) throw new Error("Credential cards require exactly one canonical credentials section");
  const start = matches[0].index;
  const next = content.indexOf("\n## ", start + heading.length);
  const section = content.slice(start, next < 0 ? content.length : next);
  const tables = [...section.matchAll(/^\|[^\n]*\|[ \t]*(?:\n\|[^\n]*\|[ \t]*)+/gm)];
  const cells = (line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
  const original = tables[0]?.[0];
  const rows = original?.split("\n").map(cells);
  if (!rows || rows.length !== 5 || rows.some((row) => row.length !== 3) ||
      rows[0].some((cell, index) => cell !== headers[index]) ||
      rows[1].some((cell) => !/^:?-{3,}:?$/.test(cell)) ||
      tables.filter((table) => cells(table[0].split("\n", 1)[0]).join("|") === headers.join("|")).length !== 1) {
    throw new Error("Canonical credential table changed; review the card layout");
  }
  const data = new Map(rows.slice(2).map((row) => [row[0], row]));
  if (data.size !== 3 || cards.some((card) => {
    const row = data.get(card.source);
    return !row || !row[1] || row[2] !== baseline[card.source];
  })) throw new Error("Credential labels or baseline classes changed; review the card mapping");
  const human = `<div className="not-prose mt-5">
    <div className="grid gap-10 md:grid-cols-3">
${cards.map((card) => renderCard(card, data.get(card.source))).join("\n")}
    </div>
  </div>`;
  const replacement = `<Visibility for="humans">\n  ${human}\n</Visibility>\n\n<Visibility for="agents">\n\n${original}\n\n</Visibility>`;
  const tableStart = start + tables[0].index;
  return content.slice(0, tableStart) + replacement + content.slice(tableStart + original.length);
}
