'use client'

import { useEffect, useState } from 'react'
import { Button } from '#components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function Navbar() {
  const [isDark, setIsDark] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('event-engine-theme')
    if (stored) {
      const isDarkPref = stored === 'dark'
      setIsDark(isDarkPref)
      if (isDarkPref) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
    } else {
      const currentlyDark =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark')
      setIsDark(currentlyDark)
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('event-engine-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('event-engine-theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-foreground">
              Event Engine
            </span>
            <span className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              Gateway v1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mounted ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          ) : (
            <div className="size-7" />
          )}
        </div>
      </div>
    </header>
  )
}
