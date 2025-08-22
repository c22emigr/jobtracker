export type FieldErrors = Record<string, string>;

export function mapZodDetails(details: any): Record<string, string> {
  const out: Record<string, string> = {};
  const fe = details?.fieldErrors ?? {};
  for (const k in fe) if (fe[k]?.length) out[k] = String(fe[k][0]);
  return out;
}
