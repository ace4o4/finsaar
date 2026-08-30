"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import TurndownService from "turndown";
import mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Table as TableIcon,
  Minus,
  UploadCloud,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Type,
  FileCode2,
  Plus,
  Trash2,
  Rows3,
  Columns3,
} from "lucide-react";

// ── Turndown (HTML → Markdown) ──────────────────────────────────────
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Handle tables
turndown.addRule("tableCell", {
  filter: ["th", "td"],
  replacement: (content) => ` ${content.trim()} |`,
});
turndown.addRule("tableRow", {
  filter: "tr",
  replacement: (content) => `|${content}\n`,
});
turndown.addRule("table", {
  filter: "table",
  replacement: (_content, node) => {
    const el = node as HTMLTableElement;
    const rows = Array.from(el.rows);
    if (rows.length === 0) return "";
    const headerCells = Array.from(rows[0].cells);
    const headerRow = `| ${headerCells.map((c) => c.textContent?.trim() || "").join(" | ")} |`;
    const separator = `| ${headerCells.map(() => "---").join(" | ")} |`;
    const bodyRows = rows.slice(1).map((r) => {
      const cells = Array.from(r.cells);
      return `| ${cells.map((c) => c.textContent?.trim() || "").join(" | ")} |`;
    });
    return `\n${headerRow}\n${separator}\n${bodyRows.join("\n")}\n\n`;
  },
});

// ── Simple Markdown → HTML (for loading into TipTap) ────────────────
function markdownToHtml(md: string): string {
  let html = md;
  // headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // blockquote
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  // hr
  html = html.replace(/^---$/gm, "<hr>");
  // code blocks
  html = html.replace(/```[\s\S]*?\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  // inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // markdown tables
  html = html.replace(
    /(?:^\|.+\|$\n?)+/gm,
    (match) => {
      const lines = match.trim().split("\n").filter((l) => l.trim());
      if (lines.length < 2) return match;
      // check for separator line
      const sepIdx = lines.findIndex((l) => /^\|[\s\-:|]+\|$/.test(l));
      const headerLine = sepIdx > 0 ? lines[sepIdx - 1] : lines[0];
      const dataStart = sepIdx >= 0 ? sepIdx + 1 : 1;
      const parseCells = (line: string) =>
        line.split("|").slice(1, -1).map((c) => c.trim());
      const headers = parseCells(headerLine);
      const rows = lines.slice(dataStart).map(parseCells);
      let table = "<table><thead><tr>";
      headers.forEach((h) => (table += `<th>${h}</th>`));
      table += "</tr></thead><tbody>";
      rows.forEach((r) => {
        table += "<tr>";
        r.forEach((c) => (table += `<td>${c}</td>`));
        table += "</tr>";
      });
      table += "</tbody></table>";
      return table;
    }
  );

  // unordered list
  html = html.replace(
    /(?:^[\-\*] .+$\n?)+/gm,
    (match) => {
      const items = match.trim().split("\n").map((l) => `<li>${l.replace(/^[\-\*] /, "")}</li>`);
      return `<ul>${items.join("")}</ul>`;
    }
  );
  // ordered list
  html = html.replace(
    /(?:^\d+\. .+$\n?)+/gm,
    (match) => {
      const items = match.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`);
      return `<ol>${items.join("")}</ol>`;
    }
  );

  // paragraphs — wrap remaining plain text lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^</.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

// ── Types ───────────────────────────────────────────────────────────
interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

