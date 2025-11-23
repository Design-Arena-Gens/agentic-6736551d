"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Clip = {
  id: string;
  title: string;
  start: number;
  end: number;
  summary?: string;
};

const VIDEO_ID = "BYizgB2FcAQ";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const VIDEO_TITLE = "Why AI is Overrated - with Neil deGrasse Tyson";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
}) as unknown as typeof import("react-player")["default"];

const BASE_CLIPS: Clip[] = [
  {
    id: "clip-opening",
    title: "Opening context",
    start: 0,
    end: 88,
    summary: "The conversation tees up the central question: how much hype does AI deserve?",
  },
  {
    id: "clip-realism",
    title: "Grounding AI expectations",
    start: 89,
    end: 208,
    summary: "Discussion shifts toward realistic guardrails for what current AI can and cannot do well.",
  },
  {
    id: "clip-human-factor",
    title: "Keep humans in the loop",
    start: 209,
    end: 332,
    summary: "Neil and Hasan explore why human judgment still drives the most meaningful outcomes.",
  },
];

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  return `${totalMinutes}:${paddedSeconds}`;
}

function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length > 3) return null;

  let total = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return null;
    }
    total = total * 60 + Number(part);
  }

  return total;
}

function buildEmbedUrl(start: number, end: number) {
  const query = new URLSearchParams({
    start: String(start),
    end: String(end),
    modestbranding: "1",
    rel: "0",
    controls: "1",
  });

  return `https://www.youtube.com/embed/${VIDEO_ID}?${query.toString()}`;
}

function buildShareUrl(start: number) {
  return `https://www.youtube.com/watch?v=${VIDEO_ID}&t=${start}s`;
}

function buildPlayerSrc(start?: number, end?: number) {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", VIDEO_ID);

  if (typeof start === "number") {
    url.searchParams.set("start", String(start));
  }

  if (typeof end === "number") {
    url.searchParams.set("end", String(end));
  }

  return url.toString();
}

export default function Home() {
  const [clips, setClips] = useState<Clip[]>(BASE_CLIPS);
  const [titleInput, setTitleInput] = useState("");
  const [startInput, setStartInput] = useState("00:30");
  const [endInput, setEndInput] = useState("01:15");
  const [error, setError] = useState<string | null>(null);

  const draftStartSeconds = useMemo(() => parseTimeInput(startInput) ?? null, [startInput]);
  const draftEndSeconds = useMemo(() => parseTimeInput(endInput) ?? null, [endInput]);
  const draftPreviewUrl =
    draftStartSeconds !== null && draftEndSeconds !== null && draftEndSeconds > draftStartSeconds
      ? buildEmbedUrl(draftStartSeconds, draftEndSeconds)
      : null;

  function handleAddClip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const start = parseTimeInput(startInput);
    const end = parseTimeInput(endInput);

    if (start === null || end === null) {
      setError("Time must be in mm:ss or hh:mm:ss format using numbers only.");
      return;
    }

    if (end <= start) {
      setError("End time must be after the start time.");
      return;
    }

    const clip: Clip = {
      id: `clip-${Date.now()}`,
      title: titleInput.trim() || `Custom clip #${clips.length + 1}`,
      start,
      end,
      summary: `Custom segment covering ${formatSeconds(start)} to ${formatSeconds(end)}.`,
    };

    setClips((current) => [clip, ...current]);
    setTitleInput("");
    setError(null);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.videoPanel}>
            <ReactPlayer
              src={VIDEO_URL}
              controls
              width="100%"
              height="100%"
              className={styles.player}
            />
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.label}>Source video</span>
            <h1 className={styles.title}>{VIDEO_TITLE}</h1>
            <p className={styles.subtitle}>
              Build focused clips from the Hasan Minhaj conversation with Neil deGrasse Tyson. Dial in
              the timestamps below and instantly preview the slices you need for sharing or research.
            </p>
            <div className={styles.metaRow}>
              <a
                className={styles.primaryAction}
                href={VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube
              </a>
              <div className={styles.infoPill}>
                <span>Video ID:</span>
                <code>{VIDEO_ID}</code>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.builderSection}>
          <div className={styles.builderHeader}>
            <h2>Create a custom clip</h2>
            <p>
              Provide a title plus start and end timestamps. Clips render as embedded players you
              can watch or open directly on YouTube.
            </p>
          </div>
          <form className={styles.form} onSubmit={handleAddClip}>
            <label className={styles.field}>
              <span>Clip title</span>
              <input
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="Neil on AI limitations"
                aria-label="Clip title"
              />
            </label>
            <div className={styles.timeGrid}>
              <label className={styles.field}>
                <span>Start (mm:ss)</span>
                <input
                  value={startInput}
                  onChange={(event) => setStartInput(event.target.value)}
                  placeholder="00:30"
                  aria-label="Start time"
                />
              </label>
              <label className={styles.field}>
                <span>End (mm:ss)</span>
                <input
                  value={endInput}
                  onChange={(event) => setEndInput(event.target.value)}
                  placeholder="01:15"
                  aria-label="End time"
                />
              </label>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submitButton}>
              Add clip to collection
            </button>
            {draftPreviewUrl && (
              <div className={styles.previewNotice}>
                <span>Preview share link:</span>
                <code>{buildShareUrl(draftStartSeconds!)}</code>
              </div>
            )}
          </form>
        </section>

        <section className={styles.clipSection}>
          <div className={styles.clipHeader}>
            <h2>Clip collection</h2>
            <p>Curated highlights plus anything you add appear here instantly.</p>
          </div>
          <div className={styles.clipGrid}>
            {clips.map((clip) => (
              <article key={clip.id} className={styles.clipCard}>
              <div className={styles.clipPlayer}>
                <ReactPlayer
                  src={buildPlayerSrc(clip.start, clip.end)}
                  controls
                  width="100%"
                  height="100%"
                />
              </div>
                <div className={styles.clipBody}>
                  <div className={styles.clipTitleRow}>
                    <h3>{clip.title}</h3>
                    <span className={styles.clipTimecode}>
                      {formatSeconds(clip.start)} → {formatSeconds(clip.end)}
                    </span>
                  </div>
                  {clip.summary && <p className={styles.clipSummary}>{clip.summary}</p>}
                  <div className={styles.clipLinks}>
                    <a
                      href={buildEmbedUrl(clip.start, clip.end)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open isolated clip
                    </a>
                    <span aria-hidden="true">•</span>
                    <a href={buildShareUrl(clip.start)} target="_blank" rel="noopener noreferrer">
                      Start at {formatSeconds(clip.start)}
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {clips.length === 0 && (
              <div className={styles.emptyState}>
                <p>No clips yet. Add one above to populate your highlight reel.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
