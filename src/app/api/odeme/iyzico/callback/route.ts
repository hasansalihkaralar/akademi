import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appPublicUrl, retrieveCheckoutForm } from "@/lib/iyzico";

export const dynamic = "force-dynamic";

async function readToken(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("token")?.trim();
  if (fromQuery) return fromQuery;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    return body?.token?.trim() || "";
  }

  const form = await request.formData().catch(() => null);
  if (!form) return "";
  return String(form.get("token") || "").trim();
}

async function finalize(token: string) {
  const app = appPublicUrl();
  if (!token) {
    return NextResponse.redirect(`${app}/odeme/basarisiz`);
  }

  const result = await retrieveCheckoutForm(token);
  const payment =
    (result.conversationId
      ? await prisma.payment.findUnique({ where: { id: result.conversationId } })
      : null) ||
    (await prisma.payment.findFirst({ where: { iyzicoToken: token } }));

  if (!payment) {
    console.error("[iyzico/callback] payment not found", { token, conversationId: result.conversationId });
    return NextResponse.redirect(`${app}/odeme/basarisiz`);
  }

  const paid =
    result.status === "success" &&
    String(result.paymentStatus || "").toUpperCase() === "SUCCESS" &&
    result.fraudStatus !== -1;

  if (paid) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "odendi",
          iyzicoToken: token,
          iyzicoPaymentId: result.paymentId || payment.iyzicoPaymentId,
        },
      });
      if (payment.studentId) {
        await tx.studentProfile.update({
          where: { id: payment.studentId },
          data: {
            packageId: payment.packageId,
            packageStartedAt: new Date(),
            grade: payment.grade || undefined,
          },
        });
      }
    });

    const success = new URL(`${app}/odeme/basarili`);
    success.searchParams.set("paket", payment.packageId);
    success.searchParams.set("ad", payment.studentName);
    success.searchParams.set("yontem", "kart");
    return NextResponse.redirect(success);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "basarisiz",
      iyzicoToken: token,
      iyzicoPaymentId: result.paymentId || payment.iyzicoPaymentId,
    },
  });
  return NextResponse.redirect(`${app}/odeme/basarisiz`);
}

export async function GET(request: Request) {
  try {
    const token = await readToken(request);
    return await finalize(token);
  } catch (error) {
    console.error("[iyzico/callback] GET", error);
    return NextResponse.redirect(`${appPublicUrl()}/odeme/basarisiz`);
  }
}

export async function POST(request: Request) {
  try {
    const token = await readToken(request);
    return await finalize(token);
  } catch (error) {
    console.error("[iyzico/callback] POST", error);
    return NextResponse.redirect(`${appPublicUrl()}/odeme/basarisiz`);
  }
}
