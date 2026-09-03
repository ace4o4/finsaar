"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { blogPosts as initialBlogPosts, blogCategories, BlogPost } from "@/lib/blog-data";
import { getBlogPosts } from "@/lib/blog-service";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import CalendarSidebarCTA from "@/components/CalendarSidebarCTA";

export default function BlogPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLivePosts() {
      try {
        const livePosts = await getBlogPosts();
        if (livePosts && livePosts.length > 0) {
          setPosts(livePosts);
        } else {
          setPosts(initialBlogPosts);
        }
      } catch (err) {
        console.error("Error loading live blog posts:", err);
        setPosts(initialBlogPosts);
      } finally {
        setLoading(false);
      }
    }
    loadLivePosts();
  }, []);

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <main className="flex-1">
        <PageHeader
          badge="Finsaar Insights"
          title={<>Financial intelligence for <span className="text-copper">scaling startups</span></>}
          subtitle="Expert insights, compliance updates, and strategic advice from our team of Founder CFOs."
        />

        <section className="relative z-10 -mt-10 pb-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10 pt-4">
              {blogCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-body font-medium transition-colors duration-300 ${
                    activeCategory === category
                      ? "bg-navy text-white"
                      : "bg-white text-navy/70 hover:bg-sand-light hover:text-navy"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
              {/* Sidebar Area (Left) */}
              <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-12">
                <CalendarSidebarCTA />
              </div>

              {/* Main Content Area (Right) */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex flex-col gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-[20px] p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 border border-sand/30 animate-pulse">
                        <div className="w-full sm:w-[120px] md:w-[140px] shrink-0 h-40 sm:h-32 bg-sand-light/60 rounded-[12px]" />
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-24 h-5 bg-sand-light/60 rounded-full" />
                              <div className="w-16 h-4 bg-sand-light/60 rounded-full" />
                            </div>
                            <div className="w-3/4 h-6 bg-sand-light/60 rounded mb-3" />
                            <div className="w-full h-4 bg-sand-light/60 rounded mb-1.5" />
                            <div className="w-5/6 h-4 bg-sand-light/60 rounded" />
                          </div>
                          <div className="mt-6 pt-3 border-t border-sand/20 flex justify-between">
                             <div className="w-20 h-4 bg-sand-light/60 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-black/5">
                    <h3 className="font-heading text-2xl font-bold text-navy mb-2">No Posts Found</h3>
                    <p className="text-navy/70">Check back soon for new insights in this category.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {filteredPosts.map((post, index) => (
                      <motion.div
                        key={post.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="group bg-white rounded-[20px] p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 border border-black/5 hover:border-copper/20 hover:shadow-xl transition-all duration-300"
                        >
                          {/* Image Block (Replaces Date Block) */}
                          <div className="w-full sm:w-[120px] md:w-[140px] shrink-0 h-40 sm:h-auto relative rounded-[12px] overflow-hidden">
                            {post.image ? (
                              <Image 
                                src={post.image} 
                                alt={post.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                              />
                            ) : (
                              <div className="w-full h-full bg-sand-light/50 flex items-center justify-center">
                                <span className="font-heading font-bold text-navy/30">Finsaar</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-navy/10 mix-blend-overlay" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between h-full pt-1">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-navy/60 uppercase tracking-wider bg-[#FBF9F6] px-3 py-1 rounded-full border border-sand/50">
                                  {post.date} <span className="mx-1 text-sand">|</span> {post.category}
                                </span>
                                
                                <span className="flex items-center gap-1.5 text-xs font-body text-navy/40 font-medium">
                                  <Clock size={12} /> {post.readTime}
                                </span>
                              </div>
                              
                              <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-navy mb-2 group-hover:text-copper transition-colors leading-snug pr-2">
                                {post.title}
                              </h3>
                              
                              <p className="text-navy/60 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2">
                                {post.excerpt}
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
