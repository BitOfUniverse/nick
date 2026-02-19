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
} from "lucide-react";

/* ─── Color Tokens ─── */
const gold = "#F9C600";
const goldBorder = "#FAD133";
const goldBgLight = "#FEF9E7";
const textPrimary = "#082330";
const textSecondary = "#506067";
const borderDefault = "#E2E3E1";
const bgSecondary = "#F9F9F8";

export function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LEFT PANEL – AI Editing Agent
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LeftPanel() {
  return (
    <aside
      className="flex flex-col h-screen bg-white"
      style={{ width: 400, minWidth: 400, borderRight: `1px solid ${borderDefault}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 56, borderBottom: `1px solid ${borderDefault}` }}
      >
        <div className="flex items-center gap-3">
          <Menu size={20} color={textPrimary} />
          <span className="text-[17px] font-semibold" style={{ color: textPrimary }}>
            AI Editing Agent
          </span>
        </div>
        <PanelLeftClose size={20} color={textSecondary} className="cursor-pointer" />
      </div>

      {/* Scrollable Chat Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Bot greeting */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>
            Done! Your study is ready to review and launch.
            <br />
            What would you like to do next?
          </p>
          <div className="flex gap-2 flex-wrap">
            <ActionChip icon={<Eye size={16} />} label="Show preview" />
            <ActionChip icon={<RotateCcw size={16} />} label="Add replays" />
            <ActionChip icon={<Link2 size={16} />} label="Get study URL" />
          </div>
        </div>

        {/* User message bubble */}
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
              Buddy, review question <strong>2</strong> and <strong>4</strong> and make it
              matching <strong>MyCompany</strong> tone of voice
            </p>
          </div>
        </div>

        {/* Bot recommendation response */}
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

          {/* Approve / Regenerate */}
          <div className="flex gap-2 pt-1">
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 cursor-pointer">
              <Check size={16} className="text-emerald-600" />
              Approve
              <ChevronDown size={14} className="text-emerald-600" />
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium cursor-pointer"
              style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
            >
              <Pencil size={16} />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${borderDefault}` }}>
        <div
          className="flex items-center rounded-2xl px-4"
          style={{ border: `1px solid ${borderDefault}`, height: 48 }}
        >
          <input
            type="text"
            placeholder="Ask almost anything"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: textPrimary }}
          />
          <div className="flex items-center gap-3">
            <Paperclip size={18} color={textSecondary} className="cursor-pointer" />
            <button
              className="flex items-center justify-center rounded-full cursor-pointer"
              style={{ width: 32, height: 32, background: gold }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Small outline chip button used in the chat */
function ActionChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm cursor-pointer bg-white"
      style={{ border: `1px solid ${borderDefault}`, color: textPrimary }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RIGHT PANEL – Survey Builder
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function RightPanel() {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden" style={{ background: bgSecondary }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 bg-white"
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
        <div
          className="flex items-center gap-3 rounded-2xl mt-4 px-4"
          style={{
            background: goldBgLight,
            border: `1px solid ${goldBorder}`,
            minHeight: 48,
          }}
        >
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 28, height: 28, background: "#3B9B6E" }}
          >
            <span className="text-white text-xs font-bold">?</span>
          </div>
          <p className="text-sm py-3" style={{ color: textPrimary }}>
            <strong>Study Goal:</strong>&nbsp; The goal of this study is to understand why some
            creators delay or avoid sharing...
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mt-4">
          <IconBtn>
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
          >
            Add Question
            <Plus size={16} />
          </button>
          <IconBtn>
            <Globe size={16} color={textSecondary} />
          </IconBtn>
          <IconBtn>
            <Shuffle size={16} color={textSecondary} />
          </IconBtn>
          <div className="flex-1" />
          <IconBtn>
            <Maximize2 size={16} color={textSecondary} />
          </IconBtn>
        </div>

        {/* Questions */}
        <div className="mt-4 space-y-2">
          {/* Question 1 – collapsed */}
          <div
            className="flex items-center bg-white rounded-2xl px-4"
            style={{ height: 48, border: `1px solid ${borderDefault}` }}
          >
            <span className="text-sm mr-3" style={{ color: textSecondary }}>
              1
            </span>
            <ClipboardList size={16} color={textSecondary} className="mr-2" />
            <span className="text-sm flex-1" style={{ color: textPrimary }}>
              What&rsquo;s been holding you back from sharing your Linktree so far?
            </span>
            <Shuffle size={16} color={gold} className="mr-3" />
            <AlertTriangle size={16} color={gold} />
          </div>

          {/* Question 2 – expanded / selected */}
          <div
            className="bg-white rounded-2xl"
            style={{ border: `2px solid ${textPrimary}` }}
          >
            {/* Q2 Header */}
            <div className="flex items-center px-4" style={{ height: 48 }}>
              <span className="text-sm mr-3" style={{ color: textSecondary }}>
                2
              </span>
              <ClipboardList size={16} color={textSecondary} className="mr-2" />
              <span className="text-sm flex-1" style={{ color: textPrimary }}>
                Which of the following best describes your current sharing status?
              </span>
              <span className="text-sm mr-2" style={{ color: textSecondary }}>
                Required
              </span>
              {/* Toggle */}
              <div
                className="relative rounded-full cursor-pointer mr-3"
                style={{ width: 40, height: 22, background: gold }}
              >
                <div
                  className="absolute bg-white rounded-full shadow"
                  style={{ width: 18, height: 18, top: 2, right: 2 }}
                />
              </div>
              <MoreHorizontal size={16} color={textSecondary} className="cursor-pointer" />
            </div>

            {/* Condition Area */}
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${borderDefault}` }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm" style={{ color: textSecondary }}>
                  Display when
                </span>
                <DropdownPill>
                  <span className="text-sm" style={{ color: textSecondary }}>
                    1
                  </span>
                  <ClipboardList size={14} color={textSecondary} />
                  <span className="text-sm" style={{ color: textPrimary }}>
                    Do you play music?
                  </span>
                  <ChevronDown size={14} color={textSecondary} />
                </DropdownPill>
                <DropdownPill>
                  <span className="text-sm" style={{ color: textPrimary }}>
                    =
                  </span>
                  <ChevronDown size={14} color={textSecondary} />
                </DropdownPill>
                <DropdownPill>
                  <span className="text-sm" style={{ color: textPrimary }}>
                    Yes
                  </span>
                  <ChevronDown size={14} color={textSecondary} />
                </DropdownPill>
                <Trash2 size={16} color={textSecondary} className="cursor-pointer" />
              </div>

              <button
                className="flex items-center gap-2 mt-3 text-sm font-medium cursor-pointer bg-transparent border-none"
                style={{ color: textPrimary }}
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
            <div
              className="px-4 py-4 space-y-4"
              style={{ borderTop: `1px solid ${borderDefault}` }}
            >
              {/* Question field */}
              <div>
                <label className="text-sm font-medium" style={{ color: textPrimary }}>
                  Question*
                </label>
                <div
                  className="mt-2 rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${borderDefault}` }}
                >
                  <FormatToolbar showBold={false} />
                  <input
                    type="text"
                    placeholder="How satisfied are you with..."
                    className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                    style={{ color: textPrimary, height: 40 }}
                  />
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="text-sm font-medium" style={{ color: textPrimary }}>
                  Description
                </label>
                <div
                  className="mt-2 rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${borderDefault}` }}
                >
                  <FormatToolbar showBold={true} />
                  <input
                    type="text"
                    placeholder="This will help us improve your experience."
                    className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                    style={{ color: textPrimary, height: 40 }}
                  />
                </div>
              </div>

              {/* Choices */}
              <div>
                <label className="text-sm font-medium" style={{ color: textPrimary }}>
                  Choices*
                </label>
                <div className="mt-2 space-y-2">
                  <ChoiceRow placeholder="Option 1" />
                  <ChoiceRow placeholder="Option 2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Shared small components ─── */

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="flex items-center justify-center rounded-lg cursor-pointer bg-white"
      style={{ width: 40, height: 40, border: `1px solid ${borderDefault}` }}
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

function ChoiceRow({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 px-3 text-sm outline-none bg-transparent rounded-lg"
        style={{
          height: 40,
          border: `1px solid ${borderDefault}`,
          color: textPrimary,
        }}
      />
      <Trash2 size={16} color={textSecondary} className="cursor-pointer shrink-0" />
    </div>
  );
}

export default App;
