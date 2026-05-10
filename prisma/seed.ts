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