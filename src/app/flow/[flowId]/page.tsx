'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';
import Image from 'next/image';
import ChatInterface from '@/components/ChatInterface';
import FormInterface from '@/components/FormInterface';
import { flows } from '@/flows';
import { Flow } from '@/types/flow';
import { useTaskContext, TaskAnswer } from '@/lib/TaskContext';
import { useUIMode } from '@/lib/UIModeContext';

const flowTitles: Record<string, string> = {
  'find-care': 'Finding you healthcare',
  'appointments': 'Managing your appointment',
  'insurance': 'Helping with your insurance',
  'compare-prices': 'Finding you the best prices',
  'medical-records': 'Getting your medical records',
  'medication-refill': 'Processing your medication refill',
  'something-else': 'Working on your request',
};

export default function FlowPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.flowId as string;
  const [flow, setFlow] = useState<Flow | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { addTask } = useTaskContext();
  const { uiMode } = useUIMode();

  useEffect(() => {
    if (flowId && flows[flowId]) {
      setFlow(flows[flowId]);
    } else {
      router.push('/');
    }
  }, [flowId, router]);

  const handleComplete = (answers: Record<string, string | string[] | File>) => {
    console.log('Flow completed with answers:', answers);

    // Convert answers to TaskAnswer format
    const taskAnswers: TaskAnswer[] = [];
    if (flow) {
      for (const step of flow.steps) {
        const answer = answers[step.id];
        if (answer !== undefined && answer !== '') {
          // Skip File objects for now (can't serialize them)
          if (answer instanceof File) {
            taskAnswers.push({
              stepId: step.id,
              question: step.question,
              answer: `[File: ${answer.name}]`,
            });
          } else {
            taskAnswers.push({
              stepId: step.id,
              question: step.question,
              answer: answer,
            });
          }
        }
      }
    }

    // Add task to active tasks
    const newTaskId = addTask({
      flowId,
      title: flowTitles[flowId] || 'Processing your request',
      description: flow?.name || 'Task',
      progress: 1,
      totalSteps: 5,
      status: 'in_progress',
      answers: taskAnswers,
    });

    setTaskId(newTaskId);
    setSubmitted(true);
  };

  if (!flow) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#A8F4F4', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // Success page
  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200">
          <Image
            src="/medfinder-logo.png"
            alt="Medfinder"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
        </header>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: '#E2FFDF' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: '#B0F7A9' }} />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#132F4E' }}>
            Request Submitted!
          </h1>

          <p className="text-center text-gray-500 mb-8 max-w-sm">
            We're working on your request. You'll receive a text message with updates.
          </p>

          {/* Task Status Card */}
          <div
            className="w-full max-w-sm rounded-2xl p-4 mb-8 border border-gray-200"
            style={{ background: 'linear-gradient(135deg, #E2FFDF 0%, #EFFDFD 100%)' }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: '#132F4E' }}>
              {flowTitles[flowId] || 'Processing your request'}
            </p>

            {/* Progress Dots */}
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className="w-5 h-5 rounded-full"
                  style={{
                    backgroundColor: step === 1 ? '#B0F7A9' : '#E2FFDF'
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">Step 1 of 5: Request received</p>
          </div>

          {/* Actions */}
          <div className="w-full max-w-sm space-y-3">
            {taskId && (
              <Link
                href={`/task/${taskId}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full transition-colors hover:opacity-80"
                style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
              >
                View Task Details
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full transition-colors hover:opacity-80 border border-gray-200"
              style={{ color: '#132F4E' }}
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className="px-4 py-6 border-t border-gray-200">
          <div className="max-w-sm mx-auto">
            <h2 className="font-semibold mb-3" style={{ color: '#132F4E' }}>What happens next?</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span style={{ color: '#B0F7A9' }}>✓</span>
                We'll review your request
              </li>
              <li className="flex gap-2">
                <span style={{ color: '#B0F7A9' }}>✓</span>
                You'll get a text with updates
              </li>
              <li className="flex gap-2">
                <span style={{ color: '#B0F7A9' }}>✓</span>
                We may reach out if we need more info
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (uiMode === 'form') {
    return <FormInterface flow={flow} onComplete={handleComplete} onClose={() => router.push('/')} />;
  }

  return <ChatInterface flow={flow} onComplete={handleComplete} />;
}
