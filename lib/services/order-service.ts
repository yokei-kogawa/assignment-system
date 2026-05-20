import { prisma } from "@/lib/prisma";
import {
  assignSalesGroup,
  assignUser,
} from "@/lib/assignment";

import { Prisma } from "@prisma/client";

type CreateOrderInput = {
  orderNumber: string;
  customerId: number;
  createdById: number;
  orderTitle: string;
  notes: string;
};

export async function createOrder(
  input: CreateOrderInput
) {
    console.log("createOrder called");
    const {
    orderNumber,
    customerId,
    createdById,
    orderTitle,
    notes,
    } = input;

    const salesGroup =
    await assignSalesGroup(customerId);

    const assignedUser = salesGroup
    ? await assignUser(salesGroup.id)
    : null;

    const result =
    await prisma.$transaction(
        async (tx) => {
        const order =
            await tx.order.create({
            data: {
                orderNumber,
                customerId,
                assignedSalesGroupId:
                salesGroup?.id,
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

        if (assignedUser) {
            await tx.orderAssignment.create({
            data: {
                orderId: order.id,
                userId: assignedUser.id,
                assignmentType:
                "primary",
                assignedById:
                createdById,
                assignedAt:
                new Date(),
                isActive: true,
            },
            });

            await tx.assignmentHistory.create({
            data: {
                orderId: order.id,
                previousUserId: null,
                newUserId:
                assignedUser.id,
                changeType:
                "auto_assigned",
                changedById:
                createdById,
                createdAt:
                new Date(),
            },
            });
        }

        await tx.orderHistory.create({
            data: {
            orderId: order.id,
            actionType: "created",
            changedById:
                createdById,
            beforeData:
                Prisma.JsonNull,
            afterData: {
                orderNumber,
                customerId,
                assignedSalesGroupId:
                salesGroup?.id ??
                null,
                status: salesGroup
                ? "assigned"
                : "pending_assignment",
                orderTitle,
                notes,
            },
            createdAt:
                new Date(),
            },
        });

        return order;
        }
    );

    return result;

}

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

type ReassignOrderInput = {
  orderId: number;
  newUserId: number;
  changedById: number;
};

export async function reassignOrder(
  input: ReassignOrderInput
) {
  const {
    orderId,
    newUserId,
    changedById,
  } = input;

  const currentAssignment =
    await prisma.orderAssignment.findFirst({
      where: {
        orderId,
        isActive: true,
      },
    });

  if (!currentAssignment) {
    throw new Error(
      "Active assignment not found"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        await tx.orderAssignment.update({
          where: {
            id:
              currentAssignment.id,
          },
          data: {
            isActive: false,
          },
        });

        const newAssignment =
          await tx.orderAssignment.create({
            data: {
              orderId,
              userId: newUserId,
              assignmentType:
                "primary",
              assignedById:
                changedById,
              assignedAt:
                new Date(),
              isActive: true,
            },
          });

        await tx.assignmentHistory.create({
          data: {
            orderId,
            previousUserId:
              currentAssignment.userId,
            newUserId,
            changeType:
              "manual_reassigned",
            changedById,
            createdAt:
              new Date(),
          },
        });

        return newAssignment;
      }
    );

  return result;
}