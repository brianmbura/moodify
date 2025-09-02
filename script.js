// Application State
let currentUser = null;
let currentTab = 'dashboard';
let moodEntries = [
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
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeApp();
    setupEventListeners();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('moodify_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
        loadSavedData();
        updateDashboard();
    }
});

// Authentication Functions
function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    showSignup.addEventListener('click', () => toggleAuthForm('signup'));
    showLogin.addEventListener('click', () => toggleAuthForm('login'));
}

function toggleAuthForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (type === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate authentication
    if (email && password) {
        currentUser = {
            name: 'Katie Johnson',
            email: email,
            isPremium: false,
            avatar: '👩‍💻'
        };
        
        localStorage.setItem('moodify_user', JSON.stringify(currentUser));
        showApp();
        loadSavedData();
        updateDashboard();
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Simulate registration
    if (name && email && password) {
        currentUser = {
            name: name,
            email: email,
            isPremium: false,
            avatar: '👩‍💻'
        };
        
        localStorage.setItem('moodify_user', JSON.stringify(currentUser));
        showApp();
        updateDashboard();
    }
}

function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateUserInfo();
}

function logout() {
    localStorage.removeItem('moodify_user');
    localStorage.removeItem('moodify_entries');
    currentUser = null;
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
}

// App Initialization
function initializeApp() {
    setupTabNavigation();
    setupMoodForm();
    drawCharts();
}

function setupEventListeners() {
    // Premium button
    const premiumBtn = document.getElementById('premium-btn');
    if (premiumBtn) {
        premiumBtn.addEventListener('click', showPremiumModal);
    }
    
    // Profile settings toggles
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', savePreferences);
    });
}

// Tab Navigation
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(btn => {
        btn.classList.add('active');
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    currentTab = tabName;
    
    // Update FAB visibility
    const fab = document.getElementById('fab');
    if (tabName === 'journal') {
        fab.style.display = 'none';
    } else {
        fab.style.display = 'flex';
    }
    
    // Load tab-specific content
    if (tabName === 'analytics') {
        setTimeout(drawCharts, 100);
    }
}

// Mood Form Setup
function setupMoodForm() {
    const moodForm = document.getElementById('moodForm');
    const moodEmojis = document.querySelectorAll('.mood-emoji');
    const moodText = document.getElementById('mood-text');
    const submitBtn = document.getElementById('submit-mood');
    const moodLabel = document.getElementById('mood-label');
    
    let selectedMood = null;
    
    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            // Remove previous selection
            moodEmojis.forEach(e => e.classList.remove('selected'));
            
            // Add selection to current emoji
            emoji.classList.add('selected');
            selectedMood = emoji.getAttribute('data-mood');
            
            // Update label
            moodLabel.textContent = emoji.getAttribute('data-label');
            
            // Update submit button state
            updateSubmitButton();
        });
    });
    
    moodText.addEventListener('input', updateSubmitButton);
    
    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedMood || !moodText.value.trim()) return;
        
        // Show loading
        showLoading();
        
        try {
            // Simulate AI sentiment analysis
            const sentiment = await analyzeSentiment(moodText.value);
            
            // Create mood entry
            const entry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                mood: selectedMood,
                text: moodText.value.trim(),
                sentiment: sentiment,
                timestamp: new Date()
            };
            
            // Add to entries
            moodEntries.unshift(entry);
            saveMoodEntries();
            
            // Show AI insight
            const insight = generateAIInsight(sentiment, selectedMood);
            showAIInsight(insight);
            
            // Reset form
            setTimeout(() => {
                resetMoodForm();
                updateDashboard();
                hideAIInsight();
            }, 4000);
            
        } catch (error) {
            console.error('Error analyzing mood:', error);
        } finally {
            hideLoading();
        }
    });
    
    function updateSubmitButton() {
        const isValid = selectedMood && moodText.value.trim();
        submitBtn.disabled = !isValid;
    }
    
    function resetMoodForm() {
        moodEmojis.forEach(e => e.classList.remove('selected'));
        moodText.value = '';
        moodLabel.textContent = '';
        selectedMood = null;
        updateSubmitButton();
    }
}

