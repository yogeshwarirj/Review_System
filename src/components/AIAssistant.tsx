import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Heart } from 'lucide-react';
import { aiActor, AIResponse, ReviewContext } from '../services/aiActor';

interface AIAssistantProps {
  context: ReviewContext;
  isVisible?: boolean;
  onToggle?: () => void;
}

export default function AIAssistant({ context, isVisible = true, onToggle }: AIAssistantProps) {
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [liveGuidance, setLiveGuidance] = useState<string[]>([]);

  useEffect(() => {
    generateResponse();
    if (context.stage === 'recording') {
      startLiveGuidance();
    }
  }, [context]);

  const generateResponse = async () => {
    setIsLoading(true);
    try {
      const aiResponse = await aiActor.generateResponse(context);
      setResponse(aiResponse);
    } catch (error) {
      console.error('AI Actor error:', error);
      setResponse({
        message: "I'm here to help! Let me know if you need any guidance.",
        emotion: 'helpful'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startLiveGuidance = async () => {
    const guidance = await aiActor.provideLiveGuidance(context);
    setLiveGuidance(guidance);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-16 h-16' : 'w-80'
    }`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        >
          <div className="relative">
            <MessageCircle className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Alex - Your AI Assistant</h3>
                  <p className="text-xs opacity-90">Here to help you succeed!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-sm">Alex is thinking...</span>
              </div>
            ) : response ? (
              <div className="space-y-4">
                {/* Main Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">
                      {aiActor.getEmoji(response.emotion)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {response.message}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Helpful Tips:</h4>
                    <ul className="space-y-1">
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-xs text-blue-800 flex items-start space-x-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Live Guidance */}
                {liveGuidance.length > 0 && context.stage === 'recording' && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>Live Feedback:</span>
                    </h4>
                    <ul className="space-y-1">
                      {liveGuidance.map((guidance, index) => (
                        <li key={index} className="text-xs text-green-800 flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{guidance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              AI-powered assistance • Always here to help
            </p>
          </div>
        </div>
      )}
    </div>
  );
}