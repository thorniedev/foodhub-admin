/**
 * Types for the mock "group recommendation" voting feature.
 *
 * A session owner proposes a short list of stores, participants join with an
 * invite code, everyone votes for one store, and the owner finishes voting to
 * lock in the winner. This is a mock (in-memory) implementation used for local
 * development only.
 */

export interface GroupSessionStoreOption {
  storeUuid: string;
  name?: string;
  imageUrl?: string;
}

export interface CreateGroupSessionRequest {
  ownerName: string;
  stores: GroupSessionStoreOption[];
}

export type GroupSessionStatus = "voting" | "finished";

export interface GroupSessionParticipantView {
  name: string;
  isOwner: boolean;
  hasVoted: boolean;
}

export interface GroupSessionVoteTally {
  storeUuid: string;
  votes: number;
}

/**
 * The public shape of a session returned to clients. Secret handles
 * (owner/participant tokens) are never included here.
 */
export interface GroupSessionView {
  inviteCode: string;
  status: GroupSessionStatus;
  createdAt: string;
  stores: GroupSessionStoreOption[];
  participants: GroupSessionParticipantView[];
  tally: GroupSessionVoteTally[];
  totalVotes: number;
  winningStoreUuid: string | null;
}

export interface CreateGroupSessionResponse {
  session: GroupSessionView;
  inviteCode: string;
  ownerToken: string;
  participantToken: string;
}

export interface JoinGroupSessionResponse {
  session: GroupSessionView;
  participantToken: string;
}
