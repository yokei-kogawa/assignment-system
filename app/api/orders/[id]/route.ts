import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  updateOrderStatusSchema
} from "@/lib/validations/order";
import {
  updateOrderStatus,
} from "@/lib/services/order-status-service";

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

    const parsed =
      updateOrderStatusSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      status,
      changedById,
    } = body;

    const result =
        await updateOrderStatus({
            orderId: Number(id),
            status,
            changedById,
        });

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(error);

    if (
        error instanceof Error &&
        error.message ===
        "Order not found"
    ) {
        return NextResponse.json(
        {
            error: "Order not found",
        },
        {
            status: 404,
        }
        );
    }

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