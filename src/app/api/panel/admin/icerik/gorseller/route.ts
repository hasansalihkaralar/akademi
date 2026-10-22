import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const MAX_BYTES = 4 * 1024 * 1024;

function extensionOf(buffer: Buffer) {
  if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length > 6 && buffer.toString("ascii", 0, 6) === "GIF87a") return "gif";
  if (buffer.length > 6 && buffer.toString("ascii", 0, 6) === "GIF89a") return "gif";
  if (
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

function fileFor(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  const name = url.slice("/uploads/".length);
  if (!/^[\w.-]+$/.test(name)) return null;
  const root = path.join(process.cwd(), "public", "uploads");
  const file = path.resolve(root, name);
  if (!file.startsWith(root + path.sep)) return null;
  return file;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const images = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Görsel seç." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Görsel 4 MB'dan küçük olmalı." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = extensionOf(buffer);
  if (!extension) return NextResponse.json({ error: "PNG, JPG, WEBP veya GIF yükle." }, { status: 400 });

  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);

  const image = await prisma.mediaAsset.create({
    data: {
      url: `/uploads/${filename}`,
      filename: file.name.slice(0, 180) || filename,
      alt: String(form?.get("alt") || "").trim().slice(0, 160),
    },
  });
  return NextResponse.json(image);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Yönetici girişi gerekli." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 400 });

  const image = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Görsel bulunamadı." }, { status: 404 });
  const file = fileFor(image.url);
  if (file) await unlink(file).catch(() => undefined);
  await prisma.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
