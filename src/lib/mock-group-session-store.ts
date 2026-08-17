import { randomUUID } from "node:crypto";

import type {
  CreateGroupSessionRequest,
  CreateGroupSessionResponse,
  GroupSessionStoreOption,
  GroupSessionView,
  JoinGroupSessionResponse,
} from "../types/group-recommendation";

/**
 * In-memory store for the mock group-voting feature. State lives on a global
 * so it survives Turbopack/HMR module reloads during `next dev`. This is a
 * development mock only — it is not persisted and not multi-process safe.
 */

interface StoredParticipant {
  token: string;
  name: string;
  isOwner: boolean;
  votedStoreUuid: string | null;
}

interface StoredGroupSession {
  inviteCode: string;
  status: "voting" | "finished";
  ownerToken: string;
  createdAt: string;
  stores: GroupSessionStoreOption[];
  participants: StoredParticipant[];
  winningStoreUuid: string | null;
}

const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 6;

function getStore(): Map<string, StoredGroupSession> {
  const globalRef = globalThis as typeof globalThis & {
    __mockGroupSessions__?: Map<string, StoredGroupSession>;
  };

  if (!globalRef.__mockGroupSessions__) {
    globalRef.__mockGroupSessions__ = new Map<string, StoredGroupSession>();
  }

  return globalRef.__mockGroupSessions__;
}

function normalizeInviteCode(inviteCode: string): string {
  return inviteCode.trim().toUpperCase();
}

function createInviteCode(store: Map<string, StoredGroupSession>): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let code = "";

    for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
      code += INVITE_CODE_ALPHABET.charAt(
        Math.floor(Math.random() * INVITE_CODE_ALPHABET.length),
      );
    }

    if (!store.has(code)) {
      return code;
    }
  }

  throw new Error("Could not allocate a unique invite code.");
}

function normalizeStores(
  stores: GroupSessionStoreOption[] | undefined,
): GroupSessionStoreOption[] {
  if (!Array.isArray(stores) || stores.length === 0) {
    throw new Error("At least one store is required to start voting.");
  }

  const seen = new Set<string>();
  const normalized: GroupSessionStoreOption[] = [];

  for (const store of stores) {
    const storeUuid = store?.storeUuid?.trim();

    if (!storeUuid) {
      throw new Error("Every store option needs a storeUuid.");
    }

    if (seen.has(storeUuid)) {
      continue;
    }

    seen.add(storeUuid);
    normalized.push({
      storeUuid,
      name: store.name?.trim() || undefined,
      imageUrl: store.imageUrl?.trim() || undefined,
    });
  }

  return normalized;
}

function requireSession(inviteCode: string): StoredGroupSession {
  const session = getStore().get(normalizeInviteCode(inviteCode));

  if (!session) {
    throw new Error("Voting session not found.");
  }

  return session;
}

function toView(session: StoredGroupSession): GroupSessionView {
  const tally = session.stores.map((store) => ({
    storeUuid: store.storeUuid,
    votes: session.participants.filter(
      (participant) => participant.votedStoreUuid === store.storeUuid,
    ).length,
  }));

  const totalVotes = tally.reduce((sum, entry) => sum + entry.votes, 0);

  return {
    inviteCode: session.inviteCode,
    status: session.status,
    createdAt: session.createdAt,
    stores: session.stores,
    participants: session.participants.map((participant) => ({
      name: participant.name,
      isOwner: participant.isOwner,
      hasVoted: participant.votedStoreUuid !== null,
    })),
    tally,
    totalVotes,
    winningStoreUuid: session.winningStoreUuid,
  };
}

export function createMockGroupSession(
  body: CreateGroupSessionRequest,
): CreateGroupSessionResponse {
  const ownerName = body?.ownerName?.trim();

  if (!ownerName) {
    throw new Error("An owner name is required to start voting.");
  }

  const stores = normalizeStores(body?.stores);
  const store = getStore();
  const inviteCode = createInviteCode(store);
  const ownerToken = randomUUID();

  const session: StoredGroupSession = {
    inviteCode,
    status: "voting",
    ownerToken,
    createdAt: new Date().toISOString(),
    stores,
    participants: [
      {
        token: ownerToken,
        name: ownerName,
        isOwner: true,
        votedStoreUuid: null,
      },
    ],
    winningStoreUuid: null,
  };

  store.set(inviteCode, session);

  return {
    session: toView(session),
    inviteCode,
    ownerToken,
    participantToken: ownerToken,
  };
}

export function getMockGroupSession(
  inviteCode: string,
): GroupSessionView | null {
  const session = getStore().get(normalizeInviteCode(inviteCode));

  return session ? toView(session) : null;
}

export function joinMockGroupSession(
  inviteCode: string,
  name: string,
): JoinGroupSessionResponse {
  const session = requireSession(inviteCode);

  if (session.status === "finished") {
    throw new Error("This voting session has already finished.");
  }

  const participantName = name?.trim();

  if (!participantName) {
    throw new Error("A name is required to join the voting session.");
  }

  const participantToken = randomUUID();

  session.participants.push({
    token: participantToken,
    name: participantName,
    isOwner: false,
    votedStoreUuid: null,
  });

  return {
    session: toView(session),
    participantToken,
  };
}

export function submitMockGroupVote(
  inviteCode: string,
  participantToken: string,
  storeUuid: string,
): GroupSessionView {
  const session = requireSession(inviteCode);

  if (session.status === "finished") {
    throw new Error("This voting session has already finished.");
  }

  const participant = session.participants.find(
    (entry) => entry.token === participantToken,
  );

  if (!participant) {
    throw new Error("You have not joined this voting session.");
  }

  const isKnownStore = session.stores.some(
    (store) => store.storeUuid === storeUuid,
  );

  if (!isKnownStore) {
    throw new Error("That option is not part of this voting session.");
  }

  participant.votedStoreUuid = storeUuid;

  return toView(session);
}

export function finishMockGroupVoting(
  inviteCode: string,
  ownerToken: string,
): GroupSessionView {
  const session = requireSession(inviteCode);

  if (session.ownerToken !== ownerToken) {
    throw new Error("Only the session owner can finish voting.");
  }

  const tally = session.stores.map((store) => ({
    storeUuid: store.storeUuid,
    votes: session.participants.filter(
      (participant) => participant.votedStoreUuid === store.storeUuid,
    ).length,
  }));

  const topVotes = tally.reduce((max, entry) => Math.max(max, entry.votes), 0);
  const winners = tally.filter((entry) => entry.votes === topVotes);

  session.status = "finished";
  // A single clear winner locks in; a tie (or no votes) leaves it unresolved.
  session.winningStoreUuid =
    topVotes > 0 && winners.length === 1 ? winners[0].storeUuid : null;

  return toView(session);
}
