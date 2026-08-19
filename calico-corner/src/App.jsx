import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Coins,
  Cat,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Send,
  X,
  LogOut,
  Eye,
  EyeOff,
  BellRing,
  RotateCw,
  CheckSquare,
  User,
  Compass,
  Camera
} from 'lucide-react';

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.2);
      });
    }
  } catch (e) {
    console.warn("Audio playback disabled without user gesture", e);
  }
};

const INITIAL_DATE_IDEAS = [
  { id: 1, category: 'outdoor', title: 'Sunset Picnic at the Park', completed: true, location: 'City Park' },
  { id: 2, category: 'outdoor', title: 'Stargazing with Hot Cocoa', completed: false, location: 'Overlook Point' },
  { id: 3, category: 'sport', title: 'Bouldering / Rock Climbing Class', completed: false, location: 'Gravity Gym' },
  { id: 4, category: 'sport', title: 'Late Night Bowling Challenge', completed: true, location: 'Retro Lanes' },
  { id: 5, category: 'art', title: 'Pottery Painting Studio Session', completed: false, location: 'Clay & Co' },
  { id: 6, category: 'art', title: 'Visit Local Contemporary Museum', completed: true, location: 'Downtown Art Hub' },
  { id: 7, category: 'indoor', title: 'Homemade Pasta Cooking Night', completed: false, location: 'At Home' },
  { id: 8, category: 'indoor', title: 'Cozy Board Game Marathon & Boba', completed: false, location: 'Living Room' },
];

const INITIAL_GALLERY = [
  {
    id: 'g1',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    caption: 'Adopted our calico friend! 🐾',
    date: '2026-02-10',
    category: 'Memory'
  },
  {
    id: 'g2',
    url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    caption: 'Sunny afternoon coffee run',
    date: '2026-02-14',
    category: 'Date Night'
  },
  {
    id: 'g3',
    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
    caption: 'Sleepy calico hours ~',
    date: '2026-02-18',
    category: 'Pets'
  }
];

const INITIAL_MESSAGES = [
  { id: 'm1', sender: 'partner', text: 'Hey cutie! Don’t forget to check our checklists for this week! 🐱✨', time: '10:14 AM' },
  { id: 'm2', sender: 'user', text: 'I saw! Added pottery painting to our list 🎨', time: '10:16 AM' },
  { id: 'm3', sender: 'partner', text: 'Awesome! Let’s toss a coin on who picks dinner later! 🪙', time: '10:18 AM' }
];

const INITIAL_AGENDA = [
  { id: 'a1', title: 'Sunset Picnic & Coffee', date: '2026-02-21', time: '05:30 PM', location: 'City Park Overlook', notes: 'Bring cozy blanket & boba tea' },
  { id: 'a2', title: 'Pottery Painting Workshop', date: '2026-02-28', time: '02:00 PM', location: 'Clay & Co Studio', notes: 'Reservation under Alex' }
];

const INITIAL_TRISHA_TODOS = [
  { id: 't1', text: 'Water bedroom plants & succulents', completed: false, category: 'Personal' },
  { id: 't2', text: 'Restock skincare favorites', completed: true, category: 'Shopping' },
  { id: 't3', text: 'Finish reading book chapter 5', completed: false, category: 'Personal' }
];

