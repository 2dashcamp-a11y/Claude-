import "server-only";

/**
 * Best-effort, per-instance sliding-window rate limiter.
 *
 * Serverless platforms run several short-lived instances, so this is a speed
 * bump rather than a guarantee. Enable Cloudflare Turnstile (see README) for
 * stronger bot protection.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  check(key: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 5000) this.prune(now);
    return true;
  }

  private prune(now: number) {
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= this.windowMs)) this.hits.delete(key);
    }
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type TurnstileVerifier = (token: string | undefined, ip: string) => Promise<boolean>;

/** Returns a verifier when TURNSTILE_SECRET_KEY is set, otherwise null (check skipped). */
export function getTurnstileVerifier(): TurnstileVerifier | null {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return null;
  return async (token, ip) => {
    if (!token) return false;
    try {
      const body = new URLSearchParams({ secret, response: token });
      if (ip !== "unknown") body.set("remoteip", ip);
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(5000),
      });
      const data = (await res.json()) as { success?: boolean };
      return data.success === true;
    } catch (error) {
      console.error("[waitlist] Turnstile verification error", error);
      return false;
    }
  };
}
