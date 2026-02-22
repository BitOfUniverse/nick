# Nick's Survey Builder

AI-powered survey builder that helps users create, review, and edit survey questions through a conversational chat interface.

## Features

- **AI Chat Agent** — interactive left panel where you can ask the AI to add, edit, delete, or improve survey questions, adjust tone, and manage study goals
- **Survey Editor** — visual right panel displaying questions with expand/collapse, inline editing, answer choices, and display conditions
- **File Attachments** — upload PDF, TXT, MD, and CSV files for the AI to reference
- **Custom System Prompt** — configure the AI agent's identity and instructions (persisted in Redis)
- **Streaming Responses** — real-time SSE streaming of AI answers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh) |
| Server | `Bun.serve()` with built-in routing |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Icons | Lucide React |
| AI | OpenRouter API (`openai/gpt-4o-mini`) |
| Storage | Redis via `Bun.redis` (system prompt persistence) |
| PDF parsing | pdf-parse |

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from [OpenRouter](https://openrouter.ai/) for LLM access |
| `REDIS_URL` | No | Redis connection string. Defaults to `redis://localhost:6379` |

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (with HMR)
bun dev

# Start production server
bun start
```

## Deployment

The app is deployed automatically to [Railway](https://railway.app/) on every push to `main`.

Live: **https://nicks-files.up.railway.app/**
