import * as React from "react"

import { Calendar, ChevronRight, ChevronUp, Home, Inbox, MoreHorizontal, Search, Settings, User2 } from "lucide-react"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction>
                                                <MoreHorizontal />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuItem>
                                                <span>Edit Project</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <span>Delete Project</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ))}

                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            <Inbox />
                                            <span>Projects</span>
                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton href="#">
                                                    <span>Project A</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton href="#">
                                                    <span>Project B</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> Username
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default function DashboardV2Page() {
    const [open, setOpen] = React.useState(true)

    return (
        <SidebarProvider
            open={open}
            onOpenChange={setOpen}
            style={{
                "--sidebar-width": "20rem",
                "--sidebar-width-mobile": "20rem",
            }}
        >
            <div className="min-h-svh w-full bg-background p-2 text-[color:var(--dr-ink)] antialiased sm:p-6">
                <div className="mx-auto flex h-[calc(100svh-16px)] w-full overflow-hidden border bg-background sm:h-[calc(100svh-48px)] sm:max-w-6xl sm:rounded-xl">
                    <AppSidebar />
                    <main className="flex min-w-0 flex-1 flex-col">
                        <div className="p-2 sm:p-4">
                            <SidebarTrigger />
                        </div>
                        <div className="flex-1" />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
