"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, BookOpen, TrendingUp, Calendar, BarChart2, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { 
    label: "Services", 
    href: "/services",
    dropdown: [
      { label: "Accounting & Compliance", href: "/services/accounting-compliance", desc: "End-to-end bookkeeping and tax management", icon: BookOpen },
      { label: "CFO as a Service", href: "/services/cfo-as-a-service", desc: "Strategic financial leadership for growth", icon: TrendingUp }
    ]
  },
  { label: "Calculator", href: "/calculator" },
  // { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { 
    label: "Resources", 
    href: "/resources",
    dropdown: [
      { label: "Compliance Calendar", href: "/resources/compliance-calendar", desc: "Never miss a tax or filing deadline", icon: Calendar },
      { label: "Case Studies", href: "/resources/case-studies", desc: "Real stories of how we drive growth", icon: BarChart2 }
    ]
  },
];

export default function Navbar({ onOpenContact }: { onOpenContact: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-sand/40 shadow-sm"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/imp/logo/a.png"
              alt="Finsaar"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => (
              <div 
                key={link.href} 
                className="relative h-full flex items-center group"
              >
                {link.dropdown ? (
                  <button
                    className="text-navy/70 hover:text-copper font-body text-[14.5px] font-semibold transition-colors duration-300 relative flex items-center gap-1.5 cursor-default"
                  >
                    {link.label}
                    <ChevronDown size={14} className="opacity-60 group-hover:rotate-180 transition-transform duration-300" />
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-copper transition-all duration-300 group-hover:w-full" />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="text-navy/70 hover:text-copper font-body text-[14.5px] font-semibold transition-colors duration-300 relative flex items-center gap-1.5"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-copper transition-all duration-300 group-hover:w-full" />
                  </Link>
                )}

                {/* Stripe-Level Ultra-Premium Dropdown Menu */}
                {link.dropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="w-[380px] bg-white rounded-3xl shadow-[0_30px_100px_-10px_rgba(20,33,58,0.15)] border border-black/[0.04] p-3 relative overflow-hidden">
                      {/* Glossy inner reflection */}
                      <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,1)] pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col gap-1.5">
                        {link.dropdown.map((dropItem) => {
                          const Icon = dropItem.icon;
                          return (
                            <Link
                              key={dropItem.href}
                              href={dropItem.href}
                              className="relative flex items-start gap-5 p-4 rounded-2xl bg-white hover:bg-[#FDFDFD] transition-all duration-300 group/item overflow-hidden"
                            >
                              {/* Hover background gradient */}
                              <div className="absolute inset-0 bg-gradient-to-r from-copper/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                              
                              <div className="relative mt-1 flex items-center justify-center w-12 h-12 rounded-[14px] bg-gray-50 border border-black/5 group-hover/item:border-copper/20 group-hover/item:bg-white group-hover/item:shadow-sm transition-all duration-300 shrink-0">
                                {Icon && <Icon size={22} className="text-navy/50 group-hover/item:text-copper transition-colors duration-300" />}
                              </div>
                              
                              <div className="relative z-10 flex-1">
                                <div className="font-heading font-semibold text-navy text-[16px] group-hover/item:text-copper transition-colors duration-300 mb-1 flex items-center justify-between">
                                  {dropItem.label}
                                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-copper" />
                                </div>
                                <div className="font-body text-navy/60 text-[13.5px] leading-relaxed group-hover/item:text-navy/70 transition-colors duration-300">
                                  {dropItem.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Button size="sm" onClick={onOpenContact}>
              Book a Strategy Call
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-navy"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-sand/30 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <div 
                    className="flex items-center justify-between py-2"
                    onClick={() => link.dropdown ? setOpenDropdown(openDropdown === link.label ? null : link.label) : setMobileOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="text-navy font-body text-lg font-semibold hover:text-copper transition-colors"
                      onClick={(e) => link.dropdown && e.preventDefault()}
                    >
                      {link.label}
                    </Link>
                    {link.dropdown && (
                      <button className="p-2 text-navy/60">
                        <ChevronDown size={20} className={`transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Dropdown */}
                  <AnimatePresence>
                    {link.dropdown && openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 space-y-3 overflow-hidden"
                      >
                        {link.dropdown.map((dropItem) => {
                          const Icon = dropItem.icon;
                          return (
                            <Link
                              key={dropItem.href}
                              href={dropItem.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-start gap-3 py-3"
                            >
                              <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-sand/20 shrink-0 text-navy">
                                {Icon && <Icon size={16} />}
                              </div>
                              <div>
                                <div className="font-heading font-medium text-navy text-[15px]">{dropItem.label}</div>
                                <div className="font-body text-navy/60 text-[13px]">{dropItem.desc}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <div className="pt-4">
                <Button
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenContact();
                  }}
                >
                  Book a Strategy Call
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
