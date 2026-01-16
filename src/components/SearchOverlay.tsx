'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Menu, Search, HelpCircle } from 'lucide-react';
import Image from 'next/image';

interface SearchTask {
  id: string;
  title: string;
  href: string;
  credits: number; // 0 = free, > 0 = requires credits
  keywords: string[];
}

const allTasks: SearchTask[] = [
  {
    id: 'find-medication',
    title: 'Find a medication in stock',
    href: '/flow/compare-prices',
    credits: 1,
    keywords: ['medication', 'medicine', 'drug', 'pharmacy', 'stock', 'find', 'prescription'],
  },
  {
    id: 'find-care',
    title: 'Find and schedule care',
    href: '/flow/find-care',
    credits: 0,
    keywords: ['find', 'doctor', 'care', 'schedule', 'appointment', 'provider', 'specialist'],
  },
  {
    id: 'appointments',
    title: 'Schedule, cancel or reschedule an appointment',
    href: '/flow/appointments',
    credits: 0,
    keywords: ['schedule', 'cancel', 'reschedule', 'appointment', 'booking'],
  },
  {
    id: 'medication-refill',
    title: 'Get a Medication Refill',
    href: '/flow/medication-refill',
    credits: 0,
    keywords: ['medication', 'refill', 'prescription', 'medicine', 'pharmacy', 'renew'],
  },
  {
    id: 'medical-records',
    title: 'Get or transfer medical records',
    href: '/flow/medical-records',
    credits: 0,
    keywords: ['records', 'medical', 'transfer', 'get', 'documents', 'history', 'files'],
  },
  {
    id: 'ask-question',
    title: 'Ask a question about my health',
    href: '/chat',
    credits: 0,
    keywords: ['ask', 'question', 'health', 'advice', 'help', 'information', 'symptoms'],
  },
  {
    id: 'compare-prices',
    title: 'Find Prescription Savings',
    href: '/flow/compare-prices',
    credits: 0,
    keywords: ['price', 'compare', 'cost', 'savings', 'cheap', 'affordable', 'prescription'],
  },
  {
    id: 'compare-care-prices',
    title: 'Compare Care Prices',
    href: '/flow/compare-prices',
    credits: 0,
    keywords: ['price', 'compare', 'cost', 'care', 'procedure', 'surgery', 'treatment'],
  },
  {
    id: 'insurance',
    title: 'Help with insurance issues',
    href: '/flow/insurance',
    credits: 0,
    keywords: ['insurance', 'coverage', 'claim', 'denied', 'help', 'issues', 'plan'],
  },
  {
    id: 'something-else',
    title: 'Something else',
    href: '/flow/something-else',
    credits: 0,
    keywords: ['other', 'else', 'different', 'help'],
  },
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
}

export default function SearchOverlay({ isOpen, onClose, initialValue = '' }: SearchOverlayProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [filteredTasks, setFilteredTasks] = useState<SearchTask[]>(allTasks);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredTasks(allTasks);
      return;
    }

    const query = searchValue.toLowerCase();
    const filtered = allTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const keywordMatch = task.keywords.some((keyword) => keyword.includes(query));
      return titleMatch || keywordMatch;
    });

    setFilteredTasks(filtered);
  }, [searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (filteredTasks.length === 0) {
        // No matches, go to chat with the query
        router.push(`/chat?q=${encodeURIComponent(searchValue.trim())}`);
        onClose();
      } else if (filteredTasks.length === 1) {
        // Single match, navigate to it
        router.push(filteredTasks[0].href);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleTaskClick = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#132F4E' }} />
          </button>
          <Image
            src="/medfinder-logo.png"
            alt="Medfinder"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-6 h-6" style={{ color: '#132F4E' }} />
        </button>
      </header>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        {/* Heading */}
        <div className="flex items-center gap-2 mb-4 mt-4">
          <h1 className="text-lg font-semibold" style={{ color: '#132F4E' }}>What do you need help with?</h1>
          <HelpCircle className="w-4 h-4 text-gray-400" />
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a task or ask a question"
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
            style={{ color: '#132F4E' }}
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task.href)}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-100 text-left transition-colors hover:border-gray-200"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <span className="text-sm font-medium" style={{ color: '#132F4E' }}>{task.title}</span>
              <span
                className="px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-3"
                style={{
                  backgroundColor: task.credits > 0 ? '#A8F4F4' : '#B0F7A9',
                  color: '#132F4E'
                }}
              >
                {task.credits > 0 ? `${task.credits} Credit` : 'Free Task'}
              </span>
            </button>
          ))}

          {/* Show "task not listed" option when user is typing and has few or no results */}
          {searchValue.trim() && (
            <button
              onClick={() => {
                router.push('/flow/something-else');
                onClose();
              }}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-dashed border-gray-300 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <span className="text-sm font-medium" style={{ color: '#132F4E' }}>
                I need help with a task that is not listed
              </span>
              <span
                className="px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-3"
                style={{ backgroundColor: '#B0F7A9', color: '#132F4E' }}
              >
                Free Task
              </span>
            </button>
          )}

          {/* Ask a question option - shows when user is typing */}
          {searchValue.trim() && (
            <button
              onClick={() => {
                router.push(`/chat?q=${encodeURIComponent(searchValue.trim())}`);
                onClose();
              }}
              className="flex items-center justify-between w-full p-4 rounded-xl border-2 text-left transition-colors hover:opacity-90"
              style={{ backgroundColor: '#A8F4F4', borderColor: '#A8F4F4' }}
            >
              <div>
                <span className="text-sm font-medium block" style={{ color: '#132F4E' }}>
                  Ask: "{searchValue.trim().length > 40 ? searchValue.trim().slice(0, 40) + '...' : searchValue.trim()}"
                </span>
                <span className="text-xs text-gray-600 mt-0.5 block">
                  Press Enter to start a conversation
                </span>
              </div>
              <span
                className="px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-3 bg-white"
                style={{ color: '#132F4E' }}
              >
                Free
              </span>
            </button>
          )}
        </div>

        {/* See how else we can help - only show when not searching */}
        {!searchValue.trim() && (
          <div className="flex items-center justify-center gap-1 mt-6 text-sm text-gray-500">
            <span>↓</span>
            <span>See how else we can help</span>
          </div>
        )}
      </div>
    </div>
  );
}
