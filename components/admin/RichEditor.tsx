"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { HexColorPicker } from "react-colorful";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TurndownService from "turndown";
import mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { uploadBlogImage } from "@/lib/blog-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import CharacterCount from "@tiptap/extension-character-count";
import { SlashCommand } from "./SlashCommand";
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
  Maximize,
  Minimize,
  Paperclip,
  Images,
  X,
  Palette,
  User,
} from "lucide-react";
import ImageResize from "tiptap-extension-resize-image";

// ── Turndown (HTML → Markdown) ──────────────────────────────────────
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Handle text color
turndown.addRule("textColor", {
  filter: (node) => node.nodeName === "SPAN" && !!node.style.color,
  replacement: (content, node) => {
    return `<span style="color: ${(node as HTMLElement).style.color}">${content}</span>`;
  },
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
  draftKey?: string;
}

// ── Table Size Picker ───────────────────────────────────────────────
function TableSizePicker({ onSelect, onClose }: { onSelect: (rows: number, cols: number) => void; onClose: () => void }) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const [customRows, setCustomRows] = useState("");
  const [customCols, setCustomCols] = useState("");
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
              className={`w-5 h-5 rounded-[3px] border transition-all duration-75 ${active
                  ? "bg-[#B5723B] border-[#B5723B]"
                  : "bg-[#FAFAF8] border-[#E7E4DC] hover:border-[#B5723B]/40"
                }`}
              onMouseEnter={() => { setHoverRow(r); setHoverCol(c); }}
              onClick={() => onSelect(r, c)}
            />
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E7E4DC] flex items-center gap-1.5">
        <input 
          type="number" 
          min="1" max="100" 
          placeholder="R" 
          value={customRows} 
          onChange={(e) => setCustomRows(e.target.value)} 
          className="w-12 h-7 text-xs bg-[#FAFAF8] border border-[#E7E4DC] rounded-md text-center focus:outline-none focus:border-[#B5723B]" 
        />
        <span className="text-xs text-[#7A7F8C]">×</span>
        <input 
          type="number" 
          min="1" max="100" 
          placeholder="C" 
          value={customCols} 
          onChange={(e) => setCustomCols(e.target.value)} 
          className="w-12 h-7 text-xs bg-[#FAFAF8] border border-[#E7E4DC] rounded-md text-center focus:outline-none focus:border-[#B5723B]" 
        />
        <button 
          onClick={() => {
            const r = parseInt(customRows);
            const c = parseInt(customCols);
            if (r > 0 && c > 0) onSelect(r, c);
          }}
          className="ml-auto px-2 py-1.5 bg-[#14213A] text-white text-[10px] uppercase tracking-wider font-bold rounded hover:bg-[#14213A]/90 transition-colors"
        >
          Add
        </button>
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

// ── Color Picker Popup ────────────────────────────────────────────────
const PRESET_COLORS = [
  "#14213A", // Navy
  "#B5723B", // Copper
  "#D9C9A8", // Sand
  "#EF4444", // Red
  "#22C55E", // Green
  "#64748B", // Slate
];

