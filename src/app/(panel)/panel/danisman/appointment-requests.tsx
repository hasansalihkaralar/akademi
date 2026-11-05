"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type RequestItem = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  title: string;
  note: string | null;
  fromParent: boolean;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
};

export function AppointmentRequests() {
  const [items, setItems] = useState<RequestItem[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openId, setOpenId] = useState("");
  const [pending, setPending] = useState<{ id: string; action: "confirm" | "delete" } | null>(null);

  useEffect(() => {
    fetch("/api/panel/danisman/randevu-talepleri")
      .then(async (response) => {
        if (!response.ok) {
          setItems([]);
          setError("Randevu talepleri yüklenemedi.");
          return;
        }
        const data = (await response.json()) as { requests: RequestItem[] };
        setItems(data.requests);
      })
      .catch(() => {
        setItems([]);
        setError("Randevu talepleri yüklenemedi.");
      });
  }, []);

  async function confirm(item: RequestItem, form: HTMLFormElement) {
    const data = new FormData(form);
    const date = String(data.get("date") || "");
    const time = String(data.get("time") || "").slice(0, 5);
    const outcome = String(data.get("outcome") || "");
    const advisorNote = String(data.get("advisorNote") || "").trim();
    if (outcome !== "planlandi" && outcome !== "yapildi") return;
    if (outcome === "planlandi" && (!date || !time)) return;
    if (advisorNote.length < 2) return;

    setPending({ id: item.id, action: "confirm" });
    setError("");
    setNotice("");
    const response = await fetch(`/api/panel/danisman/ogrenciler/${item.studentId}/gorusmeler`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        outcome,
        advisorNote,
        ...(outcome === "planlandi" ? { date, time } : {}),
      }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(null);
    if (!response.ok) {
      setError(body?.error || "Talep güncellenemedi.");
      return;
    }
    setItems((prev) => (prev ? prev.filter((entry) => entry.id !== item.id) : prev));
    setOpenId("");
    setNotice(
      outcome === "yapildi" ? "Görüşme tamamlandı. Talep kapandı." : "Görüşme planlandı. Talep listeden çıktı.",
    );
  }

  async function remove(item: RequestItem) {
    if (!window.confirm(`${item.parentName || item.studentName} talebi silinsin mi?`)) return;
    setPending({ id: item.id, action: "delete" });
    setError("");
    setNotice("");
    const response = await fetch("/api/panel/danisman/randevu-talepleri", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(null);
    if (!response.ok) {
      setError(body?.error || "Talep silinemedi.");
      return;
    }
    setItems((prev) => (prev ? prev.filter((entry) => entry.id !== item.id) : prev));
    setOpenId("");
    setNotice("Talep silindi.");
  }

  return (
    <div className="space-y-space-lg">
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {notice ? <p className="text-body-sm text-primary">{notice}</p> : null}
      {items === null ? <p className="text-body-sm text-on-surface-variant">Yükleniyor…</p> : null}

      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-title-lg font-bold text-on-surface">Veli görüşme talepleri</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Öğrenciler randevuyu kendileri alır. Burada yalnızca veli talepleri görünür.
        </p>
        {items && items.length === 0 ? (
          <p className="mt-space-md text-body-sm text-on-surface-variant">Bekleyen veli talebi yok.</p>
        ) : null}
        <div className="mt-space-md space-y-space-sm">
          {(items || []).map((item) => {
            const open = openId === item.id;
            return (
              <article key={item.id} className="rounded-lg bg-surface-container-low p-space-md">
                <div className="flex flex-wrap items-start justify-between gap-space-sm">
                  <div>
                    <p className="font-semibold text-on-surface">{item.parentName || "Veli"}</p>
                    <p className="mt-1 text-body-sm text-on-surface">{item.note || item.title}</p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">Öğrenci: {item.studentName}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-surface-container-lowest px-space-md py-2 text-label-md font-semibold text-primary"
                    onClick={() => setOpenId(open ? "" : item.id)}
                  >
                    {open ? "Kapat" : "Detay"}
                  </button>
                </div>
                {open ? (
                  <div className="mt-space-md space-y-space-md border-t border-outline-variant/40 pt-space-md">
                    <dl className="grid gap-space-sm text-body-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-on-surface-variant">Öğrenci</dt>
                        <dd className="font-semibold text-on-surface">{item.studentName}</dd>
                      </div>
                      <div>
                        <dt className="text-on-surface-variant">Veli</dt>
                        <dd className="font-semibold text-on-surface">{item.parentName || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-on-surface-variant">Veli telefon</dt>
                        <dd className="font-semibold text-on-surface">{item.parentPhone || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-on-surface-variant">Veli e-posta</dt>
                        <dd className="font-semibold text-on-surface">{item.parentEmail || "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-on-surface-variant">Talep</dt>
                        <dd className="font-semibold text-on-surface">{item.note || item.title}</dd>
                      </div>
                    </dl>
                    <form
                      className="space-y-space-sm"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void confirm(item, event.currentTarget);
                      }}
                    >
                      <fieldset className="space-y-space-xs text-body-sm text-on-surface">
                        <legend className="text-label-md font-semibold">Sonuç</legend>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="outcome" value="planlandi" defaultChecked required />
                          Görüşme planlandı
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="outcome" value="yapildi" required />
                          Görüşme yapıldı
                        </label>
                      </fieldset>
                      <label className="block text-label-md font-semibold text-on-surface">
                        Görüşme notu
                        <textarea
                          required
                          minLength={2}
                          name="advisorNote"
                          rows={3}
                          placeholder="Görüşmede konuşulanları yaz"
                          className="mt-1 w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                        />
                      </label>
                      <div className="flex flex-wrap items-end gap-space-sm">
                        <label className="text-label-md font-semibold text-on-surface">
                          Tarih
                          <input className="input-field mt-1" type="date" name="date" />
                        </label>
                        <label className="text-label-md font-semibold text-on-surface">
                          Saat
                          <input className="input-field mt-1" type="time" name="time" defaultValue="19:00" step={900} />
                        </label>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        Planlandı seçildiğinde tarih ve saat gerekir; seçilen saat + 45 dk başka randevuya kapanır.
                      </p>
                      <div className="flex flex-wrap gap-space-sm">
                        <button type="submit" className="btn-primary" disabled={pending?.id === item.id}>
                          <Icon name="event" className="text-[18px]" />
                          {pending?.id === item.id && pending.action === "confirm" ? "Kaydediliyor…" : "Talebi kapat"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-surface-container-lowest px-space-md py-3 text-label-md font-semibold text-error"
                          disabled={pending?.id === item.id}
                          onClick={() => void remove(item)}
                        >
                          {pending?.id === item.id && pending.action === "delete" ? "Siliniyor…" : "Talebi sil"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
