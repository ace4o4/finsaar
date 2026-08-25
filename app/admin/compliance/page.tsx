"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";
import { CalendarPost } from "@/lib/calendar-data";
import {
  getCalendarPosts,
  deleteCalendarPost,
} from "@/lib/calendar-service";

export default function AdminComplianceCalendarPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    setActionMessage(null);
    try {
      const res = await deleteCalendarPost(id);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: "Calendar deleted successfully.",
        });
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to delete calendar.",
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
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#14213A]">
            Compliance Calendars
          </h1>
          <p className="text-[#7A7F8C] mt-1 text-sm">
            Manage your monthly compliance calendars and due date postings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/compliance/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14213A] hover:bg-[#1e3256] text-white rounded-xl text-sm font-heading font-semibold shadow-md shadow-[#14213A]/10 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#B5723B]" />
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

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E4DC] p-2 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7F8C]" />
          <input
            type="text"
            placeholder="Search calendars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm focus:outline-none focus:ring-0 text-[#14213A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E4DC] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E7E4DC]">
                <th className="py-4 px-6 text-[10px] font-bold text-[#7A7F8C] uppercase tracking-widest">
                  Title & Month
                </th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#7A7F8C] uppercase tracking-widest">
                  Status
                </th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#7A7F8C] uppercase tracking-widest">
                  Date
                </th>
                <th className="py-4 px-6 text-[10px] font-bold text-[#7A7F8C] uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#14213A]"></div>
                    <p className="mt-2 text-[#7A7F8C] text-sm">Loading calendars...</p>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E7E4DC]">
                      <Search className="w-6 h-6 text-[#7A7F8C]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#14213A] mb-1">
                      No calendars found
                    </h3>
                    <p className="text-sm text-[#7A7F8C]">
                      Try adjusting your search query or create a new calendar.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id || post.slug}
                    className="hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#14213A] text-sm mb-1 line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-[#7A7F8C]">
                          {post.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#7A7F8C]">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {post.published && (
                          <Link
                            href={`/resources/compliance-calendar/${post.slug}`}
                            target="_blank"
                            className="p-2 text-[#7A7F8C] hover:text-[#B5723B] hover:bg-[#B5723B]/10 rounded-lg transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/compliance/edit?id=${post.id}`}
                          className="p-2 text-[#7A7F8C] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => post.id && handleDelete(post.id, post.title)}
                          disabled={!post.id || deletingId === post.id}
                          className="p-2 text-[#7A7F8C] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Needed missing import in actual component.
import { AlertTriangle } from "lucide-react";
