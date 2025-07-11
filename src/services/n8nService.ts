interface N8nWebhookPayload {
  reviewType: 'written' | 'voice' | 'video';
  content: string;
  timestamp: string;
  metadata: {
    duration?: number;
    fileSize?: number;
    userAgent: string;
    sessionId: string;
  };
  files?: {
    audio?: string; // base64 encoded
    video?: string; // base64 encoded
  };
}

class N8nService {
  private webhookUrl: string;
  private sessionId: string;

  constructor() {
    // You'll need to set your n8n webhook URL here
    this.webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async submitReview(reviewData: {
    type: 'written' | 'voice' | 'video';
    content: string;
    audioBlob?: Blob;
    videoBlob?: Blob;
    timestamp: Date;
  }): Promise<{ success: boolean; message: string; n8nResponse?: any }> {
    try {
      const payload: N8nWebhookPayload = {
        reviewType: reviewData.type,
        content: reviewData.content,
        timestamp: reviewData.timestamp.toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          sessionId: this.sessionId,
        }
      };

      // Add file data if present
      if (reviewData.audioBlob || reviewData.videoBlob) {
        payload.files = {};
        
        if (reviewData.audioBlob) {
          payload.files.audio = await this.blobToBase64(reviewData.audioBlob);
          payload.metadata.fileSize = reviewData.audioBlob.size;
          payload.metadata.duration = this.estimateAudioDuration(reviewData.audioBlob);
        }
        
        if (reviewData.videoBlob) {
          payload.files.video = await this.blobToBase64(reviewData.videoBlob);
          payload.metadata.fileSize = reviewData.videoBlob.size;
          payload.metadata.duration = this.estimateVideoDuration(reviewData.videoBlob);
        }
      }

      console.log('Sending review to n8n:', {
        type: payload.reviewType,
        contentLength: payload.content.length,
        hasFiles: !!payload.files,
        sessionId: payload.metadata.sessionId
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
      }

      const n8nResponse = await response.json();
      
      return {
        success: true,
        message: 'Review successfully submitted to n8n workflow',
        n8nResponse
      };

    } catch (error) {
      console.error('Error submitting to n8n:', error);
      
      // Fallback: Store locally if n8n fails
      this.storeReviewLocally(reviewData);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit review to n8n'
      };
    }
  }

  private estimateAudioDuration(blob: Blob): number {
    // Rough estimation: 1 minute of audio ≈ 1MB for webm
    return Math.round((blob.size / 1024 / 1024) * 60);
  }

  private estimateVideoDuration(blob: Blob): number {
    // Rough estimation: 1 minute of video ≈ 10MB for webm
    return Math.round((blob.size / 1024 / 1024) / 10 * 60);
  }

  private storeReviewLocally(reviewData: any): void {
    try {
      const localReviews = JSON.parse(localStorage.getItem('failedReviews') || '[]');
      localReviews.push({
        ...reviewData,
        failedAt: new Date().toISOString(),
        sessionId: this.sessionId
      });
      localStorage.setItem('failedReviews', JSON.stringify(localReviews));
      console.log('Review stored locally for retry');
    } catch (error) {
      console.error('Failed to store review locally:', error);
    }
  }

  async retryFailedReviews(): Promise<void> {
    try {
      const failedReviews = JSON.parse(localStorage.getItem('failedReviews') || '[]');
      
      for (const review of failedReviews) {
        const result = await this.submitReview(review);
        if (result.success) {
          // Remove from failed reviews if successful
          const updatedFailedReviews = failedReviews.filter((r: any) => r.sessionId !== review.sessionId);
          localStorage.setItem('failedReviews', JSON.stringify(updatedFailedReviews));
        }
      }
    } catch (error) {
      console.error('Error retrying failed reviews:', error);
    }
  }

  // Method to test n8n connection
  async testConnection(): Promise<boolean> {
    // If no webhook URL is configured, return false
    if (!this.webhookUrl) {
      console.warn('n8n webhook URL not configured');
      return false;
    }

    try {
      const testPayload = {
        reviewType: 'written' as const,
        content: 'Test connection from Review Assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          sessionId: 'test_connection',
          isTest: true
        }
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Connection': 'true'
        },
        body: JSON.stringify(testPayload),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      console.warn('n8n connection test failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}

export const n8nService = new N8nService();
export type { N8nWebhookPayload };