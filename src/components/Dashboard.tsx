import React from 'react';
import { TrendingUp, Calendar, Crown } from 'lucide-react';
import { MoodEntry, UserData } from '../types';
import MoodChart from './MoodChart';

interface DashboardProps {
  user: UserData;
  moodEntries: MoodEntry[];
  onQuickLog: () => void;
  onShowPremium: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, moodEntries, onQuickLog, onShowPremium }) => {
  const today = new Date();
  const greeting = getGreeting(today.getHours());
  const todaysMood = moodEntries.find(entry => entry.date === today.toISOString().split('T')[0]);
  
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const entry = moodEntries.find(e => e.date === date);
      return {
        date,
        value: entry ? getMoodValue(entry.mood) : 3,
        mood: entry?.mood || 'neutral'
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user.name}
            </h1>
            <p className="text-gray-600 mt-1">How are you feeling today?</p>
          </div>
          {!user.isPremium && (
            <button
              onClick={onShowPremium}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all"
            >
              <Crown size={16} />
              <span className="text-sm font-medium">Premium</span>
            </button>
          )}
        </div>
        
        <button
          onClick={onQuickLog}
          className="w-full bg-teal-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-600 transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Log mood
        </button>
      </div>

      {/* Today's Mood */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's mood</h2>
        
        {todaysMood ? (
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50">
              {getMoodEmoji(todaysMood.mood)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">{todaysMood.mood.replace('-', ' ')}</h3>
              <p className="text-gray-600 text-sm">{todaysMood.text}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  todaysMood.sentiment.label === 'POSITIVE' ? 'bg-green-400' :
                  todaysMood.sentiment.label === 'NEGATIVE' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <span className="text-xs text-gray-500">
                  AI Analysis: {Math.round(todaysMood.sentiment.score * 100)}% {todaysMood.sentiment.label.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500">No mood logged today</p>
            <button
              onClick={onQuickLog}
              className="mt-3 text-teal-600 hover:text-teal-700 font-medium"
            >
              Log your mood
            </button>
          </div>
        )}

        {/* Weekly Preview Chart */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">This week</h3>
          <MoodChart data={getChartData()} height={80} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-teal-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">This week</p>
              <p className="font-semibold text-gray-900">
                {Math.round(calculateWeeklyAverage(moodEntries) * 20)}% positive
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Streak</p>
              <p className="font-semibold text-gray-900">{calculateStreak(moodEntries)} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Insights</h2>
        <div className="space-y-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
            <p className="text-gray-700">
              You've been maintaining a positive outlook this week! 🌟
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
            <p className="text-gray-700">
              Consider taking short breaks when feeling overwhelmed. Your mood improves significantly after rest periods.
            </p>
          </div>
        </div>
        {!user.isPremium && (
          <button
            onClick={onShowPremium}
            className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Get personalized insights with Premium →
          </button>
        )}
      </div>
    </div>
  );
};

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMoodEmoji(mood: string): string {
  const moodEmojis = {
    'very-happy': '😄',
    'happy': '🙂',
    'neutral': '😐',
    'sad': '😞',
    'very-sad': '😢'
  };
  return moodEmojis[mood as keyof typeof moodEmojis] || '😐';
}

function getMoodValue(mood: string): number {
  const moodValues = {
    'very-happy': 5,
    'happy': 4,
    'neutral': 3,
    'sad': 2,
    'very-sad': 1
  };
  return moodValues[mood as keyof typeof moodValues] || 3;
}

function calculateWeeklyAverage(entries: MoodEntry[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekEntries = entries.filter(entry => 
    new Date(entry.timestamp) >= weekAgo
  );
  
  if (weekEntries.length === 0) return 0.5;
  
  const sum = weekEntries.reduce((acc, entry) => acc + getMoodValue(entry.mood), 0);
  return (sum / weekEntries.length) / 5;
}

function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].timestamp);
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export default Dashboard;