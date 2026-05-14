import { prisma } from "@/lib/prisma";

export async function assignSalesGroup(
  customerId: number
) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    return null;
  }

  const condition =
    await prisma.assignmentRuleCondition.findFirst({
      where: {
        fieldName: "country",
        expectedValue: customer.country,
        isEnabled: true,
        isActive: true,
      },
      include: {
        assignmentRule: {
          include: {
            salesGroup: true,
          },
        },
      },
    });

  if (!condition) {
    return null;
  }

  return condition.assignmentRule.salesGroup;
}

export async function assignUser(
  salesGroupId: number
) {
  const member =
    await prisma.salesGroupMember.findFirst({
      where: {
        salesGroupId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

  if (!member) {
    return null;
  }

  return member.user;
}