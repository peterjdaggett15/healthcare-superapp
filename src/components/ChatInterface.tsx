'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Camera, Upload, MapPin, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Flow, FlowStep, Message, SelectOption, InputType } from '@/types/flow';

interface ChatInterfaceProps {
  flow: Flow;
  onComplete: (answers: Record<string, string | string[] | File>) => void;
}

export default function ChatInterface({ flow, onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | File>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const shouldShowStep = useCallback((step: FlowStep): boolean => {
    // Check conditionalOn
    if (step.conditionalOn) {
      const dependentAnswer = answers[step.conditionalOn.stepId];
      const requiredValues = Array.isArray(step.conditionalOn.value)
        ? step.conditionalOn.value
        : [step.conditionalOn.value];

      if (!dependentAnswer || !requiredValues.includes(dependentAnswer as string)) {
        return false;
      }
    }

    // Check skipIf
    if (step.skipIf) {
      const dependentAnswer = answers[step.skipIf.stepId];
      const skipValues = Array.isArray(step.skipIf.value)
        ? step.skipIf.value
        : [step.skipIf.value];

      if (dependentAnswer && skipValues.includes(dependentAnswer as string)) {
        return false;
      }
    }

    return true;
  }, [answers]);

  const findNextStepIndex = useCallback((fromIndex: number): number => {
    for (let i = fromIndex; i < flow.steps.length; i++) {
      if (shouldShowStep(flow.steps[i])) {
        return i;
      }
    }
    return -1; // No more steps
  }, [flow.steps, shouldShowStep]);

  const addBotMessage = useCallback((step: FlowStep) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const message: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: step.question,
        timestamp: new Date(),
        inputType: step.inputType,
        options: step.options,
        stepId: step.id,
      };
      setMessages((prev) => [...prev, message]);
    }, 500);
  }, []);

  // Initialize with first message
  useEffect(() => {
    if (!initializedRef.current && flow.steps.length > 0) {
      initializedRef.current = true;
      const firstStepIndex = findNextStepIndex(0);
      if (firstStepIndex >= 0) {
        setCurrentStepIndex(firstStepIndex);
        addBotMessage(flow.steps[firstStepIndex]);
      }
    }
  }, [flow.steps, addBotMessage, findNextStepIndex]);

  const getCurrentStep = (): FlowStep | null => {
    return flow.steps[currentStepIndex] || null;
  };

  const handleAnswer = (value: string | string[] | File) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    // Add user message
    const displayValue = value instanceof File
      ? `📎 ${value.name}`
      : Array.isArray(value)
        ? value.map(v => currentStep.options?.find(o => o.value === v)?.label || v).join(', ')
        : currentStep.options?.find(o => o.value === value)?.label || value;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: displayValue as string,
      timestamp: new Date(),
      attachment: value instanceof File ? { type: 'file', name: value.name } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Store answer
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);

    // Find next step
    const nextIndex = findNextStepIndex(currentStepIndex + 1);

    if (nextIndex >= 0) {
      setCurrentStepIndex(nextIndex);
      addBotMessage(flow.steps[nextIndex]);
    } else {
      // Flow complete
      setIsComplete(true);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const completeMessage: Message = {
          id: `bot-complete-${Date.now()}`,
          type: 'bot',
          content: "Thanks! I have everything I need. We'll get started on this right away and text you with updates. Is there anything else you'd like to add?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, completeMessage]);
        onComplete(newAnswers);
      }, 500);
    }

    // Reset input
    setInputValue('');
    setMultiSelectValues([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStep = getCurrentStep();

    if (currentStep?.inputType === 'multi-select') {
      if (multiSelectValues.length > 0) {
        handleAnswer(multiSelectValues);
      }
    } else if (inputValue.trim()) {
      handleAnswer(inputValue.trim());
    } else if (!currentStep?.required) {
      // Allow empty submission for optional fields
      handleAnswer('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAnswer(file);
    }
  };

  const handleMultiSelectToggle = (value: string) => {
    setMultiSelectValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleAnswer(`📍 Location shared (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        },
        () => {
          // Fallback to manual entry
          inputRef.current?.focus();
        }
      );
    }
  };

  const renderInput = () => {
    const currentStep = getCurrentStep();
    if (!currentStep || isTyping || isComplete) {
      return (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              disabled
              placeholder={isTyping ? "..." : "Type a message..."}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full disabled:opacity-50"
              style={{ color: '#132F4E' }}
            />
          </div>
        </div>
      );
    }

    const inputType = currentStep.inputType;

    // Single select with buttons
    if (inputType === 'single-select' && currentStep.options) {
      return (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 justify-end">
            {currentStep.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="px-4 py-2 rounded-full transition-colors hover:opacity-80"
                style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {currentStep.options.some(o => o.description) && (
            <div className="mt-3 space-y-1 text-right">
              {currentStep.options.filter(o => o.description).map((option) => (
                <p key={option.value} className="text-xs text-gray-500">
                  <span className="font-medium">{option.label}:</span> {option.description}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Multi select
    if (inputType === 'multi-select' && currentStep.options) {
      return (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3 justify-end">
            {currentStep.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMultiSelectToggle(option.value)}
                className={`px-4 py-2 rounded-full border transition-colors flex items-center gap-2 ${
                  multiSelectValues.includes(option.value)
                    ? 'border-transparent'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                style={multiSelectValues.includes(option.value) ? { backgroundColor: '#A8F4F4', color: '#132F4E' } : { color: '#132F4E' }}
              >
                {multiSelectValues.includes(option.value) && <Check className="w-4 h-4" />}
                {option.label}
              </button>
            ))}
          </div>
          {multiSelectValues.length > 0 && (
            <button
              onClick={() => handleAnswer(multiSelectValues)}
              className="w-full py-2 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
            >
              Continue
            </button>
          )}
        </div>
      );
    }

    // Photo upload
    if (inputType === 'photo-upload') {
      return (
        <div className="p-4 border-t border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
            >
              <Camera className="w-5 h-5" />
              Take Photo or Upload
            </button>
          </div>
          {!currentStep.required && (
            <button
              onClick={() => handleAnswer('skipped')}
              className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      );
    }

    // File upload
    if (inputType === 'file-upload') {
      return (
        <div className="p-4 border-t border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
            >
              <Upload className="w-5 h-5" />
              Upload File
            </button>
          </div>
          {!currentStep.required && (
            <button
              onClick={() => handleAnswer('skipped')}
              className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      );
    }

    // Location input
    if (inputType === 'location') {
      return (
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentStep.placeholder || 'Enter zip code'}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
              style={{ color: '#132F4E' }}
            />
            <button
              type="button"
              onClick={handleLocationShare}
              className="p-3 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
              title="Use my location"
            >
              <MapPin className="w-5 h-5" style={{ color: '#132F4E' }} />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-3 rounded-full transition-colors disabled:opacity-50 hover:opacity-80"
              style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      );
    }

    // Default text input (and other types)
    const getInputType = (type: InputType): string => {
      switch (type) {
        case 'phone': return 'tel';
        case 'email': return 'email';
        case 'number': return 'number';
        case 'date': return 'date';
        default: return 'text';
      }
    };

    return (
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type={getInputType(inputType)}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentStep.placeholder || 'Type your answer...'}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
            style={{ color: '#132F4E' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() && currentStep.required}
            className="p-3 rounded-full transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {!currentStep.required && !inputValue.trim() && (
          <button
            onClick={() => handleAnswer('skipped')}
            className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Skip this question
          </button>
        )}
      </div>
    );
  };

  const getProgressPercentage = (): number => {
    const totalSteps = flow.steps.filter((step) => shouldShowStep(step)).length;
    const answeredSteps = Object.keys(answers).length;
    return Math.round((answeredSteps / totalSteps) * 100);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link
          href="/"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#132F4E' }} />
        </Link>
        <Image
          src="/medfinder-logo.png"
          alt="Medfinder"
          width={120}
          height={32}
          className="h-8 w-auto flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%`, backgroundColor: '#B0F7A9' }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{getProgressPercentage()}%</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'rounded-br-md'
                    : 'bg-white border border-gray-200 rounded-bl-md'
                }`}
                style={message.type === 'user' ? { backgroundColor: '#A8F4F4', color: '#132F4E' } : { color: '#132F4E' }}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {renderInput()}
    </div>
  );
}
