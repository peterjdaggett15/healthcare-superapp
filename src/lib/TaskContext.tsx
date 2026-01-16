'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TaskAnswer {
  stepId: string;
  question: string;
  answer: string | string[];
}

export interface ActiveTask {
  id: string;
  flowId: string;
  title: string;
  description: string;
  progress: number;
  totalSteps: number;
  createdAt: Date;
  status: 'in_progress' | 'completed' | 'needs_info';
  answers: TaskAnswer[];
}

interface TaskContextType {
  activeTasks: ActiveTask[];
  addTask: (task: Omit<ActiveTask, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<ActiveTask>) => void;
  removeTask: (id: string) => void;
  getTask: (id: string) => ActiveTask | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('activeTasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setActiveTasks(parsed.map((t: ActiveTask) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        })));
      } catch (e) {
        console.error('Failed to parse stored tasks');
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
  }, [activeTasks]);

  const addTask = (task: Omit<ActiveTask, 'id' | 'createdAt'>): string => {
    const id = `task-${Date.now()}`;
    const newTask: ActiveTask = {
      ...task,
      id,
      createdAt: new Date(),
    };
    setActiveTasks((prev) => [newTask, ...prev]);
    return id;
  };

  const updateTask = (id: string, updates: Partial<ActiveTask>) => {
    setActiveTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setActiveTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getTask = (id: string) => {
    return activeTasks.find((task) => task.id === id);
  };

  return (
    <TaskContext.Provider value={{ activeTasks, addTask, updateTask, removeTask, getTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
