'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/images/Todo_App_Logo_0.jpg"
              alt="Todo App Logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
          </motion.div>
          <motion.span
            className="text-xl font-semibold tracking-tight gradient-text"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Todo
          </motion.span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <Link href="/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}