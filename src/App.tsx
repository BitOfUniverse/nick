import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import "./index.css";
import {
  Menu,
  PanelLeftClose,
  Eye,
  RotateCcw,
  Link2,
  Send,
  Paperclip,
  Check,
  ChevronDown,
  Pencil,
  Maximize2,
  Copy,
  Plus,
  Globe,
  Shuffle,
  MoreHorizontal,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlertTriangle,
  HelpCircle,
  ClipboardList,
  Loader2,
  X,
  FileText,
  Settings,
} from "lucide-react";

/* ─── Design Tokens ─── */
const gold = "#F9C600";
const goldBorder = "#FAD133";
const goldBgLight = "#FEF9E7";
const textPrimary = "#082330";
const textSecondary = "#506067";
const borderDefault = "#E2E3E1";
const bgSecondary = "#F9F9F8";

/* ─── Types ─── */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; text: string }[];
}

interface Condition {
  id: string;
  sourceQuestionId: string;
  sourceQuestionLabel: string;
  operator: string;
  value: string;
}

const OPERATORS = ["=", "\u2260", "contains", "does not contain"];

interface SurveyQuestion {
  id: string;
  text: string;
  description: string;
  required: boolean;
  choices: { id: string; text: string }[];
  conditions: Condition[];
  hasShuffleIcon: boolean;
  hasWarningIcon: boolean;
}

/* ─── Helpers ─── */
let _idCounter = 0;
function generateId() {
  return `id-${Date.now()}-${++_idCounter}`;
}

