"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getBlogPost, BlogPost } from "@/lib/blog-data";
import { getBlogPostBySlug } from "@/lib/blog-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, Globe, MessageCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import CalendarSidebarCTA from "@/components/CalendarSidebarCTA";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [contactOpen, setContactOpen] = useState(false);
  const { slug } = React.use(params);
  const [post, setPost] = useState<BlogPost | null>(() => getBlogPost(slug) || null);
  const [loading, setLoading] = useState(!post);

  useEffect(() => {
    async function loadPost() {
      try {
        const livePost = await getBlogPostBySlug(slug);
        if (livePost) {
          setPost(livePost);
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 bg-white pt-[72px]">
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
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar onOpenContact={() => setContactOpen(true)} />
      <main className="flex-1 pt-[72px] bg-white">
        
        {/* Post Header / Hero */}
        <section className="relative w-full min-h-[50vh] flex flex-col justify-end pt-32 pb-16 bg-navy overflow-hidden">
          {post.image && (
            <div className="absolute inset-0 z-0">
              <Image src={post.image} alt={post.title} fill className="object-cover opacity-40 mix-blend-overlay" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 w-full">
            <Link href="/blog" className="inline-flex items-center gap-2 font-body text-sm text-sand/70 hover:text-sand transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Insights
            </Link>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-8 max-w-5xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sand/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-white text-sm">
                    {post.author ? post.author.split(" ").map((n: string) => n[0]).join("") : "F"}
                  </span>
                </div>
                <div>
                  <p className="font-body text-[10px] text-sand/60 uppercase tracking-wider mb-0.5">Written By</p>
                  <p className="font-heading font-semibold text-sm text-white">{post.author}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-sand/20 hidden md:block"></div>

              <div className="flex flex-col gap-0.5">
                <p className="font-body text-[10px] text-sand/60 uppercase tracking-wider">Published On</p>
                <p className="font-body font-medium text-sm text-white flex items-center gap-1.5">
                  <Calendar size={14} className="text-copper" /> {post.date}
                </p>
              </div>

              <div className="w-px h-8 bg-sand/20 hidden md:block"></div>

              <div className="flex flex-col gap-0.5">
                <p className="font-body text-[10px] text-sand/60 uppercase tracking-wider">Category</p>
                <span className="px-3 py-1 bg-copper/20 text-copper-light rounded-full text-[10px] font-heading font-semibold uppercase tracking-wider mt-0.5 w-max">
                  {post.category}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row lg:items-start gap-12 xl:gap-20 relative">
            
            {/* Sidebar CTA - sticky */}
            <aside className="w-full lg:w-[350px] shrink-0 order-2 lg:order-1 sticky top-32 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-8">
              <CalendarSidebarCTA />
            </aside>

            {/* Markdown Body */}
            <article className="order-1 lg:order-2 flex-1 w-full max-w-5xl font-body text-navy/80">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="font-heading font-extrabold text-2xl md:text-3xl text-navy mt-8 mb-4 leading-tight tracking-tight border-b border-sand/40 pb-3"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="font-heading font-bold text-xl md:text-2xl text-navy mt-8 mb-4 border-b border-sand/40 pb-2"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="font-heading font-semibold text-lg md:text-xl text-copper mt-6 mb-3"
                      {...props}
                    />
                  ),
                  h4: ({ ...props }) => (
                    <h4
                      className="font-heading font-semibold text-base text-navy mt-4 mb-2"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-[16px] md:text-[17px] leading-relaxed mb-6 text-navy/80" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      className="list-disc list-outside ml-6 space-y-2 font-body text-base text-navy/80 my-5"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="list-decimal list-outside ml-6 space-y-2 font-body text-base text-navy/80 my-5"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="leading-relaxed pl-1" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="border-l-4 border-copper pl-5 italic text-navy/70 my-6 bg-sand-light/30 py-3 rounded-r-2xl"
                      {...props}
                    />
                  ),
                  code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) => {
                    return (
                      <code
                        className="bg-sand-light/60 px-1.5 py-0.5 rounded text-sm font-mono text-navy font-semibold"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ ...props }) => (
                    <pre
                      className="bg-navy text-[#FAFAF8] p-5 rounded-2xl overflow-x-auto text-sm font-mono my-6 border border-navy/20 shadow-md"
                      {...props}
                    />
                  ),
                  a: ({ ...props }) => (
                    <a
                      className="text-copper underline font-medium hover:text-copper-dark transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-8 border-sand/40" {...props} />
                  ),
                  table: ({ ...props }) => (
                    <div className="overflow-x-auto my-6 border border-sand/40 rounded-2xl shadow-sm">
                      <table
                        className="min-w-full divide-y divide-sand/40 text-sm text-left"
                        {...props}
                      />
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th
                      className="bg-sand-light/50 px-5 py-3 font-heading font-semibold text-navy"
                      {...props}
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      className="px-5 py-3 border-t border-sand/30 text-navy/80"
                      {...props}
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-sand/40">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-sand-light/50 text-navy/60 text-xs font-body rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

          </div>
        </section>

      </main>
      <Footer />
      <ContactForm isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
