import React from 'react';
import { Edit3, Mic, Video, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { ReviewMode } from '../App';
import { ReviewContext } from '../services/aiActor';
import InteractiveChat from './InteractiveChat';
import Avatar, { AvatarPresets } from './Avatar';

interface WelcomeScreenProps {
  onModeSelect: (mode: ReviewMode) => void;
  aiContext: ReviewContext;
}

export default function WelcomeScreen({ onModeSelect, aiContext }: WelcomeScreenProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const options = [
    {
      id: 'written',
      title: 'Written Review',
      icon: Edit3,
      description: 'Express yourself freely with detailed observations',
      features: ['Up to 500 characters', 'Edit before submitting', 'Perfect for detailed thoughts'],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'voice',
      title: 'Voice Review',
      icon: Mic,
      description: 'Natural conversation style with audio recording',
      features: ['2-minute time limit', 'Background noise check', 'Preview before submitting'],
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'video',
      title: 'Video Review',
      icon: Video,
      description: 'Face-to-face interaction with visual feedback',
      features: ['3-minute time limit', 'Lighting & framing guidance', 'Preview before submitting'],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Avatar
              {...AvatarPresets.Belle}
              size="xl"
              showStatus={true}
              className="ring-4 ring-blue-200"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hi this is Alex, your review assistant 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            I'm here to make sharing your feedback easy and enjoyable. Choose your preferred format below:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className={`${option.bgColor} rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group`}
                onClick={() => onModeSelect(option.id as ReviewMode)}
              >
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${option.color} mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-lg">{option.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${option.color}`} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="font-medium">Choose Option {index + 1}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            I'll guide you through each step with helpful tips and countdown timers when needed.
          </p>
          <p className="text-gray-600">
            You'll always have the chance to review before submitting.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            <span>Your feedback helps us improve and is greatly appreciated!</span>
            <Star className="w-4 h-4" />
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all mx-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Alex</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Have questions? Alex is here to help!
            </p>
          </div>
        </div>
        
        <InteractiveChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          context={aiContext}
        />
      </div>
    </div>
  );
}