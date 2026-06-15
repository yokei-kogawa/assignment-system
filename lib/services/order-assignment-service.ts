import { prisma } from "@/lib/prisma";

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