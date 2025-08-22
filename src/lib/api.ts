// API Helper
"use client";

export type ApiOk<T>  = { ok: true; data: T };
export type ApiErr    = { ok: false; error: string; details?: unknown; status?: number };
export type ApiResp<T> = ApiOk<T> | ApiErr;

export async function api<T>(
  url: string,
  init: RequestInit = {},
  opts?: { notifyError?: (msg: string) => void }
): Promise<ApiResp<T>> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  let json: any = null;
  try {
    if (res.status !== 204 && init.method !== "HEAD") {
      json = await res.json();
    }
  } catch {
    // ignore if not JSON
  }

  if (json?.ok === true) return json as ApiOk<T>;
  if (res.ok) return { ok: true, data: (json?.data ?? json ?? null) as T };

  const error = json?.error ?? res.statusText ?? "Request failed";
  const details = json?.details;
  opts?.notifyError?.(error);
  return { ok: false, error, details, status: res.status };
}