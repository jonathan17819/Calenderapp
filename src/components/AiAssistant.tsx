import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '../store/calendarStore';
import { aiService } from '../services/aiService';
import { AiAssistantMessage } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { aiMessages, isLoading } = useCalendarStore();
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    
    await aiService.sendMessage(message);
  };
  
  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    setInputValue('');
    await aiService.sendMessage(prompt);
  };
  
  const renderMessage = (message: AiAssistantMessage) => {
    if (message.role === 'system') return null;
    
    return (
      <div 
        key={message.id}
        className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
      >
        <div 
          className={`
            inline-block max-w-[80%] rounded-lg px-4 py-2
            ${message.role === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800'
            }
          `}
        >
          <p>{message.content}</p>
          <div 
            className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };
  
  const quickPrompts = [
    "What's my schedule today?",
    "Find me free time this week",
    "Optimize my calendar",
    "Schedule a focus block"
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium">AI Calendar Assistant</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {aiMessages.filter(m => m.role !== 'system').map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
          
          {aiMessages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your AI assistant..."
                className="w-full pl-4 pr-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiAssistant;