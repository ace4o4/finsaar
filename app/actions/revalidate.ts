"use server";

import { revalidatePath } from "next/cache";

export async function revalidateBlog(slug?: string) {
  revalidatePath("/blog", "page");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/", "layout");
}
