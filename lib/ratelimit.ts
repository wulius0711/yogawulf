const store = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (store.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= maxRequests) return false;
  hits.push(now);
  store.set(key, hits);
  return true;
}

export function getIp(req: Request): string {
  return (
    (req.headers as Headers).get("x-forwarded-for")?.split(",")[0].trim() ??
    (req.headers as Headers).get("x-real-ip") ??
    "unknown"
  );
}
