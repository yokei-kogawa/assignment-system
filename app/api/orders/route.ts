import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        createdById,
        orderTitle,
        notes,
        status: "pending_assignment",
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