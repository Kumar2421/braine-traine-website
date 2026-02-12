import { MoreHorizontal } from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({ projects, onNavigate }) {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Recent projects</SidebarGroupLabel>
            <SidebarMenu>
                {projects.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a
                                href={item.url}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onNavigate?.(item.url)
                                }}
                            >
                                <item.icon />
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => {
                            onNavigate?.("/dashboard-v2?tab=projects")
                        }}
                    >
                        <MoreHorizontal />
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}
