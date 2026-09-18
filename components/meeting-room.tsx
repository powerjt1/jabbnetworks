"use client";

import { useEffect, useRef, useState } from "react";
import type DailyIframe from "@daily-co/daily-js";
import { Loader2, Video, VideoOff } from "lucide-react";
import { Button, Card } from "@/components/ui";

type CallFrame = ReturnType<typeof DailyIframe.createFrame>;

type State = "idle" | "joining" | "joined" | "unavailable" | "error";

export function MeetingRoom({
  contractId,
  userName,
  isOwner,
  configured,
}: {
  contractId: string;
  userName: string;
  isOwner: boolean;
  configured: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<CallFrame | null>(null);
  const [state, setState] = useState<State>(configured ? "idle" : "unavailable");
  const [error, setError] = useState<string>();

  // Destroying the frame on unmount matters: Daily keeps the camera and
  // microphone open otherwise, and the light stays on after you navigate away.
  useEffect(() => {
    return () => {
      frameRef.current?.destroy();
      frameRef.current = null;
    };
  }, []);

  async function join() {
    if (!containerRef.current || frameRef.current) return;
    setState("joining");
    setError(undefined);

    try {
      const res = await fetch("/api/daily/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, userName, isOwner }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (res.status === 503) {
          setState("unavailable");
          return;
        }
        throw new Error(body.error ?? "Could not open the room.");
      }

      const { url, token } = (await res.json()) as {
        url: string;
        token: string;
      };

      const { default: Daily } = await import("@daily-co/daily-js");
      const frame = Daily.createFrame(containerRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "12px",
        },
      });

      frame.on("left-meeting", () => {
        frame.destroy();
        frameRef.current = null;
        setState("idle");
      });

      frameRef.current = frame;
      await frame.join({ url, token });
      setState("joined");
    } catch (err) {
      frameRef.current?.destroy();
      frameRef.current = null;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "unavailable") {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <VideoOff className="mt-0.5 size-5 shrink-0 text-ink-3" />
          <div>
            <p className="font-medium">Video is not configured</p>
            <p className="mt-1 text-sm text-ink-2">
              Create a free account at{" "}
              <span className="font-mono text-brand-soft">daily.co</span>, then
              add your API key and domain to{" "}
              <code className="rounded bg-surface-2 px-1 font-mono text-xs">
                .env.local
              </code>
              :
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-ink-2">
              {`DAILY_API_KEY=...\nNEXT_PUBLIC_DAILY_DOMAIN=yourteam.daily.co`}
            </pre>
            <p className="mt-3 text-xs text-ink-3">
              The free tier covers 10,000 participant-minutes a month, which is
              roughly 80 hours of two-person calls.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={
          state === "joined"
            ? "aspect-video w-full overflow-hidden rounded-xl bg-black"
            : "hidden"
        }
      />

      {state !== "joined" && (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <Video className="size-6 text-ink-3" />
          <p className="mt-3 font-medium">Meeting room</p>
          <p className="mt-1 max-w-sm text-sm text-ink-3">
            Private to the two of you. Screen share and chat are on; the room
            closes itself after two hours.
          </p>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <Button
            className="mt-5"
            onClick={join}
            disabled={state === "joining"}
          >
            {state === "joining" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Opening…
              </>
            ) : (
              <>
                <Video className="size-4" />
                {state === "error" ? "Try again" : "Join call"}
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}
