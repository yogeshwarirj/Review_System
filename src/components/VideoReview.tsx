import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, VideoOff, Play, Pause, RotateCcw, Camera, Send, Edit } from 'lucide-react';
import { ReviewData } from '../App';
import { ReviewContext } from '../services/aiActor';

interface VideoReviewProps {
  onComplete: (data: ReviewData) => void;
  onBack: () => void;
  aiContext: ReviewContext;
}

export default function VideoReview({ onComplete, onBack, aiContext }: VideoReviewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lightingQuality, setLightingQuality] = useState<'good' | 'fair' | 'poor'>('good');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxDuration = 180; // 3 minutes in seconds

  useEffect(() => {
    startCamera();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Monitor lighting quality
      const checkLighting = () => {
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const brightness = calculateBrightness(imageData.data);
            
            if (brightness > 120) {
              setLightingQuality('good');
            } else if (brightness > 80) {
              setLightingQuality('fair');
            } else {
              setLightingQuality('poor');
            }
          }
        }
      };

      const lightingInterval = setInterval(checkLighting, 1000);
      return () => clearInterval(lightingInterval);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check your permissions.');
    }
  };

  const calculateBrightness = (data: Uint8ClampedArray) => {
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return total / (data.length / 4);
  };

  const startRecording = () => {
    if (stream) {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setDuration(0);

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
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setDuration(0);
    setIsPlaying(false);
    startCamera();
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      onComplete({
        type: 'video',
        content: `Video recording (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')})`,
        videoBlob: recordedBlob,
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
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to options</span>
            </button>
            <div className="flex items-center space-x-2 text-purple-600">
              <Video className="w-5 h-5" />
              <span className="font-medium">Video Review</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Record Your Video 🎥
            </h2>
            <p className="text-gray-600 text-lg">
              Share your thoughts face-to-face with visual feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera Preview */}
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {!recordedBlob ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={previewRef}
                    src={videoUrl || undefined}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                )}
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC</span>
                  </div>
                )}
                
                {/* Timer */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  <span className="text-sm font-mono">
                    {formatTime(duration)} / {formatTime(maxDuration)}
                  </span>
                </div>
              </div>

              {/* Lighting Quality Indicator */}
              {!recordedBlob && (
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Lighting:</span>
                  <span className={`text-sm font-medium ${
                    lightingQuality === 'good' ? 'text-green-600' :
                    lightingQuality === 'fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {lightingQuality.charAt(0).toUpperCase() + lightingQuality.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={recordedBlob !== null}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                        : recordedBlob 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-200'
                    }`}
                  >
                    {isRecording ? (
                      <VideoOff className="w-8 h-8 text-white" />
                    ) : (
                      <Video className="w-8 h-8 text-white" />
                    )}
                  </button>
                  
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                  )}
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    {isRecording ? 'Recording...' : recordedBlob ? 'Recording complete' : 'Click to start recording'}
                  </div>
                </div>
              </div>

              {/* Video Player Controls */}
              {recordedBlob && (
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
                      onClick={() => {
                        if (previewRef.current) {
                          if (isPlaying) {
                            previewRef.current.pause();
                          } else {
                            previewRef.current.play();
                          }
                          setIsPlaying(!isPlaying);
                        }
                      }}
                      className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
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
                        <div className="bg-purple-500 h-2 rounded-full w-0 transition-all duration-100" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guidance */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Keep your camera steady</li>
                  <li>• Speak clearly and naturally</li>
                  <li>• You have up to 3 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!recordedBlob}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Preview Review
            </button>
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}