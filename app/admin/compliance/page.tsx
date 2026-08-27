"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CalendarPost } from "@/lib/calendar-data";
import {
  getCalendarPosts,
  deleteCalendarPost,
} from "@/lib/calendar-service";
import Image from "next/image";

export default function AdminComplianceCalendarPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getCalendarPosts({ includeDrafts: true });
      setPosts(data);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (post: CalendarPost) => {
    if (!post.id) {
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
      setActionMessage({
        type: "success",
        text: `Removed "${post.title}" from local preview.`,
      });
      setDeletingId(null);
      return;
    }

    try {
      const res = await deleteCalendarPost(post.id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        setActionMessage({
          type: "success",
          text: `Deleted "${post.title}".`,
        });
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to delete calendar",
        });
      }
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Delete error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? post.published !== false
        : post.published === false;

    return matchesSearch && matchesStatus;
  });

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.published !== false).length;
  const draftCount = posts.filter((p) => p.published === false).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#14213A]">
            Compliance Calendars
          </h1>
          <p className="font-body text-sm text-[#7A7F8C] mt-1">
            Manage your monthly compliance calendars and due date postings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchPosts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7E4DC] hover:border-[#B5723B] text-[#14213A] rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <Link
            href="/admin/compliance/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14213A] hover:bg-[#1e3256] text-white rounded-xl text-sm font-heading font-semibold shadow-md shadow-[#14213A]/10 transition-all"
          >
            <PlusCircle size={16} className="text-[#B5723B]" />
            New Calendar
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#7A7F8C] uppercase tracking-wider">
            Total Calendars
          </p>
          <p className="font-heading font-extrabold text-3xl text-[#14213A] mt-2">
            {totalCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#7A7F8C] uppercase tracking-wider">
            Published
          </p>
          <p className="font-heading font-extrabold text-3xl text-[#0E9F6E] mt-2">
            {publishedCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#7A7F8C] uppercase tracking-wider">
            Drafts
          </p>
          <p className="font-heading font-extrabold text-3xl text-[#B5723B] mt-2">
            {draftCount}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E4DC] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7F8C]"
          />
          <input
            type="text"
            placeholder="Search by title, keyword, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-sm font-body text-[#14213A] placeholder-[#7A7F8C]/70 focus:outline-none focus:border-[#B5723B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#FAFAF8] border border-[#E7E4DC] p-1 rounded-xl">
            {(["all", "published", "draft"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-[#14213A] text-white"
                    : "text-[#7A7F8C] hover:text-[#14213A]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E7E4DC] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#7A7F8C] flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#B5723B]" />
            <span>Loading calendars...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-heading font-semibold text-lg text-[#14213A]">
              No calendars found
            </p>
            <p className="text-sm text-[#7A7F8C] mt-1">
              Try adjusting your search filters or click &quot;New Calendar&quot;.
            </p>
            <Link
              href="/admin/compliance/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#14213A] text-white rounded-xl text-xs font-semibold"
            >
              <PlusCircle size={14} /> New Calendar
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E4DC]">
            {filteredPosts.map((post) => (
              <div
                key={post.id || post.slug}
                className="p-5 sm:p-6 hover:bg-[#FAFAF8] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 max-w-3xl">
                  {post.image ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E7E4DC] bg-[#14213A]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl shrink-0 bg-gradient-to-br from-[#14213A] to-[#1e3256] flex items-center justify-center text-white font-heading font-bold text-lg">
                      {post.title.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          post.published !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {post.published !== false ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-[#14213A] leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-[#7A7F8C] line-clamp-1">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7A7F8C]">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <code className="text-[10px] bg-[#E7E4DC]/60 px-1.5 py-0.5 rounded text-[#14213A]">
                        /compliance-calendar/{post.slug}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <Link
                    href={`/resources/compliance-calendar/${post.slug}`}
                    target="_blank"
                    title="Preview public page"
                    className="p-2 rounded-xl bg-white border border-[#E7E4DC] text-[#7A7F8C] hover:text-[#14213A] transition-colors"
                  >
                    <Eye size={16} />
                  </Link>

                  <Link
                    href={`/admin/compliance/edit?id=${post.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F3EE] hover:bg-[#EAE6DE] text-[#14213A] text-xs font-semibold transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>

                  <button
                    onClick={() => setDeletingId(post.id || post.slug)}
                    className="p-2 rounded-xl bg-white border border-[#E7E4DC] text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="Delete calendar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E7E4DC] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-heading font-bold text-xl text-[#14213A]">
              Delete this calendar?
            </h3>
            <p className="text-sm text-[#7A7F8C] mt-2 leading-relaxed">
              This action cannot be undone. The calendar will be permanently removed from your website.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7F8C] hover:bg-[#F5F3EE]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = posts.find((p) => p.id === deletingId || p.slug === deletingId);
                  if (target) handleDelete(target);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
