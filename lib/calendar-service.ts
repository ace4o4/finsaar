import { supabase, isSupabaseConfigured, DatabaseCalendar } from "./supabase";
import { CalendarPost, calendarPosts as fallbackPosts } from "./calendar-data";

let cachedCalendarPosts: CalendarPost[] | null = null;

export function mapDbCalendarToCalendarPost(p: any): CalendarPost {
  return {
    id: p.id || "",
    slug: p.slug || "",
    title: p.title || "",
    excerpt: p.excerpt || "",
    content: p.content || "",
    category: p.category || "General",
    author: p.author || "",
    authorRole: p.author_role || "",
    authorEmail: p.author_email || undefined,
    authorBio: p.author_bio || undefined,
    authorImage: p.author_image || undefined,
    tags: p.tags || [],
    date: p.date || "",
    published: p.published !== undefined ? p.published : true,
    image: p.image || undefined,
  };
}

export function mapCalendarPostToDbCalendar(p: CalendarPost, published = true): Omit<DatabaseCalendar, "id"> {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author,
    author_role: p.authorRole || 'Compliance Team',
    author_email: p.authorEmail || null,
    author_bio: p.authorBio || null,
    author_image: p.authorImage || null,
    tags: p.tags || [],
    date: p.date || new Date().toISOString().split("T")[0],
    published: p.published ?? published,
    image: p.image || null,
  };
}

/**
 * Fetch all published calendar posts (or all including drafts for admin)
 */
export async function getCalendarPosts(options?: {
  includeDrafts?: boolean;
}): Promise<CalendarPost[]> {
  if (!isSupabaseConfigured || !supabase) {
    let posts = [...fallbackPosts];
    return posts;
  }

  // Use client-side cache if available
  if (typeof window !== 'undefined' && cachedCalendarPosts && !options?.includeDrafts) {
    return [...cachedCalendarPosts];
  }

  try {
    let query = supabase
      .from("compliance_calendars")
      .select("id, slug, title, excerpt, category, author, author_role, date, published, tags, image, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (!options?.includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.error("Supabase getCalendarPosts error:", JSON.stringify(error, null, 2));
      return [...fallbackPosts];
    }

    const mappedPosts = data.map(mapDbCalendarToCalendarPost);
    
    // Save to cache if we are on the client and fetching published posts
    if (typeof window !== 'undefined' && !options?.includeDrafts) {
      cachedCalendarPosts = mappedPosts;
    }

    return mappedPosts;
  } catch (err) {
    console.error("Error fetching calendar posts:", err);
    return fallbackPosts;
  }
}

/**
 * Fetch a single calendar post by slug
 */
export async function getCalendarPostBySlug(slug: string): Promise<CalendarPost | null> {
  if (!isSupabaseConfigured || !supabase) {
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    return fallback || null;
  }

  try {
    const { data, error } = await supabase
      .from("compliance_calendars")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        console.error(`Supabase getCalendarPostBySlug (${slug}) error:`, error);
      }
      return fallbackPosts.find((p) => p.slug === slug) || null;
    }

    return mapDbCalendarToCalendarPost(data as DatabaseCalendar);
  } catch (err) {
    console.error(`Error fetching calendar post by slug ${slug}:`, err);
    return null;
  }
}

/**
 * Fetch a single calendar post by id (UUID)
 */
export async function getCalendarPostById(id: string): Promise<CalendarPost | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error("Invalid UUID format passed to getCalendarPostById:", id);
    return null;
  }

  if (!isSupabaseConfigured || !supabase) {
    const fallback = fallbackPosts.find((p) => p.id === id);
    return fallback || null;
  }

  try {
    const { data, error } = await supabase
      .from("compliance_calendars")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.error(`Supabase getCalendarPostById error for id ${id}:`, error);
      }
      const fallback = fallbackPosts.find((p) => p.id === id);
      return fallback || null;
    }

    return mapDbCalendarToCalendarPost(data as DatabaseCalendar);
  } catch (err) {
    console.error(`Error fetching calendar post by id ${id}:`, err);
    const fallback = fallbackPosts.find((p) => p.id === id);
    return fallback || null;
  }
}

export async function createCalendarPost(post: CalendarPost, published = true): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const dbPost = mapCalendarPostToDbCalendar(post, published);
    
    // Create new row, omit id so UUID gets generated
    const { data, error } = await supabase
      .from("compliance_calendars")
      .insert(dbPost)
      .select("id")
      .single();

    if (error) {
      if (error.code === 'PGRST204' || error.code === '42703') {
        // Fallback for missing schema columns
        const { author_email, author_bio, author_image, ...fallbackDbPost } = dbPost as any;
        const retry = await supabase
          .from("compliance_calendars")
          .insert(fallbackDbPost)
          .select("id")
          .single();
          
        if (!retry.error) return { success: true, id: retry.data.id };
        console.error("Error creating calendar post (fallback):", retry.error);
        return { success: false, error: retry.error.message };
      }
      console.error("Error creating calendar post:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function updateCalendarPost(id: string, post: CalendarPost, published = true): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const dbPost = mapCalendarPostToDbCalendar(post, published);
    
    const { error } = await supabase
      .from("compliance_calendars")
      .update(dbPost)
      .eq("id", id);

    if (error) {
      if (error.code === 'PGRST204' || error.code === '42703') {
        // Fallback for missing schema columns
        const { author_email, author_bio, author_image, ...fallbackDbPost } = dbPost as any;
        const retry = await supabase
          .from("compliance_calendars")
          .update(fallbackDbPost)
          .eq("id", id);
          
        if (!retry.error) return { success: true };
        console.error("Error updating calendar post (fallback):", retry.error);
        return { success: false, error: retry.error.message };
      }
      console.error("Error updating calendar post:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function deleteCalendarPost(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const { error } = await supabase
      .from("compliance_calendars")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting calendar post:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}
