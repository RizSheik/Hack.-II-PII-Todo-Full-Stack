'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Todo, TodoFilter } from '@/types'
import { todosApi } from '@/lib/api-client'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<TodoFilter>('all')

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todosApi.getAll()
        setTodos(data)
      } catch (error) {
        console.error('Failed to fetch todos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTodos()
  }, [])

  const addTodo = useCallback(async (title: string, description: string) => {
    const newTodo = await todosApi.create({
      title,
      description,
      completed: false
    })
    setTodos(prev => [newTodo, ...prev])
    return newTodo
  }, [])

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    const updatedTodo = await todosApi.update(id, updates)
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updatedTodo } : todo
    ))
    return updatedTodo
  }, [])

  const deleteTodo = useCallback(async (id: string) => {
    await todosApi.delete(id)
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await updateTodo(id, { completed: !todo.completed })
    }
  }, [todos, updateTodo])

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed
    if (filter === 'pending') return !todo.completed
    return true
  })

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  }

  return {
    todos: filteredTodos,
    isLoading,
    filter,
    setFilter,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    stats
  }
}