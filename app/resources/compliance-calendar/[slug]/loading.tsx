import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[72px] bg-white animate-pulse">
        
        {/* Post Header Skeleton */}
        <section className="bg-white py-12 md:py-20 border-b border-sand/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 font-body text-sm text-navy/20 mb-8">
              <ArrowLeft size={16} /> <div className="h-4 w-32 bg-sand rounded"></div>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-24 bg-sand/80 rounded-full"></div>
              <div className="flex items-center gap-1.5 text-xs">
                <Clock size={14} className="text-navy/20" /> <div className="h-3 w-16 bg-sand rounded"></div>
              </div>
            </div>

            <div className="h-10 md:h-14 bg-sand/70 rounded-lg w-3/4 mb-4"></div>
            <div className="h-10 md:h-14 bg-sand/70 rounded-lg w-1/2 mb-6"></div>
            
            <div className="h-5 bg-sand/50 rounded w-full mb-3"></div>
            <div className="h-5 bg-sand/50 rounded w-11/12 mb-3"></div>
            <div className="h-5 bg-sand/50 rounded w-4/5 mb-8"></div>

            <div className="flex items-center justify-between py-6 border-y border-sand/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sand/80"></div>
                <div>
                  <div className="h-4 w-24 bg-sand/70 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-sand/50 rounded"></div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1.5 justify-end mb-2">
                  <Calendar size={14} className="text-navy/20" /> <div className="h-3 w-16 bg-sand rounded"></div>
                </div>
                <div className="h-4 w-28 bg-sand/70 rounded"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image Skeleton */}
        <section className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl bg-sand/40 border border-sand/30"></div>
          </div>
        </section>

        {/* Post Content Skeleton */}
        <section className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
            
            {/* Social Share sidebar skeleton */}
            <div className="md:w-16 shrink-0 order-2 md:order-1">
              <div className="flex md:flex-col gap-4 items-center">
                <div className="h-3 w-10 md:w-3 md:h-10 bg-sand/60 rounded mb-4"></div>
                <div className="w-8 h-8 rounded-full bg-sand/60"></div>
                <div className="w-8 h-8 rounded-full bg-sand/60"></div>
                <div className="w-8 h-8 rounded-full bg-sand/60"></div>
              </div>
            </div>

            {/* Markdown Body Skeleton */}
            <article className="order-1 md:order-2 flex-1 min-w-0">
              <div className="h-8 bg-sand/70 rounded w-1/3 mt-8 mb-6"></div>
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-sand/40 rounded w-full"></div>
                <div className="h-4 bg-sand/40 rounded w-full"></div>
                <div className="h-4 bg-sand/40 rounded w-11/12"></div>
                <div className="h-4 bg-sand/40 rounded w-4/5"></div>
              </div>
              
              <div className="h-6 bg-sand/70 rounded w-1/4 mt-8 mb-4"></div>
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-sand/40 rounded w-full"></div>
                <div className="h-4 bg-sand/40 rounded w-10/12"></div>
                <div className="h-4 bg-sand/40 rounded w-full"></div>
              </div>

              <div className="h-6 bg-sand/70 rounded w-2/5 mt-8 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-sand/40 rounded w-full"></div>
                <div className="h-4 bg-sand/40 rounded w-full"></div>
                <div className="h-4 bg-sand/40 rounded w-9/12"></div>
              </div>
            </article>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
