import { Separator } from '#components/ui/separator'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <span className="text-base font-semibold tracking-tight text-foreground">
          Dispact
        </span>
        <Separator orientation="vertical" className="mx-3 h-4" />
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/" className="transition-colors hover:text-foreground">Dashboard</a>
          <a href="/workers" className="transition-colors hover:text-foreground">Workers</a>
          <a href="/queue" className="transition-colors hover:text-foreground">Queue</a>
          <a href="/register" className="transition-colors hover:text-foreground">Register</a>
        </nav>
        <div className="ml-auto">
          <a
            href="http://localhost:4000/admin/queues"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            Bull Board ↗
          </a>
        </div>
      </div>
    </header>
  )
}
