import { serve, redis } from "bun";
import index from "./index.html";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const REDIS_KEY = "custom_system_prompt";

function buildSystemPrompt(studyGoal: string, questions: { text: string; description: string; choices: string[] }[], customInstructions?: string) {
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

IMPORTANT — FILE ATTACHMENTS: Users can attach files (.pdf, .txt, .md, .csv). When they do, the FULL TEXT CONTENT of each file is included directly in their message. The content appears between "--- START OF FILE: filename ---" and "--- END OF FILE ---" markers. This is NOT a reference or link — the actual file text is right there in the message. You MUST read it, use it, and reference it when responding. Never say you cannot access or read attached files.

You help users review and improve their survey questions, answer options, and overall survey structure. You can:
- Review and suggest improvements to survey questions
- Recommend better answer options
- Adjust the tone of voice to match a brand
- Provide recommendations on question ordering and logic
- Help with display conditions and skip logic
- Add new questions to the survey when asked
- Delete questions from the survey when asked
- Edit existing questions when asked

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

3. When the user asks you to DELETE or REMOVE one or more questions, include one tag per question:
[DELETE_QUESTION: <question number>]

Rules for DELETE_QUESTION:
- Use the 1-based question number from the current list above
- You may include multiple [DELETE_QUESTION: ...] tags to delete multiple questions at once
- Always confirm which question(s) you're deleting in your response text BEFORE the tags
- Only include these tags when the user explicitly asks to delete, remove, or drop questions
- Always describe the questions you're adding in your regular response text BEFORE the tags
- Only include these tags when the user explicitly asks to add, create, or insert new questions

4. When the user asks you to EDIT, MODIFY, or UPDATE an existing question, include one tag per question:
[EDIT_QUESTION: {"index": 1, "text": "New text", "description": "New desc", "required": true, "choices": ["A", "B"]}]

Rules for EDIT_QUESTION:
- "index" (number, required): 1-based question number from the current list above
- "text", "description", "required", "choices" — all optional, only include fields that need to change
- You may include multiple [EDIT_QUESTION: ...] tags to edit multiple questions at once
- Always describe the changes you're making in your regular response text BEFORE the tags
- Only include these tags when the user explicitly asks to edit, modify, change, or update existing questions${customInstructions ? `\n\nADDITIONAL CUSTOM INSTRUCTIONS FROM THE USER:\n${customInstructions}` : ""}`;
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

    "/api/parse-file": {
      async POST(req) {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
          }

          const name = file.name;
          const ext = name.split(".").pop()?.toLowerCase();
          let text: string;

          if (ext === "pdf") {
            const buffer = Buffer.from(await file.arrayBuffer());
            const parsed = await pdfParse(buffer);
            text = parsed.text;
          } else {
            text = await file.text();
          }

          // Truncate to ~50k chars to avoid token limits
          if (text.length > 50000) {
            text = text.slice(0, 50000) + "\n\n[...truncated, file too large]";
          }

          return Response.json({ name, text });
        } catch (err) {
          console.error("File parse error:", err);
          return new Response(JSON.stringify({ error: "Failed to parse file" }), { status: 500 });
        }
      },
    },

    "/api/system-prompt": {
      async GET() {
        const prompt = await redis.get(REDIS_KEY);
        return Response.json({ customSystemPrompt: prompt ?? "" });
      },
      async PUT(req) {
        const { customSystemPrompt } = (await req.json()) as { customSystemPrompt: string };
        await redis.set(REDIS_KEY, customSystemPrompt);
        return Response.json({ ok: true });
      },
    },

    "/api/chat": {
      async POST(req) {
        const { messages, studyGoal, questions, customSystemPrompt } = (await req.json()) as {
          messages: { role: string; content: string }[];
          studyGoal?: string;
          questions?: { text: string; description: string; choices: string[] }[];
          customSystemPrompt?: string;
        };

        const fullMessages = [
          { role: "system", content: buildSystemPrompt(studyGoal || "The goal of this study is to understand why some creators delay or avoid sharing their Linktree.", questions || [], customSystemPrompt || undefined) },
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
