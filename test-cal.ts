import { isSupabaseConfigured } from "./lib/supabase";
import { supabase } from "./lib/supabase";

console.log("isSupabaseConfigured:", isSupabaseConfigured);
console.log("supabase exists:", !!supabase);
