'use server';

import { createClient } from '@/lib/supabase/server';

export async function loginAction(email: string) {
  try {
    const supabase = await createClient();
    
    // Send standard passwordless OTP link to email (highly secure, production-grade magic link)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
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
