import { CheckSquare } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="h-4 w-4" />
            <span className="text-sm">TaskFlow</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Built with Next.js, TypeScript & Tailwind CSS
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}