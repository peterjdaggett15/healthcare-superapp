export type InputType =
  | 'text'
  | 'phone'
  | 'date'
  | 'number'
  | 'email'
  | 'address'
  | 'zipcode'
  | 'single-select'
  | 'multi-select'
  | 'photo-upload'
  | 'file-upload'
  | 'pharmacy-search'
  | 'location';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FlowStep {
  id: string;
  question: string;
  inputType: InputType;
  required: boolean;
  options?: SelectOption[];
  placeholder?: string;
  conditionalOn?: {
    stepId: string;
    value: string | string[];
  };
  skipIf?: {
    stepId: string;
    value: string | string[];
  };
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: FlowStep[];
}

export interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  inputType?: InputType;
  options?: SelectOption[];
  stepId?: string;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url?: string;
  };
}

export interface FlowState {
  currentStepIndex: number;
  answers: Record<string, string | string[] | File>;
  messages: Message[];
  isComplete: boolean;
  isSubmitting: boolean;
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}
