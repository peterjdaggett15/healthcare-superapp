'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  FileText,
  Menu,
  DollarSign,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Shield,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useTaskContext } from '@/lib/TaskContext';
import { useUIMode } from '@/lib/UIModeContext';
import SearchOverlay from '@/components/SearchOverlay';
import UIModeToggle from '@/components/UIModeToggle';

const featuredSkills = [
  {
    id: 'ask-question',
    title: 'Ask a healthcare question',
    href: '/chat',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #FEE8E8 100%)', // light blue to pink
  },
  {
    id: 'find-medication-stock',
    title: 'Find a medication in stock',
    href: '/flow/compare-prices',
    isFree: false,
    credits: 1,
    gradient: 'linear-gradient(45deg, #E2FFDF 0%, #FEE8E8 100%)', // green to pink
  },
  {
    id: 'find-care',
    title: 'Find and schedule care',
    href: '/flow/find-care',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #E2FFDF 100%)', // light blue to green
  },
  {
    id: 'appointments',
    title: 'Manage appointments',
    href: '/flow/appointments',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #FEE8E8 100%)', // light blue to pink
  },
  {
    id: 'medication-refill',
    title: 'Get a Medication Refill',
    href: '/flow/medication-refill',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(45deg, #E2FFDF 0%, #FEE8E8 100%)', // green to pink
  },
  {
    id: 'medical-records',
    title: 'Get or transfer medical records',
    href: '/flow/medical-records',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #E2FFDF 100%)', // light blue to green
  },
  {
    id: 'compare-prices',
    title: 'Find Prescription Savings',
    href: '/flow/compare-prices',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #FEE8E8 100%)', // light blue to pink
  },
  {
    id: 'insurance',
    title: 'Help with insurance issues',
    href: '/flow/insurance',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(45deg, #E2FFDF 0%, #FEE8E8 100%)', // green to pink
  },
  {
    id: 'something-else',
    title: 'Something else',
    href: '/flow/something-else',
    isFree: true,
    credits: 0,
    gradient: 'linear-gradient(135deg, #EFFDFD 0%, #E2FFDF 100%)', // light blue to green
  },
];

const mainTasks = [
  {
    id: 'find-medication-stock',
    title: 'Find a medication in stock',
    href: '/flow/compare-prices',
    isFree: false,
    credits: 1,
  },
  {
    id: 'find-care',
    title: 'Find and schedule care',
    href: '/flow/find-care',
    isFree: true,
    credits: 0,
  },
  {
    id: 'appointments',
    title: 'Schedule, cancel or reschedule an appointment',
    href: '/flow/appointments',
    isFree: true,
    credits: 0,
  },
  {
    id: 'medication-refill',
    title: 'Get a Medication Refill',
    href: '/flow/medication-refill',
    isFree: true,
    credits: 0,
  },
  {
    id: 'medical-records',
    title: 'Get or transfer medical records',
    href: '/flow/medical-records',
    isFree: true,
    credits: 0,
  },
];

const moreTasks = [
  {
    id: 'insurance',
    title: 'Help with insurance issues',
    href: '/flow/insurance',
    isFree: true,
    credits: 0,
  },
  {
    id: 'something-else',
    title: 'Something else',
    href: '/flow/something-else',
    isFree: true,
    credits: 0,
  },
];

export default function Home() {
  const [showMore, setShowMore] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const { activeTasks } = useTaskContext();

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white">
        <Image
          src="/medfinder-logo.png"
          alt="Medfinder"
          width={140}
          height={36}
          className="h-9 w-auto"
        />
        <div className="flex items-center gap-2">
          <UIModeToggle />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" style={{ color: '#132F4E' }} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 pb-8">
        {/* Credits Banner */}
        <div className="mt-4 flex items-center justify-between bg-white rounded-full px-4 py-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4" style={{ color: '#132F4E' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: '#132F4E' }}>0 Credits Available</span>
          </div>
          <button
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            <span>+</span>
            <span>Buy Credits</span>
          </button>
        </div>

        {/* New Skills Section */}
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: '#132F4E' }}>New Skills from Medfinder</h2>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {featuredSkills.map((skill) => (
              <Link
                key={skill.id}
                href={skill.href}
                className="flex-shrink-0 w-40 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors flex flex-col items-center text-center"
                style={{ background: skill.gradient }}
              >
                <span
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 whitespace-nowrap"
                  style={{ backgroundColor: '#B0F7A9', color: '#132F4E' }}
                >
                  {skill.isFree ? 'Free Task' : `${skill.credits} Credit`}
                </span>
                <p className="text-sm font-semibold" style={{ color: '#132F4E' }}>{skill.title}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* What do you need help with? */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#132F4E' }}>What do you need help with?</h2>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              readOnly
              onClick={() => setShowSearchOverlay(true)}
              placeholder="I need..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:border-gray-300 cursor-pointer"
              style={{ color: '#132F4E' }}
            />
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {mainTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium" style={{ color: '#132F4E' }}>{task.title}</span>
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: task.isFree ? '#A8F4F4' : '#B0F7A9',
                    color: '#132F4E'
                  }}
                >
                  {task.isFree ? 'Free Task' : `${task.credits} Credit`}
                </span>
              </Link>
            ))}

            {/* Show More */}
            {showMore && moreTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium" style={{ color: '#132F4E' }}>{task.title}</span>
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: task.isFree ? '#A8F4F4' : '#B0F7A9',
                    color: '#132F4E'
                  }}
                >
                  {task.isFree ? 'Free Task' : `${task.credits} Credit`}
                </span>
              </Link>
            ))}
          </div>

          {/* See how else we can help */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>See how else we can help</span>
          </button>
        </section>

        {/* Active Tasks */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#132F4E' }}>Active Tasks</h2>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>

          {activeTasks.length === 0 ? (
            <div className="rounded-2xl p-6 border border-gray-200 text-center">
              <p className="text-sm text-gray-500">No active tasks yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete a flow to see your tasks here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl p-4 border border-gray-200"
                  style={{ background: 'linear-gradient(135deg, #E2FFDF 0%, #EFFDFD 100%)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium" style={{ color: '#132F4E' }}>{task.title}</p>
                    {task.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#B0F7A9' }} />
                    )}
                  </div>

                  {/* Progress Dots */}
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className="w-5 h-5 rounded-full"
                        style={{
                          backgroundColor: step <= task.progress
                            ? '#B0F7A9'
                            : '#E2FFDF'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Step {task.progress} of {task.totalSteps}: {task.status === 'in_progress' ? 'In progress' : task.status === 'completed' ? 'Completed' : 'Needs info'}
                  </p>

                  <Link
                    href={`/task/${task.id}`}
                    className="block w-full py-3 text-center text-sm font-medium bg-white rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                    style={{ color: '#132F4E' }}
                  >
                    View Task Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={showSearchOverlay}
        onClose={() => setShowSearchOverlay(false)}
        initialValue={searchValue}
      />
    </main>
  );
}
