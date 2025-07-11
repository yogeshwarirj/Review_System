interface AIResponse {
  message: string;
  suggestions?: string[];
  emotion: 'friendly' | 'encouraging' | 'helpful' | 'excited' | 'thoughtful';
}

interface ReviewContext {
  type: 'written' | 'voice' | 'video';
  stage: 'welcome' | 'recording' | 'preview' | 'complete';
  content?: string;
  duration?: number;
  userPreferences?: {
    tone: 'casual' | 'formal';
    helpLevel: 'minimal' | 'guided' | 'detailed';
  };
}

class AIActor {
  private personality = {
    name: 'Alex',
    traits: ['friendly', 'encouraging', 'patient', 'helpful'],
    style: 'conversational and warm'
  };

  async generateResponse(context: ReviewContext, userInput?: string): Promise<AIResponse> {
    // Simulate AI processing with contextual responses
    await new Promise(resolve => setTimeout(resolve, 800));

    return this.getContextualResponse(context, userInput);
  }

  private getContextualResponse(context: ReviewContext, userInput?: string): AIResponse {
    const responses = this.getResponseTemplates();
    
    const key = `${context.stage}_${context.type}` as keyof typeof responses;
    const template = responses[key] || responses.default;
    
    return {
      message: this.personalizeMessage(template.message, context, userInput),
      suggestions: template.suggestions,
      emotion: template.emotion
    };
  }

  private getResponseTemplates() {
    return {
      welcome_written: {
        message: "Perfect choice! I love written reviews - they let you really think through your thoughts. Take your time, and remember, you can always edit before submitting. What's on your mind?",
        suggestions: [
          "Start with what stood out most to you",
          "Describe your overall experience first",
          "Think about specific moments or details"
        ],
        emotion: 'encouraging' as const
      },
      welcome_voice: {
        message: "Great pick! Voice reviews feel so natural and personal. I'll help you get the best audio quality. Just speak naturally like we're having a conversation. Ready when you are!",
        suggestions: [
          "Find a quiet space for better audio",
          "Speak at your normal pace",
          "Don't worry about perfect delivery"
        ],
        emotion: 'friendly' as const
      },
      welcome_video: {
        message: "Awesome! Video reviews are so engaging - I get to see your expressions too! I'll help you with lighting and framing. Let's make sure you look great on camera!",
        suggestions: [
          "Position yourself at eye level with the camera",
          "Make sure you have good lighting on your face",
          "Speak directly to the camera like you're talking to a friend"
        ],
        emotion: 'excited' as const
      },
      recording_written: {
        message: "You're doing great! I can see you're really thinking this through. Remember, there's no rush - take all the time you need to express yourself fully.",
        suggestions: [
          "Add specific examples if you can",
          "Don't worry about perfect grammar",
          "Your authentic voice matters most"
        ],
        emotion: 'encouraging' as const
      },
      recording_voice: {
        message: "Your audio sounds clear! I'm monitoring the background noise for you. Just keep speaking naturally - you're doing wonderfully!",
        suggestions: [
          "Take a breath if you need to pause",
          "Speak from the heart",
          "I'll let you know if there are any audio issues"
        ],
        emotion: 'helpful' as const
      },
      recording_video: {
        message: "You look great on camera! The lighting is good and you're perfectly framed. Just be yourself - your natural personality shines through!",
        suggestions: [
          "Make eye contact with the camera",
          "Use gestures naturally",
          "Don't worry about being perfect"
        ],
        emotion: 'encouraging' as const
      },
      preview_written: {
        message: "What a thoughtful review! I can tell you put real care into your words. This will be so helpful. Want to make any final tweaks before we submit?",
        suggestions: [
          "Read through once more",
          "Check if anything important is missing",
          "Trust your instincts - it's probably great as is"
        ],
        emotion: 'thoughtful' as const
      },
      preview_voice: {
        message: "Your voice recording came out beautifully! I love how natural and conversational it sounds. This personal touch will really resonate with others.",
        suggestions: [
          "Listen to the playback once more",
          "The natural pauses and tone are perfect",
          "Your authentic delivery is exactly what we need"
        ],
        emotion: 'friendly' as const
      },
      preview_video: {
        message: "Fantastic video! Your energy and expressions really bring your feedback to life. This kind of personal connection makes such a difference.",
        suggestions: [
          "Watch it back to see how great you did",
          "Your body language and tone are spot-on",
          "This will help others understand your perspective perfectly"
        ],
        emotion: 'excited' as const
      },
      complete_written: {
        message: "Thank you so much for taking the time to write such a detailed review! Your words will genuinely help improve things for everyone. I'm grateful for your thoughtfulness!",
        suggestions: [],
        emotion: 'thoughtful' as const
      },
      complete_voice: {
        message: "Your voice review was absolutely perfect! There's something so personal and genuine about hearing someone's actual voice. Thank you for sharing in such a natural way!",
        suggestions: [],
        emotion: 'friendly' as const
      },
      complete_video: {
        message: "Wow, what an amazing video review! Seeing your expressions and hearing your voice together creates such a powerful, authentic message. Thank you for being so open and genuine!",
        suggestions: [],
        emotion: 'excited' as const
      },
      default: {
        message: "I'm here to help make this as easy and comfortable as possible for you. What would you like to know?",
        suggestions: [
          "Ask me anything about the process",
          "I can provide tips for your chosen format",
          "Let me know if you need any guidance"
        ],
        emotion: 'helpful' as const
      }
    };
  }

  private personalizeMessage(template: string, context: ReviewContext, userInput?: string): string {
    let message = template;
    
    // Add contextual personalization
    if (context.duration && context.duration > 60) {
      message += " I can tell you're really taking your time to be thorough - that's wonderful!";
    }
    
    if (userInput && userInput.length > 200) {
      message += " I love how detailed you're being!";
    }
    
    return message;
  }

  getEmoji(emotion: AIResponse['emotion']): string {
    const emojiMap = {
      friendly: '😊',
      encouraging: '💪',
      helpful: '🤝',
      excited: '🎉',
      thoughtful: '💭'
    };
    return emojiMap[emotion];
  }

  async provideLiveGuidance(context: ReviewContext): Promise<string[]> {
    const guidance = [];
    
    if (context.type === 'voice' && context.stage === 'recording') {
      guidance.push("Your voice sounds clear and natural!");
      guidance.push("Take your time - no need to rush");
    }
    
    if (context.type === 'video' && context.stage === 'recording') {
      guidance.push("Great eye contact with the camera!");
      guidance.push("Your lighting looks perfect");
      guidance.push("Natural gestures are working well");
    }
    
    if (context.type === 'written' && context.stage === 'recording') {
      guidance.push("You're expressing yourself beautifully");
      guidance.push("Take all the time you need");
    }
    
    return guidance;
  }
}

export const aiActor = new AIActor();
export type { AIResponse, ReviewContext };