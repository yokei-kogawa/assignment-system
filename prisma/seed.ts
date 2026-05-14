import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: "tanaka@example.com",
    },
    update: {},
    create: {
      employeeCode: "U001",
      name: "Tanaka",
      email: "tanaka@example.com",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.customer.upsert({
    where: {
      customerCode: "C001",
    },
    update: {},
    create: {
      customerCode: "C001",
      companyName: "Sample Company",
      country: "Japan",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.salesGroup.upsert({
    where: {
      groupCode: "JP_SALES",
    },
    update: {},
    create: {
      groupCode: "JP_SALES",
      groupName: "Japan Sales",
      description: "Japan sales group",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

await prisma.assignmentRule.upsert({
  where: {
    id: 1,
  },
  update: {},
  create: {
    salesGroupId: 1,
    priority: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

await prisma.assignmentRuleCondition.upsert({
  where: {
    assignmentRuleId_fieldName: {
      assignmentRuleId: 1,
      fieldName: "country",
    },
  },
  update: {},
  create: {
    assignmentRuleId: 1,
    fieldName: "country",
    expectedValue: "Japan",
    priority: 1,
    isEnabled: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

await prisma.salesGroupMember.upsert({
  where: {
    salesGroupId_userId: {
      salesGroupId: 1,
      userId: 1,
    },
  },
  update: {},
  create: {
    salesGroupId: 1,
    userId: 1,
    role: "leader",
    isActive: true,
    createdAt: new Date(),
  },
});

await prisma.assignmentRuleCondition.upsert({
  where: {
    assignmentRuleId_fieldName: {
      assignmentRuleId: 1,
      fieldName: "customerCode",
    },
  },
  update: {},
  create: {
    assignmentRuleId: 1,
    fieldName: "customerCode",
    expectedValue: "C001",
    priority: 2,
    isEnabled: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });