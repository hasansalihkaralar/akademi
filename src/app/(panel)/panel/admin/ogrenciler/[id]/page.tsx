"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/lib/content";

type Advisor = { id: string; name: string; title: string | null };
type PackOption = { id: string; name: string; duration: string; program: string; price: number };

type Detail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  grade: string;
  program: string;
  risk: string;
  lastNet: number;
  packageId: string | null;
  packageStartedAt: string | null;
  advisor: { id: string; name: string; title: string | null; email: string } | null;
  parent: { name: string; email: string; phone: string | null } | null;
  quota: {
    packageName: string | null;
    used: number;
    total: number;
    remaining: number;
    weekUsed: boolean;
    weeklyLimit: number;
    cooldownUntilLabel?: string | null;
  };
  meetings: {
    id: string;
    title: string;
    dateLabel: string;
    time: string;
    status: string;
    note: string | null;
    meetUrl: string | null;
  }[];
  payments: {
    id: string;
    packageName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  trials: { id: string; name: string; dateLabel: string; tyt: number; ayt: number; delta: string }[];
};

const field =
  "h-11 rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<Detail | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [packOptions, setPackOptions] = useState<PackOption[]>([]);
  const [packageId, setPackageId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingPackage, setSavingPackage] = useState(false);
  const [savingAdvisor, setSavingAdvisor] = useState(false);

  useEffect(() => {
    fetch(`/api/panel/admin/ogrenciler/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          setError("Öğrenci detayı yüklenemedi.");
          return;
        }
        const data = (await response.json()) as {
          student: Detail;
          advisors: Advisor[];
          packages: PackOption[];
        };
        setStudent(data.student);
        setAdvisors(data.advisors);
        setPackOptions(data.packages);
        setPackageId(data.student.packageId || data.packages[0]?.id || "");
      })
      .catch(() => setError("Öğrenci detayı yüklenemedi."));
  }, [params.id]);

  async function savePackage(event: React.FormEvent) {
    event.preventDefault();
    if (!student || !packageId) return;
    setSavingPackage(true);
    setError("");
    setNotice("");
    const response = await fetch(`/api/panel/admin/ogrenciler/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const data = (await response.json().catch(() => null)) as
      | {
          packageId: string;
          packageName: string;
          packageStartedAt: string | null;
          quota: Detail["quota"];
          error?: string;
        }
      | null;
    setSavingPackage(false);
    if (!response.ok || !data?.packageId) {
      setError(data?.error || "Paket güncellenemedi.");
      return;
    }
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            packageId: data.packageId,
            packageStartedAt: data.packageStartedAt,
            quota: data.quota,
          }
        : prev,
    );
    setNotice("Paket güncellendi.");
  }

  async function assignAdvisor(nextAdvisorId: string) {
    if (!student) return;
    setSavingAdvisor(true);
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/admin/ogrenciler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student.id, advisorId: nextAdvisorId || null }),
    });
    const data = (await response.json().catch(() => null)) as
      | { advisorId: string | null; advisorName: string | null; error?: string }
      | null;
    setSavingAdvisor(false);
    if (!response.ok || !data || !("advisorId" in data)) {
      setError(data?.error || "Danışman güncellenemedi.");
      return;
    }
    const advisor = advisors.find((item) => item.id === data.advisorId) || null;
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            advisor: advisor
              ? { id: advisor.id, name: advisor.name, title: advisor.title, email: prev.advisor?.email || "" }
              : null,
          }
        : prev,
    );
    setNotice("Danışman güncellendi.");
  }

  return (
    <div className="space-y-space-lg">
      <Link href="/panel/admin/ogrenciler" className="inline-flex items-center gap-1 text-label-md font-semibold text-primary">
        <Icon name="arrow_back" className="text-[18px]" />
        Öğrencilere dön
      </Link>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      {!student && !error ? <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p> : null}

      {student ? (
        <>
          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="text-headline-sm text-on-surface">{student.name}</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {student.grade} · {student.program} · risk {student.risk} · son net {student.lastNet}
            </p>
            <dl className="mt-space-md grid gap-space-sm text-body-sm sm:grid-cols-2">
              <div>
                <dt className="text-on-surface-variant">E-posta</dt>
                <dd className="font-semibold text-on-surface">{student.email}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Telefon</dt>
                <dd className="font-semibold text-on-surface">{student.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Veli</dt>
                <dd className="font-semibold text-on-surface">{student.parent?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Veli iletişim</dt>
                <dd className="font-semibold text-on-surface">
                  {student.parent
                    ? `${student.parent.email}${student.parent.phone ? ` · ${student.parent.phone}` : ""}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-space-md lg:grid-cols-2">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="text-title-lg font-bold text-on-surface">Paket / toplantı hakkı</h3>
              <p className="mt-space-sm text-body-sm text-on-surface">
                {student.quota.packageName ? (
                  <>
                    <span className="font-semibold">{student.quota.packageName}</span>
                    <span className="mx-1">·</span>
                    {student.quota.used}/{student.quota.total} kullanıldı
                    <span className="mx-1">·</span>
                    kalan {student.quota.remaining}
                    <span className="mx-1">·</span>
                    Meet sonrası 7 gün
                    <span className="mx-1">·</span>
                    {student.quota.cooldownUntilLabel
                      ? `en erken ${student.quota.cooldownUntilLabel}`
                      : "randevu müsait"}
                  </>
                ) : (
                  "Paket tanımlı değil."
                )}
              </p>
              <form className="mt-space-md flex flex-wrap items-end gap-space-sm" onSubmit={savePackage}>
                <label className="text-label-md font-semibold text-on-surface">
                  Paket
                  <select
                    className={`${field} mt-1 min-w-[220px]`}
                    value={packageId}
                    onChange={(event) => setPackageId(event.target.value)}
                  >
                    {packOptions.map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.program.toUpperCase()} · {pack.name} ({pack.duration})
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btn-primary" disabled={savingPackage}>
                  {savingPackage ? "Kaydediliyor…" : "Paketi kaydet"}
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="text-title-lg font-bold text-on-surface">Danışman</h3>
              <p className="mt-space-sm text-body-sm text-on-surface-variant">
                {student.advisor
                  ? `${student.advisor.name}${student.advisor.title ? ` · ${student.advisor.title}` : ""}`
                  : "Atanmadı"}
              </p>
              <label className="mt-space-md block text-label-md font-semibold text-on-surface">
                Danışman ata
                <select
                  className={`${field} mt-1 w-full`}
                  value={student.advisor?.id || ""}
                  disabled={savingAdvisor}
                  onChange={(event) => void assignAdvisor(event.target.value)}
                >
                  <option value="">Atanmadı</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name}
                      {advisor.title ? ` · ${advisor.title}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h3 className="text-title-lg font-bold text-on-surface">Görüşmeler</h3>
            <div className="mt-space-md space-y-space-sm">
              {student.meetings.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">Henüz görüşme yok.</p>
              ) : null}
              {student.meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm">
                  <p className="font-semibold text-on-surface">{meeting.title}</p>
                  <p className="text-on-surface-variant">
                    {meeting.status === "requested"
                      ? "Talep"
                      : `${meeting.dateLabel} · ${meeting.time}`}{" "}
                    · {meeting.status}
                  </p>
                  {meeting.note ? <p className="mt-1 text-on-surface">{meeting.note}</p> : null}
                  {meeting.meetUrl ? (
                    <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-primary">
                      Meet linki
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-space-md lg:grid-cols-2">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="text-title-lg font-bold text-on-surface">Ödemeler</h3>
              <div className="mt-space-md space-y-space-sm">
                {student.payments.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">Bağlı ödeme yok.</p>
                ) : null}
                {student.payments.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/panel/admin/odemeler/${payment.id}`}
                    className="block rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm"
                  >
                    <p className="font-semibold text-on-surface">{payment.packageName}</p>
                    <p className="text-on-surface-variant">
                      {formatPrice(payment.amount)} · {payment.status} ·{" "}
                      {new Date(payment.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
              <h3 className="text-title-lg font-bold text-on-surface">Son denemeler</h3>
              <div className="mt-space-md space-y-space-sm">
                {student.trials.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">Deneme kaydı yok.</p>
                ) : null}
                {student.trials.map((trial) => (
                  <div key={trial.id} className="rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm">
                    <p className="font-semibold text-on-surface">{trial.name}</p>
                    <p className="text-on-surface-variant">
                      {trial.dateLabel} · TYT {trial.tyt} · AYT {trial.ayt} · {trial.delta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
