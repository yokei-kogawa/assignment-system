import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      orderId,
      title,
      createdById,
    } = body;

    const discussion =
      await prisma.discussion.create({
        data: {
          orderId,
          title,
          createdById,
          createdAt: new Date(),
        },
      });

    return NextResponse.json(
      discussion,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create discussion",
      },
      {
        status: 500,
      }
    );
  }
}
