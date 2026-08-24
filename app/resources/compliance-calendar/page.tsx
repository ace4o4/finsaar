"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { ComplianceGroup, getGroupedComplianceDeadlines } from "@/lib/compliance-service";
import { Calendar as CalendarIcon, Clock, Layers } from "lucide-react";

export default function ComplianceCalendarPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [groupedDeadlines, setGroupedDeadlines] = useState<ComplianceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGroupedComplianceDeadlines();
        setGroupedDeadlines(data);
      } catch (err) {
        console.error("Failed to load compliance deadlines:", err);
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-12">
              {/* Main Content Area */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                  </div>
                ) : groupedDeadlines.length === 0 ? (
                  <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-black/5">
                    <CalendarIcon className="w-12 h-12 text-navy/20 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl font-bold text-navy mb-2">No Deadlines Yet</h3>
                    <p className="text-navy/70">Check back soon for upcoming compliance deadlines.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {groupedDeadlines.map((group) => (
                      <div key={group.month} className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5">
                        <div className="flex items-center gap-3 mb-8 border-b border-sand/40 pb-6">
                          <Layers className="w-6 h-6 text-copper" />
                          <h2 className="font-heading text-3xl font-bold text-navy">{group.month}</h2>
                        </div>
                        
                        <div className="space-y-6">
                          {group.items.map((item, i) => (
                            <div 
                              key={item.id || i}
                              className="group flex flex-col md:flex-row bg-[#FBF9F6] rounded-[24px] p-6 lg:p-8 hover:shadow-md border border-black/5 transition-all duration-300"
                            >
                              {/* Date Badge */}
                              <div className="w-full md:w-48 shrink-0 mb-4 md:mb-0 flex flex-col justify-center border-r border-sand/40 pr-6">
                                <span className="font-heading font-bold text-4xl text-copper leading-none mb-2">
                                  {item.date}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/60">
                                  <Clock className="w-3.5 h-3.5" />
                                  Upcoming Deadline
                                </span>
                              </div>
                              
                              {/* Details */}
                              <div className="flex-1 md:pl-8 flex flex-col justify-center">
                                <p className="font-heading text-xl lg:text-2xl font-semibold text-navy leading-tight group-hover:text-copper transition-colors">
                                  {item.task}
                                </p>
                              </div>
                            </div>
                          ))}
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
