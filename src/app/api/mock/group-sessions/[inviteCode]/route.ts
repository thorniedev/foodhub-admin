import { NextResponse } from "next/server";

import {
  finishMockGroupVoting,
  getMockGroupSession,
  joinMockGroupSession,
  submitMockGroupVote,
} from "@/src/lib/mock-group-session-store";

export const dynamic = "force-dynamic";

const mockGroupSessionsEnabled = process.env.NODE_ENV !== "production";

interface RouteContext {
  params: Promise<{
    inviteCode: string;
  }>;
}

type SessionActionRequest =
  | {
      action: "join";
      name: string;
    }
  | {
      action: "vote";
      participantToken: string;
      storeUuid: string;
    }
  | {
      action: "finish";
      ownerToken: string;
    };

function disabledMockResponse(): NextResponse {
  return NextResponse.json(
    {
      message: "Mock group sessions are disabled in production mode.",
    },
    {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  if (!mockGroupSessionsEnabled) {
    return disabledMockResponse();
  }

  const { inviteCode } = await context.params;
  const session = getMockGroupSession(inviteCode);

  if (!session) {
    return NextResponse.json(
      {
        message: "Voting session not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(session, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  if (!mockGroupSessionsEnabled) {
    return disabledMockResponse();
  }

  try {
    const { inviteCode } = await context.params;
    const body = (await request.json()) as SessionActionRequest;

    switch (body.action) {
      case "join": {
        const result = joinMockGroupSession(inviteCode, body.name);

        return NextResponse.json(result);
      }

      case "vote": {
        const session = submitMockGroupVote(
          inviteCode,
          body.participantToken,
          body.storeUuid,
        );

        return NextResponse.json(session);
      }

      case "finish": {
        const session = finishMockGroupVoting(inviteCode, body.ownerToken);

        return NextResponse.json(session);
      }

      default: {
        return NextResponse.json(
          {
            message: "Unsupported session action.",
          },
          {
            status: 400,
          },
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "The voting action failed.",
      },
      {
        status: 400,
      },
    );
  }
}
