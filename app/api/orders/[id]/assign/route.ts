import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      newUserId,
      changedById,
    } = body;

    const currentAssignment =
      await prisma.orderAssignment.findFirst({
        where: {
          orderId: Number(id),
          isActive: true,
        },
      });

    if (!currentAssignment) {
      return NextResponse.json(
        {
          error:
            "Active assignment not found",
        },
        {
          status: 404,
        }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          await tx.orderAssignment.update({
            where: {
              id: currentAssignment.id,
            },
            data: {
              isActive: false,
            },
          });

          const newAssignment =
            await tx.orderAssignment.create({
              data: {
                orderId: Number(id),
                userId: newUserId,
                assignmentType: "primary",
                assignedById: changedById,
                assignedAt: new Date(),
                isActive: true,
              },
            });

          await tx.assignmentHistory.create({
            data: {
              orderId: Number(id),
              previousUserId:
                currentAssignment.userId,
              newUserId,
              changeType:
                "manual_reassigned",
              changedById,
              createdAt: new Date(),
            },
          });

          return newAssignment;
        }
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to reassign order",
      },
      {
        status: 500,
      }
    );
  }
}