function ColorPickerPopup({ onSelect, onPreview, onClose, currentColor }: { onSelect: (color: string | null) => void; onPreview: (color: string) => void; onClose: () => void; currentColor?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState(currentColor || "#000000");
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finsaar_custom_colors");
      if (saved) setCustomColors(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleCustomColorAdd = (color: string) => {
    if (PRESET_COLORS.includes(color) || customColors.includes(color)) {
      onSelect(color);
      return;
    }
    // Keep max 6 custom colors
    const newColors = [...customColors, color].slice(-6);
    setCustomColors(newColors);
    localStorage.setItem("finsaar_custom_colors", JSON.stringify(newColors));
    onSelect(color);
  };

  const handleRemoveCustomColor = (e: React.MouseEvent, colorToRemove: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this custom color?")) {
      const newColors = customColors.filter(c => c !== colorToRemove);
      setCustomColors(newColors);
      localStorage.setItem("finsaar_custom_colors", JSON.stringify(newColors));
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onPreview(val);
    }
  };

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 bg-white border border-[#E7E4DC] rounded-xl shadow-xl p-3 z-50 w-56">
      <p className="text-[10px] font-semibold text-[#7A7F8C] uppercase tracking-wider mb-2">Text Color</p>
      
      {!showWheel ? (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(color);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? "border-gray-800" : "border-transparent shadow-sm"}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}

            {/* Custom Colors */}
            {customColors.map((color) => (
              <div key={`custom-${color}`} className="relative group w-6 h-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(color);
                  }}
                  className={`w-full h-full rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? "border-gray-800" : "border-transparent shadow-sm"}`}
                  style={{ backgroundColor: color }}
                  title={`Custom: ${color}`}
                />
                <button
                  type="button"
                  onClick={(e) => handleRemoveCustomColor(e, color)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10"
                  title="Remove"
                >
                  <X size={8} strokeWidth={3} />
                </button>
              </div>
            ))}

            {/* Custom Color Wheel Toggle */}
            <button
              type="button"
              title="Custom Color"
              className="w-6 h-6 rounded-full border border-dashed border-[#7A7F8C] flex items-center justify-center cursor-pointer hover:border-[#14213A] hover:bg-[#F3F2EE] transition-all group"
              onClick={(e) => {
                e.stopPropagation();
                setShowWheel(true);
              }}
            >
              <Plus size={12} className="text-[#7A7F8C] group-hover:text-[#14213A]" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="w-full px-3 py-1.5 bg-[#FAFAF8] text-[#14213A] border border-[#E7E4DC] rounded-lg text-xs font-semibold hover:bg-[#E7E4DC] transition-colors"
          >
            Remove Color
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <HexColorPicker 
            color={/^#[0-9A-F]{6}$/i.test(hexInput) ? hexInput : "#000000"}
            onChange={(newColor) => {
              setHexInput(newColor);
              onPreview(newColor);
            }} 
            style={{ width: "100%", height: "150px" }}
          />
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#HEX"
              className="flex-1 px-2 py-1.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded text-xs font-mono focus:outline-none focus:border-[#14213A]"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
                  handleCustomColorAdd(hexInput);
                  setShowWheel(false);
                }
              }} 
              className="px-3 py-1.5 bg-[#14213A] text-white rounded text-xs font-semibold hover:bg-[#14213A]/90"
            >
              Done
            </button>
          </div>
          <button 
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               setShowWheel(false);
            }}
            className="text-[10px] text-[#7A7F8C] hover:text-[#14213A] text-center uppercase font-bold tracking-wider"
          >
            Cancel
          </button>
        </div>
      )}
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
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${active
          ? "bg-[#14213A] text-white"
          : "text-[#3a3f4d] hover:bg-[#E7E4DC]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function RichEditor({ content, onChange, placeholder, draftKey }: RichEditorProps) {
  const [, forceUpdate] = useState(0);
  const triggerUpdate = () => forceUpdate(x => x + 1);
  
  const [mode, setMode] = useState<"rich" | "markdown">("rich");
  const [markdownContent, setMarkdownContent] = useState(content);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-Save states
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftExists, setDraftExists] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Gallery states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [isGalleryMinimized, setIsGalleryMinimized] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [tableContextMenu, setTableContextMenu] = useState<{ x: number, y: number, show: boolean } | null>(null);
  
  const tablePickerRef = useRef<HTMLDivElement>(null);
  const linkBtnRef = useRef<HTMLDivElement>(null);

  // Crop states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isUploadingImageReplace, setIsUploadingImageReplace] = useState(false);
  const [replaceTargetAttrs, setReplaceTargetAttrs] = useState<any>(null);
  const [cropFileExt, setCropFileExt] = useState('jpeg');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#B5723B] underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'What\'s the title?';
          }
          return 'Press "/" for commands, or write your content...';
        },
      }),
      ImageResize.configure({
        inline: true,
        allowBase64: true,
      }),
      SlashCommand,
      CharacterCount.configure({
        limit: null,
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
        class: `prose prose-sm max-w-none focus:outline-none text-[#14213A] leading-relaxed ${isFullscreen ? 'min-h-[calc(100vh-120px)]' : 'min-h-[460px]'}`,
      },
      scrollThreshold: 0,
      scrollMargin: 0,
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

  // Close context menu on click outside
  useEffect(() => {
    const handleMouseDown = () => {
      if (tableContextMenu?.show) {
        setTableContextMenu(null);
      }
    };
    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, [tableContextMenu]);

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

  // Handle gallery image upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (isSupabaseConfigured) {
        try {
          const res = await uploadBlogImage(file);
          if (res.success && res.url) {
            newImages.push(res.url);
          } else {
            console.error("Failed to upload image:", res.error);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      } else {
        // Fallback to Base64 for local dev preview without Supabase
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              newImages.push(event.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    if (newImages.length > 0) {
      setUploadedImages((prev) => [...prev, ...newImages]);
      setShowGallery(true);
      setIsGalleryMinimized(false);
    }
    
    // reset input
    e.target.value = '';
    setIsUploadingGallery(false);
  };

  // Handle image replacement from BubbleMenu (opens crop modal)
  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Preserve existing alt, title, width, etc.
    const currentAttrs = editor.getAttributes('imageResize');
    setReplaceTargetAttrs(currentAttrs);
    
    const ext = file.name.split('.').pop() || 'jpeg';
    setCropFileExt(ext);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropImageSrc(reader.result?.toString() || '');
      // Force 1:1 aspect ratio for Author Avatar
      if (currentAttrs.alt === 'Author Avatar') {
        // We set aspect 1 here but to ensure crop initializes with it, we can define initial crop state
        setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
      } else {
        setCrop(undefined);
      }
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);

    if (e.target) e.target.value = "";
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], `cropped.${cropFileExt}`, { type: blob.type });
        resolve(file);
      }, `image/${cropFileExt === 'png' ? 'png' : 'jpeg'}`);
    });
  };

  const handleCropConfirm = async () => {
    setIsUploadingImageReplace(true);
    try {
      const file = completedCrop ? await getCroppedImg() : null;
      if (!file) throw new Error("Crop failed");

      if (isSupabaseConfigured) {
        const res = await uploadBlogImage(file);
        if (res.success && res.url) {
          editor?.chain().focus().setImage({ ...replaceTargetAttrs, src: res.url }).run();
          triggerUpdate();
        } else {
          console.error("Failed to upload image:", res.error);
        }
      } else {
        // Fallback to Base64
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            editor?.chain().focus().setImage({ ...replaceTargetAttrs, src: event.target.result as string }).run();
            triggerUpdate();
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingImageReplace(false);
      setCropModalOpen(false);
    }
  };

  // Handle inline image upload from Slash Command
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSupabaseConfigured) {
      try {
        const res = await uploadBlogImage(file);
        if (res.success && res.url) {
          editor?.chain().focus().setImage({ src: res.url }).run();
        } else {
          console.error("Failed to upload inline image:", res.error);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    } else {
      // Fallback to Base64 for local dev preview without Supabase
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          editor?.chain().focus().setImage({ src: event.target.result as string }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    
    // reset input
    e.target.value = '';
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

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

  // Check for draft on mount
  useEffect(() => {
    if (draftKey && !draftRestored) {
      const saved = localStorage.getItem(`draft_${draftKey}`);
      if (saved && saved !== content) {
        setDraftExists(true);
      }
    }
  }, [draftKey, content, draftRestored]);

  // Auto save interval
  useEffect(() => {
    if (!autoSaveEnabled || !draftKey) return;
    const interval = setInterval(() => {
      localStorage.setItem(`draft_${draftKey}`, markdownContent);
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSaveEnabled, draftKey, markdownContent]);

  const restoreDraft = () => {
    if (!draftKey) return;
    const saved = localStorage.getItem(`draft_${draftKey}`);
    if (saved) {
      setMarkdownContent(saved);
      if (editor) {
        editor.commands.setContent(markdownToHtml(saved));
      }
      onChange(saved);
      setDraftExists(false);
      setDraftRestored(true);
    }
  };

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

  // Listen to escape key for exiting fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (!editor) return null;

  const isRich = mode === "rich";

  return (
    <div className={`bg-white transition-all duration-200 ${isFullscreen ? "fixed inset-0 z-[100] w-full h-screen rounded-none flex flex-col m-0" : "rounded-3xl border border-[#E7E4DC] shadow-sm overflow-hidden relative"}`}>
      {/* Top Bar: Mode Switch + Import */}
      <div className="p-3 border-b border-[#E7E4DC] flex items-center justify-between gap-3 bg-[#FAFAF8] shrink-0">
        {/* Mode Toggle */}
        <div className="flex bg-white border border-[#E7E4DC] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeSwitch("rich")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isRich ? "bg-[#14213A] text-white" : "text-[#7A7F8C] hover:text-[#14213A]"
              }`}
          >
            <Type size={13} /> Rich Text
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("markdown")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${!isRich ? "bg-[#14213A] text-white" : "text-[#7A7F8C] hover:text-[#14213A]"
              }`}
          >
            <FileCode2 size={13} /> Markdown
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Import feedback */}
          {importFeedback && (
            <span className="text-xs font-semibold text-[#0E9F6E] animate-pulse hidden md:inline-block">{importFeedback}</span>
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
          
          {/* Gallery Attachment */}
          <button
            type="button"
            disabled={isUploadingGallery}
            onClick={() => document.getElementById("rich-editor-gallery-import")?.click()}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isUploadingGallery 
                ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed" 
                : "text-[#3a3f4d] border-[#E7E4DC] hover:bg-[#E7E4DC]"
            }`}
            title="Attach images"
          >
            {isUploadingGallery ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip size={14} />
            )}
          </button>
          <input
            type="file"
            id="rich-editor-gallery-import"
            className="hidden"
            accept="image/*"
            multiple
            disabled={isUploadingGallery}
            onChange={handleGalleryUpload}
          />
          <input
            type="file"
            id="rich-editor-inline-image"
            className="hidden"
            accept="image/*"
            onChange={handleInlineImageUpload}
          />

          {/* Show Gallery Icon (if minimized and has images) */}
          {uploadedImages.length > 0 && isGalleryMinimized && (
            <button
              type="button"
              onClick={() => {
                setShowGallery(true);
                setIsGalleryMinimized(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-copper hover:bg-copper-dark transition-colors flex items-center gap-1.5"
              title="Open Image Gallery"
            >
              <Images size={14} />
            </button>
          )}

          {draftKey && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] font-semibold text-[#7A7F8C] uppercase tracking-wider hidden sm:inline">Auto-Save</span>
              <button
                type="button"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`w-7 h-4 rounded-full flex items-center transition-colors px-[2px] ${autoSaveEnabled ? "bg-[#B5723B]" : "bg-[#E7E4DC]"}`}
              >
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${autoSaveEnabled ? "translate-x-3" : "translate-x-0"}`} />
              </button>
              {lastSaved && <span className="text-[9px] text-[#7A7F8C] italic hidden sm:inline">Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          )}

          <div className="w-px h-6 bg-[#E7E4DC] mx-1 hidden sm:block" />
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${isFullscreen ? "bg-[#14213A] text-white border-[#14213A]" : "text-[#3a3f4d] border-[#E7E4DC] hover:bg-[#E7E4DC]"
              }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-2 px-3 border-b border-[#E7E4DC] flex flex-wrap items-center gap-0.5 bg-white shrink-0">
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
          onClick={() => {
            isRich ? editor.chain().focus().toggleBold().run() : insertMarkdownSyntax("**", "**");
            triggerUpdate();
          }}
          active={isRich ? editor.isActive("bold") : false}
          title="Bold (Cmd+B)"
        >
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            isRich ? editor.chain().focus().toggleItalic().run() : insertMarkdownSyntax("*", "*");
            triggerUpdate();
          }}
          active={isRich ? editor.isActive("italic") : false}
          title="Italic (Cmd+I)"
        >
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            isRich ? editor.chain().focus().toggleUnderline().run() : insertMarkdownSyntax("<u>", "</u>");
            triggerUpdate();
          }}
          active={isRich ? editor.isActive("underline") : false}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={15} />
        </ToolbarBtn>

        {/* Text Color Picker */}
        <div className="relative flex items-center justify-center w-8 h-8 hover:bg-[#F3F2EE] rounded-lg transition-colors cursor-pointer" title="Text Color" onClick={() => setShowColorPicker(!showColorPicker)}>
          <Palette size={15} className={`text-[#7A7F8C] pointer-events-none ${showColorPicker ? 'text-[#14213A]' : ''}`} />
          
          {/* Indicator Dot */}
          {isRich && editor.getAttributes('textStyle').color && (
            <div 
              className="absolute bottom-1 w-2.5 h-1 rounded-full pointer-events-none" 
              style={{ backgroundColor: editor.getAttributes('textStyle').color }} 
            />
          )}

          {showColorPicker && (
            <ColorPickerPopup 
              currentColor={isRich ? editor.getAttributes('textStyle').color : undefined}
              onSelect={(color) => {
                if (isRich) {
                  if (color) {
                    editor.chain().focus().setColor(color).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                  triggerUpdate();
                } else {
                  if (color) {
                    insertMarkdownSyntax(`<span style="color: ${color}">`, "</span>");
                  }
                  triggerUpdate();
                }
                setShowColorPicker(false);
              }}
              onPreview={(color) => {
                if (isRich && color) {
                  editor.chain().focus().setColor(color).run();
                  triggerUpdate();
                }
              }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Headings */}
        <ToolbarBtn
          onClick={() => {
            if (isRich) editor.chain().focus().toggleHeading({ level: 2 }).run();
            else insertMarkdownSyntax("## ", "");
            triggerUpdate();
          }}
          active={isRich ? editor.isActive("heading", { level: 2 }) : false}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            if (isRich) editor.chain().focus().toggleHeading({ level: 3 }).run();
            else insertMarkdownSyntax("### ", "");
            triggerUpdate();
          }}
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

        <div className="w-px h-6 bg-[#E7E4DC] mx-1" />

        {/* Author Bio */}
        <ToolbarBtn
          onClick={() => {
            const authorHtml = `
<hr>
<h3>About the Author</h3>
<p><img src="https://ui-avatars.com/api/?name=Finsaar+Team&background=14213A&color=fff&size=64&rounded=true" alt="Author Avatar" title="Author Avatar"></p>
<p><strong>Finsaar Team</strong> | <a href="mailto:support@finsaar.com">support@finsaar.com</a></p>
<p><em>Compliance Team</em></p>
<p>We are a legal and finance firm with a deep focus on the startup ecosystem. We offer a wide range of services, including Virtual CFO, Legal Support, Tax & Regulatory, and Global Expansion assistance. Our goal at Finsaar is to provide you with peace of mind and ease in business.</p>
`;
            if (isRich) {
              const endPos = editor.state.doc.content.size;
              editor.chain().focus().insertContentAt(endPos, authorHtml).run();
              triggerUpdate();
            } else {
              insertMarkdownSyntax("\n---\n### About the Author\n\n![Author Avatar](https://ui-avatars.com/api/?name=Finsaar+Team&background=14213A&color=fff&size=64&rounded=true)\n\n**Finsaar Team** | [support@finsaar.com](mailto:support@finsaar.com)\n\n*Compliance Team*\n\nWe are a legal and finance firm with a deep focus on the startup ecosystem. We offer a wide range of services, including Virtual CFO, Legal Support, Tax & Regulatory, and Global Expansion assistance. Our goal at Finsaar is to provide you with peace of mind and ease in business.\n\n", "");
              triggerUpdate();
            }
          }}
          title="Append Author Block"
        >
          <User size={15} />
        </ToolbarBtn>

      </div>

      {/* Draft Restore Banner */}
      {draftExists && (
        <div className="bg-[#FAFAF8] border-b border-[#E7E4DC] p-2 px-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#7A7F8C] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#B5723B] rounded-full animate-pulse" /> An unsaved draft was found for this post.</span>
          <div className="flex gap-3">
            <button type="button" onClick={() => setDraftExists(false)} className="text-xs text-[#7A7F8C] hover:text-[#14213A] underline transition-colors">Dismiss</button>
            <button type="button" onClick={restoreDraft} className="text-xs font-semibold text-[#B5723B] hover:text-copper-dark underline transition-colors">Restore Draft</button>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      {isRich ? (
        <div 
          className={`tiptap-editor-container relative p-6 ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}
          onContextMenu={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('table')) {
              e.preventDefault();
              setTableContextMenu({ x: e.clientX, y: e.clientY, show: true });
            } else {
              setTableContextMenu(null);
            }
          }}
        >
          {editor && (
            <BubbleMenu 
              editor={editor}
              // @ts-expect-error tippyOptions is missing in types but works
              tippyOptions={{ duration: 100, placement: 'top' }}
              shouldShow={({ editor, state }) => {
                return !state.selection.empty && !editor.isActive('table') && !editor.isActive('imageResize');
              }}
              className="flex items-center gap-1 bg-white border border-sand shadow-xl rounded-xl p-1.5 z-[100]"
            >
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleBold().run(); triggerUpdate(); }} className={`p-1.5 rounded hover:bg-sand/50 transition-colors ${editor.isActive('bold') ? 'bg-sand/80 text-navy' : 'text-[#7A7F8C]'}`}><Bold size={15} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleItalic().run(); triggerUpdate(); }} className={`p-1.5 rounded hover:bg-sand/50 transition-colors ${editor.isActive('italic') ? 'bg-sand/80 text-navy' : 'text-[#7A7F8C]'}`}><Italic size={15} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleUnderline().run(); triggerUpdate(); }} className={`p-1.5 rounded hover:bg-sand/50 transition-colors ${editor.isActive('underline') ? 'bg-sand/80 text-navy' : 'text-[#7A7F8C]'}`}><UnderlineIcon size={15} /></button>
              <div className="w-px h-4 bg-[#E7E4DC] mx-0.5" />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); triggerUpdate(); }} className={`p-1.5 rounded hover:bg-sand/50 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-sand/80 text-navy' : 'text-[#7A7F8C]'}`}><Heading2 size={15} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); triggerUpdate(); }} className={`p-1.5 rounded hover:bg-sand/50 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-sand/80 text-navy' : 'text-[#7A7F8C]'}`}><Heading3 size={15} /></button>
            </BubbleMenu>
          )}

          {/* Image Bubble Menu */}
          {editor && (
            <BubbleMenu 
              editor={editor}
              // @ts-expect-error tippyOptions is missing in types but works
              tippyOptions={{ duration: 100, placement: 'top' }}
              shouldShow={({ editor }) => {
                return editor.isActive('imageResize');
              }}
              className="flex items-center gap-1 bg-white border border-sand shadow-xl rounded-xl p-1.5 z-[100]"
            >
              <button 
                type="button" 
                onMouseDown={(e) => e.preventDefault()} 
                onClick={() => { 
                   document.getElementById("rich-editor-image-replace")?.click();
                }} 
                className="flex items-center gap-2 p-1.5 px-3 rounded text-sm text-[#14213A] hover:bg-sand/50 font-semibold transition-colors"
              >
                <UploadCloud size={14} /> Replace
              </button>
              <div className="w-px h-4 bg-[#E7E4DC] mx-0.5" />
              <button 
                type="button" 
                onMouseDown={(e) => e.preventDefault()} 
                onClick={() => { 
                   editor.chain().focus().deleteSelection().run(); 
                }} 
                className="flex items-center gap-2 p-1.5 px-3 rounded text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
              >
                <Trash2 size={14} /> Remove
              </button>
            </BubbleMenu>
          )}

          {/* Table Context Menu (Right Click) */}
          <AnimatePresence>
            {tableContextMenu?.show && editor?.isActive("table") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                onMouseDown={(e) => e.stopPropagation()}
                className="fixed z-[9999] bg-white border border-sand shadow-2xl rounded-xl p-1.5 flex flex-col min-w-[180px]"
                style={{ top: tableContextMenu.y, left: tableContextMenu.x }}
              >
                <button type="button" onClick={() => { editor.chain().focus().addRowBefore().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-[#14213A] hover:bg-sand/40 rounded-lg transition-colors w-full text-left">
                  <Rows3 size={14} className="text-[#7A7F8C]" /> Add Row Above
                </button>
                <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-[#14213A] hover:bg-sand/40 rounded-lg transition-colors w-full text-left">
                  <Rows3 size={14} className="text-[#7A7F8C]" /> Add Row Below
                </button>
                <div className="h-px w-full bg-[#E7E4DC] my-1" />
                <button type="button" onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-[#14213A] hover:bg-sand/40 rounded-lg transition-colors w-full text-left">
                  <Columns3 size={14} className="text-[#7A7F8C]" /> Add Column Left
                </button>
                <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-[#14213A] hover:bg-sand/40 rounded-lg transition-colors w-full text-left">
                  <Columns3 size={14} className="text-[#7A7F8C]" /> Add Column Right
                </button>
                <div className="h-px w-full bg-[#E7E4DC] my-1" />
                <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                  <Rows3 size={14} /> Delete Row
                </button>
                <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                  <Columns3 size={14} /> Delete Column
                </button>
                <div className="h-px w-full bg-[#E7E4DC] my-1" />
                <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setTableContextMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                  <Trash2 size={14} /> Delete Table
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <EditorContent editor={editor} />
          
          {/* Word Count & Reading Time Footer */}
          {editor && (
            <div className="absolute bottom-2 right-4 text-[11px] font-medium text-[#7A7F8C] bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-sand/50 shadow-sm pointer-events-none">
              {editor.storage.characterCount.words()} words | {Math.ceil(editor.storage.characterCount.words() / 200)} min read
            </div>
          )}
        </div>
      ) : (
        <div className={`p-4 ${isFullscreen ? "flex-1 flex flex-col" : ""}`}>
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

      {/* Floating Canva-style Image Gallery */}
      <AnimatePresence>
        {showGallery && uploadedImages.length > 0 && !isGalleryMinimized && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[110] bg-white rounded-2xl shadow-2xl border border-[#E7E4DC] overflow-hidden flex flex-col"
            style={{ 
              top: "8rem", 
              left: "calc(100vw - 380px)", 
              width: "320px", 
              height: "400px", 
              resize: "both" 
            }}
          >
            {/* Header / Drag Handle */}
            <div className="p-3 bg-[#FAFAF8] border-b border-[#E7E4DC] flex items-center justify-between cursor-move select-none shrink-0">
              <div className="flex items-center gap-2">
                <Images size={16} className="text-[#3a3f4d]" />
                <span className="font-heading font-semibold text-sm text-[#14213A]">Images</span>
              </div>
              <div className="flex items-center gap-1 cursor-default">
                <button
                  type="button"
                  onClick={() => setIsGalleryMinimized(true)}
                  className="p-1 text-[#7A7F8C] hover:text-[#14213A] hover:bg-[#E7E4DC] rounded transition-colors"
                  title="Minimize"
                >
                  <Minus size={14} />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="p-3 overflow-y-auto flex-1 bg-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#7A7F8C] font-body">Drag into the editor.</p>
                <button
                  type="button"
                  disabled={isUploadingGallery}
                  onClick={() => document.getElementById("rich-editor-gallery-import")?.click()}
                  className={`text-xs font-semibold transition-colors ${
                    isUploadingGallery 
                      ? "text-[#7A7F8C] cursor-not-allowed flex items-center gap-1.5" 
                      : "text-copper hover:text-[#9a5d2b]"
                  }`}
                >
                  {isUploadingGallery ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "+ Add More"
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((src, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square rounded-lg border border-[#E7E4DC] overflow-hidden group cursor-grab active:cursor-grabbing hover:border-copper transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/html", `<img src="${src}" alt="Uploaded Image" />`);
                      e.dataTransfer.effectAllowed = "copy";
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGalleryImage(index);
                      }}
                      className="absolute top-1 right-1 z-20 bg-white/80 hover:bg-red-500 hover:text-white text-gray-700 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        type="file"
        id="rich-editor-image-replace"
        accept="image/*"
        onChange={handleImageReplace}
        className="hidden"
      />

      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#14213A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-[#E7E4DC] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
                <h3 className="font-heading font-bold text-[#14213A]">Crop Image</h3>
                <button 
                  type="button" 
                  onClick={() => setCropModalOpen(false)}
                  className="p-1 text-[#7A7F8C] hover:text-[#14213A] hover:bg-[#D9C9A8]/30 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                {!!cropImageSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={replaceTargetAttrs?.alt === 'Author Avatar' ? 1 : undefined}
                    circularCrop={replaceTargetAttrs?.alt === 'Author Avatar'}
                    className="max-h-[60vh] max-w-full shadow-md rounded-xl overflow-hidden bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={cropImageSrc}
                      style={{ maxHeight: '60vh', width: 'auto' }}
                      onLoad={(e) => {
                         // Default crop for 1:1 if it's avatar
                         if (replaceTargetAttrs?.alt === 'Author Avatar') {
                            const { width, height } = e.currentTarget;
                            const minDimension = Math.min(width, height);
                            const newCrop = centerCrop(
                              makeAspectCrop(
                                {
                                  unit: 'px',
                                  width: minDimension * 0.9,
                                },
                                1,
                                width,
                                height
                              ),
                              width,
                              height
                            );
                            setCrop(newCrop);
                         }
                      }}
                    />
                  </ReactCrop>
                )}
              </div>
              <div className="p-4 border-t border-[#E7E4DC] flex justify-end gap-3 shrink-0 bg-[#FAFAF8]">
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#7A7F8C] hover:bg-[#D9C9A8]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploadingImageReplace || !completedCrop}
                  onClick={handleCropConfirm}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#B5723B] hover:bg-[#9A5F2E] text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploadingImageReplace ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Crop & Save"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
