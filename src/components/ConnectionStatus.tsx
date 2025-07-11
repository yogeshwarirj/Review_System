import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { n8nService } from '../services/n8nService';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await n8nService.testConnection();
      setIsConnected(connected);
    } catch (error) {
      console.warn('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const retryFailedReviews = async () => {
    await n8nService.retryFailedReviews();
    checkConnection();
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isConnected === null 
          ? 'bg-gray-100 text-gray-600' 
          : isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isChecking ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : isConnected ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>
          {isConnected === null 
            ? 'Checking n8n...' 
            : isConnected 
            ? 'n8n Connected' 
            : 'n8n Offline'
          }
        </span>
        {!isConnected && !isChecking && (
          <button
            onClick={retryFailedReviews}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}