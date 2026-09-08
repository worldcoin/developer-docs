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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: direction < 0 ? "rotate(180deg)" : "none" }}>
      <path d="M8.5 2.8L13.2 7.5H2V8.5H13.2L8.5 13.2L9.2 13.9L15.1 8L9.2 2.1L8.5 2.8Z" fill="currentColor" />
    </svg>
  );

  return (
    <div className="not-prose" data-developer-stories>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="landing-section-title">{title}</div>
          {subtitle ? <div className="landing-section-sub">{subtitle}</div> : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous story"
            onClick={scrollByCard(-1)}
            className="landing-carousel-arrow flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
          >
            {arrow(-1)}
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={scrollByCard(1)}
            className="landing-carousel-arrow flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
          >
            {arrow(1)}
          </button>
        </div>
      </div>

      <div className="landing-stories-track mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto">
        {items.map((story, index) => (
          <div
            key={story.name}
            className="landing-story-card relative shrink-0 snap-start overflow-hidden rounded-2xl bg-zinc-900"
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
                <span className="absolute rounded-[10px] bg-black text-[17px] leading-snug text-white md:text-[20px]" style={{ left: "24px", bottom: "24px", padding: "14px 16px" }}>
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
