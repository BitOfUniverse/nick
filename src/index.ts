import { serve } from "bun";
import index from "./index.html";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

function buildSystemPrompt(studyGoal: string, questions: { text: string; description: string; choices: string[] }[]) {
  const questionsList = questions.length > 0
    ? questions.map((q, i) => {
        let line = `${i + 1}. "${q.text || "(untitled)"}"`;
        if (q.description) line += `\n   Description: "${q.description}"`;
        if (q.choices.filter(c => c).length > 0) line += `\n   Choices: ${q.choices.filter(c => c).map(c => `"${c}"`).join(", ")}`;
        return line;
      }).join("\n")
    : "(no questions yet)";

  return `You are an AI Editing Agent for a survey builder platform. The current survey is called "Share Behavior Research".

The study goal is: "${studyGoal}"

Current survey questions:
${questionsList}

You help users review and improve their survey questions, answer options, and overall survey structure. You can:
- Review and suggest improvements to survey questions
- Recommend better answer options
- Adjust the tone of voice to match a brand
- Provide recommendations on question ordering and logic
- Help with display conditions and skip logic
- Add new questions to the survey when asked

Use markdown formatting: **bold**, bullet points (- ), and headers (##, ###) for clear, structured responses. Be concise and actionable.

IMPORTANT TAGS — these are parsed by the system to update the UI. Place them at the END of your response.

1. When the user asks you to change, update, or redefine the study goal, include:
[STUDY_GOAL: <new goal text here>]

2. When the user asks you to ADD one or more new questions to the survey, include one tag per question:
[ADD_QUESTION: {"text": "Question text here", "description": "Optional description", "required": false, "choices": ["Choice 1", "Choice 2"]}]

Rules for ADD_QUESTION:
- "text" (string, required): the question text
- "description" (string, optional): helper text shown below the question
- "required" (boolean, optional, default false): whether the question is required
- "choices" (string array, optional): answer options. Omit or use empty array for open-ended questions
- Output valid JSON inside the tag — no trailing commas, proper quoting
- You may include multiple [ADD_QUESTION: ...] tags to add multiple questions at once
- Always describe the questions you're adding in your regular response text BEFORE the tags
- Only include these tags when the user explicitly asks to add, create, or insert new questions`;
}

// Initial conversation context so the model knows what was discussed
const INITIAL_MESSAGES = [
  {
    role: "assistant" as const,
    content:
      "Done! Your study is ready to review and launch.\nWhat would you like to do next?",
  },
  {
    role: "user" as const,
    content:
      "Buddy, review question 2 and 4 and make it matching MyCompany tone of voice",
  },
  {
    role: "assistant" as const,
    content: `## 2. Answer options: recommendations

Current options are logically ordered, but:
- Some are wordy
- "Once or twice" vs "occasionally" can feel fuzzy
- "I'm not sure" is useful but should be last (you already did this right 👍)

## Recommended answer set (clean + behavioral)

### Best overall set
- I haven't shared my Linktree yet
- I've shared it a few times, but not consistently
- I share it occasionally
- I share it regularly
- I'm not sure

### Why this works
- "Yet" subtly removes shame`,
  },
];

const server = serve({
  routes: {
    "/*": index,

    "/api/chat": {
      async POST(req) {
        const { messages, studyGoal, questions } = (await req.json()) as {
          messages: { role: string; content: string }[];
          studyGoal?: string;
          questions?: { text: string; description: string; choices: string[] }[];
        };

        const fullMessages = [
          { role: "system", content: buildSystemPrompt(studyGoal || "The goal of this study is to understand why some creators delay or avoid sharing their Linktree.", questions || []) },
          ...INITIAL_MESSAGES,
          ...messages,
        ];

        const upstream = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: fullMessages,
            stream: true,
          }),
        });

        if (!upstream.ok) {
          const err = await upstream.text();
          return new Response(err, { status: upstream.status });
        }

        // Forward the SSE stream directly
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
