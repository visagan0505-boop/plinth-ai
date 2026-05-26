'use server';

import { createClient } from '@/lib/supabase/server';

export async function loginAction(email: string) {
  try {
    const supabase = await createClient();
    
    // Determine site URL dynamically from environment (Vercel uses NEXT_PUBLIC_VERCEL_URL)
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
      siteUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if (!siteUrl) {
      siteUrl = 'http://localhost:3000';
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Magic link sent successfully. Please check your email inbox!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
