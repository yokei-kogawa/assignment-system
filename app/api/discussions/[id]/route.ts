import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const discussion =
      await prisma.discussion.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          order: true,
          createdBy: true,
          messages: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!discussion) {
      return NextResponse.json(
        {
          error:
            "Discussion not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      discussion
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch discussion",
      },
      {
        status: 500,
      }
    );
  }
}