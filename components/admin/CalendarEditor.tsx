"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  ArrowLeft,
  UploadCloud,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { CalendarPost } from "@/lib/calendar-data";
import {
  createCalendarPost,
  updateCalendarPost,
} from "@/lib/calendar-service";
import { uploadBlogImage } from "@/lib/blog-service"; // Reuse blog image bucket
import { isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";

interface CalendarEditorProps {
  initialPost?: Partial<CalendarPost> & { id?: string };
  isEdit?: boolean;
}

export default function CalendarEditor({ initialPost, isEdit = false }: CalendarEditorProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [category, setCategory] = useState(initialPost?.category || "Monthly Calendar");
  const [author, setAuthor] = useState(initialPost?.author || "Finsaar Team");
  const [date, setDate] = useState(
    initialPost?.date || new Date().toISOString().split("T")[0]
  );
  const [published, setPublished] = useState(
    initialPost?.published !== undefined ? initialPost.published : true
  );
  const [imageUrl, setImageUrl] = useState(initialPost?.image || "");

  // UI State
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("split");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && !isEdit && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  }, [title, slugManuallyEdited, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      setFeedback({
        type: "error",
        message: "Supabase is not configured. Cannot upload images.",
      });
      return;
    }

    setUploadingImage(true);
    setFeedback(null);

    const { url, error } = await uploadBlogImage(file);

    if (error || !url) {
      setFeedback({ type: "error", message: error || "Failed to upload image" });
      setUploadingImage(false);
      return;
    }

    setImageUrl(url);
    setUploadingImage(false);
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") replacement = `**${selected || "bold text"}**`;
    if (syntax === "italic") replacement = `*${selected || "italic text"}*`;
    if (syntax === "h2") replacement = `\n## ${selected || "Heading 2"}\n`;
    if (syntax === "h3") replacement = `\n### ${selected || "Heading 3"}\n`;
    if (syntax === "link") replacement = `[${selected || "link text"}](url)`;
    if (syntax === "image") replacement = `![${selected || "alt text"}](image_url)`;
    if (syntax === "table") {
      replacement = `\n| Due Date | Task / Compliance | Authority | Status |\n|---|---|---|---|\n| Aug 07, 2026 | TDS Liability | IT Dept | UPCOMING |\n`;
    }

    setContent(before + replacement + after);
    
    setTimeout(() => {
      textarea.focus();
      if (!selected) {
        let cursorOffset = replacement.length;
        if (syntax === "bold") cursorOffset -= 2;
        if (syntax === "italic") cursorOffset -= 1;
        if (syntax === "link") cursorOffset -= 4; // inside (url)
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }
    }, 0);
  };

  const handleSave = async (isPublished: boolean) => {
    setFeedback(null);

    if (!title || !slug || !content) {
      setFeedback({
        type: "error",
        message: "Title, slug, and content are required.",
      });
      setIsRightSidebarOpen(true);
      return;
    }

    setSaving(true);
    setPublished(isPublished);

    const postData: CalendarPost = {
      slug,
      title,
      excerpt,
      content,
      category,
      author,
      date,
      published: isPublished,
      image: imageUrl || undefined,
    };

    let result;

    if (isEdit && initialPost?.id) {
      result = await updateCalendarPost(initialPost.id, postData, isPublished);
    } else {
      result = await createCalendarPost(postData, isPublished);
    }

    setSaving(false);

    if (result.success) {
      setFeedback({
        type: "success",
        message: `Calendar ${isPublished ? "published" : "saved as draft"} successfully!`,
      });
      setTimeout(() => {
        router.push("/admin/compliance");
      }, 1500);
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Failed to save calendar post.",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/compliance"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {isEdit ? "Edit Calendar" : "New Calendar"}
            </h1>
            <p className="text-sm text-slate-500">
              {published ? "Published" : "Draft"} • {saving ? "Saving..." : "All changes saved"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("write")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "write"
                  ? "bg-white dark:bg-slate-700 text-brand-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-700 text-brand-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-700 text-brand-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Split
            </button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="p-2 ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor & Preview Pane */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Write Pane */}
          {(viewMode === "write" || viewMode === "split") && (
            <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto">
                <button onClick={() => insertMarkdown("h2")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Heading 2">H2</button>
                <button onClick={() => insertMarkdown("h3")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Heading 3">H3</button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button onClick={() => insertMarkdown("bold")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded font-bold" title="Bold">B</button>
                <button onClick={() => insertMarkdown("italic")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded italic" title="Italic">I</button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button onClick={() => insertMarkdown("link")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Link">Link</button>
                <button onClick={() => insertMarkdown("image")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Image">Img</button>
                <button onClick={() => insertMarkdown("table")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded font-bold text-brand-600" title="Insert Table">Table</button>
              </div>

              <textarea
                id="markdown-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your calendar content here using Markdown... You can insert a Table from the toolbar."
                className="flex-1 w-full p-6 resize-none outline-none bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`overflow-y-auto bg-slate-50 dark:bg-slate-900 ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
              <div className="max-w-3xl mx-auto p-8">
                {title && (
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                    {title}
                  </h1>
                )}
                <div className="prose prose-slate dark:prose-invert prose-brand max-w-none prose-headings:font-semibold prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-table:w-full prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-slate-200 dark:prose-td:border-slate-700">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <div className="text-slate-400 italic">Preview will appear here...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Settings Sidebar */}
        <div
          className={`
            absolute inset-y-0 right-0 z-20 w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none
            ${isRightSidebarOpen ? "translate-x-0" : "translate-x-full lg:hidden"}
          `}
        >
          <div className="h-full overflow-y-auto p-5 space-y-6">
            <div className="flex items-center justify-between lg:hidden mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>
              <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {feedback.type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                <p>{feedback.message}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Post Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. August 2026 Deadlines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Brief summary..."
                />
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Meta Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Meta Data
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Featured Image */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Featured Image
              </h3>
              
              {imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group aspect-video">
                  <Image src={imageUrl} alt="Featured" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setImageUrl("")}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SVG, PNG, JPG or GIF</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
              {uploadingImage && <p className="text-sm text-brand-600 animate-pulse text-center">Uploading...</p>}
            </div>

          </div>
        </div>

        {/* Toggle Sidebar Button (Desktop) */}
        <button
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className={`
            hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30
            p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-md shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all
            ${isRightSidebarOpen ? "right-[320px]" : "right-0 rounded-l-md rounded-r-none"}
          `}
        >
          {isRightSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
