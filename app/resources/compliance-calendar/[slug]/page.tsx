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
        
        {/* Post Header */}
        <section className="bg-white py-12 md:py-20 border-b border-sand/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/resources/compliance-calendar" className="inline-flex items-center gap-2 font-body text-sm text-navy/50 hover:text-copper transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Calendars
            </Link>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-copper/10 text-copper rounded-full text-xs font-heading font-semibold uppercase tracking-wider">
                {post.category || "Monthly Calendar"}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-body text-navy/50">
                <Clock size={14} /> 5 min read
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-navy leading-tight mb-6">
              {post.title}
            </h1>
            
            <p className="font-body text-lg text-navy/60 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between py-6 border-y border-sand/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-copper/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-navy">
                    {post.author ? post.author.split(" ").map((n: string) => n[0]).join("") : "F"}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy">{post.author || "Finsaar Team"}</p>
                  <p className="font-body text-xs text-navy/50">{post.authorRole || "Compliance Team"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1.5 font-body text-xs text-navy/50 justify-end mb-2">
                  <Calendar size={14} /> Published
                </p>
                <p className="font-body text-sm font-medium text-navy">{formattedDate}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.image && (
          <section className="py-8 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-sand/30">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          </section>
        )}

        {/* Post Content */}
        <section className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
            
            {/* Social Share sidebar - sticky */}
            <div className="md:w-16 shrink-0 order-2 md:order-1">
              <div className="sticky top-24 flex md:flex-col gap-4 items-center">
                <p className="font-heading font-semibold text-xs text-navy/40 uppercase tracking-widest md:[writing-mode:vertical-rl] md:mb-4">Share</p>
                <ShareButton title={post.title} />
              </div>
            </div>

            {/* Markdown Body */}
            <article className="order-1 md:order-2 flex-1 min-w-0">
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
                    <p
                      className="font-body text-base text-navy/80 leading-relaxed mb-5"
                      {...props}
                    />
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
