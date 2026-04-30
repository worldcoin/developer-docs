import React from "react";

/**
 * Agent quickstart card.
 *
 * Mintlify-safe: no hooks, no client state. The copy button uses an inline
 * onClick that calls navigator.clipboard.writeText — works in any modern
 * browser when JS is enabled, and degrades to manual selection otherwise.
 *
 * Usage:
 *   <AgentQuickstart
 *     skillUrl="docs.world.org/world-id/skill.md"
 *     productName="World ID"
 *     mcpInstall='claude mcp add --transport http worldcoin-developer-portal https://developer.world.org/api/mcp --header "Authorization: Bearer api_YOUR_KEY"'
 *     steps={[
 *       { number: "01", label: "Point your agent at the SKILL.md" },
 *       { number: "02", label: "Connect the Developer Portal MCP" },
 *     ]}
 *   />
 */

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CopyableLine = ({ value, mono = true }) => (
  <div
    className="agent-quickstart-line"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 14px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
      fontSize: 13,
      lineHeight: 1.4,
      color: "#e6e6e6",
      overflowX: "auto",
    }}
  >
    <code style={{ whiteSpace: "pre", background: "transparent", padding: 0, color: "inherit" }}>{value}</code>
    <button
      type="button"
      aria-label="Copy"
      onClick={(e) => {
        try {
          navigator.clipboard.writeText(value);
          const btn = e.currentTarget;
          const original = btn.innerHTML;
          btn.innerHTML = "✓";
          setTimeout(() => { btn.innerHTML = original; }, 1200);
        } catch (_) { /* no-op */ }
      }}
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#a8e6c1",
        cursor: "pointer",
      }}
    >
      <CopyIcon />
    </button>
  </div>
);

const AgentBadge = ({ label, icon }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 12px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontSize: 13,
      color: "#e6e6e6",
    }}
  >
    {icon ? <span aria-hidden="true">{icon}</span> : null}
    <span>{label}</span>
  </div>
);

export const AgentQuickstart = ({
  title = "How to get started",
  productName = "World ID",
  skillUrl = "docs.world.org/world-id/skill.md",
  mcpInstall = 'claude mcp add --transport http worldcoin-developer-portal https://developer.world.org/api/mcp --header "Authorization: Bearer api_YOUR_KEY"',
  steps = [
    { number: "01", label: "Point your agent at the SKILL.md file" },
    { number: "02", label: "Connect the Developer Portal MCP" },
  ],
  worksWith = ["Claude Code", "Cursor", "Codex", "Any MCP client"],
}) => {
  const agentPrompt = `Read ${skillUrl} and add ${productName} to my app`;

  return (
    <div
      className="not-prose"
      style={{
        borderRadius: 20,
        background: "#0e1411",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 0,
        overflow: "hidden",
        color: "#e6e6e6",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 0.9fr) minmax(320px, 1.3fr)",
          gap: 0,
        }}
        className="agent-quickstart-grid"
      >
        {/* Left: title + numbered steps */}
        <div
          style={{
            padding: "32px 28px",
            background: "#101a14",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 320,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              fontWeight: 500,
              color: "#fafafa",
            }}
          >
            {title}
          </h3>

          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom: i === steps.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontSize: 12,
                    color: "#a8e6c1",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {s.number}
                </span>
                <span style={{ fontSize: 15, color: "#d6d6d6" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: terminal card */}
        <div style={{ padding: "28px 28px 24px" }}>
          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                fontSize: 12,
                color: "#9ab3a4",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Get started
            </div>
            <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#9ab3a4",
                    marginBottom: 6,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  Tell your agent to:
                </div>
                <CopyableLine value={agentPrompt} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#9ab3a4",
                    marginBottom: 6,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  Or connect the Developer Portal MCP:
                </div>
                <CopyableLine value={mcpInstall} />
              </div>

              <div
                style={{
                  marginTop: 6,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 13, color: "#9ab3a4", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  Works with:
                </span>
                {worksWith.map((w) => (
                  <AgentBadge key={w} label={w} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .agent-quickstart-grid {
            grid-template-columns: 1fr !important;
          }
          .agent-quickstart-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentQuickstart;
