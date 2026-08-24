import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getCalendarPostBySlug, getCalendarPosts } from "@/lib/calendar-service";
import { ComplianceCalendarDetailClient } from "./ClientPage";

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
      <main className="bg-[#FBF9F6] min-h-screen pb-24">
        {/* Breadcrumb & Navigation */}
        <div className="bg-navy pt-32 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center text-sm font-medium text-white/60 mb-6">
              <Link href="/resources/compliance-calendar" className="hover:text-copper transition-colors">
                Compliance Calendars
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-white truncate">{post.title}</span>
            </nav>
            <Link
              href="/resources/compliance-calendar"
              className="inline-flex items-center gap-2 text-white/80 hover:text-copper transition-colors font-medium mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calendars
            </Link>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/70 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-copper" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-copper" />
                <span>{post.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {post.image && (
            <div className="relative w-full aspect-video md:aspect-[2/1] lg:aspect-[2.5/1] rounded-[24px] overflow-hidden mb-12 shadow-xl border border-white/10 z-10">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="max-w-5xl mx-auto bg-white rounded-[40px] p-8 md:p-14 lg:p-20 shadow-[0_20px_60px_-15px_rgba(20,33,58,0.05)] border border-black/5 relative z-0 mt-8 mb-20">
            <div className="prose prose-lg max-w-none 
              prose-p:font-body prose-p:text-navy/80 prose-p:leading-relaxed prose-p:mb-6
              prose-ul:list-disc prose-ul:pl-5
              prose-li:text-navy/80 prose-li:mb-2
              prose-strong:text-navy prose-strong:font-bold
              prose-hr:border-sand/60 prose-hr:my-16"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                  h2: ({node, ...props}) => (
                    <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mt-16 mb-8 tracking-tight" {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="font-heading text-2xl md:text-3xl font-semibold text-navy mt-14 mb-6 flex items-center gap-3" {...props} />
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
