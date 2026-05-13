import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignSalesGroup } from "@/lib/assignment";

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

    const order = await prisma.order.create({
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}