'use client';

import { MessageSquare, ClipboardList } from 'lucide-react';
import { useUIMode } from '@/lib/UIModeContext';

interface UIModeToggleProps {
  compact?: boolean;
}

export default function UIModeToggle({ compact = false }: UIModeToggleProps) {
  const { uiMode, setUIMode } = useUIMode();

  if (compact) {
    return (
      <button
        onClick={() => setUIMode(uiMode === 'chat' ? 'form' : 'chat')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title={uiMode === 'chat' ? 'Switch to Form mode' : 'Switch to Chat mode'}
      >
        {uiMode === 'chat' ? (
          <ClipboardList className="w-5 h-5" style={{ color: '#132F4E' }} />
        ) : (
          <MessageSquare className="w-5 h-5" style={{ color: '#132F4E' }} />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
      <button
        onClick={() => setUIMode('chat')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          uiMode === 'chat'
            ? 'bg-white text-[#132F4E] shadow-sm'
            : 'text-gray-500 hover:text-[#132F4E]'
        }`}
        title="Chat mode"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Chat</span>
      </button>
      <button
        onClick={() => setUIMode('form')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          uiMode === 'form'
            ? 'bg-white text-[#132F4E] shadow-sm'
            : 'text-gray-500 hover:text-[#132F4E]'
        }`}
        title="Form mode"
      >
        <ClipboardList className="w-4 h-4" />
        <span>Form</span>
      </button>
    </div>
  );
}
