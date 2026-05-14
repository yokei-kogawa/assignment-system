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

  const rules =
    await prisma.assignmentRule.findMany({
      where: {
        isActive: true,
      },
      include: {
        salesGroup: true,
        conditions: {
          where: {
            isEnabled: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        priority: "asc",
      },
    });

  for (const rule of rules) {
    const matched = rule.conditions.every(
    // TODO:
    // 現在は field ごとにハードコード。
    // 将来的に動的判定へ置き換え予定。
      (condition) => {
        if (
          condition.fieldName === "country"
        ) {
          return (
            customer.country ===
            condition.expectedValue
          );
        }

        if (
          condition.fieldName ===
          "customerCode"
        ) {
          return (
            customer.customerCode ===
            condition.expectedValue
          );
        }

        return false;
      }
    );

    if (matched) {
      return rule.salesGroup;
    }
  }

  return null;
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