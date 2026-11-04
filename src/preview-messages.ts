export function previewSettings(search: string): {
  parentOrigin: string;
  token: string;
} {
  const query = new URLSearchParams(search);
  const parentOrigin = query.get("parentOrigin") ?? "";
  const token = query.get("token") ?? "";
  const url = new URL(parentOrigin);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== parentOrigin ||
    !/^[a-f0-9]{64}$/.test(token)
  ) {
    throw new Error("Open this preview from the admin editor");
  }
  return { parentOrigin, token };
}

export function previewMessage(
  event: { source: unknown; origin: string; data: unknown },
  parent: unknown,
  settings: { parentOrigin: string; token: string },
): { content: unknown; page: "main" | "subscriptions" | "donations" | "success" } | undefined {
  if (event.source !== parent || event.origin !== settings.parentOrigin)
    return undefined;
  const data = event.data;
  if (
    !data ||
    typeof data !== "object" ||
    !("type" in data) ||
    data.type !== "drc-preview-content" ||
    !("token" in data) ||
    data.token !== settings.token ||
    !("content" in data)
  )
    return undefined;
  const page = "page" in data ? data.page : "main";
  if (page !== "main" && page !== "subscriptions" && page !== "donations" && page !== "success") return undefined;
  return { content: data.content, page };
}
