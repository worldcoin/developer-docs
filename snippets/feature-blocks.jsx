/**
 * Borderless feature blocks: a 32px circular chip
 * with a line icon, a large heading, and body copy — no card chrome.
 * Icons are exported from the World UI Kit.
 * Mintlify-safe: single exported component, no top-level helpers.
 */
export const FeatureBlocks = ({ items = [] }) => {
  const icons = {
    user: "/icons/ui/user.svg",
    "shield-check": "/icons/ui/shield-check.svg",
    eye: "/icons/ui/eye.svg",
    community: "/icons/ui/community.svg",
    shield: "/icons/ui/shield.svg",
  };

  return (
    <div className="not-prose mt-8 grid gap-x-12 gap-y-14 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col items-start gap-6">
          <span className="bg-[#f7f7f7] text-[#1f1f1f] dark:text-white dark:bg-[#1f1f1f] flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
            {icons[item.icon] && <img noZoom src={icons[item.icon]} alt="" width="16" height="16" className="block dark:brightness-0 dark:invert" />}
          </span>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 font-sans text-2xl font-[450] leading-[1.2] tracking-[-0.015em] text-[#1f1f1f] dark:text-white">{item.title}</h3>
            <p className="m-0 font-sans text-[17px] font-[350] leading-[1.3] tracking-[-0.005em] text-[#7d7d7d] dark:text-[#b8b8b8] max-w-[420px]">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureBlocks;
