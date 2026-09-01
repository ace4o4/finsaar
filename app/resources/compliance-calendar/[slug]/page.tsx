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

  // Format date
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <ComplianceCalendarDetailClient />
      <main className="flex-1 pt-[72px] bg-white">
        {/* Post Header / Hero */}
        <section className="relative w-full min-h-[50vh] flex flex-col justify-end pt-32 pb-16 bg-navy overflow-hidden">
          {post.image && (
            <div className="absolute inset-0 z-0">
              <Image src={post.image} alt={post.title} fill className="object-cover opacity-40 mix-blend-overlay" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Link href="/resources/compliance-calendar" className="inline-flex items-center gap-2 font-body text-sm text-sand/70 hover:text-sand transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Calendars
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
                  <p className="font-heading font-semibold text-white text-sm">{post.author || "Finsaar Team"}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-sand/20 hidden md:block"></div>

              <div>
                <p className="font-body text-[10px] text-sand/60 uppercase tracking-wider mb-0.5">Published On</p>
                <p className="font-heading font-semibold text-white text-sm">{formattedDate}</p>
              </div>

              <div className="w-px h-8 bg-sand/20 hidden md:block"></div>

              <div className="flex flex-col gap-0.5">
                <p className="font-body text-[10px] text-sand/60 uppercase tracking-wider">Share</p>
                <div className="text-white flex items-center justify-start mt-0.5">
                  <ShareButton title={post.title} className="text-white/80 hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <section className="py-12 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 relative">
            
            {/* Sidebar CTA - sticky */}
            <aside className="lg:w-[380px] shrink-0 order-2 lg:order-1 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-8">
              <CalendarSidebarCTA />
            </aside>

            {/* Markdown Body */}
            <article className="order-1 lg:order-2 flex-1 min-w-0 font-body text-navy/80">
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
                    <p className="text-base md:text-[17px] leading-[1.8] md:leading-[2] mb-6 tracking-wide" {...props} />
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
