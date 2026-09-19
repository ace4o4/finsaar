"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import { Share2, Copy, Check } from "lucide-react";

// Inline SVGs for brand icons (Lucide removed these)
const FacebookIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedinIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const XIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
  </svg>
);

const WhatsappIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        title="Share this article"
        className={className || "text-navy/70 hover:text-copper transition-colors cursor-pointer"}
      >
        <Share2 size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-sand/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <a 
            href={`https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-navy hover:bg-sand-light/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <WhatsappIcon size={16} className="text-[#25D366]" />
            WhatsApp
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-navy hover:bg-sand-light/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LinkedinIcon size={16} className="text-[#0A66C2]" />
            LinkedIn
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-navy hover:bg-sand-light/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <XIcon size={16} className="text-black" />
            X (Twitter)
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-navy hover:bg-sand-light/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FacebookIcon size={16} className="text-[#1877F2]" />
            Facebook
          </a>
          <div className="h-px bg-sand/30 my-2"></div>
          <button 
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-navy hover:bg-sand-light/50 transition-colors text-left"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="text-navy/60" />
                Copy Link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
