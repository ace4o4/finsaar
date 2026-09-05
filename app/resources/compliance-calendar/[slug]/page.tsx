import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import CalendarSidebarCTA from "@/components/CalendarSidebarCTA";
import { getCalendarPostBySlug, getCalendarPosts } from "@/lib/calendar-service";
import { ComplianceCalendarDetailClient, ShareButton } from "./ClientPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCalendarPostBySlug(slug);

  if (!post) {
    return {
      title: "Calendar Not Found | Finsaar",
    };
  }

  return {
    title: `${post.title} | Finsaar Compliance Calendar`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getCalendarPosts({ includeDrafts: false });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function ComplianceCalendarDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Artificial delay to show the skeleton loading screen (as requested for UX)
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const post = await getCalendarPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  // Format date as DD-MM-YYYY
  const dateObj = new Date(post.date);
  const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

  return (
    <>
      <ComplianceCalendarDetailClient />
      <main className="flex-1 pt-[72px] bg-white">
        {/* Banner Image Section - Fixed Height, Fully Contained, Seamless Background */}
        {post.image && (
          <section 
            className="w-full border-b border-navy/20 relative"
            style={{ background: 'linear-gradient(to right, #14213A 50%, #e6d3b3 50%)' }}
          >
            <div className="w-full mx-auto flex justify-center">
              <Image 
                src={post.image} 
                alt={post.title} 
                width={1920} 
                height={1080} 
                className="w-full h-[350px] md:h-[450px] lg:h-[550px] object-contain object-center block" 
                priority 
              />
            </div>
          </section>
        )}

        {/* Post Header (Title & Meta) - Full Width with Negative Spacing */}
        <section className="w-full bg-white relative z-10 -mt-8 md:-mt-12 lg:-mt-16 pt-8 md:pt-12 pb-10 border-b border-sand/30 rounded-t-3xl md:rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <Link href="/resources/compliance-calendar" className="inline-flex items-center gap-2 font-body text-sm font-medium text-navy/60 hover:text-copper transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Calendars
            </Link>
            
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
              <div className="flex-1 max-w-5xl">
                <h1 className="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-navy leading-tight">
                  {post.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-6 shrink-0 xl:pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center shadow-md">
                    <span className="font-heading font-bold text-white text-sm">
                      {post.author ? post.author.split(" ").map((n: string) => n[0]).join("") : "F"}
                    </span>
                  </div>
                  <div>
                    <p className="font-body text-[10px] text-navy/50 uppercase tracking-widest mb-0.5 font-bold">Written By</p>
                    <p className="font-heading font-bold text-navy text-sm">{post.author || "Finsaar Team"}</p>
                  </div>
                </div>

                <div className="w-px h-10 bg-sand/60 hidden sm:block"></div>

                <div>
                  <p className="font-body text-[10px] text-navy/50 uppercase tracking-widest mb-0.5 font-bold">Published On</p>
                  <p className="font-heading font-bold text-navy text-sm flex items-center gap-1.5">
                    <Calendar size={15} className="text-copper" />
                    {formattedDate}
                  </p>
                </div>

                <div className="w-px h-10 bg-sand/60 hidden sm:block"></div>

                <div className="flex flex-col gap-0.5">
                  <p className="font-body text-[10px] text-navy/50 uppercase tracking-widest font-bold mb-0.5">Share</p>
                  <div className="text-navy flex items-center justify-start text-sm">
                    <ShareButton title={post.title} className="text-navy/70 hover:text-copper transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-white">
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
                    <h1 className="font-heading font-extrabold text-2xl md:text-4xl text-navy mt-10 mb-6 leading-tight tracking-tight border-b border-sand/40 pb-4" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="font-heading font-bold text-xl md:text-3xl text-navy mt-10 mb-5 border-b border-sand/40 pb-3" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="font-heading font-semibold text-lg md:text-2xl text-copper mt-8 mb-4" {...props} />
                  ),
                  h4: ({ ...props }) => (
                    <h4 className="font-heading font-semibold text-base md:text-xl text-navy mt-6 mb-3" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-[16px] md:text-[17px] leading-relaxed mb-6 text-navy/80" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="font-bold text-navy bg-sand-light/30 px-1 py-0.5 rounded" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="list-disc list-outside ml-6 space-y-3 text-base md:text-[17px] leading-relaxed my-6 bg-sand-light/10 p-4 rounded-xl border border-sand/20" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="list-decimal list-outside ml-6 space-y-3 text-base md:text-[17px] leading-relaxed my-6 bg-sand-light/10 p-4 rounded-xl border border-sand/20" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="pl-2 marker:text-copper" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote className="border-l-4 border-copper pl-6 italic text-navy/70 my-8 bg-sand-light/20 py-4 pr-4 rounded-r-2xl text-lg" {...props} />
                  ),
                  code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) => {
                    return (
                      <code className="bg-navy/5 text-copper px-1.5 py-0.5 rounded-md text-sm font-mono font-medium border border-navy/10" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ ...props }) => (
                    <pre className="bg-navy text-[#FAFAF8] p-6 rounded-2xl overflow-x-auto text-sm font-mono my-8 border border-navy/20 shadow-lg leading-relaxed" {...props} />
                  ),
                  a: ({ ...props }) => (
                    <a className="text-copper underline decoration-copper/30 underline-offset-4 font-semibold hover:decoration-copper hover:text-copper-dark transition-all" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-10 border-sand/60" {...props} />
                  ),
                  table: ({ ...props }) => (
                    <div className="overflow-x-auto my-8 border border-sand/60 rounded-2xl shadow-sm">
                      <table className="min-w-full divide-y divide-sand/40 text-sm text-left" {...props} />
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th className="bg-sand-light/80 px-6 py-4 font-heading font-bold text-navy whitespace-nowrap" {...props} />
                  ),
                  td: ({ ...props }) => (
                    <td className="px-6 py-4 border-t border-sand/30 text-navy/80 leading-relaxed" {...props} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-sand/40">
                {post.tags?.map((tag: string) => (
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
    </>
  );
}
