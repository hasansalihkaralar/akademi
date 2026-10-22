import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { role: "admin", name: "Amfi Yönetim", title: "Yönetici" },
    create: {
      email: "admin@demo.com",
      passwordHash,
      name: "Amfi Yönetim",
      role: "admin",
      title: "Yönetici",
    },
  });

  const existing = await prisma.user.findUnique({ where: { email: "ogrenci@demo.com" } });
  if (existing) {
    console.log("Demo verisi zaten var. Yönetici: admin@demo.com / demo123");
    return;
  }

  const advisor = await prisma.user.create({
    data: {
      email: "danisman@demo.com",
      passwordHash,
      name: "Mert Yılmaz",
      role: "danisman",
      title: "YKS Sayısal Mentörü",
      phone: "08508400000",
    },
  });

  const parent = await prisma.user.create({
    data: {
      email: "veli@demo.com",
      passwordHash,
      name: "Ayşe Yılmaz",
      role: "veli",
      phone: "05550000001",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "ogrenci@demo.com",
      passwordHash,
      name: "Arda Yılmaz",
      role: "ogrenci",
      phone: "05550000002",
    },
  });

  const arda = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      advisorId: advisor.id,
      parentId: parent.id,
      grade: "12. Sınıf",
      program: "YKS Sayısal",
      risk: "düşük",
      lastNet: 92.5,
      tasks: {
        create: [
          { day: "Pzt", subject: "Matematik", title: "Türev problem seti (40 soru)", duration: "90 dk", done: true, sortOrder: 1 },
          { day: "Pzt", subject: "Fizik", title: "Elektrik konusu tekrar", duration: "60 dk", done: true, sortOrder: 2 },
          { day: "Sal", subject: "Kimya", title: "Organik tepkimeler", duration: "75 dk", done: false, sortOrder: 3 },
          { day: "Sal", subject: "TYT Türkçe", title: "Paragraf seti 3", duration: "45 dk", done: false, sortOrder: 4 },
          { day: "Çar", subject: "Matematik", title: "İntegral temel", duration: "90 dk", done: false, sortOrder: 5 },
          { day: "Per", subject: "Biyoloji", title: "Sistemler özeti", duration: "60 dk", done: false, sortOrder: 6 },
          { day: "Cum", subject: "Deneme", title: "TYT Genel Deneme #14", duration: "135 dk", done: false, sortOrder: 7 },
        ],
      },
      trials: {
        create: [
          { name: "TYT Genel #13", dateLabel: "28 Eyl", tyt: 92.5, ayt: 0, delta: "+4.25", sortOrder: 1 },
          { name: "AYT Sayısal #8", dateLabel: "21 Eyl", tyt: 0, ayt: 48.75, delta: "+2.5", sortOrder: 2 },
        ],
      },
      meetings: {
        create: [
          { title: "Haftalık birebir seans", dateLabel: "16 Eki", time: "19:00", type: "online", status: "upcoming", note: "AYT Mat türev analizi" },
          { title: "Deneme analizi check-in", dateLabel: "18 Eki", time: "21:00", type: "check-in", status: "upcoming", note: "TYT net kök neden" },
        ],
      },
    },
  });

  await prisma.sessionNote.create({
    data: {
      studentId: arda.id,
      authorId: advisor.id,
      body: "Türev seti bitti. Perşembe denemesinden önce yanlış köklerini karakutuya yüklesin.",
    },
  });

  const extras = [
    { name: "Elif Kara", email: "elif@demo.com", grade: "11. Sınıf", program: "YKS", risk: "orta", lastNet: 71 },
    { name: "Can Demir", email: "can@demo.com", grade: "Mezun", program: "YKS", risk: "yüksek", lastNet: 63.25 },
    { name: "Zeynep Aksoy", email: "zeynep@demo.com", grade: "8. Sınıf", program: "LGS", risk: "düşük", lastNet: 445 },
  ];

  for (const extra of extras) {
    const user = await prisma.user.create({
      data: { email: extra.email, passwordHash, name: extra.name, role: "ogrenci" },
    });
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        advisorId: advisor.id,
        grade: extra.grade,
        program: extra.program,
        risk: extra.risk,
        lastNet: extra.lastNet,
      },
    });
  }

  console.log("Demo kullanıcılar oluşturuldu. Şifre: demo123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
