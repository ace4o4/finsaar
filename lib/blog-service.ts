import { supabase, isSupabaseConfigured, DatabasePost } from "./supabase";
import { BlogPost, blogPosts as fallbackPosts } from "./blog-data";

let cachedBlogPosts: BlogPost[] | null = null;

export function mapDbPostToBlogPost(p: any): BlogPost {
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
    date: p.date || "",
    readTime: p.read_time || "5 min",
    featured: p.featured || false,
    tags: p.tags || [],
    image: p.image || undefined,
    published: p.published !== undefined ? p.published : true,
  };
}

export function mapBlogPostToDbPost(p: BlogPost, published = true): Omit<DatabasePost, "id"> {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author,
    author_role: p.authorRole,
    author_email: p.authorEmail || null,
    author_bio: p.authorBio || null,
    author_image: p.authorImage || null,
    date: p.date || new Date().toISOString().split("T")[0],
    read_time: p.readTime || "5 min",
    featured: Boolean(p.featured),
    published: p.published ?? published,
    tags: p.tags || [],
    image: p.image || null,
  };
}

/**
 * Fetch all published posts (or all including drafts for admin)
 */
export async function getBlogPosts(options?: {
  includeDrafts?: boolean;
  category?: string;
}): Promise<BlogPost[]> {
  if (!isSupabaseConfigured || !supabase) {
    let posts = [...fallbackPosts];
    if (options?.category && options.category !== "All") {
      posts = posts.filter((p) => p.category === options.category);
    }
    return posts;
  }

  // Use client-side cache if available
  if (typeof window !== 'undefined' && cachedBlogPosts && !options?.includeDrafts) {
    let posts = [...cachedBlogPosts];
    if (options?.category && options.category !== "All") {
      posts = posts.filter((p) => p.category === options.category);
    }
    return posts;
  }

  try {
    let query = supabase
      .from("posts")
      .select("id, slug, title, excerpt, category, author, author_role, date, read_time, featured, published, tags, image, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (!options?.includeDrafts) {
      query = query.eq("published", true);
    }

    if (options?.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.error("Supabase getBlogPosts error:", error);
      // Fallback to local data if DB empty or query failed
      let posts = [...fallbackPosts];
      if (options?.category && options.category !== "All") {
        posts = posts.filter((p) => p.category === options.category);
      }
      return posts;
    }

    const mappedPosts = data.map(mapDbPostToBlogPost);
    
    // Save to cache if we are on the client and fetching published posts
    if (typeof window !== 'undefined' && !options?.includeDrafts && (!options?.category || options.category === "All")) {
      cachedBlogPosts = mappedPosts;
    }

    return mappedPosts;
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return fallbackPosts;
  }
}

/**
 * Fetch a single post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured || !supabase) {
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    return fallback || null;
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      const fallback = fallbackPosts.find((p) => p.slug === slug);
      return fallback || null;
    }

    return mapDbPostToBlogPost(data);
  } catch (err) {
    console.error("Error fetching post by slug:", err);
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    return fallback || null;
  }
}

/**
 * Fetch a single post by UUID (for editing)
 */
export async function getPostById(id: string): Promise<DatabasePost | null> {
  if (!isSupabaseConfigured || !supabase || !id) {
    return null;
  }

  // Safe check: If id is not a valid UUID, don't query UUID column directly
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    return null;
  }
}

/**
 * Create a new post
 */
export async function createPost(
  post: Omit<DatabasePost, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: DatabasePost; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([post])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST204' || error.code === '42703') {
        // Fallback for missing schema columns
        const { author_email, author_bio, author_image, ...fallbackPost } = post as any;
        const retry = await supabase
          .from("posts")
          .insert([fallbackPost])
          .select()
          .single();
          
        if (!retry.error) return { success: true, data: retry.data };
        return { success: false, error: retry.error.message };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post",
    };
  }
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: string,
  post: Partial<DatabasePost>
): Promise<{ success: boolean; data?: DatabasePost; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .update(post)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST204' || error.code === '42703') {
        // Fallback for missing schema columns
        const { author_email, author_bio, author_image, ...fallbackPost } = post as any;
        const retry = await supabase
          .from("posts")
          .update(fallbackPost)
          .eq("id", id)
          .select()
          .single();
          
        if (!retry.error) return { success: true, data: retry.data };
        return { success: false, error: retry.error.message };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update post",
    };
  }
}

/**
 * Delete a post
 */
export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete post",
    };
  }
}

/**
 * Upload an image to Supabase Storage 'blog-images' bucket
 */
export async function uploadBlogImage(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}

/**
 * Seed initial hardcoded posts from blog-data.ts into Supabase
 */
export async function seedInitialPosts(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  try {
    const postsToInsert = fallbackPosts.map((post) => mapBlogPostToDbPost(post, true));

    const { data, error } = await supabase
      .from("posts")
      .upsert(postsToInsert, { onConflict: "slug" })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || postsToInsert.length };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to seed posts",
    };
  }
}
