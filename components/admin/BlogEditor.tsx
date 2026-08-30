"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichEditor from "@/components/admin/RichEditor";
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Star,
  Globe,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { BlogPost, blogCategories } from "@/lib/blog-data";
import {
  createPost,
  updatePost,
  uploadBlogImage,
} from "@/lib/blog-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";

interface BlogEditorProps {
  initialPost?: Partial<BlogPost> & { id?: string };
  isEdit?: boolean;
}

export default function BlogEditor({ initialPost, isEdit = false }: BlogEditorProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [category, setCategory] = useState(initialPost?.category || "Strategy");
  const [author, setAuthor] = useState(initialPost?.author || "Samarpan Rao");
  const [authorRole, setAuthorRole] = useState(
    initialPost?.authorRole || "Founder & Managing Director"
  );
  const [date, setDate] = useState(
    initialPost?.date || new Date().toISOString().split("T")[0]
  );
  const [readTime, setReadTime] = useState(initialPost?.readTime || "5 min");
  const [featured, setFeatured] = useState(initialPost?.featured || false);
  const [published, setPublished] = useState(
    initialPost?.published !== undefined ? initialPost.published : true
  );
  const [tags, setTags] = useState<string[]>(
    initialPost?.tags || ["Startup Finance", "CFO"]
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState(initialPost?.image || "");

  // UI State

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

  // Auto calculate read time from markdown content
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      setReadTime(`${minutes} min`);
    }
  }, [content]);

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
      category,
      author: author.trim(),
      author_role: authorRole.trim(),
      date,
      read_time: readTime,
      featured,
      published: publishStatus,
      tags,
      image: imageUrl.trim() || null,
    };

    try {
      if (isEdit && initialPost?.id) {
        const res = await updatePost(initialPost.id, postData);
        if (res.success) {
          setFeedback({
            type: "success",
            message: "Blog post updated successfully!",
          });
          setTimeout(() => router.push("/admin/blog"), 1000);
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
          setTimeout(() => router.push("/admin/blog"), 1000);
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

          {/* Rich Text / Markdown Editor */}
          <RichEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your blog post..."
          />
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

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs font-semibold text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                >
                  {blogCategories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

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

              {/* Date & Read Time */}
              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A7F8C] uppercase tracking-wider mb-1.5">
                    Est. Read Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                  />
                </div>
              </div>

              {/* Featured Post Switch */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF8] border border-[#E7E4DC] cursor-pointer hover:bg-[#F5F3EE] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Star
                      size={16}
                      className={featured ? "fill-[#B5723B] text-[#B5723B]" : "text-[#7A7F8C]"}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#14213A]">Featured Hero Post</p>
                      <p className="text-[10px] text-[#7A7F8C]">Show on top banner</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#B5723B] rounded focus:ring-0 cursor-pointer"
                  />
                </label>
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

