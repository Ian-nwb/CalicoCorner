import React, { useState, useEffect, useRef } from 'react';
import {
  Cat, Sparkles, Eye, EyeOff, BellRing, Bell, LogOut, CheckSquare,
  User, Plus, CheckCircle, Circle, Trash2, Heart, RotateCw, Coins,
  Calendar, Compass, Image as ImageIcon, Camera, X, Wallet, Settings,
  TrendingUp, RefreshCw, ExternalLink, ChevronLeft, ChevronRight,
  Shuffle, Menu, Download, Repeat, Upload
} from 'lucide-react';
import { supabase } from './utils/supabase';
import "./index.css"

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

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const partnerName = 'Tori & Motmot';

  // Role detection: 'tori' vs 'motmot'
  const userRole = user?.email?.toLowerCase().includes('tori')
    ? 'tori'
    : user?.email?.toLowerCase().includes('motmot') || user?.email?.toLowerCase().includes('ian')
    ? 'motmot'
    : 'tori';

  // Feature: Settings Modal & Display Preferences
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem('calico_display_mode') || 'light'; // 'light' | 'dark' | 'high-contrast'
  });
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('calico_text_size') || 'standard'; // 'standard' | 'large' | 'xlarge'
  });

  useEffect(() => {
    localStorage.setItem('calico_display_mode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('calico_text_size', textSize);
  }, [textSize]);

  // Tailwind CSS loaded listener state to prevent unstyled flash
  const [, setTailwindReady] = useState(typeof window !== 'undefined' && !!window.tailwind);

  // App Navigation & Speed Dial state
  const [activeTab, setActiveTab] = useState('kitten');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Feature: To-Do Lists for Tori & Motmot
  const [todoUserTab, setTodoUserTab] = useState('tori'); // 'tori' | 'motmot'
  const [toriTodos, setToriTodos] = useState([]);
  const [motmotTodos, setMotmotTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('Personal');
  const [isDailyTask, setIsDailyTask] = useState(false);

  // Push Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('calico_notifications_enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('calico_notifications_enabled', notificationsEnabled);
  }, [notificationsEnabled]);

  // Feature: Coin Flip State
  const [coinSide, setCoinSide] = useState('heads');
  const [isFlipping, setIsFlipping] = useState(false);

  // Feature: Daily Kitten State
  const [kittenUrl, setKittenUrl] = useState('');
  const [catFact, setCatFact] = useState('');
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [viewKittenModal, setViewKittenModal] = useState(false);
  const [isDownloadingCat, setIsDownloadingCat] = useState(false);

  // Feature: Date Ideas State
  const [dateIdeas, setDateIdeas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('outdoor');
  const [newIdeaLocation, setNewIdeaLocation] = useState('');
  const [deletingDateIds, setDeletingDateIds] = useState([]);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickedIdea, setPickedIdea] = useState(null);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [showScheduleInModal, setShowScheduleInModal] = useState(false);
  const [modalPlanDate, setModalPlanDate] = useState('');
  const [modalPlanTime, setModalPlanTime] = useState('');
  const [modalPlanNotes, setModalPlanNotes] = useState('');

  // Feature: Plans / Date Agenda State
  const [agenda, setAgenda] = useState([]);
  const [planTitle, setPlanTitle] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [planLocation, setPlanLocation] = useState('');
  const [planNotes, setPlanNotes] = useState('');

  // Feature: Gallery State
  const [gallery, setGallery] = useState([]);
  const [galleryPage, setGalleryPage] = useState(1);
  const [photosPerPage, setPhotosPerPage] = useState(6);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newImageCaption, setNewImageCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Feature: Gala Funds (Google Sheets API Connection)
  const [sheetId, setSheetId] = useState('');
  const [cellRange, setCellRange] = useState('A1');
  const [apiKey, setApiKey] = useState('');
  const [galaFundAmount, setGalaFundAmount] = useState(0);
  const [galaGoal, setGalaGoal] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [showSheetSettings, setShowSheetSettings] = useState(false);

  // Feature: Realtime Hug / Nudge & 24-Hour Partner Status State
  const [toriStatus, setToriStatus] = useState(null);
  const [motmotStatus, setMotmotStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [customStatusText, setCustomStatusText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💻');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [receivedHug, setReceivedHug] = useState(null);
  const [hugButtonSent, setHugButtonSent] = useState(false);
  const realtimeChannelRef = useRef(null);

  // Helper: 24-Hour Status Expiry Verification
  const isStatusExpired = (status) => {
    if (!status || !status.updated_at || !status.status_text) return true;
    const ageMs = Date.now() - new Date(status.updated_at).getTime();
    return ageMs > 24 * 60 * 60 * 1000;
  };

  // Helper: Relative time formatting
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Expired';
  };

  // Send native desktop/mobile push notification
  const sendNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=128&auto=format&fit=crop&q=80',
          badge: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=128&auto=format&fit=crop&q=80'
        });
      } catch (e) {
        console.warn('Notification error or permission issue:', e);
      }
    }
  };

  // Initial page setup + Supabase session check
  useEffect(() => {
    document.body.style.backgroundColor = '#FAF6F0';
    document.body.style.color = '#2C2421';

    if (typeof window !== 'undefined') {
      if (window.tailwind) {
        setTailwindReady(true);
      } else {
        const script = document.getElementById('tailwind-cdn-script');
        if (script) {
          const handleLoad = () => setTailwindReady(true);
          script.addEventListener('load', handleLoad);
        }
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    fetchRandomCat();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Helper to persist daily task flags without Supabase schema mismatch
  const getDailyTodosMap = () => {
    try {
      return JSON.parse(localStorage.getItem('calico_daily_todos') || '{}');
    } catch (e) {
      return {};
    }
  };

  const setDailyTodosMap = (map) => {
    try {
      localStorage.setItem('calico_daily_todos', JSON.stringify(map));
    } catch (e) {
      console.warn('Could not save daily todos to localStorage', e);
    }
  };

  // Load Supabase data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const dailyMap = getDailyTodosMap();

    supabase.from('todos').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const resetIds = [];
          const processed = data.map(t => {
            const isDaily = !!dailyMap[t.id]?.is_daily;
            const lastDate = dailyMap[t.id]?.last_completed_date;
            let isDone = !!t.completed;

            if (isDaily && isDone && lastDate && lastDate !== todayStr) {
              isDone = false;
              resetIds.push(t.id);
              if (dailyMap[t.id]) {
                dailyMap[t.id].last_completed_date = null;
              }
            }

            return {
              ...t,
              completed: isDone,
              is_daily: isDaily
            };
          });

          if (resetIds.length > 0) {
            setDailyTodosMap(dailyMap);
            supabase.from('todos').update({ completed: false }).in('id', resetIds);
          }

          setToriTodos(processed.filter(t => t.owner === 'tori'));
          setMotmotTodos(processed.filter(t => t.owner === 'motmot'));
        }
      });

    supabase.from('date_ideas').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDateIdeas(data);
      });

    supabase.from('agenda').select('*').order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setAgenda(data);
      });

    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setGallery(data);
      });

    // Load initial 24-hour partner statuses
    supabase.from('user_statuses').select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const tori = data.find(s => s.owner === 'tori');
          const motmot = data.find(s => s.owner === 'motmot');
          if (tori) setToriStatus(tori);
          if (motmot) setMotmotStatus(motmot);
        } else {
          try {
            const localStatuses = JSON.parse(localStorage.getItem('calico_user_statuses') || '{}');
            if (localStatuses.tori) setToriStatus(localStatuses.tori);
            if (localStatuses.motmot) setMotmotStatus(localStatuses.motmot);
          } catch (e) {}
        }
      })
      .catch(() => {
        try {
          const localStatuses = JSON.parse(localStorage.getItem('calico_user_statuses') || '{}');
          if (localStatuses.tori) setToriStatus(localStatuses.tori);
          if (localStatuses.motmot) setMotmotStatus(localStatuses.motmot);
        } catch (e) {}
      });
  }, [isAuthenticated]);

  // Realtime Supabase Sync for Agenda, Todos, Hugs & Live Statuses
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('calico-realtime-sync', {
        config: {
          broadcast: { self: false }
        }
      })
      .on('broadcast', { event: 'hug' }, (payload) => {
        const data = payload.payload;
        if (data && data.senderRole !== userRole) {
          setReceivedHug(data);
          playSound('success');
          if (notificationsEnabled) {
            sendNotification('You received a hug! 🐾💕', data.message);
          }
          setTimeout(() => {
            setReceivedHug(prev => (prev?.timestamp === data.timestamp ? null : prev));
          }, 5000);
        }
      })
      .on('broadcast', { event: 'status_update' }, (payload) => {
        const status = payload.payload;
        if (status) {
          if (status.owner === 'tori') setToriStatus(status);
          else if (status.owner === 'motmot') setMotmotStatus(status);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_statuses' }, (payload) => {
        const item = payload.new;
        if (item) {
          if (item.owner === 'tori') setToriStatus(item);
          else if (item.owner === 'motmot') setMotmotStatus(item);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agenda' }, (payload) => {
        setAgenda(prev => {
          if (prev.some(a => a.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
        if (notificationsEnabled) {
          sendNotification('New Agenda Plan! 🗓️', `"${payload.new.title}" scheduled for ${payload.new.date}`);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'agenda' }, (payload) => {
        setAgenda(prev => prev.filter(a => a.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, (payload) => {
        const item = payload.new;
        if (item.owner === 'tori') {
          setToriTodos(prev => prev.some(t => t.id === item.id) ? prev : [item, ...prev]);
        } else {
          setMotmotTodos(prev => prev.some(t => t.id === item.id) ? prev : [item, ...prev]);
        }
        if (notificationsEnabled && item.owner !== userRole) {
          sendNotification('New Partner Task Added! 🐾', `${item.owner === 'tori' ? 'Tori' : 'Motmot'} added: "${item.text}"`);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'todos' }, (payload) => {
        const item = payload.new;
        const updater = prev => prev.map(t => t.id === item.id ? item : t);
        if (item.owner === 'tori') setToriTodos(updater);
        else setMotmotTodos(updater);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'todos' }, (payload) => {
        setToriTodos(prev => prev.filter(t => t.id !== payload.old.id));
        setMotmotTodos(prev => prev.filter(t => t.id !== payload.old.id));
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [isAuthenticated, notificationsEnabled, userRole]);

  // Periodic Scheduler for Due Agenda & Daily Task Web Push Notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkDueReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const currentTimeStr = now.toTimeString().slice(0, 5);

      let notifiedKeys = [];
      try {
        notifiedKeys = JSON.parse(localStorage.getItem('calico_notified_events') || '[]');
      } catch (e) {
        notifiedKeys = [];
      }
      const notifiedSet = new Set(notifiedKeys);

      // Check Agenda items
      agenda.forEach(item => {
        if (!item.date) return;
        const eventKey = `agenda-${item.id}-${item.date}`;
        if (item.date === todayStr && !notifiedSet.has(eventKey)) {
          if (!item.time || item.time <= currentTimeStr) {
            sendNotification('Agenda Reminder! 🗓️', `Scheduled for today: "${item.title}" ${item.time ? 'at ' + item.time : ''} ${item.location ? '📍 ' + item.location : ''}`);
            notifiedSet.add(eventKey);
          }
        }
      });

      // Check daily tasks for current user
      const userList = userRole === 'tori' ? toriTodos : motmotTodos;
      userList.forEach(task => {
        if (task.is_daily && !task.completed) {
          const taskKey = `daily-task-${task.id}-${todayStr}`;
          if (!notifiedSet.has(taskKey) && now.getHours() >= 9) {
            sendNotification('Daily Task Reminder ☀️', `Pending daily task: "${task.text}"`);
            notifiedSet.add(taskKey);
          }
        }
      });

      localStorage.setItem('calico_notified_events', JSON.stringify(Array.from(notifiedSet)));
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 30000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, agenda, toriTodos, motmotTodos, userRole]);

  const fetchGalaFunds = async () => {
    if (!sheetId.trim()) {
      setSheetError('Please enter a Google Sheet ID or URL.');
      return;
    }

    setIsSyncingSheet(true);
    setSheetError('');

    try {
      let extractedId = sheetId.trim();
      const match = extractedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }

      let fetchedValue = null;

      if (apiKey.trim()) {
        const targetRange = cellRange.trim() || 'A1';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${extractedId}/values/${encodeURIComponent(targetRange)}?key=${apiKey.trim()}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch from Google Sheets API. Check your Sheet ID, Range, and API Key.');
        }
        const data = await response.json();
        if (data.values && data.values[0] && data.values[0][0] !== undefined) {
          fetchedValue = data.values[0][0];
        }
      } else {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${extractedId}/gviz/tq?tqx=out:json`;
        const response = await fetch(gvizUrl);
        if (!response.ok) {
          throw new Error('Could not access Google Sheet. Make sure your sheet is set to "Anyone with link can view".');
        }
        const text = await response.text();

        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          const rows = parsed?.table?.rows;
          if (rows && rows.length > 0 && rows[0].c && rows[0].c[0]) {
            fetchedValue = rows[0].c[0].v !== null ? rows[0].c[0].v : rows[0].c[0].f;
          }
        }
      }

      if (fetchedValue !== null) {
        const numVal = parseFloat(String(fetchedValue).replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numVal)) {
          setGalaFundAmount(numVal);
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          playSound('success');
        } else {
          setSheetError(`Cell value "${fetchedValue}" is not a valid number.`);
        }
      } else {
        setSheetError('No data found in the specified cell.');
      }
    } catch (err) {
      console.error('Google Sheets fetch error:', err);
      setSheetError(err.message || 'Error connecting to Google Sheets. Check Sheet permissions.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleAddToHomeScreen = async () => {
    playSound('pop');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("To add Calico Corner to your Home Screen:\n\n1. Tap your browser menu (⋮ or Share button).\n2. Tap 'Add to Home screen' or 'Install App'. 📱");
    }
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            playSound('success');
            sendNotification('Calico Corner Notifications Active! 🐾', 'Alerts ready for partner tasks & coin flips.');
          } else {
            setNotificationsEnabled(false);
            alert('Notification permission was not granted by browser settings.');
          }
        } catch (err) {
          console.error('Notification error:', err);
        }
      } else {
        alert('This browser does not support desktop/mobile notifications.');
      }
    } else {
      setNotificationsEnabled(false);
      playSound('pop');
    }
  };

  // Feature: Send Realtime Broadcast Hug
  const handleSendHug = () => {
    if (hugButtonSent) return;
    setHugButtonSent(true);
    playSound('success');

    const senderName = userRole === 'tori' ? 'Tori' : 'Motmot';

    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'hug',
        payload: {
          sender: senderName,
          senderRole: userRole,
          message: `${senderName} sent you a warm hug! 🐾💕`,
          timestamp: Date.now()
        }
      });
    }

    setTimeout(() => {
      setHugButtonSent(false);
    }, 2500);
  };

  // Feature: Update 24-Hour Live Status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!customStatusText.trim()) return;

    setIsSubmittingStatus(true);
    const nowStr = new Date().toISOString();
    const statusObj = {
      owner: userRole,
      status_text: customStatusText.trim(),
      emoji: selectedEmoji || '✨',
      updated_at: nowStr,
      ...(user?.id ? { user_id: user.id } : {})
    };

    if (userRole === 'tori') setToriStatus(statusObj);
    else setMotmotStatus(statusObj);

    // Persist in localStorage
    try {
      const localStatuses = JSON.parse(localStorage.getItem('calico_user_statuses') || '{}');
      localStatuses[userRole] = statusObj;
      localStorage.setItem('calico_user_statuses', JSON.stringify(localStatuses));
    } catch (err) {}

    // Broadcast live over WebSocket
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'status_update',
        payload: statusObj
      });
    }

    // Upsert into Supabase user_statuses table
    try {
      await supabase.from('user_statuses').upsert(statusObj, { onConflict: 'owner' });
    } catch (err) {
      console.warn('user_statuses Supabase upsert fallback:', err);
    }

    setIsSubmittingStatus(false);
    setShowStatusModal(false);
    setCustomStatusText('');
    playSound('success');
  };

  const handleClearStatus = async () => {
    setIsSubmittingStatus(true);
    const nowStr = new Date(0).toISOString();
    const statusObj = {
      owner: userRole,
      status_text: '',
      emoji: '',
      updated_at: nowStr,
      ...(user?.id ? { user_id: user.id } : {})
    };

    if (userRole === 'tori') setToriStatus(statusObj);
    else setMotmotStatus(statusObj);

    try {
      const localStatuses = JSON.parse(localStorage.getItem('calico_user_statuses') || '{}');
      delete localStatuses[userRole];
      localStorage.setItem('calico_user_statuses', JSON.stringify(localStatuses));
    } catch (err) {}

    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'status_update',
        payload: statusObj
      });
    }

    try {
      await supabase.from('user_statuses').delete().eq('owner', userRole);
    } catch (err) {}

    setIsSubmittingStatus(false);
    setShowStatusModal(false);
    setCustomStatusText('');
    playSound('pop');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      return;
    }
    setUser(data.user);
    setIsAuthenticated(true);
    setActiveTab('kitten');
    playSound('success');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
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
        setKittenUrl('');
      }

      const factRes = await fetch('https://catfact.ninja/fact');
      const factData = await factRes.json();
      if (factData?.fact) {
        setCatFact(factData.fact);
      } else {
        setCatFact('');
      }
    } catch (error) {
      setKittenUrl('');
      setCatFact('');
    } finally {
      setIsLoadingCat(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'personal':
        return 'badge-personal bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'chore':
      case 'games':
        return 'badge-games bg-purple-100 text-purple-800 border-purple-300';
      case 'work':
        return 'badge-work bg-amber-100 text-amber-900 border-amber-300';
      case 'daily stuff':
        return 'badge-daily bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'badge-other bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const handleDownloadCat = async () => {
    if (!kittenUrl) return;
    setIsDownloadingCat(true);
    try {
      const response = await fetch(kittenUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `calico-kitten-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      playSound('success');
    } catch (err) {
      console.warn('Direct blob download fallback:', err);
      window.open(kittenUrl, '_blank');
    } finally {
      setIsDownloadingCat(false);
    }
  };

  const handleToggleDate = async (id) => {
    const item = dateIdeas.find(d => d.id === id);
    if (!item) return;
    const { data, error } = await supabase
      .from('date_ideas')
      .update({ completed: !item.completed })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setDateIdeas(prev => prev.map(d => (d.id === id ? data : d)));
      playSound('pop');
    }
  };

  const handleDeleteDateIdea = async (id) => {
    setDeletingDateIds(prev => [...prev, id]);
    playSound('pop');

    setTimeout(async () => {
      const { error } = await supabase.from('date_ideas').delete().eq('id', id);
      if (!error) {
        setDateIdeas(prev => prev.filter(d => d.id !== id));
      }
      setDeletingDateIds(prev => prev.filter(i => i !== id));
    }, 300);
  };

  const handlePickRandomIdea = () => {
    const uncompleted = dateIdeas.filter(d => !d.completed);
    setShowScheduleInModal(false);
    setModalPlanDate(new Date().toISOString().slice(0, 10));
    setModalPlanTime('');
    setModalPlanNotes('');

    if (uncompleted.length === 0) {
      setPickedIdea(null);
      setShowPickerModal(true);
      playSound('pop');
      return;
    }

    setIsPickingRandom(true);
    setShowPickerModal(true);
    playSound('coin');

    let count = 0;
    const interval = setInterval(() => {
      const randomTemp = uncompleted[Math.floor(Math.random() * uncompleted.length)];
      setPickedIdea(randomTemp);
      count++;
      if (count > 6) {
        clearInterval(interval);
        const finalPick = uncompleted[Math.floor(Math.random() * uncompleted.length)];
        setPickedIdea(finalPick);
        setIsPickingRandom(false);
        playSound('success');
      }
    }, 90);
  };

  const handleCommitPickedIdeaToAgenda = async (e) => {
    e?.preventDefault();
    if (!pickedIdea || !modalPlanDate) return;

    const { data, error } = await supabase
      .from('agenda')
      .insert({
        title: pickedIdea.title,
        date: modalPlanDate,
        time: modalPlanTime || null,
        location: pickedIdea.location && pickedIdea.location !== 'To be planned' ? pickedIdea.location : null,
        notes: modalPlanNotes || null
      })
      .select()
      .single();

    if (!error && data) {
      setAgenda(prev => [data, ...prev]);
      playSound('success');
    }

    if (!pickedIdea.completed) {
      await handleToggleDate(pickedIdea.id);
    }

    setShowPickerModal(false);
    setShowScheduleInModal(false);
    setModalPlanDate('');
    setModalPlanTime('');
    setModalPlanNotes('');
  };

  const handleAddDateIdea = async (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;
    const { data, error } = await supabase
      .from('date_ideas')
      .insert({
        title: newIdeaTitle,
        category: newIdeaCategory,
        location: newIdeaLocation || 'To be planned'
      })
      .select()
      .single();
    if (!error && data) {
      setDateIdeas([data, ...dateIdeas]);
      playSound('success');
    }
    setNewIdeaTitle('');
    setNewIdeaLocation('');
  };

  const handleAddAgendaPlan = async (e) => {
    e.preventDefault();
    if (!planTitle.trim() || !planDate) return;
    const { data, error } = await supabase
      .from('agenda')
      .insert({
        title: planTitle,
        date: planDate,
        time: planTime || null,
        location: planLocation || null,
        notes: planNotes || null
      })
      .select()
      .single();
    if (!error && data) {
      setAgenda([data, ...agenda]);
      playSound('success');
    }
    setPlanTitle('');
    setPlanDate('');
    setPlanTime('');
    setPlanLocation('');
    setPlanNotes('');
  };

  const handleRemoveAgendaPlan = async (id) => {
    const { error } = await supabase.from('agenda').delete().eq('id', id);
    if (!error) {
      setAgenda(prev => prev.filter(a => a.id !== id));
      playSound('pop');
    }
  };

  const handleAddTodoItem = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    if (userRole !== todoUserTab) {
      alert(`Read-only mode: You can only add items to your own (${userRole.toUpperCase()}) checklist.`);
      return;
    }

    const payload = {
      owner: todoUserTab,
      text: newTodoText.trim(),
      category: newTodoCategory,
      completed: false
    };

    if (user?.id) {
      payload.user_id = user.id;
    }

    let insertRes = await supabase
      .from('todos')
      .insert(payload)
      .select()
      .single();

    // If failed due to user_id column absence, retry with pure base schema
    if (insertRes.error && payload.user_id) {
      const fallbackPayload = {
        owner: todoUserTab,
        text: newTodoText.trim(),
        category: newTodoCategory,
        completed: false
      };
      insertRes = await supabase
        .from('todos')
        .insert(fallbackPayload)
        .select()
        .single();
    }

    if (!insertRes.error && insertRes.data) {
      const data = insertRes.data;
      if (isDailyTask) {
        const dailyMap = getDailyTodosMap();
        dailyMap[data.id] = { is_daily: true, last_completed_date: null };
        setDailyTodosMap(dailyMap);
      }
      const itemWithDaily = { ...data, is_daily: isDailyTask };
      if (todoUserTab === 'tori') {
        setToriTodos([itemWithDaily, ...toriTodos]);
      } else {
        setMotmotTodos([itemWithDaily, ...motmotTodos]);
      }
      playSound('success');
    } else if (insertRes.error) {
      console.error('Failed to insert todo item:', insertRes.error);
    }
    setNewTodoText('');
    setIsDailyTask(false);
  };

  const handleToggleTodo = async (id, targetUser) => {
    if (userRole !== targetUser) return;

    const list = targetUser === 'tori' ? toriTodos : motmotTodos;
    const item = list.find(t => t.id === id);
    if (!item) return;

    const nextCompleted = !item.completed;
    const todayStr = new Date().toISOString().slice(0, 10);

    const dailyMap = getDailyTodosMap();
    if (item.is_daily || dailyMap[id]) {
      dailyMap[id] = {
        is_daily: true,
        last_completed_date: nextCompleted ? todayStr : null
      };
      setDailyTodosMap(dailyMap);
    }

    const { data, error } = await supabase
      .from('todos')
      .update({ completed: nextCompleted })
      .eq('id', id)
      .select()
      .single();

    const updatedItem = (!error && data)
      ? { ...data, is_daily: item.is_daily }
      : { ...item, completed: nextCompleted };

    if (targetUser === 'tori') {
      setToriTodos(prev => prev.map(t => (t.id === id ? updatedItem : t)));
    } else {
      setMotmotTodos(prev => prev.map(t => (t.id === id ? updatedItem : t)));
    }
    playSound('pop');
  };

  const handleResetDailyTasks = async () => {
    const list = todoUserTab === 'tori' ? toriTodos : motmotTodos;
    const dailyTasks = list.filter(t => t.is_daily && t.completed);
    if (dailyTasks.length === 0) return;

    const ids = dailyTasks.map(t => t.id);
    const dailyMap = getDailyTodosMap();
    ids.forEach(id => {
      if (dailyMap[id]) dailyMap[id].last_completed_date = null;
    });
    setDailyTodosMap(dailyMap);

    await supabase.from('todos').update({ completed: false }).in('id', ids);

    const updater = prev => prev.map(t => t.is_daily ? { ...t, completed: false } : t);
    if (todoUserTab === 'tori') setToriTodos(updater);
    else setMotmotTodos(updater);
    playSound('pop');
  };

  const handleDeleteTodo = async (id, targetUser) => {
    if (userRole !== targetUser) return;

    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      if (targetUser === 'tori') {
        setToriTodos(prev => prev.filter(t => t.id !== id));
      } else {
        setMotmotTodos(prev => prev.filter(t => t.id !== id));
      }
      playSound('pop');
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const filePath = `${Date.now()}.${selectedFile.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, selectedFile);
    if (uploadError) {
      console.error('Gallery upload error:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('gallery')
      .insert({
        caption: newImageCaption || 'Our special moment ✨',
        image_url: publicUrl
      })
      .select()
      .single();

    if (!error && data) {
      setGallery([data, ...gallery]);
      setGalleryPage(1);
      playSound('success');
    }

    setShowUploadModal(false);
    setPreviewImage(null);
    setSelectedFile(null);
    setNewImageCaption('');
  };

  const handleDeleteGalleryPhoto = async () => {
    if (!photoToDelete) return;
    setIsDeletingPhoto(true);
    try {
      const urlParts = photoToDelete.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabase.storage.from('gallery').remove([fileName]);
      }
      const { error } = await supabase.from('gallery').delete().eq('id', photoToDelete.id);
      if (!error) {
        setGallery(prev => prev.filter(p => p.id !== photoToDelete.id));
        if (activeLightbox?.id === photoToDelete.id) {
          setActiveLightbox(null);
        }
        playSound('pop');
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    } finally {
      setIsDeletingPhoto(false);
      setPhotoToDelete(null);
    }
  };

  const activeDisplayClass = displayMode === 'dark' ? 'dark-mode' : displayMode === 'high-contrast' ? 'high-contrast' : '';
  const activeScaleClass = textSize === 'large' ? 'text-scale-large' : textSize === 'xlarge' ? 'text-scale-xlarge' : '';
  const settingsClasses = [activeDisplayClass, activeScaleClass].filter(Boolean).join(' ');

  if (!authChecked) {
    return (
      <div className={`min-h-screen bg-[#FAF6F0] flex items-center justify-center ${settingsClasses}`}>
        <Cat className="w-12 h-12 animate-bounce text-[#E67E22]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4 text-[#2C2421] font-sans ${settingsClasses}`}>
        <style>{`
          :root, body, html, #root {
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
              Tori and Motmot's corner of the Internet🐾
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {loginError}
            </div>
          )}

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
                placeholder="Enter your email address (e.g. tori@calico.app)..."
                className="w-full px-4 py-3 bg-[#FFFDF9] border border-[#E8D8C8] rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-[#2C2421] text-sm placeholder:text-[#8C7A6B]/70"
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
                  placeholder="Enter your account password..."
                  className="w-full px-4 py-3 bg-[#FFFDF9] border border-[#E8D8C8] rounded-xl focus:ring-2 focus:ring-[#E67E22] focus:outline-none text-[#2C2421] text-sm pr-10 placeholder:text-[#8C7A6B]/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2421]"
                  title={showPassword ? "Hide password" : "Show password"}
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

  const isTodoOwner = userRole === todoUserTab;

  return (
    <div className={`min-h-screen bg-[#FAF6F0] text-[#2C2421] font-sans flex flex-col pb-20 ${settingsClasses}`}>
      <style>{`
        :root, body, #root {
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* Header Bar */}
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
              <p className="text-xs text-[#8C7A6B] font-medium mt-0.5">
                Logged in as <strong className="capitalize text-[#E67E22]">{userRole}</strong> 💚🩵💚🩵
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowSettingsModal(true);
                playSound('pop');
              }}
              className="p-2 text-[#8C7A6B] hover:text-[#E67E22] hover:bg-[#F8F1E9] rounded-xl transition-all flex items-center gap-1.5 border border-[#E8D8C8] bg-white shadow-xs"
              title="Application Settings & Display Preferences"
            >
              <Settings className="w-5 h-5 text-[#E67E22]" />
              <span className="hidden sm:inline text-xs font-bold text-[#2C2421]">Settings</span>
            </button>

            <button
              onClick={() => {
                setShowLogoutConfirmModal(true);
                playSound('pop');
              }}
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

        {/* Realtime Received Hug Floating Toast Overlay */}
        {receivedHug && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white p-4 rounded-3xl shadow-2xl border-2 border-white/30 animate-hug-toast flex items-center gap-3 backdrop-blur-md pointer-events-auto">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner animate-bounce">
                🐾
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Realtime Hug Alert 💕
                  </span>
                </div>
                <h4 className="font-black text-sm text-white mt-0.5 truncate">
                  {receivedHug.sender} sent you a warm hug!
                </h4>
                <p className="text-xs text-rose-100 font-medium">
                  Sending love across your screen ✨
                </p>
              </div>
              <button
                onClick={() => setReceivedHug(null)}
                className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* "What's My Partner Doing?" Discord-Style 24-Hour Live Status Widget */}
        {(() => {
          const partnerStatus = userRole === 'tori' ? motmotStatus : toriStatus;
          const myStatus = userRole === 'tori' ? toriStatus : motmotStatus;
          const partnerExpired = isStatusExpired(partnerStatus);
          const myExpired = isStatusExpired(myStatus);

          return (
            <div className="card-surface-container bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-[#F0E4D8] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-white/50 ${
                    userRole === 'tori'
                      ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 text-white'
                      : 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 text-white'
                  }`}>
                    {userRole === 'tori' ? '🩵' : '💚'}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    !partnerExpired ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      !partnerExpired ? 'bg-white animate-ping' : 'bg-white'
                    }`}></span>
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D35400] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      What {userRole === 'tori' ? 'Motmot' : 'Tori'} is doing
                    </span>
                    {!partnerExpired && partnerStatus?.updated_at && (
                      <span className="text-[10px] text-[#8C7A6B] font-semibold">
                        • {formatRelativeTime(partnerStatus.updated_at)}
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    {!partnerExpired && partnerStatus?.status_text ? (
                      <p className="font-extrabold text-sm sm:text-base text-[#2C2421] flex items-center gap-1.5 truncate">
                        <span className="text-lg">{partnerStatus.emoji || '✨'}</span>
                        <span className="truncate">{partnerStatus.status_text}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-[#8C7A6B] italic flex items-center gap-1.5">
                        <span>💤 Taking a break • No active status</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!myExpired && myStatus?.status_text && (
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6F0] rounded-xl border border-[#E8D8C8] text-xs font-bold text-[#2C2421]">
                    <span className="text-[10px] text-[#8C7A6B] uppercase">You:</span>
                    <span>{myStatus.emoji} {myStatus.status_text}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedEmoji(myStatus?.emoji || '💻');
                    setCustomStatusText(myStatus?.status_text || '');
                    setShowStatusModal(true);
                    playSound('pop');
                  }}
                  className="px-3.5 py-2 bg-[#FAF6F0] hover:bg-[#F0E4D8] text-[#2C2421] border border-[#E8D8C8] rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs hover:scale-105"
                >
                  <span>✏️ Set Status</span>
                </button>
              </div>
            </div>
          );
        })()}

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
                    {todoUserTab === 'tori' ? "Tori's Checklist 💚" : "Motmot's Checklist 🩵"}
                  </h2>
                  <p className="text-xs text-[#8C7A6B]">
                    {todoUserTab === 'tori'
                      ? "Tori's workspace for personal tasks, games, and daily activities!"
                      : "Motmot's workspace for personal tasks, games, and daily activities!"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 self-center sm:self-auto">
                  <div className="flex bg-[#F8F1E9] p-1.5 rounded-2xl border border-[#E8D8C8] shadow-inner">
                    <button
                      onClick={() => { setTodoUserTab('tori'); playSound('pop'); }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        todoUserTab === 'tori'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105'
                          : 'text-[#8C7A6B] hover:text-[#2C2421]'
                      }`}
                    >
                      <span>💚 Tori's Page</span>
                    </button>
                    <button
                      onClick={() => { setTodoUserTab('motmot'); playSound('pop'); }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        todoUserTab === 'motmot'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md scale-105'
                          : 'text-[#8C7A6B] hover:text-[#2C2421]'
                      }`}
                    >
                      <span>🩵 Motmot's Page</span>
                    </button>
                  </div>

                  {isTodoOwner && (
                    <button
                      type="button"
                      onClick={handleResetDailyTasks}
                      className="px-3 py-2 bg-[#FAF6F0] hover:bg-[#F0E4D8] text-[#5D4037] border border-[#E8D8C8] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                      title="Reset completed daily tasks for today"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Reset Daily Tasks</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Read-Only Access Banner for Non-Owners */}
              {!isTodoOwner && (
                <div className="mb-6 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-semibold shadow-xs">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>🔒 Read-Only Mode</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-amber-200/70 text-amber-900 rounded-full font-extrabold uppercase shrink-0">
                    View Only
                  </span>
                </div>
              )}

              {/* Progress Tracker Bar */}
              {(() => {
                const currentList = todoUserTab === 'tori' ? toriTodos : motmotTodos;
                const completedCount = currentList.filter(t => t.completed).length;
                const totalCount = currentList.length;
                const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isTori = todoUserTab === 'tori';

                return (
                  <div className={`progress-bar-card p-4 rounded-2xl border mb-6 transition-all shadow-sm ${
                    isTori
                      ? 'border-emerald-200'
                      : 'border-sky-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="progress-label text-xs font-extrabold flex items-center gap-1.5">
                        <User className={`w-4 h-4 ${isTori ? 'text-emerald-500' : 'text-sky-500'}`} />
                        {isTori ? "Tori's Progress" : "Motmot's Progress"}
                      </span>
                      <span className="progress-counter text-xs font-bold">
                        {completedCount} / {totalCount} Done ({percent}%)
                      </span>
                    </div>
                    <div className="progress-track w-full h-3 rounded-full overflow-hidden border border-black/5 shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isTori
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}

              {/* Add New Task Form (Owner Only) */}
              {isTodoOwner ? (
                <form onSubmit={handleAddTodoItem} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3 shadow-xs">
                  <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">
                    Add task to {todoUserTab === 'tori' ? "Tori's Checklist 💚" : "Motmot's Checklist 🩵"}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                        Task Description
                      </label>
                      <input
                        type="text"
                        required
                        value={newTodoText}
                        onChange={e => setNewTodoText(e.target.value)}
                        placeholder={todoUserTab === 'tori' ? "Add task for Tori (e.g. Genshin, Study)..." : "Add task for Motmot (e.g. Genshin, Coding)..."}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] transition-colors placeholder:text-[#8C7A6B]/70 text-[#2C2421]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                        Category
                      </label>
                      <select
                        value={newTodoCategory}
                        onChange={e => setNewTodoCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Chore">Games</option>
                        <option value="Work/School">Work/School</option>
                        <option value="Daily Stuff">Daily Stuff</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#2C2421] cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-[#E0D0C0] hover:border-[#E67E22] transition-colors">
                      <input
                        type="checkbox"
                        checked={isDailyTask}
                        onChange={e => setIsDailyTask(e.target.checked)}
                        className="w-4 h-4 text-[#E67E22] rounded accent-[#E67E22] cursor-pointer"
                      />
                      <Repeat className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Daily Task (repeats daily)</span>
                    </label>

                    <button
                      type="submit"
                      className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm ${
                        todoUserTab === 'tori'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-sky-600 hover:bg-sky-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8] mb-6 text-center text-xs text-[#8C7A6B]">
                  <span>🔒 Only {todoUserTab === 'tori' ? "Tori" : "Motmot"} can add tasks to this checklist. Switch to your checklist tab to add tasks!</span>
                </div>
              )}

              {/* Tasks List */}
              <div className="space-y-2.5">
                {(() => {
                  const list = todoUserTab === 'tori' ? toriTodos : motmotTodos;
                  if (list.length === 0) {
                    return (
                      <p className="text-xs text-center text-[#8C7A6B] py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8]">
                        No tasks yet on {todoUserTab === 'tori' ? "Tori's" : "Motmot's"} list! ✨
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
                        onClick={() => {
                          if (!isTodoOwner) return;
                          handleToggleTodo(item.id, todoUserTab);
                        }}
                        className={`flex items-center gap-3 flex-1 mr-2 ${isTodoOwner ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className={`w-5 h-5 text-[#C8B8A8] shrink-0 ${isTodoOwner ? 'hover:text-[#E67E22]' : ''}`} />
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-xs sm:text-sm font-bold ${item.completed ? 'line-through text-[#8C7A6B]' : 'text-[#2C2421]'}`}>
                              {item.text}
                            </p>
                            {item.is_daily && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>Daily</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8C7A6B]">
                            Category: {item.category} {item.is_daily && item.completed ? '• ☀️ Completed today' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md border font-extrabold tracking-wide hidden sm:inline-block ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                        {isTodoOwner && (
                          <button
                            onClick={() => handleDeleteTodo(item.id, todoUserTab)}
                            className="p-1.5 text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
              <p className="text-xs text-[#8C7A6B] mb-6">Powered by Cat API & CATAAS</p>

              <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-inner bg-[#F8F1E9] mb-5 group border border-[#F5E6D3]">
                {isLoadingCat || !kittenUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8C7A6B]">
                    <Cat className="w-12 h-12 animate-bounce text-[#E67E22]" />
                    <span className="text-xs font-semibold mt-2">Summoning a kitten...</span>
                  </div>
                ) : (
                  <img
                    src={kittenUrl}
                    alt="Daily Kitten"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>

              {/* Action buttons row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setViewKittenModal(true)}
                  disabled={isLoadingCat || !kittenUrl}
                  className="py-3 px-4 bg-[#FAF6F0] hover:bg-[#F0E4D8] text-[#5D4037] border border-[#E8D8C8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-[#E67E22]" />
                  <span>View Full Photo</span>
                </button>

                <button
                  onClick={handleDownloadCat}
                  disabled={isLoadingCat || !kittenUrl || isDownloadingCat}
                  className="py-3 px-4 bg-[#FAF6F0] hover:bg-[#F0E4D8] text-[#5D4037] border border-[#E8D8C8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-[#D35400]" />
                  <span>{isDownloadingCat ? 'Downloading...' : 'Save / Download'}</span>
                </button>
              </div>

              {catFact && (
                <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] text-left mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#E67E22]" />
                    <span className="text-xs font-bold text-[#D35400] uppercase tracking-wider">Cat Trivia Fact</span>
                  </div>
                  <p className="text-xs text-[#2C2421] leading-relaxed italic">
                    "{catFact}"
                  </p>
                </div>
              )}

              <button
                onClick={fetchRandomCat}
                disabled={isLoadingCat}
                className="w-full py-3.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isLoadingCat ? 'animate-spin' : ''}`} />
                <span>Get Another Kitten</span>
              </button>
            </div>

            {/* Kitten Full-Resolution Lightbox Modal */}
            {viewKittenModal && kittenUrl && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-modal-pop">
                  <button
                    onClick={() => setViewKittenModal(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                    title="Close Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                    <img
                      src={kittenUrl}
                      alt="Full Resolution Kitten"
                      className="w-full h-full max-h-[70vh] object-contain"
                    />
                  </div>

                  <div className="p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#2C2421]">Daily Kitten Preview 🐾</h3>
                      <p className="text-xs text-[#8C7A6B] mt-0.5">High-definition full size view</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleDownloadCat}
                        disabled={isDownloadingCat}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isDownloadingCat ? 'Downloading...' : 'Download Photo'}</span>
                      </button>

                      <button
                        onClick={() => setViewKittenModal(false)}
                        className="px-4 py-2.5 bg-[#FAF6F0] border border-[#E8D8C8] text-[#2C2421] rounded-xl text-xs font-bold hover:bg-[#F0E4D8] transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coin Toss Tab */}
        {activeTab === 'coin' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="card-surface-container bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#E8D8C8] text-center relative overflow-hidden transition-all">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-[#D35400] rounded-full text-xs font-black mb-4 border border-amber-200 shadow-xs">
                <Coins className="w-4 h-4 text-[#E67E22]" />
                <span>Decision Time</span>
              </div>

              <h2 className="text-2xl font-black text-[#2C2421] mb-2 flex items-center justify-center gap-2">
                <span>Toss the Coin of Decision Making</span>
                <Coins className="w-6 h-6 text-[#E67E22] shrink-0" />
              </h2>
              <p className="text-xs text-[#8C7A6B] mb-6">Tap to toss!</p>

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
                        <span className="text-xs font-extrabold uppercase tracking-widest">Scratch</span>
                        <span className="text-[10px] opacity-80">(HEADS)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Sparkles className="w-14 h-14 mb-1 text-amber-300" />
                        <span className="text-xs font-extrabold uppercase tracking-widest">Bite</span>
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
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Bucket List</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2C2421]">Date Ideas 📅</h2>
                  <p className="text-xs text-[#8C7A6B]">Plan, categorize, and check off activities together!</p>
                </div>

                <button
                  type="button"
                  onClick={handlePickRandomIdea}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#D35400] text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-orange-200 hover:scale-105 transition-all flex items-center justify-center gap-2 border border-white/20 self-start sm:self-auto"
                >
                  <Shuffle className={`w-4 h-4 ${isPickingRandom ? 'animate-spin-shuffle' : ''}`} />
                  <span>Pick a Date Idea 🎲</span>
                </button>
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

              <form onSubmit={handleAddDateIdea} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3 shadow-xs">
                <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">Add New Date Idea</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Date Idea Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newIdeaTitle}
                      onChange={e => setNewIdeaTitle(e.target.value)}
                      placeholder="Date idea (e.g. Mall, Romantic Dinner, Picnic)..."
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Category
                    </label>
                    <select
                      value={newIdeaCategory}
                      onChange={e => setNewIdeaCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                    >
                      <option value="outdoor">Outdoor 🌲</option>
                      <option value="sport">Sport ⚽</option>
                      <option value="art">Art 🎨</option>
                      <option value="indoor">Indoor 🏠</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      value={newIdeaLocation}
                      onChange={e => setNewIdeaLocation(e.target.value)}
                      placeholder="Location (optional, e.g. Central Park, Seaside)..."
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#D35400] text-white text-xs font-bold rounded-xl hover:bg-[#B94A00] transition-all flex items-center justify-center gap-1 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Date</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {dateIdeas.length === 0 && (
                  <p className="text-xs text-center text-[#8C7A6B] py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8]">
                    No date ideas yet! Add one above ✨
                  </p>
                )}
                {dateIdeas
                  .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
                  .map((item) => {
                    const isDeleting = deletingDateIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                          isDeleting ? 'opacity-0 scale-95 -translate-x-4 max-h-0 py-0 my-0 overflow-hidden border-none' : 'opacity-100 scale-100'
                        } ${
                          item.completed
                            ? 'bg-amber-50/50 border-amber-200 opacity-75'
                            : 'bg-[#FFFDF9] border-[#F5E6D3] hover:border-[#E67E22]'
                        }`}
                      >
                        <div
                          onClick={() => handleToggleDate(item.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
                        >
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-[#D35400] shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#C8B8A8] shrink-0 hover:text-[#E67E22]" />
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

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 bg-white rounded-lg border border-[#E8D8C8] text-[#8C7A6B] capitalize font-medium hidden sm:inline-block">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDateIdea(item.id);
                            }}
                            className="p-1.5 text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-80 hover:opacity-100"
                            title="Delete date idea"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Random Date Picker Modal */}
        {showPickerModal && (
          <div className="fixed inset-0 bg-[#2C2421]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#F0E4D8] relative animate-modal-pop text-center space-y-4">
              <button
                onClick={() => {
                  setShowPickerModal(false);
                  setShowScheduleInModal(false);
                }}
                className="absolute top-4 right-4 p-1.5 text-[#8C7A6B] hover:text-[#2C2421] hover:bg-[#FAF6F0] rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-gradient-to-tr from-[#E67E22] to-[#F39C12] rounded-2xl mx-auto flex items-center justify-center shadow-lg text-white transform rotate-3">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D35400] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Calico Date Generator 🎲
                </span>
                <h3 className="text-xl font-black text-[#2C2421] mt-3">
                  {isPickingRandom ? 'Selecting your next adventure...' : pickedIdea ? "Here's your next date! 💕" : "No Uncompleted Dates!"}
                </h3>
              </div>

              {isPickingRandom || pickedIdea ? (
                <div className={`picker-result-card p-5 rounded-2xl border-2 transition-all ${
                  isPickingRandom
                    ? 'bg-[#FAF6F0] border-[#E8D8C8] animate-pulse'
                    : 'bg-gradient-to-br from-[#FFFDF9] to-[#FFF8F0] border-[#E67E22] shadow-sm'
                }`}>
                  <h4 className="text-lg font-black text-[#2C2421] mb-1">
                    {pickedIdea?.title}
                  </h4>
                  <p className="text-xs text-[#8C7A6B] flex items-center justify-center gap-2">
                    <span>📍 {pickedIdea?.location || 'To be planned'}</span>
                    <span>•</span>
                    <span className="capitalize font-bold text-[#E67E22]">{pickedIdea?.category}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#8C7A6B] py-3">
                  You've completed all date ideas on your checklist! Add some new date ideas above to pick again! ✨
                </p>
              )}

              {/* Schedule inline form if toggled */}
              {pickedIdea && !isPickingRandom && showScheduleInModal && (
                <form onSubmit={handleCommitPickedIdeaToAgenda} className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8D8C8] text-left space-y-3">
                  <p className="text-xs font-bold text-[#5D4037] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>Attach to Agenda Schedule</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={modalPlanDate}
                        onChange={e => setModalPlanDate(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">Time (optional)</label>
                      <input
                        type="time"
                        value={modalPlanTime}
                        onChange={e => setModalPlanTime(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={modalPlanNotes}
                      onChange={e => setModalPlanNotes(e.target.value)}
                      placeholder="e.g. Book reservations, surprise flowers..."
                      className="w-full px-2.5 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-orange-200 transition-all flex items-center justify-center gap-1"
                  >
                    <span>Commit & Add to Agenda 🗓️</span>
                  </button>
                </form>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {pickedIdea && !isPickingRandom && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowScheduleInModal(!showScheduleInModal)}
                      className={`btn-schedule-picker flex-1 py-2.5 border-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        showScheduleInModal
                          ? 'bg-[#E67E22] text-white border-[#E67E22]'
                          : 'bg-[#FAF6F0] text-[#2C2421] border-[#E8D8C8] hover:bg-[#F0E4D8]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-[#E67E22]" />
                      <span>{showScheduleInModal ? 'Hide Schedule' : 'Schedule to Agenda 🗓️'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleToggleDate(pickedIdea.id);
                        setShowPickerModal(false);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Planned!</span>
                    </button>
                  </>
                )}

                {dateIdeas.some(d => !d.completed) && (
                  <button
                    onClick={handlePickRandomIdea}
                    disabled={isPickingRandom}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Shuffle className={`w-4 h-4 ${isPickingRandom ? 'animate-spin' : ''}`} />
                    <span>{isPickingRandom ? 'Spinning...' : 'Spin Again 🎲'}</span>
                  </button>
                )}
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
                <h2 className="text-2xl font-black text-[#2C2421]">Agenda Planning 🗓️</h2>
                <p className="text-xs text-[#8C7A6B]">Schedule upcoming dates, times, spots, and notes together.</p>
              </div>

              <form onSubmit={handleAddAgendaPlan} className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] mb-6 space-y-3 shadow-xs">
                <p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">Schedule a Plan</p>
                <div>
                  <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                    Event / Plan Title
                  </label>
                  <input
                    type="text"
                    required
                    value={planTitle}
                    onChange={e => setPlanTitle(e.target.value)}
                    placeholder="Plan title (e.g. Monthsary, Staycation, Picnic)..."
                    className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={planDate}
                      onChange={e => setPlanDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">Time (optional)</label>
                    <input
                      type="time"
                      value={planTime}
                      onChange={e => setPlanTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">Location / Spot (optional)</label>
                    <input
                      type="text"
                      value={planLocation}
                      onChange={e => setPlanLocation(e.target.value)}
                      placeholder="Location / Spot (e.g. Mall of Asia)..."
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">Notes / Reminders (optional)</label>
                    <input
                      type="text"
                      value={planNotes}
                      onChange={e => setPlanNotes(e.target.value)}
                      placeholder="Notes / Reminders (e.g. Wear semi-formal)..."
                      className="w-full px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white text-xs font-bold rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Agenda</span>
                </button>
              </form>

              <div className="space-y-3">
                {agenda.length === 0 && (
                  <p className="text-xs text-center text-[#8C7A6B] py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8]">
                    No plans scheduled yet! Add one above ✨
                  </p>
                )}
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
        {activeTab === 'gallery' && (() => {
          const totalPages = Math.ceil(gallery.length / photosPerPage) || 1;
          const safePage = Math.min(galleryPage, totalPages);
          const startIndex = (safePage - 1) * photosPerPage;
          const currentPhotos = gallery.slice(startIndex, startIndex + photosPerPage);

          return (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D35400] rounded-full text-xs font-bold mb-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Memory Vault</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#2C2421]">Photo Gallery 🖼️</h2>
                    <p className="text-xs text-[#8C7A6B]">Store our precious memories together</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Photos Per Page Selector */}
                    <div className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E8D8C8] px-3 py-1.5 rounded-xl">
                      <span className="text-[11px] font-bold text-[#8C7A6B]">Show:</span>
                      <select
                        value={photosPerPage}
                        onChange={(e) => {
                          setPhotosPerPage(Number(e.target.value));
                          setGalleryPage(1);
                        }}
                        className="bg-transparent text-xs font-extrabold text-[#2C2421] outline-none cursor-pointer"
                      >
                        <option value={3}>3 / page</option>
                        <option value={6}>6 / page</option>
                        <option value={9}>9 / page</option>
                        <option value={12}>12 / page</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                </div>

                {/* Photo Grid */}
                {gallery.length === 0 ? (
                  <p className="text-xs text-center text-[#8C7A6B] py-8 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8D8C8] mb-6">
                    No photos yet! Upload your first memory ✨
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {currentPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActiveLightbox(photo)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-[#F8F1E9] border border-[#F5E6D3] cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                          <p className="font-bold text-xs">{photo.caption}</p>
                          <p className="text-[10px] text-amber-200">{photo.taken_on} • {photo.category}</p>
                        </div>

                        {/* Delete photo overlay button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(photo);
                          }}
                          className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-xs text-white/90 hover:text-red-400 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          title="Delete photo memory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                <div className="pt-4 border-t border-[#F5E6D3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7A6B]">
                  <p className="font-medium">
                    Showing <span className="font-bold text-[#2C2421]">{gallery.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                    <span className="font-bold text-[#2C2421]">{Math.min(startIndex + photosPerPage, gallery.length)}</span> of{' '}
                    <span className="font-bold text-[#2C2421]">{gallery.length}</span> photos
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setGalleryPage(prev => Math.max(1, prev - 1));
                        playSound('pop');
                      }}
                      disabled={safePage === 1}
                      className="p-2 rounded-xl border border-[#E8D8C8] bg-[#FFFDF9] text-[#2C2421] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F1E9] transition-all"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setGalleryPage(page);
                          playSound('pop');
                        }}
                        className={`w-8 h-8 rounded-xl font-bold transition-all text-xs flex items-center justify-center ${
                          safePage === page
                            ? 'bg-[#E67E22] text-white shadow-xs'
                            : 'bg-[#FFFDF9] border border-[#E8D8C8] text-[#2C2421] hover:bg-[#F8F1E9]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setGalleryPage(prev => Math.min(totalPages, prev + 1));
                        playSound('pop');
                      }}
                      disabled={safePage === totalPages}
                      className="p-2 rounded-xl border border-[#E8D8C8] bg-[#FFFDF9] text-[#2C2421] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F1E9] transition-all"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lightbox Modal */}
              {activeLightbox && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
                    <button
                      onClick={() => setActiveLightbox(null)}
                      className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img src={activeLightbox.image_url} alt={activeLightbox.caption} className="w-full max-h-[60vh] object-contain bg-black" />
                    <div className="p-6 bg-white flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#2C2421]">{activeLightbox.caption}</h3>
                        <p className="text-xs text-[#8C7A6B]">Saved on {activeLightbox.taken_on}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPhotoToDelete(activeLightbox)}
                        className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Deletion Confirmation Modal */}
              {photoToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#F0E4D8] animate-modal-pop text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                      <Trash2 className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-[#2C2421]">Delete Photo Memory?</h3>
                      <p className="text-xs text-[#8C7A6B] mt-1.5 leading-relaxed">
                        Are you sure you want to delete <strong className="text-[#2C2421]">"{photoToDelete.caption}"</strong>? This action cannot be undone.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setPhotoToDelete(null)}
                        className="flex-1 py-2.5 bg-[#FAF6F0] text-[#2C2421] border border-[#E8D8C8] rounded-xl text-xs font-bold hover:bg-[#F0E4D8] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteGalleryPhoto}
                        disabled={isDeletingPhoto}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>{isDeletingPhoto ? 'Deleting...' : 'Delete Photo'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#F0E4D8] animate-modal-pop">
                    <div className="flex justify-between items-center border-b border-[#F5E6D3] pb-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#E67E22]" />
                        <h3 className="font-extrabold text-base text-[#2C2421]">Upload New Moment</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setPreviewImage(null);
                          setSelectedFile(null);
                          setNewImageCaption('');
                        }}
                        className="p-1.5 text-[#8C7A6B] hover:text-[#2C2421] rounded-full transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddGalleryPhoto} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5D4037] mb-1.5">
                          Select Photo <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={fileInputRef}
                          id="photo-file-upload"
                          type="file"
                          accept="image/*"
                          required
                          onChange={handleImageFileChange}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="photo-file-upload"
                          className="w-full py-4 px-4 border-2 border-dashed border-[#E0D0C0] hover:border-[#E67E22] bg-[#FAF6F0] hover:bg-[#F5E6D3] rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group text-center shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-[#D35400] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            <Upload className="w-5 h-5" />
                          </div>
                          {selectedFile ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-[#2C2421] truncate max-w-[260px]">
                                Selected: <span className="text-[#E67E22]">{selectedFile.name}</span>
                              </p>
                              <span className="text-[10px] text-[#8C7A6B] font-medium block">
                                Click to choose a different photo
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-xs font-extrabold text-[#D35400] flex items-center justify-center gap-1.5">
                                <Camera className="w-4 h-4" />
                                <span>📷 Choose Photo from Device</span>
                              </span>
                              <p className="text-[10px] text-[#8C7A6B]">
                                JPG, PNG, WEBP, or GIF supported
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      {previewImage && (
                        <div>
                          <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase mb-1">
                            Preview
                          </label>
                          <div className="aspect-video rounded-2xl overflow-hidden border border-[#F5E6D3] shadow-inner bg-black/5">
                            <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                          Caption (optional)
                        </label>
                        <input
                          type="text"
                          value={newImageCaption}
                          onChange={e => setNewImageCaption(e.target.value)}
                          placeholder="Caption for this memory (e.g. Sunset at the beach)..."
                          className="w-full px-3 py-2.5 bg-[#FFFDF9] border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUploadModal(false);
                            setPreviewImage(null);
                            setSelectedFile(null);
                            setNewImageCaption('');
                          }}
                          className="flex-1 py-3 bg-[#FAF6F0] border border-[#E8D8C8] text-[#2C2421] rounded-xl text-xs font-bold hover:bg-[#F0E4D8] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!selectedFile}
                          className="flex-1 py-3 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Save Memory</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Gala Funds Tab (Google Sheets Integration) */}
        {activeTab === 'gala' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F0E4D8]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-2">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Sheets Live Tracker</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2C2421]">Our Gala Funds 💰</h2>
                  <p className="text-xs text-[#8C7A6B]">
                    Synced directly with your Google Sheet cell!
                  </p>
                </div>

                <button
                  onClick={() => setShowSheetSettings(!showSheetSettings)}
                  className="p-2.5 bg-[#FAF6F0] border border-[#E8D8C8] text-[#5D4037] hover:bg-[#F3E8DB] rounded-2xl transition-all"
                  title="Configure Google Sheet link"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Balance Hero Card */}
              <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#0D9488] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
                <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
                  <Wallet className="w-48 h-48 text-white" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Gala Trip Savings
                    </span>
                    {lastSyncedTime && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                        Synced {lastSyncedTime}
                      </span>
                    )}
                  </div>

                  <div className="my-4">
                    <span className="text-xs text-blue-100 block font-medium mb-1">Total Savings Balance</span>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline gap-1">
                      <span>{currencySymbol}</span>
                      <span>{galaFundAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Goal Progress */}
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-blue-100">Target Goal: {currencySymbol}{galaGoal.toLocaleString()}</span>
                      <span className="text-emerald-300 font-extrabold">
                        {galaGoal > 0 ? Math.min(100, Math.round((galaFundAmount / galaGoal) * 100)) : 0}% Reached
                      </span>
                    </div>
                    <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-300 to-amber-300 rounded-full transition-all duration-700"
                        style={{ width: `${galaGoal > 0 ? Math.min(100, (galaFundAmount / galaGoal) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={fetchGalaFunds}
                  disabled={isSyncingSheet || !sheetId.trim()}
                  className="flex-1 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheet ? 'Syncing Cell...' : 'Fetch Latest Balance'}</span>
                </button>
              </div>

              {sheetError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl mb-6">
                  <p className="font-bold mb-0.5">Sync Alert:</p>
                  <p>{sheetError}</p>
                </div>
              )}

              {/* Settings Form / Instructions Modal */}
              {showSheetSettings && (
                <div className="p-5 bg-[#FFFDF9] rounded-2xl border border-[#E8D8C8] space-y-4 shadow-sm mb-6">
                  <div className="flex justify-between items-center border-b border-[#F5E6D3] pb-2">
                    <h3 className="font-extrabold text-xs text-[#2C2421] uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-[#E67E22]" />
                      Google Sheets API Settings
                    </h3>
                    <button onClick={() => setShowSheetSettings(false)} className="text-[#8C7A6B] hover:text-[#2C2421]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Google Sheet URL or Sheet ID
                    </label>
                    <input
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="Paste Google Sheet URL or Sheet ID..."
                      className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                        Cell Range (optional, default: A1)
                      </label>
                      <input
                        type="text"
                        value={cellRange}
                        onChange={(e) => setCellRange(e.target.value)}
                        placeholder="Cell range (e.g. A1 or Sheet1!B2)..."
                        className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        placeholder="Currency symbol (e.g. ₱ or $)..."
                        className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Target Gala Goal Amount (optional)
                    </label>
                    <input
                      type="number"
                      value={galaGoal}
                      onChange={(e) => setGalaGoal(Number(e.target.value))}
                      placeholder="Target savings goal (e.g. 50000)..."
                      className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                      Google Sheets API Key (optional)
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Google Sheets API Key (optional)..."
                      className="w-full px-3 py-2 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                    />
                  </div>

                  <button
                    onClick={() => {
                      fetchGalaFunds();
                      setShowSheetSettings(false);
                    }}
                    className="w-full py-2.5 bg-[#2C3E50] text-white font-bold text-xs rounded-xl hover:bg-[#1A252F] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Save & Connect Sheet</span>
                  </button>
                </div>
              )}

              {/* Instructions on how to connect Google Sheet */}
              <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#F5E6D3] text-xs space-y-2">
                <p className="font-extrabold text-[#D35400] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  How to link your Google Sheet cell:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#8C7A6B] leading-relaxed">
                  <li>In Google Sheets, place your total Gala funds amount in cell <strong className="text-[#2C2421]">A1</strong> (or custom cell).</li>
                  <li>Click <strong className="text-[#2C2421]">Share</strong> button at top right &rarr; set permission to <strong className="text-[#2C2421]">"Anyone with link can view"</strong>.</li>
                  <li>Copy your Google Sheet URL and paste it into the ⚙️ Settings above!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Main Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#2C2421]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#F0E4D8] relative animate-modal-pop space-y-5">
            <div className="flex items-center justify-between border-b border-[#F5E6D3] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-100 text-[#D35400] rounded-xl flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5 text-[#E67E22]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#2C2421]">Settings</h3>
                  <p className="text-[10px] text-[#8C7A6B]">Display modes, text sizing & notification controls</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-1.5 text-[#8C7A6B] hover:text-[#2C2421] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mutually Exclusive Display Mode Selector */}
            <div className="p-3.5 bg-[#FFFDF9] border border-[#F5E6D3] rounded-2xl space-y-2">
              <div>
                <h4 className="font-extrabold text-xs text-[#2C2421]">Display Mode</h4>
                <p className="text-[10px] text-[#8C7A6B]">Choose Light, Dark, or High Contrast Mode (mutually exclusive)</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'light', label: 'Light ☀️' },
                  { id: 'dark', label: 'Dark 🌙' },
                  { id: 'high-contrast', label: 'High Contrast 🌗' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setDisplayMode(opt.id);
                      playSound('pop');
                    }}
                    className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition-all ${
                      displayMode === opt.id
                        ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                        : 'bg-white text-[#2C2421] border-[#E8D8C8] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size Scaling
            <div className="p-3.5 bg-[#FFFDF9] border border-[#F5E6D3] rounded-2xl space-y-2">
              <div>
                <h4 className="font-extrabold text-xs text-[#2C2421]">Text Size Scaling</h4>
                <p className="text-[10px] text-[#8C7A6B]">Adjust font sizing & line spacing across the application</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'standard', label: 'Standard' },
                  { id: 'large', label: 'Large (+20%)' },
                  { id: 'xlarge', label: 'Extra Large (+40%)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTextSize(opt.id);
                      playSound('pop');
                    }}
                    className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition-all ${
                      textSize === opt.id
                        ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                        : 'bg-white text-[#2C2421] border-[#E8D8C8] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Notification Controls with Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#FFFDF9] border border-[#F5E6D3] rounded-2xl">
              <div>
                <h4 className="font-extrabold text-xs text-[#2C2421]">Application Notifications</h4>
                <p className="text-[10px] text-[#8C7A6B]">Receive push alerts for coin flips & partner tasks</p>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notificationsEnabled ? 'bg-[#E67E22]' : 'bg-[#E8D8C8]'
                }`}
                title={notificationsEnabled ? "Notifications Enabled" : "Notifications Disabled"}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                  notificationsEnabled ? 'left-6.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* PWA Add to Home Screen Option */}
            <div className="p-3.5 bg-[#FFFDF9] border border-[#F5E6D3] rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-[#2C2421]">Add to Home Screen</h4>
                <p className="text-[10px] text-[#8C7A6B]">Install Calico Corner as an app on your mobile device</p>
              </div>
              <button
                onClick={handleAddToHomeScreen}
                className="px-3 py-1.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-orange-200 transition-all shrink-0 flex items-center gap-1"
              >
                <span>Install App 📲</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setDisplayMode('light');
                  setTextSize('standard');
                  playSound('pop');
                }}
                className="flex-1 py-2.5 bg-[#FAF6F0] border border-[#E8D8C8] text-[#5D4037] font-bold text-xs rounded-xl hover:bg-[#F0E4D8]"
              >
                Reset Defaults
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2.5 bg-[#D35400] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#B94A00]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Live Status Edit Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-[#2C2421]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#F0E4D8] relative animate-modal-pop space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5E6D3] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-amber-100 text-[#D35400] rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
                  {selectedEmoji}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2C2421]">Set Live Status</h3>
                  <p className="text-[10px] text-[#8C7A6B]">Let your partner know what you're up to (24h expiry)</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 text-[#8C7A6B] hover:text-[#2C2421] rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Quick Preset Activities */}
              <div>
                <label className="block text-[11px] font-bold text-[#5D4037] mb-1.5 uppercase tracking-wider">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { emoji: '💻', text: 'Coding in Go' },
                    { emoji: '📚', text: 'Studying for exams' },
                    { emoji: '😴', text: 'Napping' },
                    { emoji: '🎮', text: 'Gaming' },
                    { emoji: '🍽️', text: 'Eating food' },
                    { emoji: '🚗', text: 'Commuting' },
                    { emoji: '✨', text: 'Chilling' },
                    { emoji: '💕', text: 'Missing you' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(preset.emoji);
                        setCustomStatusText(preset.text);
                        playSound('pop');
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedEmoji === preset.emoji && customStatusText === preset.text
                          ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#2C2421] border-[#E8D8C8] hover:bg-[#F0E4D8]'
                      }`}
                    >
                      <span>{preset.emoji}</span>
                      <span className="truncate text-[11px]">{preset.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Selector Row */}
              <div>
                <label className="block text-[11px] font-bold text-[#5D4037] mb-1.5 uppercase tracking-wider">
                  Pick Emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['💻', '📚', '😴', '🎮', '🍽️', '🚗', '✨', '💕', '🎧', '🏋️', '🐱', '☕', '🧹', '🎬'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(em);
                        playSound('pop');
                      }}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        selectedEmoji === em
                          ? 'bg-[#E67E22] text-white border-[#E67E22] scale-110 shadow-xs'
                          : 'bg-[#FAF6F0] border-[#E8D8C8] hover:bg-[#F0E4D8]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Status Text Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                  Custom Status Message
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl px-2 py-1.5 bg-[#FAF6F0] rounded-xl border border-[#E8D8C8] shrink-0">
                    {selectedEmoji}
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={customStatusText}
                    onChange={(e) => setCustomStatusText(e.target.value)}
                    placeholder="e.g. Coding in Go, Cooking dinner..."
                    className="flex-1 px-3 py-2.5 bg-white border border-[#E0D0C0] rounded-xl text-xs outline-none focus:border-[#E67E22] text-[#2C2421] placeholder:text-[#8C7A6B]/70"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#8C7A6B] mt-1 px-1">
                  <span>⏱️ Auto-expires after 24 hours</span>
                  <span>{customStatusText.length}/50</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClearStatus}
                  disabled={isSubmittingStatus}
                  className="px-4 py-2.5 bg-[#FAF6F0] border border-[#E8D8C8] text-[#8C7A6B] hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStatus || !customStatusText.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{isSubmittingStatus ? 'Updating...' : 'Set & Broadcast Status ✨'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 bg-[#2C2421]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#F0E4D8] animate-modal-pop text-center">
            <div className="w-12 h-12 bg-amber-100 text-[#D35400] rounded-2xl mx-auto flex items-center justify-center shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#2C2421]">Sign Out of Calico Corner?</h3>
              <p className="text-xs text-[#8C7A6B] mt-1.5 leading-relaxed">
                Are you sure you want to log out? You can sign back in anytime with your partner credentials.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirmModal(false)}
                className="flex-1 py-2.5 bg-[#FAF6F0] text-[#2C2421] border border-[#E8D8C8] rounded-xl text-xs font-bold hover:bg-[#F0E4D8] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  handleSignOut();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Speed Dial Navigation (FAB) */}
      {/* Dim Backdrop Overlay */}
      {isNavOpen && (
        <div
          onClick={() => setIsNavOpen(false)}
          className="fixed inset-0 bg-[#2C2421]/35 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded Speed Dial Menu Stack */}
        {isNavOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-fab-pop">
            {[
              { id: 'kitten', label: 'Daily Kitten', icon: Cat },
              { id: 'coin', label: 'Toss Coin', icon: Coins },
              { id: 'todo', label: 'Checklists', icon: CheckSquare },
              { id: 'dates', label: 'Date Ideas', icon: Calendar },
              { id: 'plans', label: 'Agenda Planning', icon: Compass },
              { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon },
              { id: 'gala', label: 'Gala Funds', icon: Wallet }
            ].map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsNavOpen(false);
                    playSound('pop');
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-lg border transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white border-transparent scale-105 shadow-orange-200'
                      : 'bg-white text-[#2C2421] border-[#F0E4D8] hover:bg-[#FFFDF9] hover:border-[#E67E22]'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#2C2421]'}`}>
                    {item.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#FAF6F0] text-[#E67E22]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB Toggle Button */}
        <button
          onClick={() => {
            setIsNavOpen(!isNavOpen);
            playSound('pop');
          }}
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#E67E22] via-[#F39C12] to-[#D35400] text-white shadow-xl hover:shadow-orange-300 flex items-center justify-center transition-all duration-300 border-2 border-white transform active:scale-95 ${
            isNavOpen ? 'rotate-90 scale-105' : 'hover:scale-105'
          }`}
          title={isNavOpen ? "Close Navigation" : "Open Navigation"}
        >
          {isNavOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Floating Send Hug Button (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={handleSendHug}
          disabled={hugButtonSent}
          className={`h-14 px-4 sm:px-5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2.5 border-2 border-white transform active:scale-95 cursor-pointer ${
            hugButtonSent
              ? 'bg-emerald-500 text-white scale-105 shadow-emerald-200'
              : 'bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white hover:scale-105 shadow-pink-400/50'
          }`}
          title="Send an instant realtime hug to your partner!"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className={`w-4 h-4 ${hugButtonSent ? 'fill-white animate-bounce' : 'fill-white animate-pulse'}`} />
          </div>
          <span className="text-xs font-black tracking-wide select-none">
            {hugButtonSent ? 'Hug Sent! 💕' : 'Send Hug 🐾'}
          </span>
        </button>
      </div>
      
    </div>
  );
}