import { resetDailyQuota } from "@/lib/ratelimit";

export async function GET(req: Request) {
  const password = req.headers.get("x-access-password");
  if (password !== process.env.ACCESS_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  resetDailyQuota();
  return Response.json({ message: "配额已重置" });
}
