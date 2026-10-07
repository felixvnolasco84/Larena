export async function downloadFile(id: string, token?: string) {
  const response = await fetch(`/api/kyc/files/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(token ? { token } : {}),
  });
  if (!response.ok) throw new Error("DOWNLOAD_FAILED");
  const blob = await response.blob(),
    url = URL.createObjectURL(blob),
    link = document.createElement("a");
  const filename = response.headers
    .get("Content-Disposition")
    ?.split("UTF-8''")[1];
  link.href = url;
  link.download = filename ? decodeURIComponent(filename) : "documento";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
