import { createHmac, randomBytes } from "crypto";

function env(name: string) {
  return (process.env[name] || "").trim();
}

export function iyzicoConfigured() {
  return Boolean(env("IYZICO_API_KEY") && env("IYZICO_SECRET_KEY"));
}

export function iyzicoBaseUrl() {
  return (env("IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");
}

export function appPublicUrl() {
  return (env("APP_URL") || env("NEXT_PUBLIC_APP_URL") || "http://localhost:3000").replace(/\/$/, "");
}

function authorizationHeader(uriPath: string, body: string) {
  const apiKey = env("IYZICO_API_KEY");
  const secretKey = env("IYZICO_SECRET_KEY");
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const payload = `${randomKey}${uriPath}${body}`;
  const signature = createHmac("sha256", secretKey).update(payload).digest("hex");
  const authorizationString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  const encoded = Buffer.from(authorizationString, "utf8").toString("base64");
  return {
    Authorization: `IYZWSv2 ${encoded}`,
    "x-iyzi-rnd": randomKey,
    "Content-Type": "application/json",
  };
}

async function iyzicoRequest<T>(uriPath: string, data: Record<string, unknown>) {
  const body = JSON.stringify(data);
  const response = await fetch(`${iyzicoBaseUrl()}${uriPath}`, {
    method: "POST",
    headers: authorizationHeader(uriPath, body),
    body,
  });
  const json = (await response.json().catch(() => null)) as T & {
    status?: string;
    errorMessage?: string;
    errorCode?: string;
  };
  if (!json) {
    throw new Error("iyzico yanıtı okunamadı.");
  }
  return json;
}

export type CheckoutInitResult = {
  status?: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  conversationId?: string;
};

export type CheckoutRetrieveResult = {
  status?: string;
  errorMessage?: string;
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
  paidPrice?: string | number;
  basketId?: string;
  fraudStatus?: number;
  token?: string;
};

export function formatIyzicoPrice(amountTl: number) {
  return amountTl.toFixed(2);
}

export async function initializeCheckoutForm(input: {
  conversationId: string;
  basketId: string;
  price: number;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    identityNumber?: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItem: {
    id: string;
    name: string;
    category1: string;
  };
}) {
  const price = formatIyzicoPrice(input.price);
  const uriPath = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
  return iyzicoRequest<CheckoutInitResult>(uriPath, {
    locale: "tr",
    conversationId: input.conversationId,
    price,
    paidPrice: price,
    currency: "TRY",
    basketId: input.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: input.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: input.buyer.id,
      name: input.buyer.name,
      surname: input.buyer.surname,
      gsmNumber: input.buyer.gsmNumber,
      email: input.buyer.email,
      identityNumber: input.buyer.identityNumber || "11111111111",
      registrationAddress: input.buyer.registrationAddress,
      ip: input.buyer.ip,
      city: input.buyer.city,
      country: input.buyer.country,
    },
    billingAddress: {
      contactName: input.billingAddress.contactName,
      city: input.billingAddress.city,
      country: input.billingAddress.country,
      address: input.billingAddress.address,
    },
    basketItems: [
      {
        id: input.basketItem.id,
        name: input.basketItem.name,
        category1: input.basketItem.category1,
        itemType: "VIRTUAL",
        price,
      },
    ],
  });
}

export async function retrieveCheckoutForm(token: string, conversationId?: string) {
  const uriPath = "/payment/iyzipos/checkoutform/auth/ecom/detail";
  return iyzicoRequest<CheckoutRetrieveResult>(uriPath, {
    locale: "tr",
    token,
    ...(conversationId ? { conversationId } : {}),
  });
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: "Ogrenci", surname: "Amfi" };
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts[0], surname: parts.slice(1).join(" ") };
}

export function normalizeGsm(phone: string | null | undefined) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("90")) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return "+905555555555";
}
