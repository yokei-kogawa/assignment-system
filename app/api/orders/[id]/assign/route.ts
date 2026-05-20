import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  reassignOrderSchema,
} from "@/lib/validations/order";
import {
  reassignOrder,
} from "@/lib/services/order-service";


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
      reassignOrderSchema.safeParse(
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
      newUserId,
      changedById,
    } = parsed.data;

    const result =
      await reassignOrder({
        orderId: Number(id),
        newUserId,
        changedById,
      });

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