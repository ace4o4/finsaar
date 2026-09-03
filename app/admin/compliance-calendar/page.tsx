"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  ComplianceItem,
  getComplianceItems,
  createComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
  seedInitialCompliance,
} from "@/lib/compliance-service";
import { isSupabaseConfigured } from "@/lib/supabase";

const commonCategories = [
  "Every Month",
  "Quarterly Deadlines",
  "Annual Deadlines (Sep - Nov)",
  "ROC & Secretarial",
  "Custom Deadlines",
];

export default function AdminComplianceCalendarPage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [formData, setFormData] = useState({
    category: "Every Month",
    customCategory: "",
    date: "",
    task: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await Promise.race([
        getComplianceItems(),
        new Promise<ComplianceItem[]>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 10000)
        )
      ]);
      
      if (!data) {
        setFetchError(true);
      } else {
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load compliance items:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category: "Every Month",
      customCategory: "",
      date: "",
      task: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ComplianceItem) => {
    setEditingItem(item);
    const isCustom = !commonCategories.includes(item.category);
    setFormData({
      category: isCustom ? "Custom Deadlines" : item.category,
      customCategory: isCustom ? item.category : "",
      date: item.date,
      task: item.task,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date.trim() || !formData.task.trim()) {
      alert("Please fill in both Date and Task description.");
      return;
    }

    setSaving(true);
    const finalCategory =
      formData.category === "Custom Deadlines"
        ? formData.customCategory.trim() || "Custom Deadlines"
        : formData.category;

    if (editingItem) {
      const res = await updateComplianceItem(editingItem.id, {
        category: finalCategory,
        date: formData.date.trim(),
        task: formData.task.trim(),
      });
      if (res.success) {
        setActionMessage({
          type: "success",
          text: "Compliance deadline updated successfully.",
        });
        setIsModalOpen(false);
        await fetchItems();
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to update item.",
        });
      }
    } else {
      const res = await createComplianceItem({
        category: finalCategory,
        date: formData.date.trim(),
        task: formData.task.trim(),
        order_index: items.length + 1,
      });
      if (res.success) {
        setActionMessage({
          type: "success",
          text: "New compliance deadline added successfully.",
        });
        setIsModalOpen(false);
        await fetchItems();
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to add item.",
        });
      }
    }
    setSaving(false);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this deadline?");
    if (!confirm) return;

    const res = await deleteComplianceItem(id);
    if (res.success) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      setActionMessage({
        type: "success",
        text: "Compliance deadline deleted.",
      });
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      setActionMessage({
        type: "error",
        text: res.error || "Failed to delete item.",
      });
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setActionMessage(null);
    try {
      const res = await seedInitialCompliance();
      if (res.success) {
        setActionMessage({
          type: "success",
          text: `Successfully synced ${res.count || 0} compliance deadlines!`,
        });
        await fetchItems();
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to sync compliance items.",
        });
      }
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Sync error",
      });
    } finally {
      setSeeding(false);
    }
  };

  // Group items by category
  const categoriesList = Array.from(new Set(items.map((it) => it.category || "General")));

  return (
    <div className="space-y-8 w-full max-w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#B5723B]/10 text-[#B5723B]">
              <Calendar size={18} />
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[#14213A]">
              Compliance Calendar
            </h1>
          </div>
          <p className="text-xs text-[#7A7F8C]">
            Manage all Indian tax, GST, PF/ESI and ROC compliance deadlines shown on the website
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/resources/compliance-calendar"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-[#E7E4DC] bg-white text-xs font-semibold text-[#14213A] hover:bg-[#FAFAF8] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>View Live Page</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-3.5 py-2 rounded-xl border border-[#B5723B]/30 bg-[#B5723B]/5 hover:bg-[#B5723B]/10 text-xs font-semibold text-[#B5723B] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Reset / Sync default statutory deadlines"
          >
            <Sparkles size={13} className={seeding ? "animate-spin" : ""} />
            <span>{seeding ? "Syncing..." : "Sync Defaults"}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#14213A] text-white text-xs font-semibold hover:bg-[#1e3256] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Deadline</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grouped Deadlines List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#E7E4DC]">
          <RefreshCw size={24} className="animate-spin text-[#B5723B] mx-auto mb-3" />
          <p className="text-xs text-[#7A7F8C]">Loading compliance deadlines...</p>
        </div>
      ) : fetchError ? (
        <div className="text-center p-10 flex flex-col items-center">
          <AlertCircle size={32} className="text-red-500 mb-3" />
          <p className="font-heading font-semibold text-lg text-[#14213A]">
            Connection Failed
          </p>
          <p className="text-sm text-[#7A7F8C] mt-1 max-w-md">
            We couldn't connect to the database. It might be asleep or there's a network issue.
          </p>
          <button
            onClick={fetchItems}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#14213A] text-white rounded-xl text-xs font-semibold hover:bg-navy/80 transition-colors"
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-[#E7E4DC]">
          <Calendar size={28} className="text-[#7A7F8C] mx-auto" />
          <h3 className="font-heading font-bold text-base text-[#14213A]">No deadlines found</h3>
          <p className="text-xs text-[#7A7F8C]">
            Click &quot;Sync Defaults&quot; or &quot;Add Deadline&quot; to populate your compliance schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesList.map((cat) => {
            const catItems = items.filter((it) => (it.category || "General") === cat);
            return (
              <div
                key={cat}
                className="bg-white rounded-3xl border border-[#E7E4DC] shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-6 py-4 bg-[#FAFAF8] border-b border-[#E7E4DC] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers size={16} className="text-[#B5723B]" />
                    <h3 className="font-heading font-bold text-base text-[#14213A]">{cat}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#14213A]/5 text-[11px] font-semibold text-[#14213A]/70">
                      {catItems.length} items
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#E7E4DC]">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAF8]/50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                        <div className="w-28 sm:w-36 shrink-0 font-heading font-bold text-base text-[#14213A] bg-[#B5723B]/10 text-[#B5723B] px-3 py-1.5 rounded-xl text-center">
                          {item.date}
                        </div>
                        <p className="font-body text-sm text-[#14213A] font-medium leading-snug">
                          {item.task}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-[#7A7F8C] hover:text-[#14213A] hover:bg-[#FAFAF8] rounded-xl transition-colors border border-[#E7E4DC]"
                          title="Edit deadline"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[#7A7F8C] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-[#E7E4DC]"
                          title="Delete deadline"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E7E4DC] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#14213A]">
                  {editingItem ? "Edit Compliance Deadline" : "Add Compliance Deadline"}
                </h3>
                <p className="text-xs text-[#7A7F8C]">
                  Configure deadline details for the statutory calendar
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#7A7F8C] hover:text-[#14213A] hover:bg-[#FAFAF8] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Category / Schedule Period
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                >
                  {commonCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category === "Custom Deadlines" && (
                <div>
                  <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Half-Yearly Audits"
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, customCategory: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                  />
                </div>
              )}

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Due Date / Frequency (e.g. &quot;7th&quot;, &quot;15th Jun/Sep&quot;, &quot;30th Sep&quot;)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7th or 30th Sep"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B]"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-xs font-semibold text-[#14213A] uppercase tracking-wider mb-2">
                  Task / Statutory Requirement
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. TDS / TCS Deposit for previous month"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E7E4DC] rounded-xl text-xs text-[#14213A] focus:outline-none focus:border-[#B5723B] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E4DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A7F8C] hover:text-[#14213A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#14213A] text-white text-xs font-semibold hover:bg-[#1e3256] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update Deadline" : "Add Deadline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
