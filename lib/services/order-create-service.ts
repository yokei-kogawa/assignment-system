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

console.log(
  "returning order:",
  result
);
    
    return result;


}