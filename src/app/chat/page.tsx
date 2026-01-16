'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'can\'t breathe',
  'cannot breathe',
  'heart attack',
  'stroke',
  'suicide',
  'kill myself',
  'want to die',
  'overdose',
  'unconscious',
  'severe bleeding',
  'choking',
];

const INITIAL_MESSAGE = `Hi! I'm your healthcare assistant. I can help answer general health questions, explain medical terms, and guide you to the right resources.

**Important:** I'm not a doctor and this isn't medical advice. For emergencies, please call 911.

What would you like to know?`;

const SUGGESTED_PROMPTS = [
  "What's the difference between urgent care and ER?",
  "What does my diagnosis mean?",
  "What questions should I ask my doctor?",
  "How do I prepare for a procedure?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      type: 'bot',
      content: INITIAL_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQueryProcessed = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial query from URL parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && !initialQueryProcessed.current) {
      initialQueryProcessed.current = true;
      // Auto-submit the query
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: query,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Generate response after a delay
      setTimeout(() => {
        const response = generateResponse(query);
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, [searchParams]);

  const checkForEmergency = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some((keyword) => lowerText.includes(keyword));
  };

  const generateResponse = (userMessage: string): string => {
    // Check for emergency keywords
    if (checkForEmergency(userMessage)) {
      return `🚨 **This sounds like it could be an emergency.**

If you or someone else is in immediate danger, please:
- **Call 911** for medical emergencies
- **Call 988** (Suicide & Crisis Lifeline) for mental health crises
- Go to your nearest **Emergency Room**

If this isn't an emergency and you'd like to continue chatting, please let me know how I can help.`;
    }

    // Simple responses based on keywords (in a real app, this would call an AI API)
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('urgent care') && lowerMessage.includes('er')) {
      return `**Urgent Care vs Emergency Room:**

**Go to Urgent Care for:**
- Minor injuries (sprains, small cuts)
- Cold, flu, or mild infections
- Minor burns
- Ear or eye infections
- Skin rashes

**Go to the ER for:**
- Chest pain or difficulty breathing
- Signs of stroke (face drooping, arm weakness, speech difficulty)
- Severe bleeding or injuries
- High fever with stiff neck
- Severe allergic reactions
- Loss of consciousness

When in doubt, call your doctor's office or a nurse hotline for guidance.

Would you like help finding an urgent care or understanding your symptoms?`;
    }

    if (lowerMessage.includes('question') && lowerMessage.includes('doctor')) {
      return `**Great questions to ask your doctor:**

**About your condition:**
- What is my diagnosis?
- What caused this condition?
- Is this chronic or will it resolve?

**About treatment:**
- What are my treatment options?
- What are the risks and benefits of each option?
- Are there lifestyle changes that could help?

**About medications:**
- What does this medication do?
- What are the side effects?
- How long will I need to take it?

**About next steps:**
- What symptoms should I watch for?
- When should I follow up?
- Should I see a specialist?

Would you like me to help you prepare for a specific type of appointment?`;
    }

    if (lowerMessage.includes('prepare') && (lowerMessage.includes('procedure') || lowerMessage.includes('surgery'))) {
      return `**Preparing for a procedure:**

**Before your appointment:**
- Ask about fasting requirements (food/water)
- Ask if you should stop any medications
- Arrange transportation home if needed
- Prepare a list of your current medications
- Bring your insurance card and ID

**Questions to ask:**
- How long will the procedure take?
- What kind of anesthesia will be used?
- What are the risks?
- What's the recovery time?
- When can I return to normal activities?

**After the procedure:**
- Follow all post-procedure instructions
- Know the warning signs to watch for
- Have a follow-up appointment scheduled

Is there a specific procedure you're preparing for?`;
    }

    if (lowerMessage.includes('diagnosis') || lowerMessage.includes('diagnosed')) {
      return `I'd be happy to help you understand a diagnosis. Could you tell me:

1. What condition were you diagnosed with?
2. What specific terms or aspects are confusing?

I can explain medical terminology, help you understand what questions to ask your doctor, or point you toward reliable resources.

**Note:** While I can provide general information, your doctor is the best source for advice specific to your situation.`;
    }

    // Default response
    return `Thanks for your question! I can help with:

- **Understanding medical terms** - Tell me the term and I'll explain it
- **Preparing for appointments** - I can suggest questions to ask
- **Navigating healthcare** - Finding the right type of care
- **General health info** - Basic information about conditions

What would you like to know more about?

*Remember: For specific medical advice, please consult with a healthcare provider.*`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic text
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
        );
      }
      if (line === '') {
        return <br key={i} />;
      }
      return (
        <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />
      );
    });
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
          className="h-8 w-auto"
        />
        <div className="flex-1 text-right">
          <p className="text-xs text-gray-500">AI Health Assistant</p>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="px-4 py-2 border-b border-gray-200" style={{ backgroundColor: '#EFFDFD' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#132F4E' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>This is not medical advice. For emergencies, call 911.</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'rounded-br-md'
                    : 'bg-white border border-gray-200 rounded-bl-md'
                }`}
                style={message.type === 'user' ? { backgroundColor: '#A8F4F4', color: '#132F4E' } : { color: '#132F4E' }}
              >
                <div className="space-y-1 text-sm leading-relaxed">
                  {renderMessageContent(message.content)}
                </div>
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

      {/* Suggested Prompts (show only if few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
                  style={{ color: '#132F4E' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
            style={{ color: '#132F4E' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-3 rounded-full transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: '#A8F4F4', color: '#132F4E' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
