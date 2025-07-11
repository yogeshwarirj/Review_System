import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, Send, Edit } from 'lucide-react';
import { ReviewData } from '../App';
import { ReviewContext } from '../services/aiActor';

interface VoiceReviewProps {
  onComplete: (data: ReviewData) => void;
  onDirectSubmit: (data: ReviewData) => Promise<void>;
  onBack: () => void;
  aiContext: ReviewContext;
}

export default function VoiceReview({ onComplete, onDirectSubmit, onBack, aiContext }: VoiceReviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isDirectSubmitting, setIsDirectSubmitting] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const maxDuration = 120; // 2 minutes in seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      // Set up audio analysis for noise detection
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const monitorNoise = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setNoiseLevel(Math.min(average / 128, 1));
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(monitorNoise);
        }
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setDuration(0);
      monitorNoise();

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setNoiseLevel(0);
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      onComplete({
        type: 'voice',
        content: `Voice recording (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')})`,
        audioBlob: recordedBlob,
        timestamp: new Date()
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <div className="flex items-center space-x-2 text-green-600">
              <Mic className="w-5 h-5" />
              <span className="font-medium">Voice Review</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Record Your Voice 🎤
            </h2>
            <p className="text-gray-600 text-lg">
              Share your thoughts naturally in conversation style.
            </p>
          </div>

          <div className="space-y-8">
            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={recordedBlob !== null}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                      : recordedBlob 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatTime(duration)} / {formatTime(maxDuration)}
                </div>
                <div className="text-sm text-gray-500">
                  {isRecording ? 'Recording...' : recordedBlob ? 'Recording complete' : 'Click to start recording'}
                </div>
              </div>

              {/* Noise Level Indicator */}
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Background noise:</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        noiseLevel > 0.7 ? 'bg-red-500' : noiseLevel > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${noiseLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {noiseLevel > 0.7 ? 'High' : noiseLevel > 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
              )}
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Recording</h3>
                  <button
                    onClick={resetRecording}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">Record Again</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">
                      Duration: {formatTime(duration)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!recordedBlob}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Preview Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}