import { prisma } from "@/lib/prisma";

type UpdateOrderStatusInput = {
  orderId: number;
  status:
    | "pending_assignment"
    | "assigned"
    | "in_progress"
    | "completed";
  changedById: number;
};

export async function updateOrderStatus(
  input: UpdateOrderStatusInput
) {
  const {
    orderId,
    status,
    changedById,
  } = input;

  const currentOrder =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!currentOrder) {
    throw new Error(
      "Order not found"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const updatedOrder =
          await tx.order.update({
            where: {
              id: orderId,
            },
            data: {
              status,
              updatedAt:
                new Date(),
            },
          });

        await tx.orderHistory.create({
          data: {
            orderId,
            actionType:
              "status_updated",
            changedById,
            beforeData: {
              status:
                currentOrder.status,
            },
            afterData: {
              status,
            },
            createdAt:
              new Date(),
          },
        });

        return updatedOrder;
      }
    );

  return result;

}