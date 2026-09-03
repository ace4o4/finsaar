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
import { ArrowUpRight, Calendar as CalendarIcon, PhoneCall, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import CalendarSidebarCTA from "@/components/CalendarSidebarCTA";

const FacebookIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
  </svg>
);

const TwitterIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
  </svg>
);

const WhatsappIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.891-4.444 9.893-9.892.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.738-.974zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);


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
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
              
              {/* Sidebar Area (Left) */}
              <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-12 pt-6">
                <CalendarSidebarCTA />
              </div>

              {/* Main Content Area (Right) */}
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
                  <div className="flex flex-col gap-6">
                    {calendars.map((cal, index) => (
                      <motion.div
                        key={cal.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link 
                          href={`/resources/compliance-calendar/${cal.slug}`}
                          className="group bg-white rounded-[20px] p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 border border-black/5 hover:border-copper/20 hover:shadow-xl transition-all duration-300"
                        >
                          {/* Date Block */}
                          <div className="w-full sm:w-[120px] md:w-[140px] shrink-0">
                            {cal.image ? (
                              <div className="relative w-full h-full rounded-[16px] overflow-hidden shadow-sm">
                                <Image 
                                  src={cal.image} 
                                  alt={cal.title} 
                                  fill 
                                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-navy/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-[#FBF9F6] border border-sand/50 rounded-[16px] flex flex-col justify-center items-center group-hover:border-copper/20 transition-colors">
                                <span className="font-heading font-bold text-4xl text-navy leading-none mb-1 group-hover:text-copper transition-colors">
                                  {new Date(cal.date).toLocaleDateString("en-US", { day: "2-digit" })}
                                </span>
                                <span className="font-heading font-bold text-xl text-navy/80 uppercase tracking-wider mb-0.5">
                                  {new Date(cal.date).toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="font-heading font-semibold text-sm text-navy/40">
                                  {new Date(cal.date).toLocaleDateString("en-US", { year: "numeric" })}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between h-full pt-1">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-navy/60 uppercase tracking-wider bg-[#FBF9F6] px-3 py-1 rounded-full border border-sand/50">
                                  {new Date(cal.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} <span className="mx-1 text-sand">|</span> {cal.category || "Calendar"}
                                </span>
                                
                                <div className="flex items-center gap-3 text-navy/30">
                                  <Share2 size={14} className="hover:text-copper cursor-pointer transition-colors" />
                                  <LinkedinIcon size={14} className="hover:text-[#0077b5] cursor-pointer transition-colors" />
                                  <WhatsappIcon size={14} className="hover:text-[#25D366] cursor-pointer transition-colors" />
                                  <TwitterIcon size={14} className="hover:text-[#1DA1F2] cursor-pointer transition-colors" />
                                  <FacebookIcon size={14} className="hover:text-[#4267B2] cursor-pointer transition-colors" />
                                </div>
                              </div>
                              
                              <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-navy mb-2 group-hover:text-copper transition-colors leading-snug pr-2">
                                {cal.title}
                              </h3>
                              
                              <p className="text-navy/60 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2">
                                {cal.excerpt || "Monthly regulatory filings, tax submissions, and reporting deadlines checklist."}
                              </p>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between border-t border-sand/30 pt-3">
                              <span className="text-[#E5B76E] font-semibold text-sm group-hover:text-copper transition-colors uppercase tracking-wide flex items-center">
                                Read More 
                                <span className="inline-flex w-7 h-7 ml-3 rounded-full bg-[#F5C77E]/10 group-hover:bg-copper/10 items-center justify-center transition-colors">
                                  <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </span>
                              </span>
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
