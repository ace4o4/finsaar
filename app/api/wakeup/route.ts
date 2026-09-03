import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, message: 'Supabase not configured' });
  }
  
  try {
    // Extremely lightweight queries just to ensure the database connection wakes up.
    // We do both tables so the cache for both is warmed up if any.
    await Promise.allSettled([
      supabase.from('posts').select('id').limit(1),
      supabase.from('compliance_calendars').select('id').limit(1)
    ]);
    
    return NextResponse.json({ success: true, message: 'Database warmed up successfully' });
  } catch (error) {
    console.error("Database wakeup ping failed:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
