// /snippets/qr-code-generator.jsx
import { useMemo, useState } from "react";

/**
 * Simple QR generator for Mintlify (no external NPM deps).
 * Renders an <img> that points to a public QR service.
 * If you prefer zero external calls, swap the <img> for a <canvas>
 * and inline a tiny QR encoder instead.
 */
export const QRCodeGenerator = (props) => {
  const {
    appId: initialAppId = "",
    hideInput = false,
    baseUrl = "https://worldcoin.org/mini-app",
    hideDetails = false,
  } = props || {};
  const [appId, setAppId] = useState(initialAppId);

  const trimmed = useMemo(() => appId.trim(), [appId]);
  const isValid = useMemo(() => /^app_[a-f0-9]+$/.test(trimmed), [trimmed]);

  // Encode the mini-app URL with the app_id; domain is configurable via baseUrl
  const payload = useMemo(() => {
    if (!trimmed || !isValid) return "";
    return `${baseUrl}?app_id=${trimmed}`;
  }, [trimmed, isValid, baseUrl]);

  const qrSrc = useMemo(() => {
    const size = "200x200";
    const data = encodeURIComponent(payload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
  }, [payload]);

  const containerGridClass = hideDetails
    ? ""
    : "grid gap-4 md:grid-cols-[200px_1fr] items-start";

  return (
    <div className="not-prose p-4 border rounded-xl space-y-4">
      {!hideInput && (
        <label className="block text-sm font-medium">
          App ID
          <input
            type="text"
            placeholder="Enter App Id (eg. app_f88bb2a....)"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            aria-label="App ID"
          />
        </label>
      )}

      {trimmed && !isValid && (
        <p className="text-sm text-red-600">
          Invalid App Id. Eg. app_xxxxxxxxxxx
        </p>
      )}

      <div className={containerGridClass}>
        <div className="flex items-center justify-center border rounded-xl p-2 bg-white">
          {isValid && payload ? (
            <img
              src={qrSrc}
              alt={`QR for ${payload}`}
              width="200"
              height="200"
              loading="eager"
            />
          ) : (
            <div className="w-[200px] h-[200px] grid place-items-center text-sm text-gray-500">
              {hideInput
                ? "Provide an App ID via props"
                : "Enter a valid App ID"}
            </div>
          )}
        </div>

        {!hideDetails && (
          <div className="space-y-2 text-sm">
            <div className="text-gray-700">
              Encoded value:
              <code className="ml-2 px-2 py-1 rounded bg-gray-100">
                {payload || "(empty)"}
              </code>
            </div>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enter your App ID {hideInput ? "via props" : "above"}.</li>
              <li>Scan the QR with your phone’s camera.</li>
              <li>Confirm the prompt in World App.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
