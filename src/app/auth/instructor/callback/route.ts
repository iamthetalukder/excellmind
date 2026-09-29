import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after confirmation
  return NextResponse.redirect(new URL('/dashboard/instructor', request.url));
}
