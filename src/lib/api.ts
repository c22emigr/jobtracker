// API Helper
"use client";

export type ApiOk<T>  = { ok: true; data: T };
export type ApiErr    = { ok: false; error: string; details?: unknown; status?: number };
export type ApiResp<T> = ApiOk<T> | ApiErr;


type ApiOptions = {
  notifyError?: (msg: string) => void;
  timeoutMs?: number;            // auto-abort to avoid hung fetch
  parseJsonOn?: (res: Response) => boolean; // override JSON detection if needed
};

function isJsonResponse(res: Response) { // check for JSON response
  if (res.status === 204) return false;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

function withTimeout(input?: AbortSignal | null, ms?: number) {
  // no timeout -> just pass through whatever we got, normalizing null
  if (!ms) return { signal: input ?? undefined, cancel: () => {} };

  const ctrl = new AbortController();

  // if caller provided a signal, link it so either aborts
  if (input) {
    const onAbort = () => ctrl.abort();
    if (input.aborted) ctrl.abort();
    else input.addEventListener("abort", onAbort, { once: true });
  }

  const timer = setTimeout(() => ctrl.abort(), ms);
  const cancel = () => clearTimeout(timer);

  return { signal: ctrl.signal, cancel };
}

type InitJSON = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T>(
  url: string,
  init: InitJSON = {},
  opts: ApiOptions = {}
): Promise<ApiResp<T>> {
  const method = (init.method || "GET").toUpperCase();

  // auto-stringify JSON bodies
  let headers = new Headers(init.headers || {});
  let body = init.body as BodyInit | undefined;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  // don’t set Content-Type for GET/HEAD without body
  if ((method === "GET" || method === "HEAD") && !body) {
    headers.delete("Content-Type");
  }

  // default no-store for client navigations
  const cache = init.cache ?? "no-store";

  // timeout
  const { signal, cancel } = withTimeout(init.signal, opts.timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, { ...init, method, headers, body, cache, signal });
  } catch (e) {
    opts.notifyError?.("Network error");
    return { ok: false, error: "Network error", details: e };
  } finally {
    cancel?.();
  }

  // parse JSON only when appropriate
  const shouldJson = opts.parseJsonOn ? opts.parseJsonOn(res) : isJsonResponse(res);
  let json: any = null;
  if (shouldJson) {
    try {
      json = await res.json();
    } catch {
      // ignore malformed JSON; we'll fall back to statusText
    }
  }

  if (json?.ok === true) {
    return json as ApiOk<T>;
  }

  if (res.ok) {
    // server didn’t wrap in envelope; be forgiving in dev
    return { ok: true, data: (json?.data ?? json ?? null) as T };
  }

  const error = json?.error || res.statusText || "Request failed";
  opts.notifyError?.(error);
  return { ok: false, error, details: json?.details, status: res.status };
}

// Strict variant that throws on error (handy with try/catch + toasts)
export async function apiStrict<T>(
  url: string,
  init?: InitJSON,
  opts?: ApiOptions
): Promise<T> {
  const r = await api<T>(url, init, opts);
  if (!r.ok) throw Object.assign(new Error(r.error), { details: r.details, status: r.status });
  return r.data;
}