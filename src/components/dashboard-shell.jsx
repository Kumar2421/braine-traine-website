import * as React from "react"

import { supabase } from "../supabaseClient"
import { projectsApi } from "../utils/api.js"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function DashboardShell({ session, navigate, title, children }) {
    const userId = session?.user?.id || null

    const [projects, setProjects] = React.useState([])

    const user = React.useMemo(() => {
        const meta = session?.user?.user_metadata || {}
        const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || session?.user?.email || "Account"
        return {
            name,
            email: session?.user?.email || "",
        }
    }, [session?.user?.email, session?.user?.user_metadata])

    React.useEffect(() => {
        if (!userId) return
        let mounted = true

        const run = async () => {
            try {
                const { data } = await projectsApi.getProjects(userId)
                if (!mounted) return
                setProjects(data || [])
            } catch {
                if (!mounted) return
                setProjects([])
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId])

    const onSignOut = React.useCallback(async () => {
        try {
            await supabase.auth.signOut()
        } finally {
            navigate?.("/")
        }
    }, [navigate])

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background text-foreground">
                <AppSidebar navigate={navigate} user={user} projects={projects} onSignOut={onSignOut} />
                <div className="flex min-h-0 flex-1 flex-col">
                    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <SidebarTrigger />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold tracking-tight">
                                {title || "Dashboard"}
                            </div>
                        </div>
                    </header>
                    <main className="min-h-0 flex-1 overflow-auto p-2 sm:p-4">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}
