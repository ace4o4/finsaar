"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarPost } from "@/lib/calendar-data";
import { getCalendarPosts } from "@/lib/calendar-service";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, Clock } from "lucide-react";

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Main Content Area */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                  </div>
                ) : calendars.length === 0 ? (
                  <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-black/5">
                    <CalendarIcon className="w-12 h-12 text-navy/20 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl font-bold text-navy mb-2">No Calendars Yet</h3>
                    <p className="text-navy/70">Check back soon for upcoming compliance deadlines.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {calendars.map((cal) => (
                      <div 
                        key={cal.slug} 
                        className="group flex flex-col md:flex-row bg-white rounded-[24px] p-6 lg:p-8 shadow-sm hover:shadow-md border border-black/5 transition-all duration-300"
                      >
                        {/* Month Badge */}
                        <div className="w-full md:w-48 shrink-0 mb-6 md:mb-0 flex flex-col justify-center border-r border-sand/40 pr-6">
                          <span className="font-heading font-bold text-3xl text-navy uppercase leading-none">
                            {new Date(cal.date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="font-heading font-semibold text-2xl text-navy/50">
                            {new Date(cal.date).toLocaleDateString("en-US", { year: "numeric" })}
                          </span>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 md:pl-8 flex flex-col justify-center">
                          <h3 className="font-heading text-xl lg:text-2xl font-bold text-navy mb-2 group-hover:text-copper transition-colors">
                            {cal.title}
                          </h3>
                          <p className="text-navy/70 mb-4 line-clamp-2">
                            {cal.excerpt || "Monthly regulatory filings, tax submissions, and reporting deadlines."}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#FBF9F6] text-navy px-3 py-1.5 rounded-full border border-sand">
                              <Clock className="w-3.5 h-3.5" />
                              Status: Upcoming
                            </span>
                            
                            <Link 
                              href={`/resources/compliance-calendar/${cal.slug}`}
                              className="inline-flex items-center gap-2 font-medium text-copper hover:text-navy transition-colors text-sm lg:text-base"
                            >
                              View Calendar
                              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
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
