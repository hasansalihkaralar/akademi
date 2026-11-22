import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appPublicUrl, retrieveCheckoutForm } from "@/lib/iyzico";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function redirectBase(request: Request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return appPublicUrl();
  }
}

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

function redirectWithSession(
  request: Request,
  path: string,
  session?: { userId: string; role: string } | null,
) {
  const url = new URL(path, redirectBase(request));
  const response = NextResponse.redirect(url, 303);
  if (session) {
    response.cookies.set(SESSION_COOKIE, signSession(session.userId, session.role), sessionCookieOptions);
  }
  return response;
}

async function sessionForPayment(studentId: string | null) {
  if (!studentId) return null;
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { user: { select: { id: true, role: true } } },
  });
  if (!profile?.user) return null;
  return { userId: profile.user.id, role: profile.user.role };
}

async function finalize(request: Request, token: string) {
  if (!token) {
    return redirectWithSession(request, "/odeme/basarisiz");
  }

  const result = await retrieveCheckoutForm(token);
  const payment =
    (result.conversationId
      ? await prisma.payment.findUnique({ where: { id: result.conversationId } })
      : null) ||
    (await prisma.payment.findFirst({ where: { iyzicoToken: token } }));

  if (!payment) {
    console.error("[iyzico/callback] payment not found", { token, conversationId: result.conversationId });
    return redirectWithSession(request, "/odeme/basarisiz");
  }

  const session = await sessionForPayment(payment.studentId);

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

    const success = `/odeme/basarili?paket=${encodeURIComponent(payment.packageId)}&ad=${encodeURIComponent(payment.studentName)}&yontem=kart`;
    return redirectWithSession(request, success, session);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "basarisiz",
      iyzicoToken: token,
      iyzicoPaymentId: result.paymentId || payment.iyzicoPaymentId,
    },
  });
  return redirectWithSession(request, "/odeme/basarisiz", session);
}

export async function GET(request: Request) {
  try {
    const token = await readToken(request);
    return await finalize(request, token);
  } catch (error) {
    console.error("[iyzico/callback] GET", error);
    return redirectWithSession(request, "/odeme/basarisiz");
  }
}

export async function POST(request: Request) {
  try {
    const token = await readToken(request);
    return await finalize(request, token);
  } catch (error) {
    console.error("[iyzico/callback] POST", error);
    return redirectWithSession(request, "/odeme/basarisiz");
  }
}
