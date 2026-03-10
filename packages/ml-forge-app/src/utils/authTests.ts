import { supabase } from "../lib/supabaseClient";

/**
 * Manual Test Script for Authentication Flow
 * Run this to verify the Supabase Auth implementation.
 */
export async function runLoginTest(email: string, password: string) {
  console.log("--- STARTING LOGIN TEST ---");
  console.log(`Target Email: ${email}`);

  try {
    // 1. Test Sign In
    console.log("Step 1: Attempting signInWithPassword...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("❌ Sign-in failed:", signInError.message);
      return { success: false, error: signInError };
    }

    console.log("✅ Sign-in successful!");
    console.log("Session User ID:", signInData.user?.id);

    // 2. Test Session Retrieval
    console.log("Step 2: Verifying getSession()...");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error("❌ Session retrieval failed:", sessionError?.message || "No session found");
      return { success: false, error: sessionError || "No session" };
    }
    console.log("✅ Session is active.");

    // 3. Test Sign Out
    console.log("Step 3: Attempting signOut...");
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("❌ Sign-out failed:", signOutError.message);
      return { success: false, error: signOutError };
    }
    console.log("✅ Sign-out successful!");

    console.log("--- LOGIN TEST PASSED ---");
    return { success: true };
  } catch (err) {
    console.error("❌ Unexpected error during test:", err);
    return { success: false, error: err };
  }
}
