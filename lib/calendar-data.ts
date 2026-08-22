export interface CalendarPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  published: boolean;
  image?: string;
}

export const calendarPosts: CalendarPost[] = [
  {
    slug: "august-2026-deadlines",
    title: "Compliance Calendar August 2026 - GST, TDS, PF, ESI Deadlines",
    excerpt: "August 2026 is a deceptively busy month. The standard monthly GST and TDS cycle runs on schedule.",
    content: "<h2>August 2026 Deadlines</h2><p>Here are the standard compliance deadlines for August 2026.</p>",
    category: "Monthly Calendar",
    author: "Finsaar Team",
    date: "2026-08-01",
    published: true,
  }
];
