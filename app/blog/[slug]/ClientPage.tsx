"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import { Share2, Check } from "lucide-react";

export function BlogPostClient() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <ContactForm isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title, url: window.location.href }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
          }
        }}
        title="Share this article"
        className={className || "text-navy/70 hover:text-copper transition-colors cursor-pointer"}
      >
        {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
      </button>
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full z-50">
          Link copied!
        </span>
      )}
    </div>
  );
}
