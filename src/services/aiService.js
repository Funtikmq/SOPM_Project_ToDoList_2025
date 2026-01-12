const fallback = (title) => ({
  subtasks: [
    `Define scope for "${title}"`,
    "Draft outline",
    "Gather references",
    "Write first draft",
    "Review & polish",
  ],
  suggestedDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  suggestedPriority: "Medium",
  dailyPlan: ["Plan today's tasks", "Work 45 minutes on the outline", "Collect 3 references", "Review progress"],
});

export async function generateTaskInsights(title) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return fallback(title);

  const system = `
You are an assistant for a task manager. Respond in JSON with fields:
{
  "subtasks": [array of short subtasks],
  "suggestedDeadline": "YYYY-MM-DD",
  "suggestedPriority": "High|Medium|Low",
  "dailyPlan": [array of 3-5 bullet items for today]
}
Keep it concise. Deadline within 14-30 days if not specified. Priority: High if urgent, Medium default, Low for long-term.
`;

  const user = `Task title: ${title}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error((await res.text()) || "OpenAI error");
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return {
      subtasks: parsed.subtasks || [],
      suggestedDeadline: parsed.suggestedDeadline || "",
      suggestedPriority: parsed.suggestedPriority || "Medium",
      dailyPlan: parsed.dailyPlan || [],
    };
  } catch (err) {
    console.warn("AI fallback:", err.message);
    return fallback(title);
  }
}
