import nodemailer from "nodemailer";

function appUrl() {
  const raw = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();
  return raw.replace(/\/$/, "");
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP ayarları eksik. SMTP_HOST, SMTP_USER ve SMTP_PASS gerekli.");
  }
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function verificationUrl(token: string) {
  return `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = verificationUrl(token);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@amfikocluk.com";

  if (process.env.NODE_ENV !== "production") {
    console.info(`[mail] Doğrulama linki (${to}): ${url}`);
  }

  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP ayarları eksik; doğrulama maili gönderilemedi.");
    }
    return { previewOnly: true as const, url };
  }

  const transport = transporter();
  await transport.sendMail({
    from,
    to,
    subject: "Amfi Koçluk — e-posta doğrulama",
    text: `Merhaba,\n\nAmfi Koçluk hesabını doğrulamak için bu bağlantıya tıkla:\n${url}\n\nLink 24 saat geçerlidir. Bu maili sen istemediysen yok sayabilirsin.\n`,
    html: `
      <p>Merhaba,</p>
      <p>Amfi Koçluk hesabını doğrulamak için aşağıdaki bağlantıya tıkla:</p>
      <p><a href="${url}">E-postamı doğrula</a></p>
      <p style="color:#666;font-size:13px">Link 24 saat geçerlidir. Bu maili sen istemediysen yok sayabilirsin.</p>
    `,
  });

  return { previewOnly: false as const, url };
}
