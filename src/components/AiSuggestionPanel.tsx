import React, { useEffect } from 'react';
import { Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '../store/calendarStore';
import { aiService } from '../services/aiService';
import { AiSuggestion } from '../types';

interface AiSuggestionPanelProps {
  onToggleAiAssistant: () => void;
}

const AiSuggestionPanel: React.FC<AiSuggestionPanelProps> = ({ onToggleAiAssistant }) => {
  const { 
    aiSuggestions, 
    dismissAiSuggestion, 
    applyAiSuggestion,
    isLoading
  } = useCalendarStore();
  
  useEffect(() => {
    // Refresh suggestions when component mounts
    aiService.refreshSuggestions();
    
    // Set up interval to refresh suggestions every 5 minutes
    const interval = setInterval(() => {
      aiService.refreshSuggestions();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const activeSuggestions = aiSuggestions.filter(
    suggestion => !suggestion.dismissed && !suggestion.applied
  );
  
  const handleRefresh = () => {
    aiService.refreshSuggestions();
  };
  
  const renderSuggestion = (suggestion: AiSuggestion) => {
    return (
      <motion.div
        key={suggestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-md p-4 mb-3"
      >
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-600">
                {suggestion.type === 'new-event' && 'Event Suggestion'}
                {suggestion.type === 'optimization' && 'Schedule Optimization'}
                {suggestion.type === 'conflict' && 'Conflict Detected'}
                {suggestion.type === 'reminder' && 'Reminder'}
                {suggestion.type === 'reminder' && 'Reminder'}
                {suggestion.type === 'reschedule' && 'Reschedule Suggestion'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => applyAiSuggestion(suggestion.id)}
                className="flex items-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded"
              >
                <Check className="h-3 w-3 mr-1" />
                Apply
              </button>
              <button
                onClick={() => dismissAiSuggestion(suggestion.id)}
                className="flex items-center text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="bg-gray-50 border-l p-4 w-80 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
          AI Suggestions
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggleAiAssistant}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Ask AI
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {activeSuggestions.length > 0 ? (
          activeSuggestions.map(renderSuggestion)
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-sm text-gray-500">
              No active suggestions right now.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Suggestions will appear as your schedule changes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiSuggestionPanel;