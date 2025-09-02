import React, { useState, useEffect } from 'react';
import { Home, PenTool, BarChart3, User, Plus, Crown } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MoodLogging from './components/MoodLogging';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import PremiumModal from './components/PremiumModal';
import { MoodEntry, UserData } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [user, setUser] = useState<UserData>({
    name: 'Katie',
    email: 'katie@example.com',
    isPremium: false,
    avatar: '👩‍💻'
  });
  
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      mood: 'sad',
      text: 'Feeling a bit overwhelmed with work today.',
      sentiment: { label: 'NEGATIVE', score: 0.7 },
      timestamp: new Date()
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      mood: 'happy',
      text: 'Had a great day with friends!',
      sentiment: { label: 'POSITIVE', score: 0.9 },
      timestamp: new Date(Date.now() - 86400000)
    }
  ]);

  const addMoodEntry = (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMoodEntries(prev => [newEntry, ...prev]);
  };

  const handlePremiumUpgrade = () => {
    setUser(prev => ({ ...prev, isPremium: true }));
    setShowPremiumModal(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'journal', label: 'Log', icon: PenTool },
    { id: 'analytics', label: 'Trends', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            moodEntries={moodEntries} 
            onQuickLog={() => setActiveTab('journal')}
            onShowPremium={() => setShowPremiumModal(true)}
          />
        );
      case 'journal':
        return (
          <MoodLogging 
            onSubmit={addMoodEntry} 
            user={user}
            onShowPremium={() => setShowPremiumModal(true)}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            moodEntries={moodEntries} 
            user={user}
            onShowPremium={() => setShowPremiumModal(true)}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user} 
            setUser={setUser}
            onShowPremium={() => setShowPremiumModal(true)}
          />
        );
      default:
        return <Dashboard user={user} moodEntries={moodEntries} onQuickLog={() => setActiveTab('journal')} onShowPremium={() => setShowPremiumModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Moodify</h1>
        </div>
        
        <nav className="flex space-x-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          {!user.isPremium && (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Crown size={16} />
              <span className="font-medium">Upgrade</span>
            </button>
          )}
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.avatar}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-6">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'text-teal-600' 
                  : 'text-gray-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button - Mobile Only */}
      {activeTab !== 'journal' && (
        <button
          onClick={() => setActiveTab('journal')}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-600 transition-all transform hover:scale-110 active:scale-95"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handlePremiumUpgrade}
        />
      )}
    </div>
  );
}

export default App;