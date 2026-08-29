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
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Star,
  Globe,
  FileText,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  Code,
  Link2,
  Table,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { CalendarPost } from "@/lib/calendar-data";
import {
  createCalendarPost as createPost,
  updateCalendarPost as updatePost,
} from "@/lib/calendar-service";
import { uploadBlogImage } from "@/lib/blog-service";
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

  const [author, setAuthor] = useState(initialPost?.author || "Finsaar Team");
  const [authorRole, setAuthorRole] = useState(
    initialPost?.authorRole || "Compliance Team"
  );
  const [date, setDate] = useState(
    initialPost?.date || new Date().toISOString().split("T")[0]
  );
  
  
  const [published, setPublished] = useState(
    initialPost?.published !== undefined ? initialPost.published : true
  );
  const [tags, setTags] = useState<string[]>(
    initialPost?.tags || []
  );
  const [newTagInput, setNewTagInput] = useState("");
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

  

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^,+|,+$/g, "");
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      // Local preview mode
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
      setFeedback({
        type: "success",
        message: "Image preview loaded (Supabase storage will store this when connected).",
      });
      return;
    }

    setUploadingImage(true);
    setFeedback(null);
    try {
      const res = await uploadBlogImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        setFeedback({
          type: "success",
          message: "Cover photo uploaded to Supabase Storage successfully!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to upload image.",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Upload error",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Toolbar Insert Helper
  const insertMarkdown = (syntaxStart: string, syntaxEnd = "") => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${syntaxStart}${selected || "text"}${syntaxEnd}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxStart.length,
        start + syntaxStart.length + (selected.length || 4)
      );
    }, 50);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Metric / Header 1 | Description 2 | Status 3 |\n| :--- | :--- | :--- |\n| Data A | Value 1 | Active |\n| Data B | Value 2 | Completed |\n\n`;
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + tableTemplate + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tableTemplate.length, start + tableTemplate.length);
    }, 50);
  };

  // Save / Publish Submit Handler
  const handleSubmit = async (publishStatus = published) => {
    setSaving(true);
    setFeedback(null);

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setFeedback({
        type: "error",
        message: "Title, URL slug, and content are required.",
      });
      setSaving(false);
      return;
    }

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim(),
      category: "Compliance Calendar",
      author: author.trim(),
      authorRole: authorRole.trim(),
      date,
      
      
      published: publishStatus,
      tags: tags.length > 0 ? tags : ["Compliance"],
      image: imageUrl.trim() || undefined,
    };

    try {
      if (isEdit && initialPost?.id) {
        const res = await updatePost(initialPost.id, postData);
        if (res.success) {
          setFeedback({
            type: "success",
            message: "Calendar post updated successfully!",
          });
          setTimeout(() => router.push("/admin/compliance"), 1000);
        } else {
          setFeedback({
            type: "error",
            message: res.error || "Failed to update blog post.",
          });
        }
      } else {
        const res = await createPost(postData);
        if (res.success) {
          setFeedback({
            type: "success",
            message: "New blog post published successfully!",
          });
          setTimeout(() => router.push("/admin/compliance"), 1000);
        } else {
          // If Supabase not configured, acknowledge in local preview
          if (!isSupabaseConfigured) {
            setFeedback({
              type: "success",
              message: "Preview validated! Connect Supabase to save permanently to your database.",
            });
          } else {
            setFeedback({
              type: "error",
              message: res.error || "Failed to save post.",
            });
          }
        }
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error saving post",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2 rounded-xl bg-white border border-[#E7E4DC] text-[#7A7F8C] hover:text-[#14213A] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-[#14213A]">
              {isEdit ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-xs text-[#7A7F8C] mt-0.5">
              Authoritative financial intelligence for scaling founders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Right Sidebar Button */}
          <button
            type="button"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isRightSidebarOpen
                ? "bg-white border-[#E7E4DC] text-[#14213A] hover:bg-[#F5F3EE]"
                : "bg-[#14213A] border-[#14213A] text-white shadow-sm"
            }`}
            title={isRightSidebarOpen ? "Hide Settings Panel" : "Show Settings Panel"}
          >
            {isRightSidebarOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            <span>{isRightSidebarOpen ? "Hide Settings" : "Show Settings"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-[#E7E4DC] bg-white text-xs font-semibold text-[#14213A] hover:bg-[#F5F3EE] transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#14213A] hover:bg-[#1e3256] text-white text-xs font-heading font-semibold shadow-md shadow-[#14213A]/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={14} className="text-[#B5723B]" />
            {saving ? "Publishing..." : isEdit ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Fields (Flex Layout with responsive expand/collapse) */}
      <div className="flex flex-col lg:flex-row gap-8 relative items-start">
        {/* Left / Middle Main Writing Section (Expands smoothly to 100% when right panel is minimized) */}
        <div className={`w-full ${isRightSidebarOpen ? "lg:flex-1" : "lg:w-full"} space-y-6 transition-all duration-500 ease-in-out min-w-0`}>
          {/* Title */}
          <div className="bg-white p-6 rounded-3xl border border-[#E7E4DC] shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                Article Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Navigating Indian Compliance for Seed-Stage Startups"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl font-heading font-bold text-lg text-[#14213A] placeholder-[#7A7F8C]/60 focus:outline-none focus:border-[#B5723B]"
              />
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-xs font-semibold text-[#7A7F8C] uppercase tracking-wider mb-1">
                URL Slug
              </label>
              <div className="flex items-center gap-2 bg-[#FAFAF8] border border-[#E7E4DC] px-3.5 py-2 rounded-xl text-xs">
                <span className="text-[#7A7F8C]">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="bg-transparent font-mono text-[#14213A] flex-1 focus:outline-none"
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                Excerpt (Meta Summary)
              </label>
              <textarea
                rows={3}
                placeholder="A compelling 2-3 sentence overview that appears on search engines and card previews..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-sm font-body text-[#14213A] placeholder-[#7A7F8C]/60 focus:outline-none focus:border-[#B5723B]"
              />
            </div>
          </div>

          {/* Markdown Content Studio */}
          <div className="bg-white rounded-3xl border border-[#E7E4DC] shadow-sm overflow-hidden">
            {/* Studio Toolbar */}
            <div className="p-4 border-b border-[#E7E4DC] flex flex-wrap items-center justify-between gap-3 bg-[#FAFAF8]">
              {/* Markdown Quick Formatting */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ", "")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Heading 3"
                >
                  <Heading3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ", "")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ", "")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Quote"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[Link Text](", ")")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Insert Link"
                >
                  <Link2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("```\n", "\n```")}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Code Block"
                >
                  <Code size={15} />
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  className="p-2 rounded-lg text-[#3a3f4d] hover:bg-[#E7E4DC] transition-colors"
                  title="Insert Table"
                >
                  <Table size={15} />
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="flex bg-white border border-[#E7E4DC] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("write")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "write"
                      ? "bg-[#14213A] text-white"
                      : "text-[#7A7F8C] hover:text-[#14213A]"
                  }`}
                >
                  <Edit3 size={13} /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={`hidden md:flex px-3 py-1 rounded-lg text-xs font-semibold items-center gap-1.5 transition-colors ${
                    viewMode === "split"
                      ? "bg-[#14213A] text-white"
                      : "text-[#7A7F8C] hover:text-[#14213A]"
                  }`}
                >
                  <FileText size={13} /> Split View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "preview"
                      ? "bg-[#14213A] text-white"
                      : "text-[#7A7F8C] hover:text-[#14213A]"
                  }`}
                >
                  <Eye size={13} /> Live Preview
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div
              className={`grid ${
                viewMode === "split"
                  ? "grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E7E4DC]"
                  : "grid-cols-1"
              }`}
            >
              {/* Textarea */}
              {(viewMode === "write" || viewMode === "split") && (
                <div className="p-4">
                  <textarea
                    id="content-textarea"
                    rows={22}
                    placeholder="Write your article content using Markdown format...

## Section Title

As your startup scales beyond ₹1 Crore, financial clarity becomes paramount...

- Key metric 1
- Key metric 2"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full min-h-[460px] bg-transparent border-0 font-mono text-sm text-[#14213A] placeholder-[#7A7F8C]/50 focus:outline-none leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* Preview */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className="p-6 overflow-y-auto max-h-[600px] bg-[#FAFAF8]/50">
                  <div className="prose prose-sm max-w-none text-[#14213A] space-y-4">
                    {content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({ ...props }) => (
                            <h1
                              className="font-heading font-extrabold text-2xl md:text-3xl text-[#14213A] mt-6 mb-4 leading-tight tracking-tight border-b border-[#E7E4DC] pb-2"
                              {...props}
                            />
                          ),
                          h2: ({ ...props }) => (
                            <h2
                              className="font-heading font-bold text-xl md:text-2xl text-[#14213A] mt-6 mb-3 border-b border-[#E7E4DC] pb-2"
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              className="font-heading font-semibold text-lg md:text-xl text-[#14213A] mt-5 mb-2 text-[#B5723B]"
                              {...props}
                            />
                          ),
                          h4: ({ ...props }) => (
                            <h4
                              className="font-heading font-semibold text-base text-[#14213A] mt-4 mb-1.5"
                              {...props}
                            />
                          ),
                          p: ({ ...props }) => (
                            <p
                              className="font-body text-sm md:text-base text-[#14213A]/85 leading-relaxed mb-4"
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              className="list-disc list-outside ml-5 space-y-1.5 font-body text-sm md:text-base text-[#14213A]/85 my-4"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="list-decimal list-outside ml-5 space-y-1.5 font-body text-sm md:text-base text-[#14213A]/85 my-4"
                              {...props}
                            />
                          ),
                          li: ({ ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote
                              className="border-l-4 border-[#B5723B] pl-4 italic text-[#14213A]/75 my-4 bg-white/70 py-2.5 rounded-r-xl"
                              {...props}
                            />
                          ),
                          code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) => {
                            return (
                              <code
                                className="bg-[#E7E4DC]/60 px-1.5 py-0.5 rounded text-xs font-mono text-[#14213A] font-semibold"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          pre: ({ ...props }) => (
                            <pre
                              className="bg-[#14213A] text-[#FAFAF8] p-4 rounded-2xl overflow-x-auto text-xs font-mono my-4 border border-[#14213A]/20"
                              {...props}
                            />
                          ),
                          a: ({ ...props }) => (
                            <a
                              className="text-[#B5723B] underline font-medium hover:text-[#9A5F2E] transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                          hr: ({ ...props }) => (
                            <hr className="my-6 border-[#E7E4DC]" {...props} />
                          ),
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto my-4 border border-[#E7E4DC] rounded-xl">
                              <table
                                className="min-w-full divide-y divide-[#E7E4DC] text-xs text-left"
                                {...props}
                              />
                            </div>
                          ),
                          th: ({ ...props }) => (
                            <th
                              className="bg-[#FAFAF8] px-4 py-2.5 font-semibold text-[#14213A]"
                              {...props}
                            />
                          ),
                          td: ({ ...props }) => (
                            <td
                              className="px-4 py-2.5 border-t border-[#E7E4DC] text-[#14213A]/80"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-xs text-[#7A7F8C] italic">
                        Type in the editor to see your live preview here.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Settings Panel): Collapsible with left-sidebar styled button */}
        <div
          className={`space-y-6 relative transition-all duration-500 ease-in-out ${
            isRightSidebarOpen
              ? "w-full lg:w-80 xl:w-96 opacity-100 scale-100 pointer-events-auto"
              : "w-0 lg:w-0 opacity-0 scale-95 overflow-hidden invisible pointer-events-none p-0 m-0 border-0 h-0 lg:h-auto"
          } shrink-0`}
        >
          {/* Minimizer Button (Matching Left Sidebar style) */}
          <button
            type="button"
            onClick={() => setIsRightSidebarOpen(false)}
            className="hidden lg:flex absolute -left-3 top-8 w-6 h-6 bg-white border border-[#E7E4DC] rounded-full items-center justify-center text-[#7A7F8C] hover:text-[#14213A] hover:shadow-sm transition-all duration-300 z-30 shadow-sm"
            title="Minimize Settings Panel"
          >
            <ChevronRight size={14} />
          </button>

            {/* Post Settings */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7E4DC] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
                <h3 className="font-heading font-bold text-sm text-[#14213A] uppercase tracking-wider">
                  Publishing Settings
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="lg:hidden p-1 text-[#7A7F8C] hover:text-[#14213A]"
                  title="Close Settings"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Category removed per user request */}

              {/* Author Name */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs font-body text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                />
              </div>

              {/* Author Role */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Author Designation
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs font-body text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                />
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7F8C] uppercase tracking-wider mb-1.5">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                  />
                </div>
              </div>

              {/* Published Status Switch */}
              <div>
                <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF8] border border-[#E7E4DC] cursor-pointer hover:bg-[#F5F3EE] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Globe
                      size={16}
                      className={published ? "text-[#0E9F6E]" : "text-[#7A7F8C]"}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#14213A]">
                        {published ? "Live / Published" : "Draft Status"}
                      </p>
                      <p className="text-[10px] text-[#7A7F8C]">
                        {published ? "Visible on public blog" : "Hidden from public"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-[#0E9F6E] rounded focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7E4DC] shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#14213A] uppercase tracking-wider border-b border-[#E7E4DC] pb-3">
                Cover Image
              </h3>

              {imageUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#E7E4DC] bg-[#14213A]">
                    <Image
                      src={imageUrl}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Remove Cover Image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="border-2 border-dashed border-[#E7E4DC] hover:border-[#B5723B] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#FAFAF8]">
                    <UploadCloud
                      size={28}
                      className={uploadingImage ? "animate-bounce text-[#B5723B]" : "text-[#7A7F8C]"}
                    />
                    <span className="text-xs font-semibold text-[#14213A] mt-2">
                      {uploadingImage ? "Uploading to Cloud..." : "Upload Cover Image"}
                    </span>
                    <span className="text-[10px] text-[#7A7F8C] mt-0.5">
                      PNG, JPG, WebP up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A7F8C] mb-1">
                      Or paste Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7E4DC] shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#14213A] uppercase tracking-wider border-b border-[#E7E4DC] pb-3">
                Tags & Topics
              </h3>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFAF8] border border-[#E7E4DC] rounded-full text-xs font-semibold text-[#14213A]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#7A7F8C] hover:text-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add tag (Press Enter)..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 px-3 py-2 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-2 bg-[#14213A] text-white rounded-xl text-xs hover:bg-[#1e3256] transition-colors"
                >
                  <Plus size={14} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

