import * as React from "react"
import { Command, CreditCard, FolderKanban, LayoutDashboard, Package, Settings2, Activity } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ navigate, user, projects, onSignOut, ...props }) {
    const navMain = React.useMemo(
        () => [
            {
                title: "Dashboard",
                url: "/dashboard-v2",
                icon: LayoutDashboard,
                isActive: true,
            },
            {
                title: "Projects",
                url: "/dashboard-v2?tab=projects",
                icon: FolderKanban,
            },
            {
                title: "Exports",
                url: "/dashboard-v2?tab=exports",
                icon: Package,
            },
            {
                title: "Billing",
                url: "/dashboard-v2?tab=billing",
                icon: CreditCard,
            },
            {
                title: "Settings",
                url: "/dashboard-v2?tab=settings",
                icon: Settings2,
            },
            {
                title: "Diagnostics",
                url: "/dashboard-v2?tab=diagnostics",
                icon: Activity,
            },
        ],
        []
    )

    const navSecondary = React.useMemo(
        () => [
            {
                title: "Support",
                url: "/help",
                icon: Command,
            },
        ],
        []
    )

    const sidebarProjects = React.useMemo(() => {
        const base = (projects || []).slice(0, 6).map((p) => {
            const id = p?.project_id ?? p?.id ?? ""
            const name = p?.name ?? p?.project_name ?? "Project"
            return {
                name,
                url: id
                    ? `/dashboard-v2?tab=projects&project=${encodeURIComponent(String(id))}`
                    : "/dashboard-v2?tab=projects",
                icon: FolderKanban,
            }
        })

        return base.length
            ? base
            : [{ name: "All projects", url: "/dashboard-v2?tab=projects", icon: FolderKanban }]
    }, [projects])

    return (
        <Sidebar variant="sidebar" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a
                                href="/dashboard-v2"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate?.("/dashboard-v2")
                                }}
                            >
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">ML FORGE</span>
                                    <span className="truncate text-xs">Workspace</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} onNavigate={navigate} activePath={`${window.location.pathname}${window.location.search || ""}`} />
                <NavProjects projects={sidebarProjects} onNavigate={navigate} />
                <NavSecondary items={navSecondary} className="mt-auto" onNavigate={navigate} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} onNavigate={navigate} onSignOut={onSignOut} />
            </SidebarFooter>
        </Sidebar>
    )
}
