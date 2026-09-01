"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { submitContactForm } from "@/app/actions/contact";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CalendarSidebarCTA() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitContactForm({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        description: formData.message,
        timeTaken: 1000, // mock time
      });
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: "", phone: "", email: "", message: "" });
      } else {
        setSubmitError(result.error || "Failed to submit form.");
      }
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter subscription
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    });
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("sidebar-contact-form");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Banner Card */}
      <div className="bg-navy rounded-2xl overflow-hidden relative p-8 shadow-xl">
        <div className="absolute inset-0 bg-copper/10"></div>
        <div className="relative z-10">
          <h3 className="text-white font-heading font-bold text-2xl mb-4 leading-tight">
            We take care of your Legal, Finance & Compliance needs!
          </h3>
          <Button variant="primary" className="mt-2 bg-copper text-white hover:bg-copper-dark border-none" onClick={scrollToContact}>
            Let&apos;s Talk
          </Button>
        </div>
      </div>

      {/* Contact Form */}
      <div id="sidebar-contact-form">
        <h3 className="font-heading font-bold text-xl text-navy mb-4">Get in touch with us</h3>
        {submitted ? (
          <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-6 text-center">
            <CheckCircle2 size={40} className="text-emerald mx-auto mb-3" />
            <h4 className="font-heading font-bold text-navy mb-2">Message Sent!</h4>
            <p className="font-body text-sm text-navy/70">
              We&apos;ll get back to you within 24 hours.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSubmitted(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name*"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-sand/60 focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none font-body text-sm bg-sand-light/20"
              />
              <input
                type="tel"
                placeholder="Phone*"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-sand/60 focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none font-body text-sm bg-sand-light/20"
              />
            </div>
            <input
              type="email"
              placeholder="Email*"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-sand/60 focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none font-body text-sm bg-sand-light/20"
            />
            <textarea
              placeholder="Your Message*"
              required
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-sand/60 focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none font-body text-sm bg-sand-light/20 resize-none"
            />
            <p className="text-xs text-navy/50 font-body">Your information is confidential and secure</p>
            
            {submitError && (
              <p className="text-red-500 text-xs font-body">{submitError}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full justify-center bg-sand text-navy hover:bg-sand-dark border-none uppercase tracking-wider text-xs font-bold py-3 disabled:opacity-70">
              {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        )}
      </div>

      {/* Newsletter */}
      <div>
        <h3 className="font-heading font-bold text-lg text-navy mb-4">Stay updated with our Newsletter</h3>
        {newsletterSubscribed ? (
          <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald shrink-0" />
            <p className="font-body text-sm text-navy/80">
              Thanks for subscribing to our newsletter!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email id"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-sand/60 focus:border-copper focus:ring-2 focus:ring-copper/20 outline-none font-body text-sm bg-sand-light/20 min-w-0"
            />
            <Button type="submit" disabled={isPending} className="bg-sand shrink-0 text-navy hover:bg-sand-dark border-none uppercase tracking-wider text-xs font-bold px-6 disabled:opacity-70">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
