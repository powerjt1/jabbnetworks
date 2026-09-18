/**
 * SERVER ONLY.
 *
 * Daily.co rooms for client/freelancer calls.
 *
 * Rooms are created private and each participant gets a short-lived meeting
 * token. A public room URL is guessable, and a guessable URL on a call where
 * two people discuss a $70,000 contract is a real problem — the token is what
 * makes the room actually private.
 */

const API = "https://api.daily.co/v1";

export function isDailyConfigured() {
  return Boolean(process.env.DAILY_API_KEY);
}

function headers() {
  const key = process.env.DAILY_API_KEY;
  if (!key) {
    throw new Error(
      "Daily is not configured. Set DAILY_API_KEY in .env.local.",
    );
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface RoomOptions {
  /** Stable name so everyone with the same contract lands in one room. */
  name: string;
  /** Unix seconds. Rooms self-destruct rather than linger. */
  expiresAt: number;
  enableRecording?: boolean;
}

export async function createRoom(opts: RoomOptions) {
  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: opts.name,
      privacy: "private",
      properties: {
        exp: opts.expiresAt,
        enable_screenshare: true,
        enable_chat: true,
        enable_knocking: true,
        start_video_off: false,
        start_audio_off: false,
        ...(opts.enableRecording ? { enable_recording: "cloud" } : {}),
      },
    }),
    cache: "no-store",
  });

  // A room that already exists is the normal case on a second join, not a
  // failure — reuse it.
  if (res.status === 400) {
    const existing = await getRoom(opts.name);
    if (existing) return existing;
  }

  if (!res.ok) {
    throw new Error(`Daily room creation failed: ${res.status}`);
  }
  return (await res.json()) as { name: string; url: string };
}

export async function getRoom(name: string) {
  const res = await fetch(`${API}/rooms/${name}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { name: string; url: string };
}

export async function createMeetingToken(params: {
  roomName: string;
  userName: string;
  /** Owners can admit knockers, record and end the call for everyone. */
  isOwner?: boolean;
  /** Unix seconds. */
  expiresAt: number;
}) {
  const res = await fetch(`${API}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_name: params.userName,
        is_owner: params.isOwner ?? false,
        exp: params.expiresAt,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Daily token creation failed: ${res.status}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

/** Daily requires room names to be URL-safe. */
export function roomNameForContract(contractId: string) {
  return `contract-${contractId}`.replace(/[^a-zA-Z0-9-]/g, "-");
}
