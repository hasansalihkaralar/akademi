"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/content";

type Advisor = { id: string; name: string; title: string | null };
type Enrolled = {
  id: string;
  name: string;
  email: string;
  parentName: string | null;
  parentEmail: string | null;
};
type Payment = {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  grade: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string;
  student: Enrolled | null;
};

const grades = ["12. Sınıf", "Mezun", "11. Sınıf", "8. Sınıf", "7. Sınıf"];
const programs = ["YKS Sayısal", "YKS Eşit Ağırlık", "YKS Sözel / Dil", "LGS 8. Sınıf", "LGS 7. Sınıf"];
const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary";

function matchGrade(value: string) {
  return grades.find((item) => item.toLocaleLowerCase("tr") === value.toLocaleLowerCase("tr")) ?? "12. Sınıf";
}

function defaultProgram(packageId: string, grade: string) {
  if (packageId.startsWith("lgs")) return grade.startsWith("7") ? "LGS 7. Sınıf" : "LGS 8. Sınıf";
  return "YKS Sayısal";
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("12. Sınıf");
  const [program, setProgram] = useState("YKS Sayısal");
  const [advisorId, setAdvisorId] = useState("");
  const [withParent, setWithParent] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  useEffect(() => {
    fetch(`/api/panel/admin/odemeler/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          setError("Ödeme bulunamadı.");
          return;
        }
        const data = (await response.json()) as { payment: Payment; advisors: Advisor[] };
        setPayment(data.payment);
        setAdvisors(data.advisors);
        const nextGrade = matchGrade(data.payment.grade);
        setName(data.payment.studentName);
        setEmail(data.payment.email);
        setPhone(data.payment.phone);
        setGrade(nextGrade);
        setProgram(defaultProgram(data.payment.packageId, nextGrade));
        setParentName(data.payment.parentName);
      })
      .catch(() => setError("Ödeme yüklenemedi."));
  }, [params.id]);

  async function enroll(event: React.FormEvent) {
    event.preventDefault();
    if (!payment) return;
    setSaving(true);
    setError("");
    setNotice("");
    const response = await fetch(`/api/panel/admin/odemeler/${payment.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        grade,
        program,
        advisorId: advisorId || null,
        withParent,
        parentName,
        parentEmail,
        parentPassword,
      }),
    });
    const data = (await response.json().catch(() => null)) as (Enrolled & { parentReused?: boolean; error?: string }) | null;
    setSaving(false);
    if (!response.ok || !data?.id) {
      setError(data?.error || "Öğrenci hesabı açılamadı.");
      return;
    }
    setPayment({ ...payment, student: data });
    setNotice(
      data.parentEmail
        ? data.parentReused
          ? `${data.name} eklendi. Veli hesabı zaten vardı, bu öğrenciye bağlandı.`
          : `${data.name} ve veli hesabı eklendi. Veli, ${data.parentEmail} ile giriş yapar.`
        : `${data.name} eklendi. Veli hesabı açılmadı.`,
    );
  }

  if (!payment) {
    return (
      <div className="space-y-space-md">
        <Link href="/panel/admin/odemeler" className="text-body-sm font-semibold text-primary">
          Ödemelere dön
        </Link>
        {error ? <p className="text-body-sm text-error">{error}</p> : <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p>}
      </div>
    );
  }

  const paid = payment.status === "odendi";

  return (
    <div className="space-y-space-lg">
      <div>
        <Link href="/panel/admin/odemeler" className="text-body-sm font-semibold text-primary">
          Ödemelere dön
        </Link>
        <h2 className="mt-space-sm text-headline-sm text-on-surface">{payment.studentName}</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">{formatWhen(payment.createdAt)}</p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-space-sm">
          <h3 className="text-title-lg font-bold text-on-surface">Ödeme bilgisi</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-label-md font-semibold ${
              paid ? "bg-[#DCFCE7] text-[#15803D]" : "bg-error/10 text-error"
            }`}
          >
            {paid ? "Ödendi" : "Başarısız"}
          </span>
        </div>
        <dl className="mt-space-md grid gap-space-sm text-body-sm sm:grid-cols-2">
          <div>
            <dt className="text-on-surface-variant">Paket</dt>
            <dd className="font-semibold text-on-surface">
              {payment.packageName} · {formatPrice(payment.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Sınıf</dt>
            <dd className="font-semibold text-on-surface">{payment.grade}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Telefon</dt>
            <dd className="font-semibold text-on-surface">{payment.phone}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">E-posta</dt>
            <dd className="font-semibold text-on-surface">{payment.email}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Veli adı</dt>
            <dd className="font-semibold text-on-surface">{payment.parentName || "—"}</dd>
          </div>
        </dl>
      </section>
      {payment.student ? (
        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="text-title-lg font-bold text-on-surface">Açılan hesap</h3>
          <p className="mt-space-sm text-body-sm text-on-surface">
            {payment.student.name} · {payment.student.email}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {payment.student.parentEmail
              ? `Veli: ${payment.student.parentName} · ${payment.student.parentEmail}`
              : "Veli hesabı açılmadı."}
          </p>
        </section>
      ) : paid ? (
        <form onSubmit={enroll} className="grid gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:grid-cols-2">
          <h3 className="text-title-lg font-bold text-on-surface md:col-span-2">Öğrenci hesabı aç</h3>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ad soyad" className={field} />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta" className={field} />
          <input required minLength={4} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Giriş şifresi" className={field} />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefon" className={field} />
          <select value={grade} onChange={(event) => setGrade(event.target.value)} className={field} aria-label="Sınıf">
            {grades.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={program} onChange={(event) => setProgram(event.target.value)} className={field} aria-label="Program">
            {programs.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={advisorId} onChange={(event) => setAdvisorId(event.target.value)} className={`${field} md:col-span-2`} aria-label="Danışman">
            <option value="">Danışman sonra atanacak</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name}
                {advisor.title ? ` · ${advisor.title}` : ""}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-space-xs text-body-sm text-on-surface md:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={withParent}
              onChange={(event) => setWithParent(event.target.checked)}
            />
            Veli hesabı da açılsın
          </label>
          {withParent ? (
            <>
              <input required value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Veli adı soyadı" className={field} />
              <input required type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="Veli e-posta" className={field} />
              <input required minLength={4} value={parentPassword} onChange={(event) => setParentPassword(event.target.value)} placeholder="Veli giriş şifresi" className={field} />
            </>
          ) : null}
          <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
            {saving ? "Kaydediliyor…" : "Öğrenciyi kaydet"}
          </button>
        </form>
      ) : (
        <p className="text-body-sm text-on-surface-variant">Bu ödeme tamamlanmadığı için hesap buradan açılmaz.</p>
      )}
    </div>
  );
}