/* ─── Initial Data ─── */
const initialQuestions: SurveyQuestion[] = [
  {
    id: generateId(),
    text: "What\u2019s been holding you back from sharing your Linktree so far?",
    description: "",
    required: false,
    choices: [{ id: generateId(), text: "" }],
    conditions: [],
    hasShuffleIcon: true,
    hasWarningIcon: true,
  },
  {
    id: generateId(),
    text: "Which of the following best describes your current sharing status?",
    description: "",
    required: true,
    choices: [
      { id: generateId(), text: "" },
      { id: generateId(), text: "" },
    ],
    conditions: [
      {
        id: generateId(),
        sourceQuestionId: "",
        sourceQuestionLabel: "Do you play music?",
        operator: "=",
        value: "Yes",
      },
    ],
    hasShuffleIcon: false,
    hasWarningIcon: false,
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function App() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    initialQuestions[1]!.id,
  );
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(400);
  const [studyGoal, setStudyGoal] = useState(
    "The goal of this study is to understand why some creators delay or avoid sharing...",
  );
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {leftPanelCollapsed && (
        <CollapsedLeftPanel onExpand={() => setLeftPanelCollapsed(false)} />
      )}
      <LeftPanel
        collapsed={leftPanelCollapsed}
        onCollapse={() => setLeftPanelCollapsed(true)}
        width={leftPanelWidth}
        onWidthChange={setLeftPanelWidth}
        studyGoal={studyGoal}
        onStudyGoalChange={setStudyGoal}
        customSystemPrompt={customSystemPrompt}
        onCustomSystemPromptChange={setCustomSystemPrompt}
        questions={questions}
        onAddQuestions={(newQs) => {
          setQuestions((prev) => [...prev, ...newQs]);
          if (newQs.length > 0) setSelectedQuestionId(newQs[0]!.id);
        }}
        onDeleteQuestions={(indices) => {
          setQuestions((prev) => {
            const next = prev.filter((_, i) => !indices.includes(i));
            if (next.length > 0 && !next.find((q) => q.id === selectedQuestionId)) {
              setSelectedQuestionId(next[next.length - 1]!.id);
            } else if (next.length === 0) {
              setSelectedQuestionId(null);
            }
            return next;
          });
        }}
        onEditQuestions={(edits) => {
          setQuestions((prev) =>
            prev.map((q, i) => {
              const edit = edits.find((e) => e.index === i);
              if (!edit) return q;
              return {
                ...q,
                ...(edit.text !== undefined && { text: edit.text }),
                ...(edit.description !== undefined && { description: edit.description }),
                ...(edit.required !== undefined && { required: edit.required }),
                ...(edit.choices !== undefined && {
                  choices: edit.choices.length > 0
                    ? edit.choices.map((c) => ({ id: generateId(), text: c }))
                    : [{ id: generateId(), text: "" }],
                }),
              };
            }),
          );
        }}
      />
      <RightPanel
        questions={questions}
        setQuestions={setQuestions}
        selectedQuestionId={selectedQuestionId}
        setSelectedQuestionId={setSelectedQuestionId}
        studyGoal={studyGoal}
        setStudyGoal={setStudyGoal}
      />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COLLAPSED LEFT PANEL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CollapsedLeftPanel({ onExpand }: { onExpand: () => void }) {
  return (
    <div
      className="flex flex-col items-center pt-4 bg-white shrink-0"
      style={{ width: 48, borderRight: `1px solid ${borderDefault}` }}
    >
      <button
        className="flex items-center justify-center cursor-pointer bg-transparent border-none"
        onClick={onExpand}
      >
        <Menu size={20} color={textPrimary} />
      </button>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LEFT PANEL – AI Editing Agent (interactive chat)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LeftPanel({
  collapsed,
  onCollapse,
  width,
  onWidthChange,
  studyGoal,
  onStudyGoalChange,
  customSystemPrompt,
  onCustomSystemPromptChange,
  questions,
  onAddQuestions,
  onDeleteQuestions,
  onEditQuestions,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  width: number;
  onWidthChange: (w: number) => void;
  studyGoal: string;
  onStudyGoalChange: (goal: string) => void;
  customSystemPrompt: string;
  onCustomSystemPromptChange: (prompt: string) => void;
  questions: SurveyQuestion[];
  onAddQuestions: (questions: SurveyQuestion[]) => void;
  onDeleteQuestions: (indices: number[]) => void;
  onEditQuestions: (edits: { index: number; text?: string; description?: string; required?: boolean; choices?: string[] }[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; text: string; error?: string }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [promptDraft, setPromptDraft] = useState(customSystemPrompt);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;
  const chatInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatInputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const promises = Array.from(files).map(async (file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      try {
        if (ext === "pdf") {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/parse-file", { method: "POST", body: formData });
          if (!res.ok) throw new Error("Failed to parse PDF");
          const data = await res.json() as { name: string; text: string };
          if (!data.text?.trim()) {
            return { name: file.name, text: "", error: "No extractable text" };
          }
          return { name: data.name, text: data.text };
        } else {
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
          });
          if (text.length > 50000) {
            return { name: file.name, text: text.slice(0, 50000) + "\n\n[...truncated, file too large]" };
          }
          return { name: file.name, text };
        }
      } catch {
        return { name: file.name, text: "", error: "Failed to read file" };
      }
    });

    const results = await Promise.all(promises);
    setAttachments((prev) => [...prev, ...results]);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    const validAttachments = attachments.filter((a) => !a.error && a.text);
    if ((!text && validAttachments.length === 0) || isStreamingRef.current) return;

    // Show attached filenames in the user bubble, store attachments on the message
    const displayContent = validAttachments.length > 0
      ? (validAttachments.map((a) => `[${a.name}]`).join(" ") + (text ? "\n" + text : ""))
      : text;

    const userMsg: ChatMessage = {
      role: "user",
      content: displayContent,
      attachments: validAttachments.length > 0
        ? validAttachments.map((a) => ({ name: a.name, text: a.text }))
        : undefined,
    };
    const allMessages = [...messagesRef.current, userMsg];
    setMessages(allMessages);
    if (!textOverride) setInput("");
    setAttachments([]);
    setIsStreaming(true);

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Build API messages: augment any user message that has attachments with file text
    const apiMessages = allMessages.map((m) => {
      if (m.attachments && m.attachments.length > 0) {
        const prefix = m.attachments
          .map((a) => `--- START OF FILE: ${a.name} ---\n${a.text}\n--- END OF FILE ---`)
          .join("\n\n");
        return { role: m.role, content: prefix + "\n\n" + m.content };
      }
      return { role: m.role, content: m.content };
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          studyGoal,
          questions: questions.map((q) => ({
            text: q.text,
            description: q.description,
            choices: q.choices.map((c) => c.text),
          })),
          customSystemPrompt: customSystemPrompt || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue;
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1]!;
                if (last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + delta,
                  };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Extract structured tags from the final message
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1]!;
        if (last.role === "assistant") {
          let content = last.content;

          // [STUDY_GOAL: ...]
          const goalMatch = content.match(/\[STUDY_GOAL:\s*(.*?)\]/);
          if (goalMatch) {
            onStudyGoalChange(goalMatch[1]!.trim());
            content = content.replace(/\[STUDY_GOAL:\s*.*?\]/, "").trim();
          }

          // [ADD_QUESTION: {...}] — may appear multiple times
          const addQRegex = /\[ADD_QUESTION:\s*(\{[\s\S]*?\})\s*\]/g;
          const newQuestions: SurveyQuestion[] = [];
          let qMatch;
          while ((qMatch = addQRegex.exec(content)) !== null) {
            try {
              const parsed = JSON.parse(qMatch[1]!) as {
                text?: string;
                description?: string;
                required?: boolean;
                choices?: string[];
              };
              newQuestions.push({
                id: generateId(),
                text: parsed.text ?? "",
                description: parsed.description ?? "",
                required: parsed.required ?? false,
                choices: (parsed.choices && parsed.choices.length > 0)
                  ? parsed.choices.map((c) => ({ id: generateId(), text: c }))
                  : [{ id: generateId(), text: "" }],
                conditions: [],
                hasShuffleIcon: false,
                hasWarningIcon: false,
              });
            } catch {
              // skip malformed JSON
            }
          }
          content = content.replace(/\[ADD_QUESTION:\s*\{[\s\S]*?\}\s*\]/g, "").trim();

          if (newQuestions.length > 0) {
            onAddQuestions(newQuestions);
          }

          // [DELETE_QUESTION: <number>] — may appear multiple times
          const deleteRegex = /\[DELETE_QUESTION:\s*(\d+)\s*\]/g;
          const deleteIndices: number[] = [];
          let dMatch;
          while ((dMatch = deleteRegex.exec(content)) !== null) {
            const idx = parseInt(dMatch[1]!, 10) - 1; // convert 1-based to 0-based
            if (idx >= 0) deleteIndices.push(idx);
          }
          content = content.replace(/\[DELETE_QUESTION:\s*\d+\s*\]/g, "").trim();

          if (deleteIndices.length > 0) {
            onDeleteQuestions(deleteIndices);
          }

          // [EDIT_QUESTION: {...}] — may appear multiple times
          const editQRegex = /\[EDIT_QUESTION:\s*(\{[\s\S]*?\})\s*\]/g;
          const editOps: { index: number; text?: string; description?: string; required?: boolean; choices?: string[] }[] = [];
          let eMatch;
          while ((eMatch = editQRegex.exec(content)) !== null) {
            try {
              const parsed = JSON.parse(eMatch[1]!) as {
                index?: number;
                text?: string;
                description?: string;
                required?: boolean;
                choices?: string[];
              };
              if (typeof parsed.index === "number" && parsed.index >= 1) {
                editOps.push({
                  index: parsed.index - 1, // convert 1-based to 0-based
                  ...(parsed.text !== undefined && { text: parsed.text }),
                  ...(parsed.description !== undefined && { description: parsed.description }),
                  ...(parsed.required !== undefined && { required: parsed.required }),
                  ...(parsed.choices !== undefined && { choices: parsed.choices }),
                });
              }
            } catch {
              // skip malformed JSON
            }
          }
          content = content.replace(/\[EDIT_QUESTION:\s*\{[\s\S]*?\}\s*\]/g, "").trim();

          if (editOps.length > 0) {
            onEditQuestions(editOps);
          }

          updated[updated.length - 1] = { ...last, content };
        }
        return updated;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1]!;
        if (last.role === "assistant" && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: "Sorry, something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(300, Math.min(700, startWidth + ev.clientX - startX));
      onWidthChange(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <aside
      className="relative flex flex-col h-screen bg-white shrink-0"
      style={{
        width,
        minWidth: 300,
        maxWidth: 700,
        display: collapsed ? "none" : undefined,
      }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 h-full z-10"
        style={{ width: 5, cursor: "col-resize", borderRight: `1px solid ${borderDefault}` }}
        onMouseDown={handleDragStart}
      />
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 56, borderBottom: `1px solid ${borderDefault}` }}
      >
        <div className="flex items-center gap-3">
          <Menu size={20} color={textPrimary} />
          <span className="text-[17px] font-semibold" style={{ color: textPrimary }}>
            AI Editing Agent
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Settings
            size={20}
            color={textSecondary}
            className="cursor-pointer"
            onClick={() => {
              setPromptDraft(customSystemPrompt);
              setShowSettings(true);
            }}
          />
          <PanelLeftClose
            size={20}
            color={textSecondary}
            className="cursor-pointer"
            onClick={onCollapse}
          />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-[90%] max-w-[480px] flex flex-col"
            style={{ maxHeight: "80%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 shrink-0"
              style={{ height: 56, borderBottom: `1px solid ${borderDefault}` }}
            >
              <span className="text-[15px] font-semibold" style={{ color: textPrimary }}>
                Custom Instructions
              </span>
              <X
                size={18}
                color={textSecondary}
                className="cursor-pointer"
                onClick={() => setShowSettings(false)}
              />
            </div>
            <div className="px-5 py-4 flex-1 overflow-y-auto space-y-3">
              <p className="text-sm" style={{ color: textSecondary }}>
                Add custom instructions to guide the AI assistant's behavior. These will be appended to the default system prompt.
              </p>
              <textarea
                className="w-full rounded-lg px-3 py-3 text-sm outline-none resize-none"
                style={{
                  border: `1px solid ${borderDefault}`,
                  color: textPrimary,
                  minHeight: 160,
                }}
                placeholder="e.g. Always respond in a formal tone. Focus on question clarity and avoid jargon..."
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
              />
            </div>
            <div
              className="flex items-center justify-end gap-3 px-5 shrink-0"
              style={{ height: 64, borderTop: `1px solid ${borderDefault}` }}
            >
              <button
                className="h-9 px-4 rounded-lg text-sm font-medium cursor-pointer bg-white"
                style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="h-9 px-4 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: gold, border: `1px solid ${goldBorder}`, color: textPrimary }}
                onClick={() => {
                  onCustomSystemPromptChange(promptDraft);
                  setShowSettings(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Chat Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* ── Initial static conversation ── */}
        <InitialConversation onSendMessage={sendMessage} />

        {/* ── Dynamic messages ── */}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <UserBubble key={`msg-${i}`} content={msg.content} />
          ) : (
            <AssistantMessage
              key={`msg-${i}`}
              content={msg.content}
              isStreaming={isStreaming && i === messages.length - 1}
            />
          ),
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Attachment chips + Chat Input */}
      <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${borderDefault}` }}>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, i) => (
              <div
                key={`${att.name}-${i}`}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs"
                style={{
                  background: att.error ? "#FEF2F2" : bgSecondary,
                  border: `1px solid ${att.error ? "#FECACA" : borderDefault}`,
                  color: att.error ? "#DC2626" : textPrimary,
                }}
              >
                <FileText size={12} />
                <span className="max-w-[120px] truncate">{att.name}</span>
                {att.error && <span className="text-[10px] opacity-70">({att.error})</span>}
                <button
                  className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 ml-0.5"
                  onClick={() => removeAttachment(i)}
                >
                  <X size={12} color={att.error ? "#DC2626" : textSecondary} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="flex items-center rounded-2xl px-4"
          style={{ border: `1px solid ${borderDefault}`, height: 48 }}
        >
          <input
            ref={chatInputRef}
            type="text"
            placeholder="Ask almost anything"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: textPrimary }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <div className="flex items-center gap-3">
            <Paperclip
              size={18}
              color={textSecondary}
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            />
            <button
              className="flex items-center justify-center rounded-full cursor-pointer"
              style={{
                width: 32,
                height: 32,
                background: isStreaming ? borderDefault : gold,
              }}
              onClick={() => sendMessage()}
              disabled={isStreaming}
            >
              {isStreaming ? (
                <Loader2 size={14} color="white" className="animate-spin" />
              ) : (
                <Send size={14} color="white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Initial static conversation (matches the original screenshot) ─── */
function InitialConversation({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  return (
    <>
      {/* Bot greeting */}
      <div className="space-y-3">
        <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>
          Done! Your study is ready to review and launch.
          <br />
          What would you like to do next?
        </p>
        <div className="flex gap-2 flex-wrap">
          <ActionChip icon={<Eye size={16} />} label="Show preview" onClick={() => onSendMessage("Show preview")} />
          <ActionChip icon={<RotateCcw size={16} />} label="Add replays" onClick={() => onSendMessage("Add replays")} />
          <ActionChip icon={<Link2 size={16} />} label="Get study URL" onClick={() => onSendMessage("Get study URL")} />
        </div>
      </div>

      {/* User bubble */}
      <UserBubble content="Buddy, review question **2** and **4** and make it matching **MyCompany** tone of voice" />

      {/* Bot recommendations */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold" style={{ color: textPrimary }}>
          2. Answer options: recommendations
        </h3>
        <p className="text-sm" style={{ color: textPrimary }}>
          Current options are logically ordered, but:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: textPrimary }}>
          <li>Some are wordy</li>
          <li>&ldquo;Once or twice&rdquo; vs &ldquo;occasionally&rdquo; can feel fuzzy</li>
          <li>
            &ldquo;I&rsquo;m not sure&rdquo; is useful but should be last (you already did this
            right 👍)
          </li>
        </ul>

        <h3 className="text-base font-bold" style={{ color: textPrimary }}>
          Recommended answer set (clean + behavioral)
        </h3>
        <h4 className="text-sm font-bold" style={{ color: textPrimary }}>
          Best overall set
        </h4>
        <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: textPrimary }}>
          <li>I haven&rsquo;t shared my Linktree yet</li>
          <li>I&rsquo;ve shared it a few times, but not consistently</li>
          <li>I share it occasionally</li>
          <li>I share it regularly</li>
          <li>I&rsquo;m not sure</li>
        </ul>

        <h4 className="text-sm font-bold" style={{ color: textPrimary }}>
          Why this works
        </h4>
        <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: textPrimary }}>
          <li>&ldquo;Yet&rdquo; subtly removes shame</li>
        </ul>

        <div className="flex gap-2 pt-1">
          <button
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 cursor-pointer"
            onClick={() => onSendMessage("Approve the recommended changes")}
          >
            <Check size={16} className="text-emerald-600" />
            Approve
            <ChevronDown size={14} className="text-emerald-600" />
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium cursor-pointer"
            style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
            onClick={() => onSendMessage("Regenerate the recommendations")}
          >
            <Pencil size={16} />
            Regenerate
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── User message bubble ─── */
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="rounded-2xl px-4 py-3"
        style={{
          background: goldBgLight,
          border: `1px solid ${goldBorder}`,
          maxWidth: "85%",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>
          {renderInlineMarkdown(content)}
        </p>
      </div>
    </div>
  );
}

/* ─── Assistant message with markdown rendering ─── */
function AssistantMessage({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 size={16} color={textSecondary} className="animate-spin" />
        <span className="text-sm" style={{ color: textSecondary }}>
          Thinking...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5" style={{ color: textPrimary }}>
      {renderMarkdown(content)}
      {isStreaming && (
        <span
          className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm"
          style={{ background: gold }}
        />
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Markdown rendering helpers
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Handle **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${listKey++}`}
          className="list-disc pl-5 text-sm space-y-1"
          style={{ color: textPrimary }}
        >
          {listItems}
        </ul>,
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Bullet point
    if (line.match(/^[-*•]\s/)) {
      listItems.push(<li key={i}>{renderInlineMarkdown(line.replace(/^[-*•]\s/, ""))}</li>);
      continue;
    }

    flushList();

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-base font-bold pt-2" style={{ color: textPrimary }}>
          {renderInlineMarkdown(line.slice(3))}
        </h3>,
      );
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-bold pt-1" style={{ color: textPrimary }}>
          {renderInlineMarkdown(line.slice(4))}
        </h4>,
      );
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold pt-2" style={{ color: textPrimary }}>
          {renderInlineMarkdown(line.slice(2))}
        </h3>,
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed" style={{ color: textPrimary }}>
        {renderInlineMarkdown(line)}
      </p>,
    );
  }

  flushList();
  return elements;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RIGHT PANEL – Survey Builder (data-driven)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function RightPanel({
  questions,
  setQuestions,
  selectedQuestionId,
  setSelectedQuestionId,
  studyGoal,
  setStudyGoal,
}: {
  questions: SurveyQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<SurveyQuestion[]>>;
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  studyGoal: string;
  setStudyGoal: (goal: string) => void;
}) {
  const handleSelectQuestion = (id: string) => {
    setSelectedQuestionId(id);
  };

  const handleAddQuestion = () => {
    const newQ: SurveyQuestion = {
      id: generateId(),
      text: "",
      description: "",
      required: false,
      choices: [{ id: generateId(), text: "" }],
      conditions: [],
      hasShuffleIcon: false,
      hasWarningIcon: false,
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
  };

  const handleToggleRequired = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q)),
    );
  };

  const handleUpdateText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q)),
    );
  };

  const handleUpdateDescription = (id: string, description: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, description } : q)),
    );
  };

  const handleUpdateChoice = (qId: string, choiceId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              choices: q.choices.map((c) =>
                c.id === choiceId ? { ...c, text } : c,
              ),
            }
          : q,
      ),
    );
  };

  const handleAddChoice = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, choices: [...q.choices, { id: generateId(), text: "" }] }
          : q,
      ),
    );
  };

  const handleDeleteChoice = (qId: string, choiceId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || q.choices.length <= 1) return q;
        return { ...q, choices: q.choices.filter((c) => c.id !== choiceId) };
      }),
    );
  };

  const handleAddCondition = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              conditions: [
                ...q.conditions,
                {
                  id: generateId(),
                  sourceQuestionId: "",
                  sourceQuestionLabel: "Select question",
                  operator: "=",
                  value: "Select value",
                },
              ],
            }
          : q,
      ),
    );
  };

  const handleDeleteCondition = (qId: string, condId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, conditions: q.conditions.filter((c) => c.id !== condId) }
          : q,
      ),
    );
  };

  const handleUpdateCondition = (
    qId: string,
    condId: string,
    updates: Partial<Condition>,
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              conditions: q.conditions.map((c) =>
                c.id === condId ? { ...c, ...updates } : c,
              ),
            }
          : q,
      ),
    );
  };

  const handleDuplicateQuestion = () => {
    if (!selectedQuestionId) return;
    const idx = questions.findIndex((q) => q.id === selectedQuestionId);
    if (idx === -1) return;
    const original = questions[idx]!;
    const clone: SurveyQuestion = {
      ...original,
      id: generateId(),
      choices: original.choices.map((c) => ({ ...c, id: generateId() })),
      conditions: original.conditions.map((c) => ({ ...c, id: generateId() })),
    };
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setSelectedQuestionId(clone.id);
  };

  const handleShuffleQuestions = () => {
    setQuestions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr;
    });
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden" style={{ background: bgSecondary }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 bg-white shrink-0"
        style={{ height: 56, borderBottom: `1px solid ${borderDefault}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: gold }}
          >
            <ClipboardList size={16} color="white" />
          </div>
          <span className="text-lg font-semibold" style={{ color: textPrimary }}>
            Share Behavior Research
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium cursor-pointer bg-white"
            style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
          >
            <Maximize2 size={16} />
            Preview
          </button>
          <button
            className="inline-flex items-center h-9 px-5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: gold, border: `1px solid ${goldBorder}`, color: textPrimary }}
          >
            Continue to Audience
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Study Goal Banner */}
        <StudyGoalBanner value={studyGoal} onChange={setStudyGoal} />

        {/* Toolbar */}
        <div className="flex items-center gap-3 mt-4">
          <IconBtn onClick={handleDuplicateQuestion}>
            <Copy size={16} color={textSecondary} />
          </IconBtn>
          <button
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              height: 40,
              padding: "0 16px",
              background: gold,
              border: `1px solid ${goldBorder}`,
              color: textPrimary,
            }}
            onClick={handleAddQuestion}
          >
            Add Question
            <Plus size={16} />
          </button>
          <IconBtn>
            <Globe size={16} color={textSecondary} />
          </IconBtn>
          <IconBtn onClick={handleShuffleQuestions}>
            <Shuffle size={16} color={textSecondary} />
          </IconBtn>
          <div className="flex-1" />
          <IconBtn>
            <Maximize2 size={16} color={textSecondary} />
          </IconBtn>
        </div>

        {/* Questions */}
        <div className="mt-4 space-y-2">
          {questions.map((q, index) =>
            q.id === selectedQuestionId ? (
              <ExpandedQuestion
                key={q.id}
                question={q}
                index={index}
                allQuestions={questions}
                onToggleRequired={() => handleToggleRequired(q.id)}
                onUpdateText={(text) => handleUpdateText(q.id, text)}
                onUpdateDescription={(desc) => handleUpdateDescription(q.id, desc)}
                onUpdateChoice={(choiceId, text) => handleUpdateChoice(q.id, choiceId, text)}
                onAddChoice={() => handleAddChoice(q.id)}
                onDeleteChoice={(choiceId) => handleDeleteChoice(q.id, choiceId)}
                onAddCondition={() => handleAddCondition(q.id)}
                onDeleteCondition={(condId) => handleDeleteCondition(q.id, condId)}
                onUpdateCondition={(condId, updates) => handleUpdateCondition(q.id, condId, updates)}
              />
            ) : (
              <CollapsedQuestion
                key={q.id}
                question={q}
                index={index}
                onClick={() => handleSelectQuestion(q.id)}
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
}

/* ─── Collapsed Question ─── */
function CollapsedQuestion({
  question,
  index,
  onClick,
}: {
  question: SurveyQuestion;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center bg-white rounded-2xl px-4 cursor-pointer"
      style={{ height: 48, border: `1px solid ${borderDefault}` }}
      onClick={onClick}
    >
      <span className="text-sm mr-3" style={{ color: textSecondary }}>{index + 1}</span>
      <ClipboardList size={16} color={textSecondary} className="mr-2" />
      <span className="text-sm flex-1" style={{ color: textPrimary }}>
        {question.text || "Untitled question"}
      </span>
      {question.hasShuffleIcon && <Shuffle size={16} color={gold} className="mr-3" />}
      {question.hasWarningIcon && <AlertTriangle size={16} color={gold} />}
    </div>
  );
}

/* ─── Expanded Question ─── */
function ExpandedQuestion({
  question,
  index,
  allQuestions,
  onToggleRequired,
  onUpdateText,
  onUpdateDescription,
  onUpdateChoice,
  onAddChoice,
  onDeleteChoice,
  onAddCondition,
  onDeleteCondition,
  onUpdateCondition,
}: {
  question: SurveyQuestion;
  index: number;
  allQuestions: SurveyQuestion[];
  onToggleRequired: () => void;
  onUpdateText: (text: string) => void;
  onUpdateDescription: (desc: string) => void;
  onUpdateChoice: (choiceId: string, text: string) => void;
  onAddChoice: () => void;
  onDeleteChoice: (choiceId: string) => void;
  onAddCondition: () => void;
  onDeleteCondition: (condId: string) => void;
  onUpdateCondition: (condId: string, updates: Partial<Condition>) => void;
}) {
  // Build source question options (exclude current question)
  const sourceQuestionOptions = allQuestions
    .filter((q) => q.id !== question.id)
    .map((q, i) => ({
      label: `${allQuestions.indexOf(q) + 1}. ${q.text || "Untitled question"}`,
      value: q.id,
    }));

  // Build value options based on selected source question's choices
  const getValueOptions = (cond: Condition) => {
    const sourceQ = allQuestions.find((q) => q.id === cond.sourceQuestionId);
    const filledChoices = sourceQ?.choices.filter((c) => c.text.trim()) ?? [];
    if (filledChoices.length > 0) {
      return filledChoices.map((c) => ({ label: c.text, value: c.text }));
    }
    return [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
      { label: "Maybe", value: "Maybe" },
    ];
  };

  return (
    <div className="bg-white rounded-2xl" style={{ border: `2px solid ${textPrimary}` }}>
      {/* Header */}
      <div className="flex items-center px-4" style={{ height: 48 }}>
        <span className="text-sm mr-3" style={{ color: textSecondary }}>{index + 1}</span>
        <ClipboardList size={16} color={textSecondary} className="mr-2" />
        <span className="text-sm flex-1" style={{ color: textPrimary }}>
          {question.text || "Untitled question"}
        </span>
        <span className="text-sm mr-2" style={{ color: textSecondary }}>Required</span>
        <div
          className="relative rounded-full cursor-pointer mr-3"
          style={{
            width: 40,
            height: 22,
            background: question.required ? gold : "#D1D5DB",
          }}
          onClick={onToggleRequired}
        >
          <div
            className="absolute bg-white rounded-full shadow"
            style={{
              width: 18,
              height: 18,
              top: 2,
              ...(question.required ? { right: 2 } : { left: 2 }),
            }}
          />
        </div>
        <MoreHorizontal size={16} color={textSecondary} className="cursor-pointer" />
      </div>

      {/* Condition Area */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${borderDefault}` }}>
        {question.conditions.map((cond) => (
          <div key={cond.id} className="flex items-center gap-3 flex-wrap mb-2">
            <span className="text-sm" style={{ color: textSecondary }}>Display when</span>
            <DropdownSelect
              value={cond.sourceQuestionLabel}
              options={sourceQuestionOptions}
              onSelect={(val) => {
                const srcQ = allQuestions.find((q) => q.id === val);
                onUpdateCondition(cond.id, {
                  sourceQuestionId: val,
                  sourceQuestionLabel: srcQ?.text || "Untitled question",
                });
              }}
            />
            <DropdownSelect
              value={cond.operator}
              options={OPERATORS.map((op) => ({ label: op, value: op }))}
              onSelect={(val) => onUpdateCondition(cond.id, { operator: val })}
            />
            <DropdownSelect
              value={cond.value}
              options={getValueOptions(cond)}
              onSelect={(val) => onUpdateCondition(cond.id, { value: val })}
            />
            <Trash2
              size={16}
              color={textSecondary}
              className="cursor-pointer"
              onClick={() => onDeleteCondition(cond.id)}
            />
          </div>
        ))}

        <button
          className="flex items-center gap-2 mt-1 text-sm font-medium cursor-pointer bg-transparent border-none"
          style={{ color: textPrimary }}
          onClick={onAddCondition}
        >
          <Plus size={14} />
          Add condition
        </button>

        <button
          className="flex items-center gap-2 mt-3 text-sm cursor-pointer bg-transparent border-none"
          style={{ color: textSecondary }}
        >
          <Eye size={14} />
          Add Display logic
          <HelpCircle size={14} />
        </button>
      </div>

      {/* Question Editor */}
      <div className="px-4 py-4 space-y-4" style={{ borderTop: `1px solid ${borderDefault}` }}>
        <div>
          <label className="text-sm font-medium" style={{ color: textPrimary }}>Question*</label>
          <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${borderDefault}` }}>
            <FormatToolbar showBold={false} />
            <input
              type="text"
              placeholder="How satisfied are you with..."
              className="w-full px-3 py-2 text-sm outline-none bg-transparent"
              style={{ color: textPrimary, height: 40 }}
              value={question.text}
              onChange={(e) => onUpdateText(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium" style={{ color: textPrimary }}>Description</label>
          <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${borderDefault}` }}>
            <FormatToolbar showBold={true} />
            <input
              type="text"
              placeholder="This will help us improve your experience."
              className="w-full px-3 py-2 text-sm outline-none bg-transparent"
              style={{ color: textPrimary, height: 40 }}
              value={question.description}
              onChange={(e) => onUpdateDescription(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium" style={{ color: textPrimary }}>Choices*</label>
          <div className="mt-2 space-y-2">
            {question.choices.map((choice, i) => (
              <ChoiceRow
                key={choice.id}
                value={choice.text}
                placeholder={`Option ${i + 1}`}
                onChange={(text) => onUpdateChoice(choice.id, text)}
                onDelete={
                  question.choices.length > 1
                    ? () => onDeleteChoice(choice.id)
                    : undefined
                }
              />
            ))}
            <button
              className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none pt-1"
              style={{ color: textPrimary }}
              onClick={onAddChoice}
            >
              <Plus size={14} />
              Add option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Editable Study Goal Banner ─── */
function StudyGoalBanner({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div
      className="flex items-center gap-3 rounded-2xl mt-4 px-4 cursor-pointer group"
      style={{
        background: goldBgLight,
        border: `1px solid ${goldBorder}`,
        minHeight: 48,
      }}
      onClick={() => {
        if (!editing) {
          setDraft(value);
          setEditing(true);
        }
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 28, height: 28, background: "#3B9B6E" }}
      >
        <span className="text-white text-xs font-bold">?</span>
      </div>
      {editing ? (
        <div className="flex-1 flex items-center gap-2 py-2">
          <strong className="text-sm shrink-0" style={{ color: textPrimary }}>
            Study Goal:
          </strong>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: textPrimary }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <p className="text-sm py-3 flex-1" style={{ color: textPrimary }}>
          <strong>Study Goal:</strong>&nbsp;{value}
          <Pencil
            size={14}
            color={textSecondary}
            className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </p>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared small components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ActionChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm cursor-pointer bg-white"
      style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      className="flex items-center justify-center rounded-lg cursor-pointer bg-white"
      style={{ width: 40, height: 40, border: `1px solid ${borderDefault}` }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DropdownPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer"
      style={{ border: `1px solid ${borderDefault}` }}
    >
      {children}
    </div>
  );
}

function DropdownSelect({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer"
        style={{ border: `1px solid ${open ? textPrimary : borderDefault}` }}
        onClick={() => setOpen(!open)}
      >
        <span
          className="text-sm max-w-[180px] truncate"
          style={{ color: textPrimary }}
        >
          {value}
        </span>
        <ChevronDown
          size={14}
          color={textSecondary}
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        />
      </div>
      {open && (
        <div
          className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden"
          style={{
            border: `1px solid ${borderDefault}`,
            zIndex: 50,
            minWidth: 180,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className="px-3 py-2 text-sm cursor-pointer truncate"
              style={{
                color: opt.value === value || opt.label === value ? textPrimary : textSecondary,
                background: opt.value === value || opt.label === value ? goldBgLight : undefined,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = goldBgLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  opt.value === value || opt.label === value ? goldBgLight : "transparent";
              }}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm" style={{ color: textSecondary }}>
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FormatToolbar({ showBold }: { showBold: boolean }) {
  return (
    <div
      className="flex items-center gap-1 px-3"
      style={{ height: 36, borderBottom: `1px solid ${borderDefault}` }}
    >
      {showBold && (
        <button className="p-1 cursor-pointer bg-transparent border-none">
          <Bold size={14} color={textSecondary} />
        </button>
      )}
      <button className="p-1 cursor-pointer bg-transparent border-none">
        <Italic size={14} color={textSecondary} />
      </button>
      <button className="p-1 cursor-pointer bg-transparent border-none">
        <Underline size={14} color={textSecondary} />
      </button>
      <button className="p-1 cursor-pointer bg-transparent border-none">
        <ListOrdered size={14} color={textSecondary} />
      </button>
      <button className="p-1 cursor-pointer bg-transparent border-none">
        <List size={14} color={textSecondary} />
      </button>
      <button className="p-1 cursor-pointer bg-transparent border-none">
        <Link2 size={14} color={textSecondary} />
      </button>
      <button
        className="inline-flex items-center gap-1 px-2 py-1 text-xs cursor-pointer bg-transparent border-none"
        style={{ color: textSecondary }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 4h3l2 3-2 3H3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 4h3l-2 3 2 3H8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Piping
      </button>
    </div>
  );
}

function ChoiceRow({
  value,
  placeholder,
  onChange,
  onDelete,
}: {
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="flex-1 px-3 text-sm outline-none bg-transparent rounded-lg"
        style={{ height: 40, border: `1px solid ${borderDefault}`, color: textPrimary }}
        onChange={(e) => onChange(e.target.value)}
      />
      <Trash2
        size={16}
        color={onDelete ? textSecondary : borderDefault}
        className={onDelete ? "cursor-pointer shrink-0" : "shrink-0"}
        onClick={onDelete}
      />
    </div>
  );
}

export default App;
