"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CalendarEditor from "@/components/admin/CalendarEditor";
import { getCalendarPostById } from "@/lib/calendar-service";
import { CalendarPost } from "@/lib/calendar-data";

export default function EditCalendarPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [post, setPost] = useState<CalendarPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (id) {
        const data = await getCalendarPostById(id);
        setPost(data);
      }
      setLoading(false);
    }
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Calendar not found</h2>
        <p className="text-slate-500">The calendar post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <CalendarEditor initialPost={post} isEdit={true} />;
}
