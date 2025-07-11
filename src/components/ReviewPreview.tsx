import React from 'react';
import { Send, Edit, Play, Video, FileText, Mic, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ReviewData } from '../App';
import { ReviewContext } from '../services/aiActor';
import { n8nService } from '../services/n8nService';

interface ReviewPreviewProps {
  reviewData: ReviewData;
  onSubmit: (success: boolean, message?: string) => void;
  onEdit: () => void;
  aiContext: ReviewContext;
}

export default function ReviewPreview({ reviewData, onSubmit, onEdit, aiContext }: ReviewPreviewProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const getTypeIcon = () => {
    switch (reviewData.type) {
      case 'written':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'voice':
        return <Mic className="w-6 h-6 text-green-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-600" />;
    }
  };

  const getTypeColor = () => {
    switch (reviewData.type) {
      case 'written':
        return 'from-blue-500 to-blue-600';
      case 'voice':
        return 'from-green-500 to-green-600';
      case 'video':
        return 'from-purple-500 to-purple-600';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: 'idle', message: '' });

    try {
      const result = await n8nService.submitReview(reviewData);
      
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Review successfully submitted to workflow!'
        });
        setTimeout(() => {
          onSubmit(true, result.message);
        }, 1500);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit review'
        });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getTypeIcon()}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Review Your Submission 👀
            </h2>
            <p className="text-gray-600 text-lg">
              Please review your {reviewData.type} review before submitting.
            </p>
          </div>

          <div className="space-y-6">
            {/* Review Content */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {reviewData.type.charAt(0).toUpperCase() + reviewData.type.slice(1)} Review
                </h3>
                <span className="text-sm text-gray-500">
                  {reviewData.timestamp.toLocaleString()}
                </span>
              </div>

              {reviewData.type === 'written' && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {reviewData.content}
                  </p>
                </div>
              )}

              {reviewData.type === 'voice' && reviewData.audioBlob && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{reviewData.content}</p>
                      <audio 
                        controls 
                        className="w-full mt-2"
                        src={URL.createObjectURL(reviewData.audioBlob)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {reviewData.type === 'video' && reviewData.videoBlob && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="space-y-4">
                    <p className="text-gray-800 font-medium">{reviewData.content}</p>
                    <video 
                      controls 
                      className="w-full rounded-lg"
                      src={URL.createObjectURL(reviewData.videoBlob)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Review Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Submission Summary:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review type: {reviewData.type.charAt(0).toUpperCase() + reviewData.type.slice(1)}</li>
                <li>• Submitted on: {reviewData.timestamp.toLocaleDateString()}</li>
                <li>• Time: {reviewData.timestamp.toLocaleTimeString()}</li>
                {reviewData.type === 'written' && (
                  <li>• Character count: {reviewData.content.length}/500</li>
                )}
              </ul>
            </div>

            {/* Submission Status */}
            {submitStatus.type !== 'idle' && (
              <div className={`rounded-lg p-4 flex items-center space-x-3 ${
                submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            )}

            {isSubmitting && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-800 font-medium">Submitting to n8n workflow...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Review</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || submitStatus.type === 'success'}
                className={`flex items-center space-x-2 px-8 py-3 bg-gradient-to-r ${getTypeColor()} text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit Review</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}