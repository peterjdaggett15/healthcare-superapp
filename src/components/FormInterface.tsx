'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, X, Camera, Upload, MapPin, Check, Info, User } from 'lucide-react';
import { Flow, FlowStep, InputType } from '@/types/flow';

interface FormInterfaceProps {
  flow: Flow;
  onComplete: (answers: Record<string, string | string[] | File>) => void;
  onClose?: () => void;
}

export default function FormInterface({ flow, onComplete, onClose }: FormInterfaceProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | File>>({});
  const [inputValue, setInputValue] = useState('');
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<FlowStep[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shouldShowStep = useCallback((step: FlowStep, currentAnswers: Record<string, string | string[] | File>): boolean => {
    // Check conditionalOn
    if (step.conditionalOn) {
      const dependentAnswer = currentAnswers[step.conditionalOn.stepId];
      const requiredValues = Array.isArray(step.conditionalOn.value)
        ? step.conditionalOn.value
        : [step.conditionalOn.value];

      if (!dependentAnswer || !requiredValues.includes(dependentAnswer as string)) {
        return false;
      }
    }

    // Check skipIf
    if (step.skipIf) {
      const dependentAnswer = currentAnswers[step.skipIf.stepId];
      const skipValues = Array.isArray(step.skipIf.value)
        ? step.skipIf.value
        : [step.skipIf.value];

      if (dependentAnswer && skipValues.includes(dependentAnswer as string)) {
        return false;
      }
    }

    return true;
  }, []);

  // Calculate visible steps based on current answers
  useEffect(() => {
    const visible = flow.steps.filter(step => shouldShowStep(step, answers));
    setVisibleSteps(visible);
  }, [flow.steps, answers, shouldShowStep]);

  // Focus input when step changes
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  }, [currentStepIndex]);

  // Pre-fill input if answer exists (for back navigation)
  useEffect(() => {
    const currentStep = visibleSteps[currentStepIndex];
    if (currentStep) {
      const existingAnswer = answers[currentStep.id];
      if (existingAnswer) {
        if (currentStep.inputType === 'multi-select' && Array.isArray(existingAnswer)) {
          setMultiSelectValues(existingAnswer as string[]);
          setInputValue('');
        } else if (typeof existingAnswer === 'string') {
          setInputValue(existingAnswer);
          setMultiSelectValues([]);
        }
      } else {
        setInputValue('');
        setMultiSelectValues([]);
      }
    }
  }, [currentStepIndex, visibleSteps, answers]);

  const getCurrentStep = (): FlowStep | null => {
    return visibleSteps[currentStepIndex] || null;
  };

  const handleAnswer = (value: string | string[] | File) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    // Store answer
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);

    // Recalculate visible steps with new answers
    const newVisibleSteps = flow.steps.filter(step => shouldShowStep(step, newAnswers));

    // Check if there's a next step
    if (currentStepIndex < newVisibleSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Flow complete
      onComplete(newAnswers);
    }

    // Reset input
    setInputValue('');
    setMultiSelectValues([]);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    if (currentStep.inputType === 'multi-select') {
      if (multiSelectValues.length > 0 || !currentStep.required) {
        handleAnswer(multiSelectValues.length > 0 ? multiSelectValues : []);
      }
    } else if (inputValue.trim()) {
      handleAnswer(inputValue.trim());
    } else if (!currentStep.required) {
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
          inputRef.current?.focus();
        }
      );
    }
  };

  const getInputType = (type: InputType): string => {
    switch (type) {
      case 'phone': return 'tel';
      case 'email': return 'email';
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  };

  const getInputLabel = (step: FlowStep): string => {
    switch (step.inputType) {
      case 'phone': return 'Your Phone Number';
      case 'email': return 'Email Address';
      case 'zipcode': return 'ZIP Code';
      case 'location': return 'ZIP Code';
      case 'date': return 'Date';
      case 'address': return 'Address';
      default: return '';
    }
  };

  const renderInput = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;

    const inputType = currentStep.inputType;

    // Single select with card-style options
    if (inputType === 'single-select' && currentStep.options) {
      return (
        <div className="space-y-3">
          {currentStep.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: '#132F4E' }}>{option.label}</p>
                {option.description && (
                  <p className="text-sm text-gray-500 truncate">{option.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }

    // Multi select
    if (inputType === 'multi-select' && currentStep.options) {
      return (
        <div className="space-y-3">
          {currentStep.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleMultiSelectToggle(option.value)}
              className={`w-full flex items-center gap-3 p-4 border rounded-xl text-left transition-colors ${
                multiSelectValues.includes(option.value)
                  ? 'border-[#A8F4F4] bg-[#EFFDFD]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  multiSelectValues.includes(option.value)
                    ? 'border-[#A8F4F4] bg-[#A8F4F4]'
                    : 'border-gray-300'
                }`}
              >
                {multiSelectValues.includes(option.value) && (
                  <Check className="w-4 h-4 text-[#132F4E]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: '#132F4E' }}>{option.label}</p>
                {option.description && (
                  <p className="text-sm text-gray-500">{option.description}</p>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={() => handleAnswer(multiSelectValues)}
            disabled={multiSelectValues.length === 0 && currentStep.required}
            className="w-full py-4 rounded-full font-medium transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            Continue
          </button>
        </div>
      );
    }

    // Photo upload
    if (inputType === 'photo-upload') {
      return (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            <Camera className="w-5 h-5" />
            Take Photo or Upload
          </button>
          {!currentStep.required && (
            <button
              onClick={() => handleAnswer('skipped')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
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
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            <Upload className="w-5 h-5" />
            Upload File
          </button>
          {!currentStep.required && (
            <button
              onClick={() => handleAnswer('skipped')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      );
    }

    // Location input
    if (inputType === 'location') {
      const label = getInputLabel(currentStep);
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {label && (
            <label className="block text-sm font-medium" style={{ color: '#132F4E' }}>
              {label}
            </label>
          )}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentStep.placeholder || 'Enter zip code'}
              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#A8F4F4]"
              style={{ color: '#132F4E' }}
            />
            <button
              type="button"
              onClick={handleLocationShare}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Use my location"
            >
              <MapPin className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() && currentStep.required}
            className="w-full py-4 rounded-full font-medium transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            Continue
          </button>
        </form>
      );
    }

    // Text area for longer inputs
    if (inputType === 'text' && currentStep.placeholder && currentStep.placeholder.length > 50) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentStep.placeholder}
            rows={4}
            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#A8F4F4] resize-none"
            style={{ color: '#132F4E' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() && currentStep.required}
            className="w-full py-4 rounded-full font-medium transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            Continue
          </button>
          {!currentStep.required && !inputValue.trim() && (
            <button
              type="button"
              onClick={() => handleAnswer('')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip this question
            </button>
          )}
        </form>
      );
    }

    // Default text input
    const label = getInputLabel(currentStep);
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {label && (
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium" style={{ color: '#132F4E' }}>
              {label}
            </label>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          ref={inputRef}
          type={getInputType(inputType)}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentStep.placeholder || ''}
          className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#A8F4F4]"
          style={{ color: '#132F4E' }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() && currentStep.required}
          className="w-full py-4 rounded-full font-medium transition-colors disabled:opacity-50 hover:opacity-80"
          style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
        >
          Continue
        </button>
        {!currentStep.required && !inputValue.trim() && (
          <button
            type="button"
            onClick={() => handleAnswer('')}
            className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip this question
          </button>
        )}
      </form>
    );
  };

  const currentStep = getCurrentStep();
  const totalSteps = visibleSteps.length;
  const currentStepNumber = currentStepIndex + 1;

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#A8F4F4', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#132F4E' }} />
        </button>

        <span className="text-sm font-medium" style={{ color: '#132F4E' }}>
          Step {currentStepNumber} of {totalSteps}
        </span>

        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: '#132F4E' }} />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="flex gap-1">
          {visibleSteps.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: index < currentStepNumber ? '#B0F7A9' : '#E5E7EB'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-sm mx-auto">
          {/* Question */}
          <h1 className="text-2xl font-bold text-center mb-3" style={{ color: '#132F4E' }}>
            {currentStep.question}
          </h1>

          {/* Subtitle/Description - show placeholder as hint for text inputs */}
          {currentStep.inputType !== 'single-select' &&
           currentStep.inputType !== 'multi-select' &&
           currentStep.placeholder && (
            <p className="text-center text-gray-500 mb-8">
              {currentStep.inputType === 'text' && currentStep.placeholder.length > 50
                ? currentStep.placeholder.split('.')[0] + '.'
                : ''}
            </p>
          )}

          {/* Spacer for select types */}
          {(currentStep.inputType === 'single-select' || currentStep.inputType === 'multi-select') && (
            <div className="mb-6" />
          )}

          {/* Input Area */}
          <div className="mt-8">
            {renderInput()}
          </div>
        </div>
      </div>
    </div>
  );
}
