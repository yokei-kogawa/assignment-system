import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      status,
      orderTitle,
      notes,
    } = body;

    const order = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        orderTitle,
        notes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}