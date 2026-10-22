import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";

const tones = [
  "from-primary to-primary-container",
  "from-secondary to-secondary-container",
  "from-primary-container to-primary",
  "from-on-surface to-primary",
];

export type PublicAdvisor = {
  id: string;
  name: string;
  title: string;
  initials: string;
  tone: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");
}

export async function listPublicAdvisors() {
  noStore();
  const advisors = await prisma.user.findMany({
    where: { role: "danisman" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, title: true },
  });
  return advisors.map((advisor, index) => ({
    id: advisor.id,
    name: advisor.name,
    title: advisor.title?.trim() || "Danışman",
    initials: initials(advisor.name) || "A",
    tone: tones[index % tones.length],
  }));
}
