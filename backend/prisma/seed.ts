import "dotenv/config";
import prisma from "../src/utils/prismaClient";
import bcrypt from "bcrypt";

async function main() {
  // Clear existing data in dependency order
  await prisma.machineSnapshot.deleteMany({});
  await prisma.machine.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.organization.deleteMany({});

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Test Institute",
      org_token: "test_token_123",
    },
  });

  // Hash password
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Admin linked to organization
  await prisma.admin.create({
    data: {
      org_id: org.id,
      email: "admin@test.com",
      password_hash: passwordHash,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
