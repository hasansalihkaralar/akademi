import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = (process.argv[2] || "admin@amfikocluk.com").toLowerCase().trim();
const password = process.argv[3] || "";
const name = process.argv[4] || "Amfi Yönetim";

if (!password || password.length < 8) {
  console.error("Kullanım: node scripts/create-admin.mjs <email> <sifre-en-az-8> [ad]");
  process.exit(1);
}

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash(password, 10);
const user = await prisma.user.upsert({
  where: { email },
  update: {
    passwordHash,
    name,
    role: "admin",
    title: "Yönetici",
    emailVerifiedAt: new Date(),
  },
  create: {
    email,
    passwordHash,
    name,
    role: "admin",
    title: "Yönetici",
    emailVerifiedAt: new Date(),
  },
  select: { id: true, email: true, name: true, role: true },
});

// Eski demo admin hesabını sil (varsa)
const removed = await prisma.user.deleteMany({ where: { email: "admin@demo.com" } });
if (removed.count) console.log("Silindi: admin@demo.com");

console.log("Admin hazır:", user);
await prisma.$disconnect();
