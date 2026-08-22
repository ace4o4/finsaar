"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import DirectionHover from "@/components/DirectionHover";

const footerLinks = {
  services: [
    { label: "Accounts & Compliance", href: "/services/accounting-compliance" },
    { label: "CFO as a Service", href: "/services/cfo-as-a-service" },
    // { label: "Capital Advisory", href: "/services/capital-advisory" },
    { label: "ROI Calculator", href: "/calculator" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    // { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Resources", href: "/resources" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const letters = ["F", "I", "N", "S", "A", "A", "R"];

export default function Footer() {
  return (
    <footer className="relative bg-navy overflow-hidden z-[90] rounded-t-[2rem] md:rounded-t-[3rem] -mt-8 shadow-[0_-10px_50px_rgba(0,0,0,0.2)] pt-8 md:pt-16">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-10 md:mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Image
              src="/imp/logo/b.png"
              alt="Finsaar"
              width={150}
              height={42}
              className="h-10 w-auto object-contain brightness-0 invert opacity-90"
            />
            <p className="font-body text-[14px] text-white/35 leading-relaxed max-w-sm">
              Boutique CFO-as-a-service for India&apos;s fastest-growing
              startups and SMEs. Your embedded financial operating system.
            </p>

            {/* Newsletter */}
            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] max-w-sm">
              <p className="font-heading font-semibold text-sm text-white/80 mb-1">
                Stay ahead of compliance
              </p>
              <p className="font-body text-xs text-white/25 mb-3">
                Weekly insights on GST, tax, and financial strategy.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-body text-sm placeholder:text-white/20 outline-none focus:border-copper/40 transition-all min-h-[44px]"
                />
                <button className="px-4 py-2.5 rounded-xl bg-copper hover:bg-copper-dark text-white font-heading font-semibold text-sm transition-colors cursor-pointer min-h-[44px]">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {[
                { icon: Globe, href: "#", label: "Website" },
                { icon: Mail, href: "mailto:hello@finsaar.com", label: "Email" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-copper hover:border-copper/30 transition-all duration-300"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-10">
            {/* Services */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-white/25 uppercase tracking-[0.2em] mb-5">
                Services
              </h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-[13px] text-white/35 hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                    >
                      <DirectionHover
                        title={link.label}
                        font={{ fontSize: 13, fontFamily: "var(--font-inter)", fontWeight: 400 }}
                        textColor="rgba(255,255,255,0.35)"
                        hoverColor="#ffffff"
                      />
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-copper"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-white/25 uppercase tracking-[0.2em] mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-[13px] text-white/35 hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                    >
                      <DirectionHover
                        title={link.label}
                        font={{ fontSize: 13, fontFamily: "var(--font-inter)", fontWeight: 400 }}
                        textColor="rgba(255,255,255,0.35)"
                        hoverColor="#ffffff"
                      />
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-copper"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-white/25 uppercase tracking-[0.2em] mb-5">
                Contact
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-copper shrink-0 mt-1" />
                  <div className="font-body text-[13px] text-white/35">
                    <p className="text-white/60">Gurgaon, Bengaluru, Ahmedabad</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail size={14} className="text-copper shrink-0 mt-0.5" />
                  <a href="mailto:hello@finsaar.com" className="font-body text-[13px] text-white/35 hover:text-copper transition-colors">
                    hello@finsaar.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone size={14} className="text-copper shrink-0 mt-0.5" />
                  <a href="tel:+919876543210" className="font-body text-[13px] text-white/35 hover:text-copper transition-colors">
                    +91 98765 43210
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-body text-xs text-white/15">
            © {new Date().getFullYear()} Finsaar. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} href={link.href} className="group">
                <DirectionHover
                  title={link.label}
                  font={{ fontSize: 12, fontFamily: "var(--font-inter)", fontWeight: 400 }}
                  textColor="rgba(255,255,255,0.15)"
                  hoverColor="rgba(255,255,255,0.3)"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Animated FINSAAR Text Without Parallax ── */}
      <div className="relative pt-0 pb-2 px-4 -mt-6 md:-mt-10 flex flex-col items-center overflow-hidden z-0">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-copper/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-center tracking-tighter gap-1 md:gap-2">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              whileHover={{
                scale: 1.1,
                color: "#B5723B",
                textShadow: "0 0 30px rgba(181, 114, 59, 0.5)",
                transition: { duration: 0.2 }
              }}
              className="font-heading font-extrabold text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] leading-none text-white/5 hover:text-copper cursor-default transition-colors duration-500"
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="font-body text-[10px] sm:text-xs text-white/15 uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-4"
        >
          Your Embedded Financial Operating System
        </motion.p>
      </div>
    </footer>
  );
}
