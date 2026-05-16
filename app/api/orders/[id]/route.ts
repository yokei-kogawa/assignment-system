import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        customer: true,
        assignedSalesGroup: true,
        createdBy: true,
        assignments: true,
        histories: true,
        assignmentHistories: true
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

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
      status,
      changedById,
    } = body;

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedOrder =
            await tx.order.update({
              where: {
                id: Number(id),
              },
              data: {
                status,
                updatedAt: new Date(),
              },
            });

          await tx.orderHistory.create({
            data: {
              orderId: updatedOrder.id,
              actionType:
                "status_updated",
              changedById,
              beforeData: {
                status:
                  existingOrder.status,
              },
              afterData: {
                status:
                  updatedOrder.status,
              },
              createdAt: new Date(),
            },
          });

          return updatedOrder;
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
          "Failed to update order",
      },
      {
        status: 500,
      }
    );
  }
}