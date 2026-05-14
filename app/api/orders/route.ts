import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  assignSalesGroup,
  assignUser,
} from "@/lib/assignment";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      orderNumber,
      customerId,
      createdById,
      orderTitle,
      notes,
    } = body;

    const salesGroup =
      await assignSalesGroup(customerId);

    const assignedUser = salesGroup
      ? await assignUser(salesGroup.id)
      : null;

    const result = await prisma.$transaction( async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          assignedSalesGroupId: salesGroup?.id,
          status: salesGroup
            ? "assigned"
            : "pending_assignment",
          orderTitle,
          notes,
          createdById,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await tx.orderHistory.create({
        data: {
            orderId: order.id,
            actionType: "created",
            changedById: createdById,
            beforeData: Prisma.JsonNull,
            afterData: {
            orderNumber,
            customerId,
            assignedSalesGroupId:
                salesGroup?.id ?? null,
            status: salesGroup
                ? "assigned"
                : "pending_assignment",
            orderTitle,
            notes,
            },
            createdAt: new Date(),
        },
      });

      if (assignedUser) {
        await tx.orderAssignment.create({
          data: {
            orderId: order.id,
            userId: assignedUser.id,
            assignmentType: "primary",
            assignedById: createdById,
            assignedAt: new Date(),
            isActive: true,
          },
        });

        await tx.assignmentHistory.create({
          data: {
            orderId: order.id,
            previousUserId: null,
            newUserId: assignedUser.id,
            changeType: "auto_assigned",
            changedById: createdById,
            createdAt: new Date(),
          },
        });
        }

      return order;
    }
  );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}