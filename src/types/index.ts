export interface MoodEntry {
  id: string;
  date: string;
  mood: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
  text: string;
  sentiment: {
    label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
  };
  timestamp: Date;
}

export interface UserData {
  name: string;
  email: string;
  isPremium: boolean;
  avatar: string;
}

export interface ChartData {
  date: string;
  value: number;
  mood: string;
}