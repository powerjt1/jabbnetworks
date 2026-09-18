import { NextResponse } from "next/server";
import {
  createMeetingToken,
  createRoom,
  isDailyConfigured,
  roomNameForContract,
} from "@/lib/meetings/daily";

/** Rooms and tokens both expire after two hours. */
const TTL_SECONDS = 60 * 60 * 2;

/**
 * Creates (or reuses) the room for a contract and mints a token for the
 * caller.
 *
 * Authorise before minting: only the client and the freelancer on this
 * contract may join. Without that check the endpoint hands a valid token to
 * anyone who can guess a contract id.
 */
export async function POST(request: Request) {
  if (!isDailyConfigured()) {
    return NextResponse.json(
      { error: "Video is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { contractId?: string; userName?: string; isOwner?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.contractId || !body.userName) {
    return NextResponse.json(
      { error: "contractId and userName are required." },
      { status: 400 },
    );
  }

  if (!(await canJoin(body.contractId))) {
    return NextResponse.json(
      { error: "You are not a participant on this contract." },
      { status: 403 },
    );
  }

  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const roomName = roomNameForContract(body.contractId);

  try {
    const room = await createRoom({ name: roomName, expiresAt });
    const token = await createMeetingToken({
      roomName: room.name,
      userName: body.userName,
      isOwner: body.isOwner ?? false,
      expiresAt,
    });

    return NextResponse.json({ url: room.url, token, expiresAt });
  } catch (error) {
    console.error("Daily room setup failed", error);
    return NextResponse.json(
      { error: "Could not open the meeting room." },
      { status: 502 },
    );
  }
}

/**
 * Stand-in for the authorisation check. Replace with a query confirming the
 * session user is the client or the freelancer on this contract.
 */
async function canJoin(contractId: string) {
  const { getContract } = await import("@/lib/data");
  return Boolean(getContract(contractId));
}
