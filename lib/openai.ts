import OpenAI from "openai";

export function createClient(userKey?: string | null) {
  const key = userKey || process.env.DEEPSEEK_API_KEY;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.deepseek.com/v1",
  });
}
