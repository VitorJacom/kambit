const MEMORY = new Map<string, { exp: number; meta: Record<string, any> }>();
const TTL_MS = 10 * 60 * 1000; // 10 min

function gc() {
  const now = Date.now();
  for (const [k, v] of MEMORY.entries()) if (v.exp <= now) MEMORY.delete(k);
}

export function putState(value: string, meta: Record<string, any> = {}) {
  gc();
  MEMORY.set(value, { exp: Date.now() + TTL_MS, meta });
}

export function takeState(value: string) {
  gc();
  const item = MEMORY.get(value);
  if (item) MEMORY.delete(value);
  return item;
}
