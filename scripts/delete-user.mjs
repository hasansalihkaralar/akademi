import { PrismaClient } from "@prisma/client";

const email = (process.argv[2] || "").toLowerCase().trim();
if (!email) {
  console.error("Kullanım: node scripts/delete-user.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, role: true, name: true },
});

if (!user) {
  console.log("Kullanıcı yok:", email);
  await prisma.$disconnect();
  process.exit(0);
}

await prisma.user.delete({ where: { id: user.id } });
console.log("Silindi:", user);
await prisma.$disconnect();
