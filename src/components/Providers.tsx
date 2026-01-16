'use client';

import { TaskProvider } from '@/lib/TaskContext';
import { UIModeProvider } from '@/lib/UIModeContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UIModeProvider>
      <TaskProvider>{children}</TaskProvider>
    </UIModeProvider>
  );
}