// ── Table Size Picker ───────────────────────────────────────────────
function TableSizePicker({ onSelect, onClose }: { onSelect: (rows: number, cols: number) => void; onClose: () => void }) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 bg-white border border-[#E7E4DC] rounded-xl shadow-xl p-3 z-50"
    >
      <p className="text-[10px] font-semibold text-[#7A7F8C] uppercase tracking-wider mb-2 text-center">
        {hoverRow > 0 ? `${hoverRow} × ${hoverCol}` : "Select Size"}
      </p>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(8, 1fr)` }}>
        {Array.from({ length: 8 * 8 }).map((_, i) => {
          const r = Math.floor(i / 8) + 1;
          const c = (i % 8) + 1;
          const active = r <= hoverRow && c <= hoverCol;
          return (
            <button
              key={i}
              type="button"
              className={`w-5 h-5 rounded-[3px] border transition-all duration-75 ${
                active
                  ? "bg-[#B5723B] border-[#B5723B]"
                  : "bg-[#FAFAF8] border-[#E7E4DC] hover:border-[#B5723B]/40"
              }`}
              onMouseEnter={() => { setHoverRow(r); setHoverCol(c); }}
              onClick={() => onSelect(r, c)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Link Input Popup ────────────────────────────────────────────────
function LinkInput({ onSubmit, onClose, initialUrl }: { onSubmit: (url: string) => void; onClose: () => void; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl || "https://");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 bg-white border border-[#E7E4DC] rounded-xl shadow-xl p-3 z-50 w-72">
      <p className="text-[10px] font-semibold text-[#7A7F8C] uppercase tracking-wider mb-2">Insert Link</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(url); } if (e.key === "Escape") onClose(); }}
          className="flex-1 px-3 py-1.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-lg text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
          placeholder="https://example.com"
        />
        <button
          type="button"
          onClick={() => onSubmit(url)}
          className="px-3 py-1.5 bg-[#14213A] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3256] transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Toolbar Button ──────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? "bg-[#14213A] text-white"
          : "text-[#3a3f4d] hover:bg-[#E7E4DC]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const [mode, setMode] = useState<"rich" | "markdown">("rich");
  const [markdownContent, setMarkdownContent] = useState(content);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const tablePickerRef = useRef<HTMLDivElement>(null);
  const linkBtnRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#B5723B] underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your content here...\n\nUse the toolbar above to format text, insert tables, add links, and more. Or press Cmd+B for bold, Cmd+I for italic.",
      }),
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const md = turndown.turndown(html);
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[460px] p-6 text-[#14213A] leading-relaxed",
      },
    },
  });

  // Sync content from parent on initial load only
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (editor && content && !initialLoadDone.current) {
      const currentHtml = editor.getHTML();
      if (currentHtml === "<p></p>" && content.trim()) {
        editor.commands.setContent(markdownToHtml(content));
        initialLoadDone.current = true;
      }
    }
  }, [editor, content]);

  // Mode switch handler
  const handleModeSwitch = useCallback(
    (newMode: "rich" | "markdown") => {
      if (newMode === mode) return;

      if (newMode === "markdown" && editor) {
        // Rich → Markdown: serialize HTML to markdown
        const html = editor.getHTML();
        const md = turndown.turndown(html);
        setMarkdownContent(md);
      } else if (newMode === "rich" && editor) {
        // Markdown → Rich: parse markdown to HTML and load into editor
        const html = markdownToHtml(markdownContent);
        editor.commands.setContent(html);
      }
      setMode(newMode);
    },
    [mode, editor, markdownContent]
  );

  // Markdown textarea change
  const handleMarkdownChange = useCallback(
    (value: string) => {
      setMarkdownContent(value);
      onChange(value);
    },
    [onChange]
  );

  // Insert markdown syntax in textarea
  const insertMarkdownSyntax = useCallback(
    (syntaxStart: string, syntaxEnd = "") => {
      const textarea = document.getElementById("rich-editor-md-textarea") as HTMLTextAreaElement;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = markdownContent.substring(start, end);
      const replacement = `${syntaxStart}${selected || "text"}${syntaxEnd}`;
      const newContent = markdownContent.substring(0, start) + replacement + markdownContent.substring(end);
      handleMarkdownChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + (selected.length || 4));
      }, 50);
    },
    [markdownContent, handleMarkdownChange]
  );

  // Insert table (markdown mode)
  const insertMarkdownTable = useCallback(
    (rows: number, cols: number) => {
      const header = `| ${Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(" | ")} |`;
      const sep = `| ${Array.from({ length: cols }, () => "---").join(" | ")} |`;
      const bodyRows = Array.from({ length: rows - 1 }, () =>
        `| ${Array.from({ length: cols }, () => "  ").join(" | ")} |`
      );
      const table = `\n${header}\n${sep}\n${bodyRows.join("\n")}\n\n`;

      const textarea = document.getElementById("rich-editor-md-textarea") as HTMLTextAreaElement;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const newContent = markdownContent.substring(0, start) + table + markdownContent.substring(start);
      handleMarkdownChange(newContent);
    },
    [markdownContent, handleMarkdownChange]
  );

  // Keyboard shortcuts in markdown mode
  const handleMarkdownKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "b") { e.preventDefault(); insertMarkdownSyntax("**", "**"); }
      if (mod && e.key === "i") { e.preventDefault(); insertMarkdownSyntax("*", "*"); }
      if (mod && e.key === "u") { e.preventDefault(); insertMarkdownSyntax("<u>", "</u>"); }
      if (mod && e.key === "k") { e.preventDefault(); insertMarkdownSyntax("[", "](https://)"); }
      // Tab in tables
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const newContent = markdownContent.substring(0, start) + "  " + markdownContent.substring(start);
        handleMarkdownChange(newContent);
        setTimeout(() => { textarea.setSelectionRange(start + 2, start + 2); }, 0);
      }
    },
    [insertMarkdownSyntax, markdownContent, handleMarkdownChange]
  );

  // DOCX / MD import
  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.name.endsWith(".docx")) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (mode === "rich" && editor) {
            editor.commands.setContent(result.value);
            const md = turndown.turndown(result.value);
            onChange(md);
          } else {
            const md = turndown.turndown(result.value);
            handleMarkdownChange(md);
          }
          setImportFeedback("DOCX imported successfully!");
        } catch {
          setImportFeedback("Failed to parse DOCX file.");
        }
      } else {
        // .md or .txt
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === "string") {
            if (mode === "rich" && editor) {
              editor.commands.setContent(markdownToHtml(text));
              onChange(text);
            } else {
              handleMarkdownChange(text);
            }
            setImportFeedback("File imported successfully!");
          }
        };
        reader.readAsText(file);
      }
      e.target.value = "";
      setTimeout(() => setImportFeedback(null), 3000);
    },
    [mode, editor, onChange, handleMarkdownChange]
  );

  // Table select handler
  const handleTableSelect = useCallback(
    (rows: number, cols: number) => {
      if (mode === "rich" && editor) {
        editor
          .chain()
          .focus()
          .insertTable({ rows, cols, withHeaderRow: true })
          .run();
      } else {
        insertMarkdownTable(rows, cols);
      }
      setShowTablePicker(false);
    },
    [mode, editor, insertMarkdownTable]
  );

  // Link insert handler
  const handleLinkInsert = useCallback(
    (url: string) => {
      if (mode === "rich" && editor) {
        if (editor.state.selection.empty) {
          editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
        } else {
          editor.chain().focus().setLink({ href: url }).run();
        }
      } else {
        insertMarkdownSyntax("[", `](${url})`);
      }
      setShowLinkInput(false);
    },
    [mode, editor, insertMarkdownSyntax]
  );

  if (!editor) return null;

  const isRich = mode === "rich";

  return (
    <div className="bg-white rounded-3xl border border-[#E7E4DC] shadow-sm overflow-hidden">
      {/* Top Bar: Mode Switch + Import */}
      <div className="p-3 border-b border-[#E7E4DC] flex items-center justify-between gap-3 bg-[#FAFAF8]">
        {/* Mode Toggle */}
        <div className="flex bg-white border border-[#E7E4DC] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeSwitch("rich")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRich ? "bg-[#14213A] text-white" : "text-[#7A7F8C] hover:text-[#14213A]"
            }`}
          >
            <Type size={13} /> Rich Text
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("markdown")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              !isRich ? "bg-[#14213A] text-white" : "text-[#7A7F8C] hover:text-[#14213A]"
            }`}
          >
            <FileCode2 size={13} /> Markdown
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Import feedback */}
          {importFeedback && (
            <span className="text-xs font-semibold text-[#0E9F6E] animate-pulse">{importFeedback}</span>
          )}
          {/* Import button */}
          <button
            type="button"
            onClick={() => document.getElementById("rich-editor-file-import")?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors flex items-center gap-1.5 border border-[#E7E4DC]"
            title="Import from DOCX or Markdown file"
          >
            <UploadCloud size={14} /> Import File
          </button>
          <input
            type="file"
            id="rich-editor-file-import"
            className="hidden"
            accept=".md,.txt,.docx"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 px-3 border-b border-[#E7E4DC] flex flex-wrap items-center gap-0.5 bg-white">
        {/* Undo / Redo */}
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().undo().run() : undefined}
          disabled={isRich ? !editor.can().undo() : true}
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().redo().run() : undefined}
          disabled={isRich ? !editor.can().redo() : true}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 size={15} />
        </ToolbarBtn>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Text Formatting */}
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleBold().run() : insertMarkdownSyntax("**", "**")}
          active={isRich ? editor.isActive("bold") : false}
          title="Bold (Cmd+B)"
        >
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleItalic().run() : insertMarkdownSyntax("*", "*")}
          active={isRich ? editor.isActive("italic") : false}
          title="Italic (Cmd+I)"
        >
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleUnderline().run() : insertMarkdownSyntax("<u>", "</u>")}
          active={isRich ? editor.isActive("underline") : false}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={15} />
        </ToolbarBtn>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Headings */}
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleHeading({ level: 2 }).run() : insertMarkdownSyntax("## ", "")}
          active={isRich ? editor.isActive("heading", { level: 2 }) : false}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleHeading({ level: 3 }).run() : insertMarkdownSyntax("### ", "")}
          active={isRich ? editor.isActive("heading", { level: 3 }) : false}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarBtn>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleBulletList().run() : insertMarkdownSyntax("- ", "")}
          active={isRich ? editor.isActive("bulletList") : false}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleOrderedList().run() : insertMarkdownSyntax("1. ", "")}
          active={isRich ? editor.isActive("orderedList") : false}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </ToolbarBtn>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Block Formatting */}
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleBlockquote().run() : insertMarkdownSyntax("> ", "")}
          active={isRich ? editor.isActive("blockquote") : false}
          title="Quote"
        >
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().toggleCodeBlock().run() : insertMarkdownSyntax("```\n", "\n```")}
          active={isRich ? editor.isActive("codeBlock") : false}
          title="Code Block"
        >
          <Code size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => isRich ? editor.chain().focus().setHorizontalRule().run() : insertMarkdownSyntax("\n---\n", "")}
          title="Horizontal Rule"
        >
          <Minus size={15} />
        </ToolbarBtn>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Link */}
        <div className="relative" ref={linkBtnRef}>
          <ToolbarBtn
            onClick={() => {
              if (isRich && editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            active={isRich ? editor.isActive("link") : false}
            title="Insert Link (Cmd+K)"
          >
            <Link2 size={15} />
          </ToolbarBtn>
          {showLinkInput && (
            <LinkInput
              initialUrl={isRich ? editor.getAttributes("link").href : undefined}
              onSubmit={handleLinkInsert}
              onClose={() => setShowLinkInput(false)}
            />
          )}
        </div>

        {/* Table */}
        <div className="relative" ref={tablePickerRef}>
          <ToolbarBtn
            onClick={() => setShowTablePicker(!showTablePicker)}
            title="Insert Table"
          >
            <TableIcon size={15} />
          </ToolbarBtn>
          {showTablePicker && (
            <TableSizePicker
              onSelect={handleTableSelect}
              onClose={() => setShowTablePicker(false)}
            />
          )}
        </div>

        {/* Table editing controls (only when inside a table in rich mode) */}
        {isRich && editor.isActive("table") && (
          <>
            <div className="w-px h-6 bg-[#E7E4DC] mx-1" />
            <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row Below">
              <div className="flex items-center gap-0.5"><Rows3 size={13} /><Plus size={10} /></div>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column Right">
              <div className="flex items-center gap-0.5"><Columns3 size={13} /><Plus size={10} /></div>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
              <div className="flex items-center gap-0.5"><Rows3 size={13} /><Trash2 size={10} className="text-red-500" /></div>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
              <div className="flex items-center gap-0.5"><Columns3 size={13} /><Trash2 size={10} className="text-red-500" /></div>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
              <Trash2 size={14} className="text-red-500" />
            </ToolbarBtn>
          </>
        )}
      </div>

      {/* Editor Content Area */}
      {isRich ? (
        <div className="tiptap-editor-container">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="p-4">
          <textarea
            id="rich-editor-md-textarea"
            rows={22}
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            onKeyDown={handleMarkdownKeyDown}
            placeholder={placeholder || "Write your content in Markdown format...\n\n## Heading\n\nYour content here...\n\n- List item 1\n- List item 2"}
            className="w-full h-full min-h-[460px] bg-transparent border-0 font-mono text-sm text-[#14213A] placeholder-[#7A7F8C]/50 focus:outline-none leading-relaxed resize-y"
          />
        </div>
      )}
    </div>
  );
}
