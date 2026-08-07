"use client";

import { useEffect, useRef, useState } from "react";

type XpPasswordDialogProps = {
  fileName: string;
  error?: string | null;
  pending?: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
};

export function XpPasswordDialog({
  fileName,
  error,
  pending,
  onSubmit,
  onCancel,
}: XpPasswordDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="xp-pass-overlay" role="presentation">
      <div
        className="xp-pass-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-pass-title"
      >
        <div className="xp-pass-titlebar">
          <span id="xp-pass-title" className="xp-pass-title-text">
            Password
          </span>
          <button
            type="button"
            className="xp-pass-x"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="xp-pass-body">
          <div className="xp-pass-row">
            <div className="xp-pass-lock" aria-hidden>
              <svg viewBox="0 0 48 48" className="xp-pass-lock-svg">
                <rect
                  x="10"
                  y="20"
                  width="28"
                  height="22"
                  rx="3"
                  fill="#F4C542"
                  stroke="#B8860B"
                  strokeWidth="1.5"
                />
                <path
                  d="M16 20v-6a8 8 0 0 1 16 0v6"
                  fill="none"
                  stroke="#607D8B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="30" r="3" fill="#5D4037" />
                <rect
                  x="22.5"
                  y="30"
                  width="3"
                  height="7"
                  rx="1"
                  fill="#5D4037"
                />
              </svg>
            </div>
            <div className="xp-pass-copy">
              <p className="xp-pass-msg">
                Enter the password to open
                <br />
                <strong>{fileName}</strong>
              </p>
              <label className="xp-pass-label" htmlFor="xp-pass-input">
                Password:
              </label>
              <input
                ref={inputRef}
                id="xp-pass-input"
                className="xp-pass-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={pin}
                disabled={pending}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 12))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pin.length >= 4) onSubmit(pin);
                  if (e.key === "Escape") onCancel();
                }}
              />
              {error ? <p className="xp-pass-error">{error}</p> : null}
            </div>
          </div>
          <div className="xp-pass-actions">
            <button
              type="button"
              className="xp-pass-btn"
              disabled={pending || pin.length < 4}
              onClick={() => onSubmit(pin)}
            >
              OK
            </button>
            <button
              type="button"
              className="xp-pass-btn"
              disabled={pending}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
