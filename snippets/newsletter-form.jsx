/**
 * "Subscribe to World Developers Newsletter" block for the landing footer,
 * per the Docs 3.0 design. Submits to world.org's public subscribe endpoint
 * (worldcoin/company-website#4481). Single attempt with a bounded timeout and
 * explicit success/error states — no silent failures, no retries (subscribing
 * twice on a retry would double-fire the marketing pipeline).
 * Mintlify-safe: single exported component, no top-level helpers, no refs.
 */
import { useState } from "react";

export const NewsletterForm = ({ endpoint = "https://world.org/api/subscribe" }) => {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;
    const input = event.currentTarget.querySelector("input[type=email]");
    const email = (input && input.value ? input.value : "").trim();
    if (!email || !input.checkValidity()) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 10000);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
        signal: abort.signal,
      });
      setStatus(res.ok ? "ok" : "error");
    } catch (_) {
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <div className="landing-newsletter not-prose">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
        <div className="landing-newsletter-title" style={{ fontSize: "40px", lineHeight: 1.2, letterSpacing: "-0.8px", fontWeight: 300 }}>
          Subscribe to World Developers Newsletter
        </div>
        <div>
          {status === "ok" ? (
            <div className="landing-newsletter-title" style={{ fontSize: "20px", lineHeight: 1.4, fontWeight: 300 }}>
              Thanks — you’re subscribed.
            </div>
          ) : (
            <form className="landing-email-field" style={{ display: "flex", alignItems: "center", borderRadius: "30px", padding: "10px 10px 10px 24px", gap: "12px" }} onSubmit={onSubmit} noValidate={false}>
              <input
                type="email"
                required
                name="email"
                placeholder="Your email"
                autoComplete="email"
                aria-label="Your email"
                className="landing-email-input"
                style={{ flex: 1, border: "none", outline: "none", fontSize: "20px", fontWeight: 300, background: "transparent", fontFamily: "inherit" }}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                disabled={status === "loading"}
                style={{ width: "40px", height: "40px", borderRadius: "20px", backgroundColor: "#181818", border: "none", cursor: status === "loading" ? "default" : "pointer", opacity: status === "loading" ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8.5 2.8L13.2 7.5H2V8.5H13.2L8.5 13.2L9.2 13.9L15.1 8L9.2 2.1L8.5 2.8Z" fill="white" /></svg>
              </button>
            </form>
          )}
          {status === "error" ? (
            <div role="alert" style={{ fontSize: "14px", lineHeight: 1.4, color: "#B3261E", marginTop: "12px" }}>
              Something went wrong — check the address and try again.
            </div>
          ) : null}
          {status !== "ok" ? (
            <div style={{ fontSize: "12px", lineHeight: 1.4, color: "#9D9B96", marginTop: "24px" }}>
              By entering your email address and clicking “Subscribe,” you consent to receive newsletters, marketing communications and ecosystem updates. For details on how we process your personal data, including your rights and how to exercise them, please review our <a href="https://world.org/legal/privacy-notice" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }} className="landing-privacy-link">Privacy Notice</a>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;
