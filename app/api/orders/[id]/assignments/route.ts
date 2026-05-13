import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      userId,
      assignmentType,
      assignedById,
    } = body;

    const assignment = await prisma.orderAssignment.create({
      data: {
        orderId: Number(id),
        userId,
        assignmentType,
        assignedById,
        assignedAt: new Date(),
        isActive: true,
      },
    });

    await prisma.assignmentHistory.create({
      data: {
        orderId: Number(id),
        previousUserId: null,
        newUserId: userId,
        changeType: "assigned",
        changedById: assignedById,
        createdAt: new Date(),
      },
    });

    await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "assigned",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(assignment, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}