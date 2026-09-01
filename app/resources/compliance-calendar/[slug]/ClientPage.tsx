"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import { Share2 } from "lucide-react";

export function ComplianceCalendarDetailClient() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <ContactForm isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export function ShareButton({ title, className }: { title: string, className?: string }) {
  return (
    <button 
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title,
            url: window.location.href,
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        }
      }}
      title="Share this calendar"
      className={className || "w-10 h-10 rounded-full bg-sand-light/50 flex items-center justify-center text-navy/60 hover:bg-copper hover:text-white transition-all"}
    >
      <Share2 size={16} />
    </button>
  );
}
