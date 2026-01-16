import { Flow } from '@/types/flow';

export const somethingElseFlow: Flow = {
  id: 'something-else',
  name: 'Something Else',
  description: "Get help with something that's not listed",
  icon: 'HelpCircle',
  steps: [
    {
      id: 'full-name',
      question: "Hi! I'm here to help. What's your name?",
      inputType: 'text',
      required: true,
      placeholder: 'Your name',
    },
    {
      id: 'phone',
      question: "What's your phone number?",
      inputType: 'phone',
      required: true,
      placeholder: '(555) 123-4567',
    },
    {
      id: 'dob',
      question: "What's your date of birth?",
      inputType: 'date',
      required: true,
    },
    {
      id: 'request',
      question: "How can we help you today? Please describe what you need.",
      inputType: 'text',
      required: true,
      placeholder: 'Describe what you need help with...',
    },
    {
      id: 'urgency',
      question: "Is this urgent?",
      inputType: 'single-select',
      required: true,
      options: [
        { value: 'urgent', label: 'Yes, urgent' },
        { value: 'not-urgent', label: 'Not urgent' },
      ],
    },
    {
      id: 'documents',
      question: "Do you have any relevant files to upload?",
      inputType: 'file-upload',
      required: false,
    },
    {
      id: 'other-notes',
      question: "Anything else we should know?",
      inputType: 'text',
      required: false,
      placeholder: 'Additional notes...',
    },
  ],
};
