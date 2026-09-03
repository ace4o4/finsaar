import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white pt-[72px]">
        {/* Hero Skeleton */}
        <section className="relative w-full min-h-[50vh] flex flex-col justify-end pt-32 pb-16 bg-navy overflow-hidden animate-pulse">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="w-32 h-4 bg-white/10 rounded mb-8"></div>
            <div className="w-3/4 md:w-1/2 h-12 md:h-16 bg-white/20 rounded-lg mb-8"></div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                <div className="flex flex-col gap-1">
                  <div className="w-16 h-3 bg-white/10 rounded"></div>
                  <div className="w-24 h-4 bg-white/20 rounded"></div>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block"></div>
              <div className="flex flex-col gap-1">
                <div className="w-16 h-3 bg-white/10 rounded"></div>
                <div className="w-24 h-4 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row lg:items-start gap-12 xl:gap-20">
            {/* Sidebar Skeleton */}
            <aside className="w-full lg:w-[350px] shrink-0 order-2 lg:order-1 animate-pulse">
              <div className="w-full h-[500px] bg-sand-light/60 rounded-[24px]"></div>
            </aside>
            
            {/* Article Skeleton */}
            <article className="order-1 lg:order-2 flex-1 min-w-0 animate-pulse">
              <div className="h-8 bg-sand/40 rounded w-1/3 mb-6"></div>
              <div className="space-y-4 mb-12">
                <div className="h-4 bg-sand/30 rounded w-full"></div>
                <div className="h-4 bg-sand/30 rounded w-full"></div>
                <div className="h-4 bg-sand/30 rounded w-11/12"></div>
                <div className="h-4 bg-sand/30 rounded w-4/5"></div>
              </div>
              
              <div className="h-8 bg-sand/40 rounded w-1/4 mb-6"></div>
              <div className="space-y-4 mb-12">
                <div className="h-4 bg-sand/30 rounded w-full"></div>
                <div className="h-4 bg-sand/30 rounded w-10/12"></div>
                <div className="h-4 bg-sand/30 rounded w-full"></div>
              </div>

              <div className="h-8 bg-sand/40 rounded w-2/5 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-sand/30 rounded w-full"></div>
                <div className="h-4 bg-sand/30 rounded w-full"></div>
                <div className="h-4 bg-sand/30 rounded w-9/12"></div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
