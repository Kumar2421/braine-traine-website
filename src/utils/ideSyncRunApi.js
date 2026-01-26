import { supabase } from "../supabaseClient"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function syncIDERun(runPayload) {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return { success: false, error: "Not authenticated" }
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/ide-sync-run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
                "apikey": supabaseAnonKey,
            },
            body: JSON.stringify(runPayload || {}),
        })

        const data = await response.json()

        if (!response.ok) {
            return { success: false, error: data?.error || "Failed to sync run" }
        }

        return data
    } catch (error) {
        console.error("Error syncing IDE run:", error)
        return { success: false, error: error?.message || String(error) }
    }
}
