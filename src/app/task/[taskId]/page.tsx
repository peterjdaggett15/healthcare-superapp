'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useTaskContext, ActiveTask } from '@/lib/TaskContext';

const statusConfig = {
  in_progress: {
    label: 'In Progress',
    color: '#A8F4F4',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: '#B0F7A9',
    icon: CheckCircle,
  },
  needs_info: {
    label: 'Needs More Info',
    color: '#F9A7A7',
    icon: AlertCircle,
  },
};

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const { getTask } = useTaskContext();
  const [task, setTask] = useState<ActiveTask | null>(null);

  useEffect(() => {
    const foundTask = getTask(taskId);
    if (foundTask) {
      setTask(foundTask);
    }
  }, [taskId, getTask]);

  if (!task) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#132F4E' }} />
          </button>
          <Image
            src="/medfinder-logo.png"
            alt="Medfinder"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Task not found</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full transition-colors"
              style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#132F4E' }} />
        </button>
        <Image
          src="/medfinder-logo.png"
          alt="Medfinder"
          width={140}
          height={36}
          className="h-9 w-auto"
        />
      </header>

      <div className="flex-1 px-4 py-6">
        {/* Task Title & Status */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-3" style={{ color: '#132F4E' }}>
            {task.title}
          </h1>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            >
              <StatusIcon className="w-4 h-4" style={{ color: '#132F4E' }} />
              <span className="text-sm font-medium" style={{ color: '#132F4E' }}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div
          className="rounded-2xl p-4 mb-6 border border-gray-200"
          style={{ background: 'linear-gradient(135deg, #E2FFDF 0%, #EFFDFD 100%)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: '#132F4E' }}>
            Progress
          </p>

          {/* Progress Dots */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor: step <= task.progress ? '#B0F7A9' : '#E2FFDF'
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Step {task.progress} of {task.totalSteps}
          </p>
        </div>

        {/* Request Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#132F4E' }}>
            Request Details
          </h2>

          {task.answers && task.answers.length > 0 ? (
            <div className="space-y-4">
              {task.answers.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <p className="text-xs text-gray-500 mb-1">{item.question}</p>
                  <p className="text-sm font-medium" style={{ color: '#132F4E' }}>
                    {Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No details available</p>
          )}
        </div>

        {/* Timeline / What's Next */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#132F4E' }}>
            What happens next?
          </h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: task.progress >= 1 ? '#B0F7A9' : '#E2FFDF' }}
              >
                {task.progress >= 1 && <CheckCircle className="w-4 h-4" style={{ color: '#132F4E' }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#132F4E' }}>Request received</p>
                <p className="text-xs text-gray-500">We've received your request</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: task.progress >= 2 ? '#B0F7A9' : '#E2FFDF' }}
              >
                {task.progress >= 2 && <CheckCircle className="w-4 h-4" style={{ color: '#132F4E' }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#132F4E' }}>Reviewing details</p>
                <p className="text-xs text-gray-500">Our team is reviewing your information</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: task.progress >= 3 ? '#B0F7A9' : '#E2FFDF' }}
              >
                {task.progress >= 3 && <CheckCircle className="w-4 h-4" style={{ color: '#132F4E' }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#132F4E' }}>Working on it</p>
                <p className="text-xs text-gray-500">We're actively working on your request</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: task.progress >= 4 ? '#B0F7A9' : '#E2FFDF' }}
              >
                {task.progress >= 4 && <CheckCircle className="w-4 h-4" style={{ color: '#132F4E' }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#132F4E' }}>Final steps</p>
                <p className="text-xs text-gray-500">Finishing up your request</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: task.progress >= 5 ? '#B0F7A9' : '#E2FFDF' }}
              >
                {task.progress >= 5 && <CheckCircle className="w-4 h-4" style={{ color: '#132F4E' }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#132F4E' }}>Complete</p>
                <p className="text-xs text-gray-500">Your request has been fulfilled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submitted Date */}
        <div className="text-xs text-gray-400 mb-6">
          Submitted {task.createdAt.toLocaleDateString()} at {task.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Link
          href="/"
          className="block w-full py-3 text-center text-sm font-medium rounded-full transition-colors"
          style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
