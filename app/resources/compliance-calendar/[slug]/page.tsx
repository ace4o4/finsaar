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
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getCalendarPostBySlug(params.slug);

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
  const post = await getCalendarPostBySlug(params.slug);

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

          <div className="max-w-5xl mx-auto bg-white rounded-[32px] p-8 md:p-12 lg:p-16 shadow-sm border border-black/5 relative z-0 mt-8">
            <div className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-navy
              prose-a:text-copper hover:prose-a:text-copper/80
              prose-p:font-body prose-p:text-navy/80 prose-p:leading-relaxed
              prose-li:text-navy/80
              prose-strong:text-navy
              prose-table:w-full prose-table:border-collapse
              prose-th:bg-navy prose-th:text-white prose-th:font-heading prose-th:p-4 prose-th:text-left
              prose-td:p-4 prose-td:border-b prose-td:border-sand/40 prose-td:text-navy/80
              prose-tr:hover:bg-[#FBF9F6] prose-tr:transition-colors"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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
