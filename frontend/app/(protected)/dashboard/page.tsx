'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/contexts/AuthContext'
import type { Todo, TodoFilter } from '@/types'
import { TaskCard } from '@/components/todos/TaskCard'
import { AddTaskModal } from '@/components/todos/AddTaskModal'
import { EditTaskModal } from '@/components/todos/EditTaskModal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { taskListVariants, emptyStateVariants } from '@/lib/animations'
import {
  Plus,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { 
    todos, 
    isLoading, 
    filter, 
    setFilter, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodo,
    stats 
  } = useTodos()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const handleAddTask = async (title: string, description: string) => {
    await addTodo(title, description)
  }

  const handleEditTask = async (id: string, updates: Partial<Todo>) => {
    await updateTodo(id, updates)
  }

  const handleDeleteTask = async (id: string) => {
    await deleteTodo(id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s what&apos;s on your plate today
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {[
          {
            label: 'Total Tasks',
            value: stats.total,
            icon: ListTodo,
            color: 'text-foreground'
          },
          {
            label: 'Completed',
            value: stats.completed,
            icon: CheckCircle2,
            color: 'text-primary'
          },
          {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'text-muted-foreground'
          }
        ].map((stat) => (
          <Card 
            key={stat.label} 
            className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as TodoFilter)}>
          <TabsList className="h-auto gap-1 bg-card/50 p-1 backdrop-blur-sm relative">
            <TabsTrigger
              value="all"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-10"
            >
              <ListTodo className="h-4 w-4" />
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-10"
            >
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative z-10"
            >
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : todos.length === 0 ? (
        <motion.div
          variants={emptyStateVariants.container}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-border/50 border-dashed bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <motion.div
                variants={emptyStateVariants.item}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.h3
                variants={emptyStateVariants.item}
                className="mb-2 text-lg font-semibold"
              >
                No tasks yet
              </motion.h3>
              <motion.p
                variants={emptyStateVariants.item}
                className="mb-4 text-center text-sm text-muted-foreground"
              >
                {filter === 'all'
                  ? 'Create your first task to get started'
                  : filter === 'completed'
                  ? 'No completed tasks yet'
                  : 'All caught up! No pending tasks'}
              </motion.p>
              {filter === 'all' && (
                <motion.div variants={emptyStateVariants.item}>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Task
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.ul
          variants={taskListVariants.container}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                variants={taskListVariants.item}
                exit="exit"
                layout
              >
                <TaskCard
                  todo={todo}
                  onToggle={toggleTodo}
                  onEdit={setEditingTodo}
                  onDelete={handleDeleteTask}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Modals */}
      <AddTaskModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddTask}
      />
      
      <EditTaskModal
        todo={editingTodo}
        open={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
        onSave={handleEditTask}
      />
    </div>
  )
}