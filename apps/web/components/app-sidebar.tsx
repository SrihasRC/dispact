"use client"

import * as React from "react"
import { NavMain } from "#components/nav-main"
import { NavProjects } from "#components/nav-projects"
import { NavUser } from "#components/nav-user"
import { TeamSwitcher } from "#components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "#components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ActivityIcon,
  CableIcon,
  UserCheckIcon,
  CpuIcon,
  GaugeIcon,
  DatabaseIcon,
  ServerIcon,
  ZapIcon,
} from "lucide-react"

const data = {
  user: {
    name: "System Operator",
    email: "admin@dispact.local",
    avatar: "/favicon.ico",
  },
  teams: [
    {
      name: "Dispact",
      logo: <ZapIcon className="size-4" />,
      plan: "Event Gateway v1",
    },
    {
      name: "API Gateway",
      logo: <ServerIcon className="size-4" />,
      plan: "port 4000 · online",
    },
    {
      name: "BullMQ Daemon",
      logo: <CpuIcon className="size-4" />,
      plan: "5 workers · active",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: "Queue Stream",
      url: "/queue",
      icon: <ActivityIcon className="size-4" />,
    },
    {
      title: "Connectors",
      url: "/connectors",
      icon: <CableIcon className="size-4" />,
    },
    {
      title: "Registration Flow",
      url: "/register",
      icon: <UserCheckIcon className="size-4" />,
    },
    {
      title: "Worker Architecture",
      url: "/workers",
      icon: <CpuIcon className="size-4" />,
    },
  ],
  infrastructure: [
    {
      name: "Bull Board UI",
      url: "http://localhost:4000/admin/queues",
      icon: <GaugeIcon className="size-4" />,
      external: true,
    },
    {
      name: "PostgreSQL Engine",
      url: "/workers",
      icon: <DatabaseIcon className="size-4" />,
    },
    {
      name: "Redis Broker (6379)",
      url: "/workers",
      icon: <ServerIcon className="size-4" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.infrastructure} label="Monitoring & Infra" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
