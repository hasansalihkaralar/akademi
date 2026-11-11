export function paymentStatusLabel(status: string) {
  if (status === "odendi") return "Ödendi";
  if (status === "havale_bekliyor") return "Havale bekliyor";
  if (status === "basarisiz") return "Başarısız";
  return status;
}

export function paymentStatusClass(status: string) {
  if (status === "odendi") return "bg-[#DCFCE7] text-[#15803D]";
  if (status === "havale_bekliyor") return "bg-secondary-fixed text-on-secondary-fixed";
  return "bg-error/10 text-error";
}
