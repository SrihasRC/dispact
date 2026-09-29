"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "#components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#components/ui/sidebar"
import { Separator } from "#components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#components/ui/breadcrumb"
import { fetchHealth, type HealthResponse } from "#lib/api"

const routeConfig: Record<string, { section: string; title: string }> = {
  "/": { section: "Platform", title: "Overview" },
  "/queue": { section: "Platform", title: "Queue Stream" },
  "/connectors": { section: "Platform", title: "Connectors" },
  "/register": { section: "Workflows", title: "Registration Test" },
  "/workers": { section: "Architecture", title: "Worker Architecture" },
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeRoute = routeConfig[pathname] ?? { section: "Platform", title: "Dashboard" }
  const [health, setHealth] = React.useState<HealthResponse | null>(null)

  React.useEffect(() => {
    void fetchHealth().then(setHealth)
    const interval = setInterval(() => {
      void fetchHealth().then(setHealth)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink render={<Link href="/" />}>
                    Dispact
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem className="hidden md:block">
                  <span className="text-xs text-muted-foreground">{activeRoute.section}</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">{activeRoute.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {/* API Health Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={`inline-block size-1.5 rounded-full ${
                  health ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
              <span className="hidden font-mono text-[11px] sm:inline">
                {health ? `API Online (${health.uptime.toFixed(0)}s)` : "API Offline"}
              </span>
            </div>

            {/* Bull Board Quick Link */}
            <a
              href="http://localhost:4000/admin/queues"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Bull Board ↗
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
