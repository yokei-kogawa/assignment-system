import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
await prisma.user.upsert({
where: {
email: "[tanaka@example.com](mailto:tanaka@example.com)",
},
update: {},
create: {
employeeCode: "U001",
name: "Tanaka",
email: "[tanaka@example.com](mailto:tanaka@example.com)",
role: "admin",
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

