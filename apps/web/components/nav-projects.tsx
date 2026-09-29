"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#components/ui/sidebar"

export function NavProjects({
  projects,
  label = "Infrastructure",
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
    external?: boolean
  }[]
  label?: string
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              tooltip={item.name}
              render={
                item.external ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" />
                ) : (
                  <Link href={item.url} />
                )
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

