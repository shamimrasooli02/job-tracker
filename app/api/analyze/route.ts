import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { jobText } = await req.json();

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Extract the company name and job role/title from this job posting. Respond ONLY with JSON in this exact format, nothing else: {"company": "...", "role": "..."}\n\nJob posting:\n${jobText}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { company: "", role: "" };
  }

  return Response.json(parsed);
}