const INITIAL_IAN_TODOS = [
  { id: 'i1', text: 'Clean coffee grinder & fresh beans', completed: true, category: 'Chore' },
  { id: 'i2', text: 'Gym workout / Leg day session', completed: false, category: 'Fitness' },
  { id: 'i3', text: 'Review project code updates', completed: false, category: 'Work' }
];

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setUser] = useState(null);
  const [email, setEmail] = useState('meow@calicocorner.app');
  const [password, setPassword] = useState('calicocat123');
  const [showPassword, setShowPassword] = useState(false);
  const partnerName = 'Trisha & Ian';

  // App Navigation: Default explicitly set to 'kitten'
  const [activeTab, setActiveTab] = useState('kitten');

  // Feature: To-Do Lists for Trisha & Ian
  const [todoUserTab, setTodoUserTab] = useState('trisha'); // 'trisha' | 'ian'
  const [trishaTodos, setTrishaTodos] = useState(INITIAL_TRISHA_TODOS);
  const [ianTodos, setIanTodos] = useState(INITIAL_IAN_TODOS);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('Personal');

  // Push Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Feature: Coin Flip State
  const [coinSide, setCoinSide] = useState('heads');
  const [isFlipping, setIsFlipping] = useState(false);

  // Feature: Daily Kitten State
  const [kittenUrl, setKittenUrl] = useState('');
  const [catFact, setCatFact] = useState('');
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [savedCats, setSavedCats] = useState([]);

  // Feature: Date Ideas State
  const [dateIdeas, setDateIdeas] = useState(INITIAL_DATE_IDEAS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('outdoor');
  const [newIdeaLocation, setNewIdeaLocation] = useState('');

  // Feature: Plans / Date Agenda State
  const [agenda, setAgenda] = useState(INITIAL_AGENDA);
  const [planTitle, setPlanTitle] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [planLocation, setPlanLocation] = useState('');
  const [planNotes, setPlanNotes] = useState('');

  // Feature: Gallery State
  const [gallery, setGallery] = useState(INITIAL_GALLERY);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageCategory] = useState('Memory');
  const [previewImage, setPreviewImage] = useState(null);
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Feature: Messaging State
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    // Inject Tailwind CDN synchronously to prevent FOUC / raw unstyled HTML
    if (!document.getElementById('tailwind-cdn-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn-script';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    // Force light background on root/body to override Vite's default dark CSS template
    document.body.style.backgroundColor = '#FAF6F0';
    document.body.style.color = '#2C2421';

    // Check Notification support
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
    // Fetch initial Daily Kitten
    fetchRandomCat();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop/mobile notifications.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        playSound('success');
        sendNotification('Calico Corner Active! 🐾', 'Alerts ready for partner messages & tasks.');
      } else {
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }
  };

  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100'
        });
      } catch (e) {
        console.warn('Push fallback:', e);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ email, name: 'Calico Lover' });
    setIsAuthenticated(true);
    setActiveTab('kitten'); // Always land on Kitten tab after logging in
    playSound('success');
  };

  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    playSound('coin');

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    setTimeout(() => {
      setCoinSide(result);
      setIsFlipping(false);
      playSound('pop');

      if (notificationsEnabled) {
        sendNotification('Coin Toss Result! 🪙', `It landed on: ${result.toUpperCase()}`);
      }
    }, 1200);
  };

  const fetchRandomCat = async () => {
    setIsLoadingCat(true);
    try {
      const catRes = await fetch('https://api.thecatapi.com/v1/images/search');
      const catData = await catRes.json();
      if (catData && catData[0]?.url) {
        setKittenUrl(catData[0].url);
      } else {
        setKittenUrl('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800');
      }

      const factRes = await fetch('https://catfact.ninja/fact');
      const factData = await factRes.json();
      if (factData?.fact) {
        setCatFact(factData.fact);
      } else {
        setCatFact('Calico cats are almost always female due to genetic chromosomes! 🐈');
      }
    } catch (error) {
      setKittenUrl('https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800');
      setCatFact('Calico cats bring buena suerte (good luck) in Japanese and Irish folklore!');
    } finally {
      setIsLoadingCat(false);
    }
  };

  const handleSaveCat = () => {
    if (!kittenUrl || savedCats.includes(kittenUrl)) return;
    setSavedCats(prev => [kittenUrl, ...prev]);
    playSound('pop');
  };

  const handleToggleDate = (id) => {
    setDateIdeas(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    playSound('pop');
  };

  const handleAddDateIdea = (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;
    const newItem = {
      id: Date.now(),
      category: newIdeaCategory,
      title: newIdeaTitle,
      completed: false,
      location: newIdeaLocation || 'To be planned'
    };
    setDateIdeas([newItem, ...dateIdeas]);
    setNewIdeaTitle('');
    setNewIdeaLocation('');
    playSound('success');
  };

  const handleAddAgendaPlan = (e) => {
    e.preventDefault();
    if (!planTitle.trim() || !planDate) return;
    const newPlan = {
      id: 'a_' + Date.now(),
      title: planTitle,
      date: planDate,
      time: planTime || 'TBD',
      location: planLocation || 'TBD',
      notes: planNotes || ''
    };
    setAgenda([newPlan, ...agenda]);
    setPlanTitle('');
    setPlanDate('');
    setPlanTime('');
    setPlanLocation('');
    setPlanNotes('');
    playSound('success');
  };

  const handleRemoveAgendaPlan = (id) => {
    setAgenda(prev => prev.filter(a => a.id !== id));
    playSound('pop');
  };

  const handleAddTodoItem = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem = {
      id: 'td_' + Date.now(),
      text: newTodoText.trim(),
      completed: false,
      category: newTodoCategory
    };
    if (todoUserTab === 'trisha') {
      setTrishaTodos([newItem, ...trishaTodos]);
    } else {
      setIanTodos([newItem, ...ianTodos]);
    }
    setNewTodoText('');
    playSound('success');
  };

  const handleToggleTodo = (id, targetUser) => {
    if (targetUser === 'trisha') {
      setTrishaTodos(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    } else {
      setIanTodos(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    }
    playSound('pop');
  };

  const handleDeleteTodo = (id, targetUser) => {
    if (targetUser === 'trisha') {
      setTrishaTodos(prev => prev.filter(item => item.id !== id));
    } else {
      setIanTodos(prev => prev.filter(item => item.id !== id));
    }
    playSound('pop');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryPhoto = (e) => {
    e.preventDefault();
    const photoUrl = previewImage || 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800';
    const newPhoto = {
      id: 'g_' + Date.now(),
      url: photoUrl,
      caption: newImageCaption || 'Our special moment ✨',
      date: new Date().toISOString().split('T')[0],
      category: newImageCategory
    };
    setGallery([newPhoto, ...gallery]);
    setShowUploadModal(false);
    setPreviewImage(null);
    setNewImageCaption('');
    playSound('success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const userMsg = {
      id: 'm_' + Date.now(),
      sender: 'user',
      text: newMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessageText('');
    playSound('pop');

    setTimeout(() => {
      const partnerReplies = [
        'Aww love this! Calico high five! 🐾',
        'Can’t wait! Check our checklists page too! 📅',
        'Sounds amazing! Did you toss the coin on it? 🪙',
        'Check out today’s Daily Kitten picture too! So cute! 🐱'
      ];
      const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
      const partnerMsg = {
        id: 'm_partner_' + Date.now(),
        sender: 'partner',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, partnerMsg]);
      playSound('pop');

      if (notificationsEnabled) {
        sendNotification(`New message from ${partnerName} 💕`, randomReply);
      }
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4 text-[#2C2421] font-sans">
        {/* Instant CSS rules to guarantee zero FOUC/unstyled display before Tailwind JS initializes */}
        <style>{`
          :root, body, html, #root {
            background-color: #FAF6F0 !important;
            color: #2C2421 !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
          input, button, select {
            font-family: inherit;
          }
        `}</style>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#F5E6D3] p-8 relative overflow-hidden">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#E67E22] via-[#F39C12] to-[#2C3E50] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-3 border-2 border-white">
              <Cat className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#D35400] via-[#E67E22] to-[#2C3E50] bg-clip-text text-transparent">
              Calico Corner
            </h1>
            <p className="text-sm text-[#7F8C8D] mt-1 font-medium">
              Trisha & Ian's cozy shared space 🐾
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meow@calicocorner.app"
                className="w-full px-4 py-3 bg-[#FFFDF9] border border-[#E8D8C8] rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-[#2C2421] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#FFFDF9] border border-[#E8D8C8] rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-[#2C2421] text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#A08A7E] hover:text-[#5D4037]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C2421] font-sans flex flex-col pb-24 md:pb-6">
      <style>{`
        :root, body, #root {
          background-color: #FAF6F0 !important;
          color: #2C2421 !important;
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* Header without top tab buttons */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-[#F0E4D8] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#E67E22] via-[#F39C12] to-[#2C3E50] rounded-xl flex items-center justify-center shadow-md">
              <Cat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-[#2C2421] leading-none">Calico Corner</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-[#8C7A6B] font-medium mt-0.5">Connected with {partnerName} 💕</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                notificationsEnabled
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
              title={notificationsEnabled ? 'Notifications Active' : 'Enable Mobile Push Notifications'}
            >
              {notificationsEnabled ? <BellRing className="w-4 h-4 text-[#E67E22]" /> : <Bell className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">Alerts</span>
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2 text-[#8C7A6B] hover:text-[#D35400] hover:bg-[#F8F1E9] rounded-xl transition-all flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">

        {/* To-Do Checklist Tab */}
        {activeTab === 'todo' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Personal Checklists</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2C2421]">
                    {todoUserTab === 'trisha' ? "Trisha's Checklist 🌸" : "Ian's Checklist ⚡"}
                  </h2>
                  <p className="text-xs text-[#8C7A6B]">
                    {todoUserTab === 'trisha' 
                      ? "Trisha's workspace for personal tasks, errands, and shopping!" 
                      : "Ian's workspace for workouts, tech tasks, and personal goals!"}
                  </p>
                </div>

                {/* Sub-Tabs: Switch between Trisha and Ian */}
                <div className="flex bg-[#F8F1E9] p-1.5 rounded-2xl border border-[#E8D8C8] self-center sm:self-auto shadow-inner">
                  <button
                    onClick={() => { setTodoUserTab('trisha'); playSound('pop'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      todoUserTab === 'trisha'
                        ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white shadow-md scale-105'
                        : 'text-[#8C7A6B] hover:text-[#2C2421]'
                    }`}
                  >
                    <span>🌸 Trisha's Page</span>
                  </button>
                  <button
                    onClick={() => { setTodoUserTab('ian'); playSound('pop'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      todoUserTab === 'ian'
                        ? 'bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white shadow-md scale-105'
                        : 'text-[#8C7A6B] hover:text-[#2C2421]'
                    }`}
                  >
                    <span>⚡ Ian's Page</span>
                  </button>
                </div>
              </div>

              {/* Progress Tracker Bar */}
              {(() => {
                const currentList = todoUserTab === 'trisha' ? trishaTodos : ianTodos;
                const completedCount = currentList.filter(t => t.completed).length;
                const totalCount = currentList.length;
                const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isTrisha = todoUserTab === 'trisha';

                return (
                  <div className={`p-4 rounded-2xl border mb-6 transition-all shadow-sm ${
                    isTrisha 
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50/70 border-orange-200' 
                      : 'bg-gradient-to-r from-slate-50 to-blue-50/70 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-extrabold text-[#2C2421] flex items-center gap-1.5">
                        <User className={`w-4 h-4 ${isTrisha ? 'text-[#D35400]' : 'text-[#2C3E50]'}`} />
                        {isTrisha ? "Trisha's Progress" : "Ian's Progress"}
                      </span>
                      <span className="text-xs font-bold text-[#8C7A6B]">
                        {completedCount} / {totalCount} Done ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden border border-black/5 shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isTrisha 
                            ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400]' 
                            : 'bg-gradient-to-r from-[#2C3E50] to-[#34495E]'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}

              {/* Add New Task Form */}
              <form onSubmit={handleAddTodoItem} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3 shadow-xs">
                <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">
                  Add task to {todoUserTab === 'trisha' ? "Trisha's Checklist 🌸" : "Ian's Checklist ⚡"}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder={todoUserTab === 'trisha' ? "e.g., Water succulents, skincare restock..." : "e.g., Clean coffee grinder, leg day workout..."}
                    value={newTodoText}
                    onChange={e => setNewTodoText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] transition-colors"
                  />
                  <select
                    value={newTodoCategory}
                    onChange={e => setNewTodoCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Chore">Chore</option>
                    <option value="Work">Work/Study</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                  <button
                    type="submit"
                    className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm ${
                      todoUserTab === 'trisha'
                        ? 'bg-[#D35400] hover:bg-[#B94A00]'
                        : 'bg-[#2C3E50] hover:bg-[#1A252F]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {(() => {
                  const list = todoUserTab === 'trisha' ? trishaTodos : ianTodos;
                  if (list.length === 0) {
                    return (
                      <p className="text-xs text-center text-[#8C7A6B] py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8]">
                        No tasks yet on {todoUserTab === 'trisha' ? "Trisha's" : "Ian's"} list! Add one above ✨
                      </p>
                    );
                  }
                  return list.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                        item.completed
                          ? 'bg-emerald-50/30 border-emerald-200/60 opacity-75'
                          : 'bg-[#FFFDF9] border-[#F5E6D3] hover:border-[#E67E22]'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleTodo(item.id, todoUserTab)}
                        className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                      >
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#C8B8A8] shrink-0 hover:text-[#E67E22]" />
                        )}
                        <div>
                          <p className={`text-xs sm:text-sm font-bold ${item.completed ? 'line-through text-[#8C7A6B]' : 'text-[#2C2421]'}`}>
                            {item.text}
                          </p>
                          <span className="text-[10px] text-[#8C7A6B]">
                            Category: {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2.5 py-1 bg-white rounded-md border border-[#E8D8C8] text-[#8C7A6B] font-medium hidden sm:inline-block">
                          {item.category}
                        </span>
                        <button
                          onClick={() => handleDeleteTodo(item.id, todoUserTab)}
                          className="p-1.5 text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Daily Kitten Tab */}
        {activeTab === 'kitten' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8] text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-4">
                <Cat className="w-3.5 h-3.5" />
                <span>Daily Kitten Feed</span>
              </div>

              <h2 className="text-2xl font-black text-[#2C2421] mb-2">Random Cat of the Day 🐱</h2>
              <p className="text-xs text-[#8C7A6B] mb-6">Powered by Cat API & CATAAS - Daily cuteness boost!</p>

              <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-inner bg-[#F8F1E9] mb-4 group border border-[#F5E6D3]">
                {isLoadingCat ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8C7A6B]">
                    <Cat className="w-12 h-12 animate-bounce text-[#E67E22]" />
                    <span className="text-xs font-semibold mt-2">Summoning a kitten...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={kittenUrl}
                      alt="Daily Kitten"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={handleSaveCat}
                      className="absolute top-3 right-3 p-3 bg-white/80 backdrop-blur-md text-[#D35400] rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                      title="Save to Favorite Kittens"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] text-left mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#E67E22]" />
                  <span className="text-xs font-bold text-[#D35400] uppercase tracking-wider">Cat Trivia Fact</span>
                </div>
                <p className="text-xs text-[#2C2421] leading-relaxed italic">
                  "{catFact || 'Calico cats are standard luck charms worldwide!'}"
                </p>
              </div>

              <button
                onClick={fetchRandomCat}
                disabled={isLoadingCat}
                className="w-full py-3.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isLoadingCat ? 'animate-spin' : ''}`} />
                <span>Get Another Kitten</span>
              </button>
            </div>

            {savedCats.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
                <h3 className="font-bold text-[#2C2421] text-sm mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D35400] fill-current" />
                  Your Saved Favorite Kittens ({savedCats.length})
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {savedCats.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-[#F5E6D3]">
                      <img src={url} alt="Saved Cat" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coin Toss Tab */}
        {activeTab === 'coin' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8] text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-4">
                <Coins className="w-3.5 h-3.5" />
                <span>Decision Toss</span>
              </div>
              
              <h2 className="text-2xl font-black text-[#2C2421] mb-2">Toss the Coin 🪙</h2>
              <p className="text-xs text-[#8C7A6B] mb-6">Tap to toss and let the Calico Coin decide!</p>

              <div className="py-10 flex flex-col items-center justify-center">
                <div
                  className={`w-40 h-40 rounded-full border-4 border-[#F39C12] shadow-xl flex items-center justify-center cursor-pointer transition-transform duration-700 relative overflow-hidden ${
                    isFlipping ? 'animate-spin' : 'hover:scale-105'
                  } ${
                    coinSide === 'heads'
                      ? 'bg-gradient-to-tr from-[#E67E22] via-[#F39C12] to-[#FBEEA0]'
                      : 'bg-gradient-to-tr from-[#2C3E50] via-[#34495E] to-[#7F8C8D]'
                  }`}
                  onClick={handleFlipCoin}
                >
                  <div className="text-center text-white px-2">
                    {coinSide === 'heads' ? (
                      <div className="flex flex-col items-center">
                        <Cat className="w-14 h-14 mb-1" />
                        <span className="text-xs font-extrabold uppercase tracking-widest">Calico Paw</span>
                        <span className="text-[10px] opacity-80">(HEADS)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Sparkles className="w-14 h-14 mb-1 text-amber-300" />
                        <span className="text-xs font-extrabold uppercase tracking-widest">Calico Tail</span>
                        <span className="text-[10px] opacity-80">(TAILS)</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-6 text-xs font-semibold text-[#8C7A6B]">
                  {isFlipping ? 'Spinning through the air...' : 'Tap the coin or button to flip'}
                </p>
              </div>

              <button
                onClick={handleFlipCoin}
                disabled={isFlipping}
                className="w-full py-4 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-orange-200 transition-all active:scale-98 disabled:opacity-50"
              >
                {isFlipping ? 'Flipping...' : 'Toss the Coin!'}
              </button>
            </div>
          </div>
        )}

        {/* Date Ideas Tab */}
        {activeTab === 'dates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Bucket List</span>
                </div>
                <h2 className="text-2xl font-black text-[#2C2421]">Date Ideas Checklist 📅</h2>
                <p className="text-xs text-[#8C7A6B]">Plan, categorize, and check off activities together!</p>
              </div>

              <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#F5E6D3] mb-6">
                <div className="w-full h-3 bg-[#E8D8C8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E67E22] to-[#D35400] transition-all duration-500 rounded-full"
                    style={{
                      width: `${(dateIdeas.filter(d => d.completed).length / (dateIdeas.length || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: 'outdoor', label: 'Outdoor 🌲' },
                  { id: 'sport', label: 'Sport ⚽' },
                  { id: 'art', label: 'Art 🎨' },
                  { id: 'indoor', label: 'Indoor 🏠' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#E67E22] text-white shadow-sm'
                        : 'bg-[#F8F1E9] text-[#7F8C8D] hover:bg-[#EFE3D5] hover:text-[#2C2421]'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddDateIdea} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3">
                <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">Add New Date Idea</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Activity title (e.g., Kayaking)"
                    value={newIdeaTitle}
                    onChange={e => setNewIdeaTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  />
                  <select
                    value={newIdeaCategory}
                    onChange={e => setNewIdeaCategory(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  >
                    <option value="outdoor">Outdoor 🌲</option>
                    <option value="sport">Sport ⚽</option>
                    <option value="art">Art 🎨</option>
                    <option value="indoor">Indoor 🏠</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Location / Spot (Optional)"
                    value={newIdeaLocation}
                    onChange={e => setNewIdeaLocation(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D35400] text-white text-xs font-bold rounded-xl hover:bg-[#B94A00] transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Date</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {dateIdeas
                  .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleDate(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        item.completed
                          ? 'bg-amber-50/50 border-amber-200 opacity-75'
                          : 'bg-[#FFFDF9] border-[#F5E6D3] hover:border-[#E67E22]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-[#D35400] shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#C8B8A8] shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-bold ${item.completed ? 'line-through text-[#8C7A6B]' : 'text-[#2C2421]'}`}>
                            {item.title}
                          </p>
                          <p className="text-[10px] text-[#8C7A6B]">
                            📍 {item.location} • <span className="capitalize">{item.category}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-white rounded-lg border border-[#E8D8C8] text-[#8C7A6B] capitalize font-medium">
                        {item.category}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Date Agenda Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Scheduled Plans</span>
                </div>
                <h2 className="text-2xl font-black text-[#2C2421]">Date Agenda 🗓️</h2>
                <p className="text-xs text-[#8C7A6B]">Schedule upcoming dates, times, spots, and notes together.</p>
              </div>

              <form onSubmit={handleAddAgendaPlan} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3">
                <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">Schedule a Date Plan</p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Plan Title (e.g., Sunset Picnic & Boba)"
                    value={planTitle}
                    onChange={e => setPlanTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] uppercase font-bold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={planDate}
                      onChange={e => setPlanDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] uppercase font-bold mb-1">Time</label>
                    <input
                      type="time"
                      value={planTime}
                      onChange={e => setPlanTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Location / Spot"
                    value={planLocation}
                    onChange={e => setPlanLocation(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  />
                  <input
                    type="text"
                    placeholder="Notes (e.g., bring blankets)"
                    value={planNotes}
                    onChange={e => setPlanNotes(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white text-xs font-bold rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Agenda</span>
                </button>
              </form>

              <div className="space-y-3">
                {agenda.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#E67E22] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-[#D35400] font-bold text-[10px] rounded-md">
                          {item.date}
                        </span>
                        {item.time && (
                          <span className="text-[10px] text-[#8C7A6B] font-semibold">
                            ⏰ {item.time}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#2C2421]">{item.title}</h4>
                      {item.location && <p className="text-xs text-[#8C7A6B]">📍 {item.location}</p>}
                    </div>

                    <button
                      onClick={() => handleRemoveAgendaPlan(item.id)}
                      className="p-2 text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Memory Vault</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2C2421]">Couple Photo Gallery 🖼️</h2>
                  <p className="text-xs text-[#8C7A6B]">Store your precious memories together</p>
                </div>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActiveLightbox(photo)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-[#F8F1E9] border border-[#F5E6D3] cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <p className="font-bold text-xs">{photo.caption}</p>
                      <p className="text-[10px] text-amber-200">{photo.date} • {photo.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeLightbox && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
                  <button
                    onClick={() => setActiveLightbox(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img src={activeLightbox.url} alt={activeLightbox.caption} className="w-full max-h-[60vh] object-contain bg-black" />
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-lg text-[#2C2421]">{activeLightbox.caption}</h3>
                    <p className="text-xs text-[#8C7A6B]">Saved on {activeLightbox.date}</p>
                  </div>
                </div>
              </div>
            )}

            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#F5E6D3] pb-3">
                    <h3 className="font-bold text-base text-[#2C2421]">Upload New Moment</h3>
                    <button onClick={() => setShowUploadModal(false)}>
                      <X className="w-5 h-5 text-[#8C7A6B]" />
                    </button>
                  </div>

                  <form onSubmit={handleAddGalleryPhoto} className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="w-full text-xs text-[#8C7A6B]"
                      />
                    </div>
                    {previewImage && (
                      <div className="aspect-video rounded-xl overflow-hidden border border-[#F5E6D3]">
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Caption"
                        value={newImageCaption}
                        onChange={e => setNewImageCaption(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#E0D0C0] rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold rounded-xl text-xs shadow-md"
                    >
                      Save Memory
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl shadow-md border border-[#F0E4D8] overflow-hidden flex flex-col h-[70vh]">
              <div className="bg-[#FFFDF9] p-4 border-b border-[#F0E4D8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E67E22] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {partnerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C2421]">{partnerName} 💕</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </p>
                  </div>
                </div>

                <button
                  onClick={requestNotificationPermission}
                  className="px-2.5 py-1 bg-amber-50 text-[#D35400] rounded-lg text-[10px] font-bold border border-amber-200 flex items-center gap-1"
                >
                  <Bell className="w-3 h-3" />
                  <span>{notificationsEnabled ? 'Push Active' : 'Enable Mobile Push'}</span>
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF6F0]/50">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white rounded-tr-none'
                            : 'bg-white text-[#2C2421] border border-[#F0E4D8] rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-[#A08A7E] mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#F0E4D8] flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message to your partner..."
                  className="flex-1 px-4 py-2.5 bg-[#FFFDF9] border border-[#E8D8C8] rounded-xl text-xs focus:ring-2 focus:ring-[#E67E22] outline-none"
                />
                <button
                  type="submit"
                  className="p-3 bg-[#D35400] text-white rounded-xl hover:bg-[#B94A00] transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#F0E4D8] z-40 py-2 px-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { id: 'todo', label: 'To-Do', icon: CheckSquare },
            { id: 'kitten', label: 'Kitten', icon: Cat },
            { id: 'coin', label: 'Toss Coin', icon: Coins },
            { id: 'dates', label: 'Ideas', icon: Calendar },
            { id: 'plans', label: 'Agenda', icon: Compass },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  playSound('pop');
                }}
                className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#D35400] font-bold scale-105'
                    : 'text-[#8C7A6B] hover:text-[#2C2421]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}