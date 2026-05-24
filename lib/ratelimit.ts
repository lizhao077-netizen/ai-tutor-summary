const ipRequests = new Map<string, { count: number; resetAt: number }>();

let dailyTotal = 0;
let dailyResetAt = Date.now() + 24 * 60 * 60 * 1000;

const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN) || 5;
const DAILY_QUOTA = Number(process.env.DAILY_QUOTA) || 200;

function nowMs() {
  return Date.now();
}

export function checkIpRateLimit(ip: string): {
  allowed: boolean;
  message?: string;
} {
  const now = nowMs();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_PER_MIN) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      message: `请求过于频繁，请 ${retryAfter} 秒后重试`,
    };
  }

  entry.count++;
  return { allowed: true };
}

export function resetDailyQuota() {
  dailyTotal = 0;
  dailyResetAt = nowMs() + 24 * 60 * 60 * 1000;
}

export function checkDailyQuota(): { allowed: boolean; message?: string } {
  const now = nowMs();

  if (now > dailyResetAt) {
    dailyTotal = 0;
    dailyResetAt = now + 24 * 60 * 60 * 1000;
  }

  if (dailyTotal >= DAILY_QUOTA) {
    return {
      allowed: false,
      message: "今日使用次数已达上限，请明天再试",
    };
  }

  dailyTotal++;
  return { allowed: true };
}
