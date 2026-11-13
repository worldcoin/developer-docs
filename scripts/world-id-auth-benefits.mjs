// Short portal walkthrough for humans; retain the canonical reference for agents.
import { createHash } from "node:crypto";

const heading = "## Publish a benefit listing {#publish-a-benefit-listing}";
const expectedSectionSha256 = "94e0a752601d7a7b5d4285b4ef9c348ca123baa35e1edb3192f4e445a6def680";
const walkthrough = `Open your app's **Catalog** tab in the [developer portal](https://auth.world.org/portal).

1. Add a listing name, description, and HTTPS benefit URL, separate from your OIDC callback.
2. Add optional public **Instructions** explaining how to claim. Exclude credentials and tokens.
3. The owner selects **Submit for review**.

![Catalog tab showing the benefit listing fields and Submit for review below Instructions](/images/agent-pass/catalog-submit-review.jpg)

Only approved, published listings for active clients appear in \`get_benefits\`.
Updates can take one minute; changing Instructions requires another review.
Your app enforces eligibility, authorization, and redemption.`;

export function renderBenefitPublishing(content) {
  if (content.split(heading).length !== 2) {
    throw new Error("Benefit publishing requires exactly one canonical section");
  }
  const start = content.indexOf(heading);
  const original = content.slice(start);
  const normalized = original.replace(/\s+/g, " ").trim();
  if (createHash("sha256").update(normalized).digest("hex") !== expectedSectionSha256) {
    throw new Error("Canonical benefit publishing changed; review the portal walkthrough");
  }
  const agentBody = original.slice(heading.length).trim();
  return content.slice(0, start) + [
    heading, "",
    '<Visibility for="humans">', "", walkthrough, "", "</Visibility>", "",
    '<Visibility for="agents">', "", agentBody, "", "</Visibility>",
  ].join("\n");
}
