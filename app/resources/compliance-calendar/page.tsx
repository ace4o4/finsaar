"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarPost } from "@/lib/calendar-data";
import { getCalendarPosts } from "@/lib/calendar-service";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ComplianceCalendarPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [calendars, setCalendars] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCalendarPosts({ includeDrafts: false });
        setCalendars(data);
      } catch (err) {
        console.error("Failed to load calendars:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <main className="flex-1 bg-[#FBF9F6] min-h-screen pb-24">
        <PageHeader
          badge="Resources"
          title={<>Compliance <span className="text-copper">Calendars</span></>}
          subtitle="Monthly regulatory filings, tax submissions, and reporting deadlines."
        />

        <section className="relative z-10 -mt-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-12">
              
              {/* Main Content Area */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper"></div>
                  </div>
                ) : calendars.length === 0 ? (
                  <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-black/5">
                    <CalendarIcon className="w-12 h-12 text-navy/20 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl font-bold text-navy mb-2">No Calendars Yet</h3>
                    <p className="text-navy/70">Check back soon for upcoming compliance deadlines.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {calendars.map((cal, i) => (
                      <motion.div
                        key={cal.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link 
                          href={`/resources/compliance-calendar/${cal.slug}`}
                          className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(20,33,58,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(20,33,58,0.1)] border border-sand/40 hover:border-copper/30 transition-all duration-500 relative h-full"
                        >
                          {/* Hover Glow Effect */}
                          <div className="absolute -inset-2 bg-gradient-to-br from-copper/0 to-copper/0 group-hover:from-copper/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />
                          
                          {/* Optional Image / Month Badge area */}
                          {cal.image ? (
                            <div className="relative w-full h-56 lg:h-64 shrink-0 overflow-hidden">
                              <Image 
                                src={cal.image} 
                                alt={cal.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-navy/10 mix-blend-overlay" />
                            </div>
                          ) : (
                            <div className="w-full h-56 lg:h-64 shrink-0 bg-[#FBF9F6] p-8 flex flex-col justify-center items-center text-center border-b border-sand/40">
                              <span className="font-heading font-bold text-4xl lg:text-5xl text-navy uppercase leading-none mb-2">
                                {new Date(cal.date).toLocaleDateString("en-US", { month: "short" })}
                              </span>
                              <span className="font-heading font-semibold text-2xl text-navy/40">
                                {new Date(cal.date).toLocaleDateString("en-US", { year: "numeric" })}
                              </span>
                            </div>
                          )}
                          
                          {/* Details */}
                          <div className="flex-1 p-8 flex flex-col relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-heading font-semibold text-xs bg-copper/10 text-copper px-3 py-1 rounded-full uppercase tracking-wider">
                                {cal.category || "Deadlines"}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs font-body text-navy/40 font-medium">
                                <Clock size={12} /> Upcoming
                              </span>
                            </div>
                            
                            <h3 className="font-heading text-xl lg:text-2xl font-bold text-navy mb-3 group-hover:text-copper transition-colors line-clamp-2">
                              {cal.title}
                            </h3>
                            <p className="text-navy/60 mb-6 line-clamp-3 leading-relaxed text-sm lg:text-base">
                              {cal.excerpt || "Monthly regulatory filings, tax submissions, and reporting deadlines."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-sand/20">
                              <div className="flex items-center gap-2">
                                <CalendarIcon size={16} className="text-navy/30" />
                                <span className="font-body text-xs md:text-sm font-medium text-navy/50">
                                  {new Date(cal.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 font-heading font-semibold text-copper group-hover:text-copper-dark transition-colors text-sm">
                                View
                                <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center group-hover:bg-copper group-hover:text-white transition-all duration-300">
                                  <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactForm isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
