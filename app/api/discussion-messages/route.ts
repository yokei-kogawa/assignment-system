import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      discussionId,
      userId,
      message,
    } = body;

    const discussionMessage =
      await prisma.discussionMessage.create({
        data: {
          discussionId,
          userId,
          message,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

    return NextResponse.json(
      discussionMessage,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create discussion message",
      },
      {
        status: 500,
      }
    );
  }
}