import { resetDailyQuota } from "@/lib/ratelimit";

export async function GET() {
  resetDailyQuota();
  return Response.json({ message: "配额已重置" });
}
