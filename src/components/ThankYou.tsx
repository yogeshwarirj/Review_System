import React from 'react';
import { CheckCircle, RotateCcw, Star, Heart } from 'lucide-react';
import { ReviewContext } from '../services/aiActor';

interface ThankYouProps {
  onStartOver: () => void;
  aiContext: ReviewContext;
}

export default function ThankYou({ onStartOver, aiContext }: ThankYouProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your review has been successfully submitted
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Feedback Matters!
                </h3>
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-gray-700">
                Thank you for taking the time to share your thoughts with us. 
                Your valuable feedback helps us improve and create better experiences for everyone.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">✨</div>
                <h4 className="font-medium text-blue-900 mb-1">Quality</h4>
                <p className="text-sm text-blue-800">Your insights help us maintain high standards</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">🚀</div>
                <h4 className="font-medium text-green-900 mb-1">Innovation</h4>
                <p className="text-sm text-green-800">Your feedback drives our continuous improvement</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">🤝</div>
                <h4 className="font-medium text-purple-900 mb-1">Community</h4>
                <p className="text-sm text-purple-800">Together, we build something amazing</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your review will be processed within 24 hours</li>
                <li>• We'll take your feedback into consideration for future improvements</li>
                <li>• You may receive a follow-up email with updates</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={onStartOver}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Review</span>
            </button>
            
            <p className="text-gray-500 text-sm">
              Have more feedback to share? We'd love to hear from you again!
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-400 text-xs">
              Review Assistant by Alex • Making feedback easy and enjoyable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}