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
      <main className="bg-[#FBF9F6] min-h-screen">
        <section className="bg-white py-12 md:py-20 border-b border-sand/40 pt-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/resources/compliance-calendar" className="inline-flex items-center gap-2 font-body text-sm text-navy/50 hover:text-copper transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Calendars
            </Link>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-copper/10 text-copper rounded-full text-xs font-heading font-semibold uppercase tracking-wider">
                {post.category || "Deadlines"}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-navy leading-tight mb-6">
              {post.title}
            </h1>
            
            <p className="font-body text-lg text-navy/60 mb-8 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between py-6 border-y border-sand/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-copper/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-navy">
                    {post.author ? post.author.split(" ").map(n => n[0]).join("") : "F"}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy">{post.author || "Finsaar"}</p>
                  <p className="font-body text-xs text-navy/50">Compliance Team</p>
                </div>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1.5 font-body text-xs text-navy/50 justify-end mb-2">
                  <Calendar size={14} /> Date
                </p>
                <p className="font-body text-sm font-medium text-navy">{formattedDate}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.image && (
          <section className="py-8 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-sand/30">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          </section>
        )}

        {/* Post Content */}
        <section className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
            
            {/* Social Share sidebar - sticky */}
            <div className="md:w-16 shrink-0 order-2 md:order-1">
              <div className="sticky top-24 flex md:flex-col gap-4 items-center">
                <p className="font-heading font-semibold text-xs text-navy/40 uppercase tracking-widest md:[writing-mode:vertical-rl] md:mb-4">Share</p>
                <ShareButton title={post.title} />
              </div>
            </div>

            {/* Markdown Body */}
            <article className="order-1 md:order-2 flex-1 min-w-0 prose prose-lg max-w-none 
              prose-p:font-body prose-p:text-navy/80 prose-p:leading-relaxed prose-p:mb-6
              prose-ul:list-disc prose-ul:pl-5
              prose-li:text-navy/80 prose-li:mb-2
              prose-strong:text-navy prose-strong:font-bold
              prose-hr:border-sand/60 prose-hr:my-16">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                  h2: ({node, ...props}) => (
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-navy mt-12 mb-6 tracking-tight" {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="font-heading font-semibold text-xl md:text-2xl text-navy mt-10 mb-4 flex items-center gap-3" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="font-body text-base md:text-lg text-navy/80 leading-relaxed mb-6" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-outside ml-6 space-y-2 font-body text-base md:text-lg text-navy/80 mb-6" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-outside ml-6 space-y-2 font-body text-base md:text-lg text-navy/80 mb-6" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="leading-relaxed pl-1" {...props} />
                  ),
                  hr: ({node, ...props}) => (
                    <hr className="my-12 border-sand/40" {...props} />
                  ),
                  table: ({node, ...props}) => (
                    <div className="w-full my-12 bg-white rounded-[24px] border border-sand/60 shadow-[0_8px_30px_rgba(20,33,58,0.04)] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]" {...props} />
                      </div>
                    </div>
                  ),
                  thead: ({node, ...props}) => (
                    <thead className="bg-navy text-white" {...props} />
                  ),
                  th: ({node, ...props}) => (
                    <th className="px-8 py-6 font-heading font-semibold text-sm md:text-base uppercase tracking-widest text-white/90 border-b border-white/10" {...props} />
                  ),
                  tbody: ({node, ...props}) => (
                    <tbody className="divide-y divide-sand/60" {...props} />
                  ),
                  tr: ({node, ...props}) => (
                    <tr className="hover:bg-[#FBF9F6] transition-colors duration-300 group" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-8 py-6 text-navy/80 font-body align-top text-base group-hover:text-navy transition-colors 
                      [&:first-child>strong]:bg-copper/10 [&:first-child>strong]:text-copper [&:first-child>strong]:px-4 [&:first-child>strong]:py-1.5 [&:first-child>strong]:rounded-full [&:first-child>strong]:text-xs [&:first-child>strong]:font-bold [&:first-child>strong]:tracking-wider [&:first-child>strong]:uppercase [&:first-child]:whitespace-nowrap
                      [&:nth-child(2)]:font-semibold [&:nth-child(2)]:text-navy [&:nth-child(2)]:whitespace-nowrap" 
                      {...props} 
                    />
                  ),
                  blockquote: ({node, ...props}) => (
                    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-copper/5 to-transparent border border-copper/20 p-8 md:p-10 my-12 shadow-sm">
                      <div className="absolute top-0 left-0 w-2 h-full bg-copper" />
                      <blockquote className="relative z-10 text-navy/90 font-medium text-xl leading-relaxed m-0 p-0" {...props} />
                    </div>
                  ),
                  a: ({node, ...props}) => (
                    <a className="text-copper font-semibold hover:text-copper-dark underline decoration-2 underline-offset-4 decoration-copper/30 hover:decoration-copper transition-all" {...props} />
                  )
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
