'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Todo } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TaskCard({ todo, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(139, 92, 246, 0.15)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300',
          'hover:border-primary/30 hover:bg-card/80',
          todo.completed && 'opacity-70'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <motion.div
              className="pt-0.5"
              whileTap={{ scale: 1.15 }}
              animate={todo.completed ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              } : {}}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggle(todo.id)}
                className={cn(
                  'h-5 w-5 rounded-full border-2 transition-all duration-200',
                  todo.completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/50 hover:border-primary'
                )}
              />
            </motion.div>

            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'font-medium leading-tight transition-all duration-200',
                  todo.completed && 'text-muted-foreground line-through'
                )}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {todo.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(todo.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(todo)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(todo.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </motion.div>
          </div>
        </CardContent>

        {/* Animated border gradient */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '100%' : 0 }}
          transition={{ duration: 0.5 }}
        />
      </Card>
    </motion.div>
  )
}