// AI Functions
async function analyzeSentiment(text) {
    // Simulate API call to Hugging Face Sentiment Analysis
    return new Promise((resolve) => {
        setTimeout(() => {
            const positiveWords = ['happy', 'good', 'great', 'amazing', 'wonderful', 'love', 'excited', 'perfect', 'awesome', 'fantastic'];
            const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'stressed', 'worried', 'overwhelmed', 'depressed', 'angry'];
            
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
}

function generateAIInsight(sentiment, mood) {
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
    
    const moodInsights = insights[sentiment.label];
    return moodInsights[Math.floor(Math.random() * moodInsights.length)];
}

function showAIInsight(insight) {
    const aiInsightEl = document.getElementById('ai-insight');
    const insightText = document.getElementById('insight-text');
    
    insightText.textContent = insight;
    aiInsightEl.classList.remove('hidden');
    aiInsightEl.classList.add('animate-fade-in');
}

function hideAIInsight() {
    const aiInsightEl = document.getElementById('ai-insight');
    aiInsightEl.classList.add('hidden');
    aiInsightEl.classList.remove('animate-fade-in');
}

// Dashboard Functions
function updateDashboard() {
    updateTodaysMood();
    updateWeeklyStats();
    drawMiniChart();
}

function updateTodaysMood() {
    const today = new Date().toISOString().split('T')[0];
    const todaysMood = moodEntries.find(entry => entry.date === today);
    const container = document.getElementById('todays-mood-content');
    
    if (todaysMood) {
        container.innerHTML = `
            <div class="todays-mood">
                <div class="mood-emoji-large">${getMoodEmoji(todaysMood.mood)}</div>
                <div class="mood-info">
                    <h3>${todaysMood.mood.replace('-', ' ')}</h3>
                    <p>${todaysMood.text}</p>
                    <div class="sentiment-indicator">
                        <div class="sentiment-dot ${todaysMood.sentiment.label.toLowerCase()}"></div>
                        <span class="sentiment-text">
                            AI Analysis: ${Math.round(todaysMood.sentiment.score * 100)}% ${todaysMood.sentiment.label.toLowerCase()}
                        </span>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="no-mood">
                <div class="no-mood-icon">📅</div>
                <p>No mood logged today</p>
                <button class="btn-link" onclick="switchTab('journal')">Log your mood</button>
            </div>
        `;
    }
}

function updateWeeklyStats() {
    const weeklyAverage = calculateWeeklyAverage();
    const streak = calculateStreak();
    
    document.getElementById('weekly-positive').textContent = `${Math.round(weeklyAverage * 20)}% positive`;
    document.getElementById('streak-days').textContent = `${streak} days`;
}

function updateUserInfo() {
    if (currentUser) {
        // Update greeting
        const hour = new Date().getHours();
        const greeting = getGreeting(hour);
        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `${greeting}, ${currentUser.name}`;
        }
        
        // Update profile
        const profileInfo = document.querySelector('.profile-info h1');
        const profileEmail = document.querySelector('.profile-info p');
        if (profileInfo) profileInfo.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        
        // Show/hide premium features
        updatePremiumUI();
    }
}

function updatePremiumUI() {
    const premiumBtn = document.getElementById('premium-btn');
    const premiumBadge = document.getElementById('premium-badge');
    
    if (currentUser && currentUser.isPremium) {
        if (premiumBtn) premiumBtn.style.display = 'none';
        if (premiumBadge) premiumBadge.classList.remove('hidden');
    } else {
        if (premiumBtn) premiumBtn.style.display = 'flex';
        if (premiumBadge) premiumBadge.classList.add('hidden');
    }
}

// Premium Modal Functions
function showPremiumModal() {
    document.getElementById('premium-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hidePremiumModal() {
    document.getElementById('premium-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function upgradeToPremium() {
    if (currentUser) {
        currentUser.isPremium = true;
        localStorage.setItem('moodify_user', JSON.stringify(currentUser));
        updatePremiumUI();
        hidePremiumModal();
        
        // Show success message
        showNotification('🎉 Welcome to Premium! Enjoy your enhanced features.');
    }
}

// Utility Functions
function getGreeting(hour) {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function getMoodEmoji(mood) {
    const moodEmojis = {
        'very-happy': '😄',
        'happy': '🙂',
        'neutral': '😐',
        'sad': '😞',
        'very-sad': '😢'
    };
    return moodEmojis[mood] || '😐';
}

function getMoodValue(mood) {
    const moodValues = {
        'very-happy': 5,
        'happy': 4,
        'neutral': 3,
        'sad': 2,
        'very-sad': 1
    };
    return moodValues[mood] || 3;
}

function calculateWeeklyAverage() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekEntries = moodEntries.filter(entry => 
        new Date(entry.timestamp) >= weekAgo
    );
    
    if (weekEntries.length === 0) return 0.5;
    
    const sum = weekEntries.reduce((acc, entry) => acc + getMoodValue(entry.mood), 0);
    return (sum / weekEntries.length) / 5;
}

function calculateStreak() {
    if (moodEntries.length === 0) return 0;
    
    const sortedEntries = [...moodEntries].sort((a, b) => 
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

// Chart Functions
function drawCharts() {
    drawMiniChart();
    drawMoodChart();
    drawDistributionChart();
}

function drawMiniChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });
    
    const data = last7Days.map(date => {
        const entry = moodEntries.find(e => e.date === date);
        return entry ? getMoodValue(entry.mood) : 3;
    });
    
    // Draw line chart
    ctx.strokeStyle = '#2EC4B6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((value - 1) / 4) * (height - 40);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#2EC4B6';
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((value - 1) / 4) * (height - 40);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get last 30 days data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
    });
    
    const data = last30Days.map(date => {
        const entry = moodEntries.find(e => e.date === date);
        return entry ? getMoodValue(entry.mood) : null;
    });
    
    // Draw grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        const y = (i / 5) * (height - 40) + 20;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
    }
    
    // Draw mood line
    ctx.strokeStyle = '#2EC4B6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    let started = false;
    data.forEach((value, index) => {
        if (value !== null) {
            const x = (index / (data.length - 1)) * (width - 40) + 20;
            const y = height - 20 - ((value - 1) / 4) * (height - 40);
            
            if (!started) {
                ctx.moveTo(x, y);
                started = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#2EC4B6';
    data.forEach((value, index) => {
        if (value !== null) {
            const x = (index / (data.length - 1)) * (width - 40) + 20;
            const y = height - 20 - ((value - 1) / 4) * (height - 40);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawDistributionChart() {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate mood distribution
    const moodCounts = {
        'very-happy': 0,
        'happy': 0,
        'neutral': 0,
        'sad': 0,
        'very-sad': 0
    };
    
    moodEntries.forEach(entry => {
        moodCounts[entry.mood]++;
    });
    
    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return;
    
    const distribution = [
        { name: 'Happy', value: moodCounts['very-happy'] + moodCounts['happy'], color: '#2EC4B6' },
        { name: 'Sad', value: moodCounts['sad'] + moodCounts['very-sad'], color: '#FF6B81' },
        { name: 'Neutral', value: moodCounts['neutral'], color: '#FFD23F' }
    ].filter(item => item.value > 0);
    
    // Draw pie chart
    let currentAngle = 0;
    distribution.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
    
    // Draw center circle for donut effect
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();
}

// Data Persistence
function saveMoodEntries() {
    localStorage.setItem('moodify_entries', JSON.stringify(moodEntries));
}

function loadSavedData() {
    const savedEntries = localStorage.getItem('moodify_entries');
    if (savedEntries) {
        moodEntries = JSON.parse(savedEntries).map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
        }));
    }
}

function savePreferences() {
    const preferences = {
        dailyReminders: document.getElementById('daily-reminders').checked,
        weeklyReports: document.getElementById('weekly-reports').checked,
        shareData: document.getElementById('share-data').checked,
        aiAnalysis: document.getElementById('ai-analysis').checked
    };
    
    localStorage.setItem('moodify_preferences', JSON.stringify(preferences));
    showNotification('Preferences saved successfully! ✅');
}

// UI Functions
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        color: var(--gray-900);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--gray-200);
        z-index: 1001;
        max-width: 300px;
        animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Demo Functions for Development
function addSampleData() {
    const sampleEntries = [
        {
            id: '3',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            mood: 'neutral',
            text: 'Just another day at work.',
            sentiment: { label: 'NEUTRAL', score: 0.6 },
            timestamp: new Date(Date.now() - 172800000)
        },
        {
            id: '4',
            date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
            mood: 'very-happy',
            text: 'Got promoted today! So excited!',
            sentiment: { label: 'POSITIVE', score: 0.95 },
            timestamp: new Date(Date.now() - 259200000)
        }
    ];
    
    moodEntries.push(...sampleEntries);
    saveMoodEntries();
    updateDashboard();
    drawCharts();
}

// Export for global access
window.switchTab = switchTab;
window.showPremiumModal = showPremiumModal;
window.hidePremiumModal = hidePremiumModal;
window.upgradeToPremium = upgradeToPremium;
window.logout = logout;
window.addSampleData = addSampleData;