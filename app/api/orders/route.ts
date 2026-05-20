import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  assignSalesGroup,
  assignUser,
} from "@/lib/assignment";
import {
  createOrderSchema
} from "@/lib/validations/order";
import {
  createOrder,
} from "@/lib/services/order-service";

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

    const parsed =
    createOrderSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
            error: "Invalid input",
            details: parsed.error.flatten(),
            },
            {
            status: 400,
            }
        );
    }

    const result =
        await createOrder(parsed.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
        if (error.code === "P2002") {
        return NextResponse.json(
            {
            error:
                "orderNumber already exists",
            },
            {
            status: 409,
            }
        );
        }
    }

    return NextResponse.json(
        {
        error:
            "Failed to create order",
        },
        {
        status: 500,
        }
    );
    }
}