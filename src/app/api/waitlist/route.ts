import { siteConfig } from "@/lib/site";
import { getEmailSettings } from "@/lib/waitlist/email";
import { handleWaitlistPost } from "@/lib/waitlist/handler";
import { RateLimiter, getTurnstileVerifier } from "@/lib/waitlist/protection";
import { getWaitlistStore } from "@/lib/waitlist/store";

// 5 submissions per IP per 10 minutes, per server instance.
const rateLimiter = new RateLimiter(5, 10 * 60 * 1000);

export async function POST(request: Request) {
  return handleWaitlistPost(request, {
    store: getWaitlistStore(),
    email: getEmailSettings(),
    rateLimiter,
    verifyTurnstile: getTurnstileVerifier(),
    privacyPolicyVersion: siteConfig.privacyPolicyVersion,
  });
}
