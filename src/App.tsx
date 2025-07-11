import React, { useState } from 'react';
import ConnectionStatus from './components/ConnectionStatus';
import AIAssistant from './components/AIAssistant';
import WelcomeScreen from './components/WelcomeScreen';
import WrittenReview from './components/WrittenReview';
import VoiceReview from './components/VoiceReview';
import VideoReview from './components/VideoReview';
import ReviewPreview from './components/ReviewPreview';
import ThankYou from './components/ThankYou';
import { ReviewContext } from './services/aiActor';
import { n8nService } from './services/n8nService';

export type ReviewMode = 'welcome' | 'written' | 'voice' | 'video' | 'preview' | 'thanks';

export interface ReviewData {
  type: 'written' | 'voice' | 'video';
  content: string;
  audioBlob?: Blob;
  videoBlob?: Blob;
  timestamp: Date;
}

function App() {
  const [currentMode, setCurrentMode] = useState<ReviewMode>('welcome');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [aiContext, setAiContext] = useState<ReviewContext>({
    type: 'written',
    stage: 'welcome'
  });

  const handleModeChange = (mode: ReviewMode) => {
    setAiContext({
      type: mode === 'welcome' ? 'written' : mode as 'written' | 'voice' | 'video',
      stage: mode === 'welcome' ? 'welcome' : 'recording'
    });
    setCurrentMode(mode);
  };

  const handleReviewData = (data: ReviewData) => {
    setReviewData(data);
    setAiContext({
      type: data.type,
      stage: 'preview',
      content: data.content,
      duration: data.audioBlob || data.videoBlob ? 120 : undefined
    });
    setCurrentMode('preview');
  };

  const handleDirectSubmit = async (data: ReviewData) => {
    try {
      const result = await n8nService.submitReview(data);
      console.log('Direct submission result:', { success: result.success, message: result.message, reviewData: data });
      
      // Navigate to thank you page regardless of success/failure
      setAiContext({
        type: data.type,
        stage: 'complete'
      });
      setCurrentMode('thanks');
    } catch (error) {
      console.error('Direct submission error:', error);
      // Still navigate to thank you page even if there's an error
      setAiContext({
        type: data.type,
        stage: 'complete'
      });
      setCurrentMode('thanks');
    }
  };
  const handleSubmit = () => {
    setAiContext({
      type: reviewData?.type || 'written',
      stage: 'complete'
    });
    setCurrentMode('thanks');
  };

  const handleSubmitWithStatus = (success: boolean, message?: string) => {
    console.log('Review submission result:', { success, message, reviewData });
    setAiContext({
      type: reviewData?.type || 'written',
      stage: 'complete'
    });
    setCurrentMode('thanks');
  };

  const handleStartOver = () => {
    setReviewData(null);
    setAiContext({
      type: 'written',
      stage: 'welcome'
    });
    setCurrentMode('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ConnectionStatus />
      {currentMode === 'welcome' && (
        <WelcomeScreen onModeSelect={handleModeChange} aiContext={aiContext} />
      )}
      {currentMode === 'written' && (
        <WrittenReview 
          onComplete={handleReviewData} 
          onDirectSubmit={handleDirectSubmit}
          onBack={() => setCurrentMode('welcome')}
          aiContext={aiContext}
        />
      )}
      {currentMode === 'voice' && (
        <VoiceReview 
          onComplete={handleReviewData} 
          onDirectSubmit={handleDirectSubmit}
          onBack={() => setCurrentMode('welcome')}
          aiContext={aiContext}
        />
      )}
      {currentMode === 'video' && (
        <VideoReview 
          onComplete={handleReviewData} 
          onDirectSubmit={handleDirectSubmit}
          onBack={() => setCurrentMode('welcome')}
          aiContext={aiContext}
        />
      )}
      {currentMode === 'preview' && reviewData && (
        <ReviewPreview
          reviewData={reviewData}
          onSubmit={handleSubmitWithStatus}
          onEdit={() => setCurrentMode(reviewData.type)}
          aiContext={aiContext}
        />
      )}
      {currentMode === 'thanks' && (
        <ThankYou onStartOver={handleStartOver} aiContext={aiContext} />
      )}
      
      <AIAssistant context={aiContext} />
    </div>
  );
}

export default App;