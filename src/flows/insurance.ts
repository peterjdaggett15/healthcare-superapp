import { Flow } from '@/types/flow';

export const insuranceFlow: Flow = {
  id: 'insurance',
  name: 'Help with Insurance',
  description: 'Get help with coverage, claims, denials, and more',
  icon: 'Shield',
  steps: [
    {
      id: 'phone',
      question: "Hi! I can help you with your insurance issue. What's your phone number?",
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
      id: 'issue-description',
      question: "Tell me about the insurance issue you're facing. What's going on?",
      inputType: 'text',
      required: true,
      placeholder: 'Describe your insurance problem...',
    },
    {
      id: 'urgency',
      question: "Is this time-sensitive? Do you have any deadlines?",
      inputType: 'single-select',
      required: true,
      options: [
        { value: 'urgent', label: 'Yes, urgent' },
        { value: 'not-urgent', label: 'Not urgent' },
      ],
    },
    {
      id: 'deadline',
      question: "What's the deadline?",
      inputType: 'text',
      required: true,
      placeholder: 'Date or describe the deadline...',
      conditionalOn: { stepId: 'urgency', value: 'urgent' },
    },
    {
      id: 'issue-type',
      question: "What type of issue is this?",
      inputType: 'single-select',
      required: true,
      options: [
        { value: 'specific-claim', label: 'Specific claim' },
        { value: 'prior-auth', label: 'Prior authorization' },
        { value: 'coverage-question', label: 'General coverage question' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'already-contacted',
      question: "Have you already contacted your insurance company about this?",
      inputType: 'single-select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'contact-outcome',
      question: "What happened when you contacted them?",
      inputType: 'text',
      required: false,
      placeholder: 'Describe the conversation...',
      conditionalOn: { stepId: 'already-contacted', value: 'yes' },
    },
    {
      id: 'insurance-card',
      question: "Please upload a photo of your insurance card (front and back).",
      inputType: 'photo-upload',
      required: true,
    },
    {
      id: 'documents',
      question: "Upload any relevant documents (EOB, denial letter, bills, etc.).",
      inputType: 'file-upload',
      required: false,
    },
    {
      id: 'desired-outcome',
      question: "What outcome are you hoping for?",
      inputType: 'text',
      required: false,
      placeholder: 'e.g., Get the claim paid, get prior auth approved...',
    },
    {
      id: 'other-notes',
      question: "Anything else we should know?",
      inputType: 'text',
      required: false,
      placeholder: 'Additional information...',
    },
  ],
};
