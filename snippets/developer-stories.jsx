/**
 * Developer stories carousel per the Docs 3.0 homepage design: a horizontally
 * scrolling row of 16:9 video cards with a centered play button and a
 * name / role / company chip. Clicking a card swaps the poster for a
 * privacy-enhanced YouTube embed. Adapted from worldcoin/developer-portal's
 * DeveloperStories component (same stories, same YouTube ids).
 * Mintlify-safe: single exported component, no top-level helpers.
 */
import { useState } from "react";

export const DeveloperStories = ({ title, subtitle, items = [] }) => {
  const [playing, setPlaying] = useState(null);

  // Mintlify's MDX runtime does not forward React refs to snippet elements,
  // so locate the track from the clicked arrow instead of a ref.
  const scrollByCard = (direction) => (event) => {
    const root = event.currentTarget.closest("[data-developer-stories]");
    const track = root ? root.querySelector(".landing-stories-track") : null;
    if (!track) return;
    const card = track.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 24 : 600;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const arrow = (direction) => (
    <img noZoom src="/icons/ui/arrow-right.svg" alt="" width="24" height="24" className="block dark:brightness-0 dark:invert" style={{ transform: direction < 0 ? "rotate(180deg)" : "none" }} />
  );

  return (
    <div className="not-prose" data-developer-stories>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[48px] font-[400] leading-[1.15] tracking-[-0.015em] text-[#1f1f1f] dark:text-white max-[600px]:text-[32px]">{title}</div>
          {subtitle ? <div className="mt-3 text-[18px] font-[350] leading-[1.4] text-[#7d7d7d] dark:text-[#b8b8b8]">{subtitle}</div> : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous story"
            onClick={scrollByCard(-1)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#f7f7f7] transition-colors hover:bg-[#f1f1f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007cfb] dark:bg-[#2b2b2b] dark:hover:bg-[#333333]"
          >
            {arrow(-1)}
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={scrollByCard(1)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#f7f7f7] transition-colors hover:bg-[#f1f1f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007cfb] dark:bg-[#2b2b2b] dark:hover:bg-[#333333]"
          >
            {arrow(1)}
          </button>
        </div>
      </div>

      <div className="landing-stories-track mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto">
        {items.map((story, index) => (
          <div
            key={story.name}
            className="landing-story-card relative shrink-0 snap-start overflow-hidden rounded-3xl bg-[#1f1f1f]"
          >
            {playing === index ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${story.youtubeId}?autoplay=1`}
                title={`${story.name} — ${story.company}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                aria-label={`Play video: ${story.name}, ${story.role}, ${story.company}`}
                onClick={() => setPlaying(index)}
                className="group absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
              >
                <img
                  src={story.poster}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-105" style={{ width: "46px", height: "46px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="translate-x-px fill-zinc-900">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute bottom-4 left-4 right-4 rounded-3xl bg-[#1f1f1f] px-4 py-2 text-[15px] font-[500] leading-[1.3] text-white">
                  {story.name} / {story.role} / {story.company}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperStories;
