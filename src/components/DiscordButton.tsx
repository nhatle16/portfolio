"use client";

import { useRef, useState } from "react";

// Discord username (not the display name): what people type into "Add Friend".
const DISCORD_USERNAME = "_mnhatl";

// Shared look for the Contact buttons: thick border, hard shadow, lifts on hover, presses flat on click.
export const contactButton =
  "flex items-center gap-2 rounded-xs border-2 border-border bg-background px-4 py-2 shadow-[4px_4px_0_0_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--border)] active:translate-x-1 active:translate-y-1 active:shadow-none";

// Discord logo (Simple Icons path); lucide-react has no brand logos.
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export function DiscordButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_USERNAME);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the username is still shown for people to copy by hand.
    }
  };

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={contactButton}>
        <DiscordIcon className="size-5 shrink-0" />
        My Discord
      </button>

      {/* Native <dialog>: Esc closes it, and clicking the backdrop closes it too. */}
      <dialog
        ref={dialog}
        aria-labelledby="discord-title"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-xs border-2 border-border bg-background p-6 font-normal text-foreground shadow-[6px_6px_0_0_var(--border)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 id="discord-title" className="flex items-center gap-2 font-grotesk text-xl font-bold">
              <DiscordIcon className="size-6 shrink-0" />
              Send me an invitation
            </h3>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close"
              className="text-xl font-bold leading-none hover:opacity-60"
            >
              ✕
            </button>
          </div>
          <p>Add me as a friend on Discord and I’ll get back to you:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-xs border-2 border-border bg-background px-3 py-2 font-grotesk font-bold">
              {DISCORD_USERNAME}
            </code>
            {/* Flat (no shadow) so it lines up with the username box beside it. */}
            <button
              type="button"
              onClick={copy}
              className="rounded-xs border-2 border-border bg-background px-4 py-2 font-grotesk font-bold hover:bg-card-tint/20"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {/* Announces the copy result to screen readers. */}
          <p aria-live="polite" className="sr-only">{copied ? "Username copied" : ""}</p>
        </div>
      </dialog>
    </>
  );
}
