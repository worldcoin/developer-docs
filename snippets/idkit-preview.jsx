/** Illustrations only; real verification and QR generation belong to IDKit. */
export const IDKitPreview = ({ state = "default", partnerName, partnerLogo }) => {
  const screens = {
    default: {
      title: "Connect your World ID",
      description: "Use phone camera to scan the QR code",
    },
    success: {
      title: "All set!",
      description: "Your World ID is now connected",
    },
    cancelled: {
      title: "Request cancelled",
      description: "You've cancelled the request in World ID App.",
    },
    connection: {
      title: "Connection lost",
      description: "Please check your connection and try again.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't complete your request. Please try again.",
    },
  };
  const screen = screens[state];
  if (!screen) {
    throw new Error(`Unsupported IDKit preview state: ${state}`);
  }
  const showQR = state === "default";
  const description = partnerName
    ? `Connect your World ID to ${partnerName} by scanning the QR code with your phone camera`
    : screen.description;
  const icon = partnerName ? (
    <div className="flex items-center gap-2">
      <img noZoom src={partnerLogo} alt="" className="block h-11 w-11 md:h-16 md:w-16" />
      <img noZoom src="/images/docs/id/design-guidelines/partnership-world-id.svg" alt="" className="block h-11 w-11 md:h-16 md:w-16" />
    </div>
  ) : showQR ? (
    <img noZoom src="/images/docs/id/design-guidelines/world-id-badge.svg" alt="" className="block h-11 w-11 md:h-16 md:w-16" />
  ) : state === "success" ? (
    <img noZoom src="/images/docs/id/design-guidelines/human-badge.svg" alt="" className="block h-11 w-11 md:h-12 md:w-12" />
  ) : state === "cancelled" ? (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="block h-11 w-11 text-[#ffae00] md:h-14 md:w-14">
      <path d="M28 31.4904V19.282M32.0908 9.84339L48.7665 39.8036C50.4978 42.9142 48.2488 46.7399 44.6889 46.7399H11.66C8.11715 46.7399 5.86641 42.9472 7.56382 39.8374L23.917 9.87713C25.6778 6.65123 30.3035 6.63214 32.0908 9.84339Z" stroke="currentColor" strokeWidth="4" strokeMiterlimit="10" />
      <path d="M27.9983 39.6766C29.5176 39.6766 30.7492 38.4448 30.7492 36.9252C30.7492 35.4057 29.5176 34.1738 27.9983 34.1738C26.4791 34.1738 25.2475 35.4057 25.2475 36.9252C25.2475 38.4448 26.4791 39.6766 27.9983 39.6766Z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="block h-11 w-11 text-[#b8b8b8] dark:text-[#9c9c9c] md:h-14 md:w-14">
      <path d="M27.9987 49.0171C39.5959 49.0171 48.9973 39.6139 48.9973 28.0144C48.9973 16.4149 39.5959 7.01172 27.9987 7.01172C16.4014 7.01172 7 16.4149 7 28.0144C7 39.6139 16.4014 49.0171 27.9987 49.0171Z" stroke="currentColor" strokeWidth="4" strokeMiterlimit="10" />
      <path d="M13.1432 42.8588L42.0019 13.998" stroke="currentColor" strokeWidth="4" strokeMiterlimit="10" />
    </svg>
  );

  return (
    <figure className="not-prose mx-0 my-6 flex justify-center rounded-3xl bg-[#f7f7f7] p-1.5 dark:bg-[#1f1f1f] md:p-6" role="img" aria-label={`${screen.title}: ${description}`}>
      <div className="box-border flex w-full max-w-md flex-col gap-5 rounded-t-[34px] rounded-b-[58px] bg-white p-8 shadow-sm dark:bg-black md:gap-8 md:rounded-3xl" aria-hidden="true">
        <div className="flex min-h-11 items-center justify-between md:justify-end">
          <div className="md:hidden">{icon}</div>
          <span className="docs-idkit-preview-close flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#1f1f1f] dark:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
        </div>
        <div className="flex flex-col items-stretch gap-8 text-left md:items-center md:text-center">
          <div className="flex flex-col items-stretch gap-6 text-left md:items-center md:text-center">
            <div className="hidden md:block">
              {icon}
            </div>
            <div className="flex flex-col gap-3">
              <p className="m-0 font-sans text-2xl font-[450] leading-[1.2] tracking-[-0.015em] text-[#1f1f1f] dark:text-white md:text-[27px] md:font-[400]">{screen.title}</p>
              <p className="m-0 font-sans text-[17px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:text-[#b8b8b8]">
                {description}
              </p>
            </div>
          </div>
          {showQR && (
            <div className="box-border max-w-full self-center overflow-hidden rounded-[32px] border-2 border-[#f1f1f1] bg-white">
              <img noZoom src="/images/docs/id/design-guidelines/qr-artwork.svg" alt="" width="200" height="200" className="block h-auto max-w-full" />
            </div>
          )}
        </div>
        {!showQR && state !== "success" && <span className="box-border inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-3xl border-0 bg-[#1f1f1f] px-6 py-3 text-center font-sans text-[17px] font-[500] leading-[1.2] tracking-[-0.01em] text-white dark:bg-white dark:text-[#1f1f1f] md:w-auto">Try Again</span>}
        <div className="border-t border-[#f1f1f1] pt-4 text-center font-sans text-[15px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:border-[#333333] dark:text-[#b8b8b8]">Terms &amp; Privacy</div>
      </div>
    </figure>
  );
};

export default IDKitPreview;
