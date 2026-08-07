"use client";

import { useEffect, useRef, useState } from "react";

import { resolveMediaSource } from "@/lib/media-url";

type XpVideoPlayerProps = {
  src: string;
  title: string;
};

export function XpVideoPlayer({ src, title }: XpVideoPlayerProps) {
  const resolved = resolveMediaSource(src, "video");
  const isDrive = resolved.kind === "drive-embed";

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [resolved.src, isDrive]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const bumpVolume = (delta: number) => {
    setVolume((v) =>
      Math.min(1, Math.max(0, Math.round((v + delta) * 20) / 20)),
    );
  };

  const volumePct = Math.round(volume * 100);

  return (
    <div className="np-body np-wmp">
      <div className="wmp-screen">
        {isDrive ? (
          <iframe
            className="wmp-video wmp-drive-frame"
            src={resolved.src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="wmp-video"
            src={resolved.src}
            title={title}
            playsInline
            preload="metadata"
          />
        )}
      </div>
      <div className="wmp-chrome">
        <div className="wmp-brand">Windows Media Player</div>
        {isDrive ? (
          <p className="wmp-drive-hint">
            Google Drive video — use the play / volume controls on the video.
          </p>
        ) : (
          <div className="wmp-controls">
            <button
              type="button"
              className="wmp-btn"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              className="wmp-btn"
              onClick={() => bumpVolume(-0.1)}
              aria-label="Volume down"
            >
              −
            </button>
            <div className="wmp-vol-meter" aria-hidden>
              <div
                className="wmp-vol-fill"
                style={{ width: `${volumePct}%` }}
              />
            </div>
            <button
              type="button"
              className="wmp-btn"
              onClick={() => bumpVolume(0.1)}
              aria-label="Volume up"
            >
              +
            </button>
            <span className="wmp-vol-label">{volumePct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

type XpImageViewerProps = {
  src: string;
  title: string;
};

export function XpImageViewer({ src, title }: XpImageViewerProps) {
  const resolved = resolveMediaSource(src, "image");

  return (
    <div className="np-body np-picture">
      <div className="picture-toolbar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Favorites</span>
        <span>Help</span>
      </div>
      <div className="picture-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="picture-img" src={resolved.src} alt={title} />
      </div>
      <div className="picture-caption">{title}</div>
    </div>
  );
}
