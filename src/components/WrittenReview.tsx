import React, { useState } from 'react';
import { ArrowLeft, Send, Edit3, Edit } from 'lucide-react';
import { ReviewData } from '../App';
import { ReviewContext } from '../services/aiActor';

interface WrittenReviewProps {
  onComplete: (data: ReviewData) => void;
  onDirectSubmit: (data: ReviewData) => Promise<void>;
  onBack: () => void;
  aiContext: ReviewContext;
}

export default function WrittenReview({ onComplete, onDirectSubmit, onBack, aiContext }: WrittenReviewProps) {
  const [review, setReview] = useState('');
  const [isDirectSubmitting, setIsDirectSubmitting] = useState(false);
  const maxLength = 500;

  const handleSubmit = () => {
    if (review.trim()) {
      onComplete({
        type: 'written',
        content: review,
        timestamp: new Date()
      });
    }
  };

  const handleDirectSubmit = async () => {
    if (review.trim()) {
      setIsDirectSubmitting(true);
      try {
        await onDirectSubmit({
          type: 'written',
          content: review,
          timestamp: new Date()
        });
      } finally {
        setIsDirectSubmitting(false);
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to options</span>
            </button>
            <div className="flex items-center space-x-2 text-blue-600">
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Written Review</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Share Your Thoughts 📝
            </h2>
            <p className="text-gray-600 text-lg">
              Take your time to express yourself. You can edit before submitting.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={maxLength}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                placeholder="Start typing your review here... Share your experience, thoughts, or feedback."
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  Express yourself freely with detailed observations
                </span>
                <span className={`text-sm font-medium ${
                  review.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {review.length}/{maxLength}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDirectSubmit}
                disabled={!review.trim() || isDirectSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDirectSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Review</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!review.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Edit className="w-4 h-4" />
                <span>Preview Review</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}