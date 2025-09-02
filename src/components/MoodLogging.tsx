import React, { useState } from 'react';
import { Send, Sparkles, Crown } from 'lucide-react';
import { MoodEntry, UserData } from '../types';

interface MoodLoggingProps {
  onSubmit: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  user: UserData;
  onShowPremium: () => void;
}

const MoodLogging: React.FC<MoodLoggingProps> = ({ onSubmit, user, onShowPremium }) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const moods = [
    { value: 'very-happy', emoji: '😄', label: 'Very Happy' },
    { value: 'happy', emoji: '🙂', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😞', label: 'Sad' },
    { value: 'very-sad', emoji: '😢', label: 'Very Sad' }
  ];

  const analyzeSentiment = async (text: string) => {
    // Simulate API call to Hugging Face Sentiment Analysis
    return new Promise<{ label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; score: number }>((resolve) => {
      setTimeout(() => {
        const positiveWords = ['happy', 'good', 'great', 'amazing', 'wonderful', 'love', 'excited', 'perfect'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'stressed', 'worried', 'overwhelmed'];
        
        const words = text.toLowerCase().split(' ');
        const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
        const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
        
        if (positiveCount > negativeCount) {
          resolve({ label: 'POSITIVE', score: 0.7 + Math.random() * 0.3 });
        } else if (negativeCount > positiveCount) {
          resolve({ label: 'NEGATIVE', score: 0.7 + Math.random() * 0.3 });
        } else {
          resolve({ label: 'NEUTRAL', score: 0.5 + Math.random() * 0.3 });
        }
      }, 1500);
    });
  };

  const getAIInsight = (sentiment: { label: string; score: number }, mood: string) => {
    const insights = {
      'POSITIVE': [
        "Your positive energy is shining through! Keep up the great work! ✨",
        "It's wonderful to see you feeling good. Remember to savor these moments! 🌟",
        "Your optimism is inspiring! Consider sharing this positive energy with others. 💫"
      ],
      'NEGATIVE': [
        "It's okay to have difficult days. Remember, this feeling is temporary. 🤗",
        "Take some time for self-care today. You deserve kindness, especially from yourself. 💙",
        "Consider reaching out to someone you trust or try a calming activity. You're not alone. 🌱"
      ],
      'NEUTRAL': [
        "Every day doesn't have to be extraordinary, and that's perfectly fine. 🌸",
        "Steady emotions can be a sign of balance. Take note of what's working for you. ⚖️",
        "Sometimes neutral is exactly what we need. Honor your current state. 🍃"
      ]
    };
    
    const moodInsights = insights[sentiment.label as keyof typeof insights];
    return moodInsights[Math.floor(Math.random() * moodInsights.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood || !text.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const sentiment = await analyzeSentiment(text);
      const insight = getAIInsight(sentiment, selectedMood);
      
      const entry = {
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        text: text.trim(),
        sentiment
      };

      onSubmit(entry);
      setAiInsight(insight);
      
      // Reset form after a delay to show the insight
      setTimeout(() => {
        setSelectedMood(null);
        setText('');
        setAiInsight(null);
      }, 4000);
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling today?</h1>
        <p className="text-gray-600">Take a moment to reflect on your emotions</p>
      </div>

      {/* AI Insight Display */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Insight</h3>
              <p className="text-gray-700">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Logging Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Text Input */}
        <div>
          <label htmlFor="mood-text" className="block text-sm font-medium text-gray-700 mb-3">
            Write about your day...
          </label>
          <textarea
            id="mood-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I had a nice chat with my friend over lunch..."
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            disabled={isAnalyzing}
          />
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select your mood
          </label>
          <div className="flex justify-center space-x-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value as MoodEntry['mood'])}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all transform hover:scale-110 active:scale-95 ${
                  selectedMood === mood.value
                    ? 'ring-4 ring-teal-500 ring-opacity-50 bg-teal-50 scale-110'
                    : 'hover:bg-gray-50'
                }`}
                disabled={isAnalyzing}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
          {selectedMood && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {moods.find(m => m.value === selectedMood)?.label}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMood || !text.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-6 rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit</span>
            </>
          )}
        </button>

        {/* AI Analysis Note */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Sparkles size={14} />
          <span>Entry will be analyzed using AI for sentiment insights</span>
        </div>
      </form>

      {/* Premium Features Teaser */}
      {!user.isPremium && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
          <div className="flex items-start space-x-3">
            <Crown className="text-pink-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
              <ul className="space-y-1 text-sm text-gray-600 mb-4">
                <li>• Advanced mood pattern analysis</li>
                <li>• Personalized recommendations</li>
                <li>• Export your data</li>
                <li>• Custom mood categories</li>
              </ul>
              <button
                onClick={onShowPremium}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodLogging;