import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Search, Globe, BarChart3, MessageSquare, Users, Zap, ChevronRight, Star, Clock, Volume2, Eye, Filter, Bell, Settings, RefreshCw, Activity, Plus, X, Check, Heart, Trash2, LogOut, Wifi, WifiOff, Loader, Send, Trophy, UserPlus, Target, Flame, Award, Bitcoin, Newspaper, ExternalLink, Briefcase, DollarSign, PieChart, BellRing, AlertTriangle } from 'lucide-react';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addToWatchlist, removeFromWatchlist, getWatchlist, recordVote, removeVote, getUserVotes, getUserProfile, addComment, getStockComments, likeComment, unlikeComment, getTopTraders, followUser, unfollowUser, addHolding, removeHolding, getPortfolio, addPriceAlert, removePriceAlert, sendGlobalMessage, listenToGlobalChat, likeGlobalMessage, listenToAnnouncements, markAnnouncementRead, postAnnouncement, getUserAvatars } from './firestore.js';
import { getMultipleQuotes, getQuote, searchStocks, initializeRealTimeData, disconnectWebSocket, getWebSocketStatus, isMarketOpen, subscribeSymbol } from './stockApi.js';
import { getCryptoMarketData, searchCrypto, formatCryptoPrice, formatMarketCap } from './cryptoApi.js';
import { getCombinedNews, getStockNews, getCryptoNewsBySymbol, formatTimeAgo, truncateText } from './newsApi.js';

// Thumbs Up Logo
const ThumbsUpLogo = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DEFAULT_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', thumbsUp: 8934, thumbsDown: 1243, sentiment: 87, sentimentLabel: 'Very Bullish', avgVolume: 58200000 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', thumbsUp: 12453, thumbsDown: 8932, sentiment: 58, sentimentLabel: 'Neutral', avgVolume: 112500000 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', thumbsUp: 15678, thumbsDown: 2134, sentiment: 92, sentimentLabel: 'Extremely Bullish', avgVolume: 42300000 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', thumbsUp: 7823, thumbsDown: 1923, sentiment: 81, sentimentLabel: 'Bullish', avgVolume: 22100000 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', thumbsUp: 6234, thumbsDown: 2341, sentiment: 73, sentimentLabel: 'Bullish', avgVolume: 37800000 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', thumbsUp: 9234, thumbsDown: 2134, sentiment: 81, sentimentLabel: 'Bullish', avgVolume: 25400000 },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', thumbsUp: 7823, thumbsDown: 3421, sentiment: 70, sentimentLabel: 'Bullish', avgVolume: 19200000 },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', thumbsUp: 4523, thumbsDown: 1876, sentiment: 71, sentimentLabel: 'Bullish', avgVolume: 9800000 },
];

// Format volume numbers
const formatVolume = (vol) => {
  if (!vol || vol === 0) return '—';
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toLocaleString();
};

// Simulate live volume (varies around avg)
const getLiveVolume = (avgVolume) => {
  if (!avgVolume) return 0;
  const now = new Date();
  const hours = now.getHours();
  const marketProgress = Math.max(0, Math.min(1, (hours - 9.5) / 6.5));
  const variance = 0.7 + Math.random() * 0.6;
  return Math.floor(avgVolume * marketProgress * variance);
};

const EXCHANGES = [
  { id: 'nyse', name: 'NYSE', country: 'US', flag: '🇺🇸', status: 'open', change: 0.42 },
  { id: 'nasdaq', name: 'NASDAQ', country: 'US', flag: '🇺🇸', status: 'open', change: 0.67 },
  { id: 'binance', name: 'Binance', country: 'CRYPTO', flag: '🪙', status: 'open', change: 1.24 },
  { id: 'coinbase', name: 'Coinbase', country: 'CRYPTO', flag: '🪙', status: 'open', change: 0.89 },
  { id: 'lse', name: 'LSE', country: 'UK', flag: '🇬🇧', status: 'closed', change: -0.12 },
  { id: 'tse', name: 'TSE', country: 'JP', flag: '🇯🇵', status: 'closed', change: 1.24 },
];

// Market Hours Helper
const getMarketStatus = () => {
  const now = new Date();
  const etOptions = { timeZone: 'America/New_York' };
  const etString = now.toLocaleString('en-US', etOptions);
  const etDate = new Date(etString);
  
  const day = etDate.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = etDate.getHours();
  const minutes = etDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 30; // 9:30 AM ET
  const marketClose = 16 * 60; // 4:00 PM ET
  
  const isWeekend = day === 0 || day === 6;
  const isMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;
  const isOpen = !isWeekend && isMarketHours;
  
  // Calculate next market event
  let nextEventTime;
  let nextEventLabel;
  
  if (isOpen) {
    // Market is open - countdown to close
    nextEventLabel = 'closes';
    const closeToday = new Date(etDate);
    closeToday.setHours(16, 0, 0, 0);
    nextEventTime = closeToday;
  } else {
    // Market is closed - countdown to open
    nextEventLabel = 'opens';
    let nextOpen = new Date(etDate);
    
    if (day === 6) {
      // Saturday - next open is Monday
      nextOpen.setDate(nextOpen.getDate() + 2);
    } else if (day === 0) {
      // Sunday - next open is Monday
      nextOpen.setDate(nextOpen.getDate() + 1);
    } else if (currentMinutes >= marketClose) {
      // After hours - next open is tomorrow (or Monday if Friday)
      if (day === 5) {
        nextOpen.setDate(nextOpen.getDate() + 3); // Friday after hours -> Monday
      } else {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
    }
    // If before market open on a weekday, nextOpen is today
    
    nextOpen.setHours(9, 30, 0, 0);
    nextEventTime = nextOpen;
  }
  
  // Calculate time difference
  const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const diff = nextEventTime - etNow;
  
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const hoursLeft = Math.floor(totalSeconds / 3600);
  const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
  const secondsLeft = totalSeconds % 60;
  
  return {
    isOpen,
    nextEventLabel,
    hours: hoursLeft,
    minutes: minutesLeft,
    seconds: secondsLeft,
    etTime: etDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })
  };
};

// Market Countdown Component
const MarketCountdown = () => {
  const [status, setStatus] = useState(getMarketStatus());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (h, m, s) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.isOpen ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
        <span className="text-xs font-bold text-white">US Market</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] ${status.isOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
          {status.isOpen ? 'OPEN' : 'CLOSED'}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">{status.nextEventLabel} in</span>
          <span className={`font-mono text-xs font-bold ${status.isOpen ? 'text-amber-400' : 'text-cyan-400'}`}>
            {formatTime(status.hours, status.minutes, status.seconds)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CRYPTO_ICONS = { BTC: '₿', ETH: 'Ξ', BNB: '◆', SOL: '◎', XRP: '✕', ADA: '₳', DOGE: 'Ð', DOT: '●', MATIC: '⬡', LTC: 'Ł' };
const AVATARS = ['👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🚀', '🦊', '🐺', '🦁', '🐯', '🦅', '🐋', '🎯', '📊', '💹', '🚀'];
const getAvatar = (uid) => AVATARS[uid?.charCodeAt(0) % AVATARS.length] || '👤';

// Avatar Display component - handles both emoji and uploaded image avatars
const AvatarDisplay = ({ avatar, size = 'md', className = '' }) => {
  const sizeClasses = { sm: 'w-6 h-6 text-sm', md: 'w-8 h-8 text-lg', lg: 'w-10 h-10 text-xl' };
  const isImage = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex-shrink-0 ${className}`}>
      {isImage ? (
        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{avatar || '👤'}</span>
      )}
    </div>
  );
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
    <div className="absolute inset-0 opacity-30">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-cyan-500 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />
      ))}
    </div>
  </div>
);

const ExchangeBadge = ({ exchange }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer ${exchange.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
    <span className="text-lg">{exchange.flag}</span>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-white">{exchange.name}</span>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${exchange.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className={`text-[10px] ${exchange.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{exchange.change >= 0 ? '+' : ''}{exchange.change}%</span>
      </div>
    </div>
  </div>
);

const SentimentMeter = ({ score, size = 'md' }) => {
  const getColor = (s) => { if (s >= 80) return 'from-emerald-400 to-cyan-400'; if (s >= 60) return 'from-cyan-400 to-blue-400'; if (s >= 40) return 'from-amber-400 to-orange-400'; return 'from-rose-400 to-red-500'; };
  const sizes = { sm: { width: 60, height: 6, text: 'text-xs' }, md: { width: 100, height: 8, text: 'text-sm' }, lg: { width: 150, height: 10, text: 'text-base' } };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: s.width, height: s.height }}>
        <div className="absolute inset-0 bg-slate-700/50 rounded-full" />
        <div className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getColor(score)} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-mono font-bold ${s.text} ${score >= 60 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{score}%</span>
    </div>
  );
};

// Alert Notification Toast
const AlertToast = ({ alert, currentPrice, onDismiss }) => {
  const isAbove = alert.condition === 'above';
  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`p-4 rounded-xl border shadow-xl ${isAbove ? 'bg-emerald-900/90 border-emerald-500/50' : 'bg-rose-900/90 border-rose-500/50'} backdrop-blur-sm max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isAbove ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
            <BellRing size={20} className={isAbove ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">🔔 Price Alert Triggered!</p>
            <p className="text-sm text-slate-300 mt-1">
              <span className="font-bold">{alert.symbol}</span> is now {isAbove ? 'above' : 'below'} ${alert.targetPrice.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Current: ${currentPrice?.toFixed(2) || 'N/A'}</p>
          </div>
          <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded"><X size={16} className="text-slate-400" /></button>
        </div>
      </div>
    </div>
  );
};

// Add Alert Modal
const AddAlertModal = ({ isOpen, onClose, onAdd, stocks, cryptos, currentPrices }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');
  const [isCrypto, setIsCrypto] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const currentPrice = currentPrices[symbol] || 0;

  useEffect(() => {
    if (symbol.length >= 1) {
      const stockMatches = stocks.filter(s => s.ticker.toLowerCase().includes(symbol.toLowerCase())).slice(0, 3);
      const cryptoMatches = cryptos.filter(c => c.symbol.toLowerCase().includes(symbol.toLowerCase())).slice(0, 3);
      setSearchResults([...stockMatches.map(s => ({ ...s, symbol: s.ticker, isCrypto: false })), ...cryptoMatches.map(c => ({ symbol: c.symbol, name: c.name, isCrypto: true }))]);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [symbol, stocks, cryptos]);

  const selectResult = (result) => {
    setSymbol(result.symbol || result.ticker);
    setName(result.name);
    setIsCrypto(result.isCrypto);
    setShowSearch(false);
  };

  const handleSubmit = async () => {
    if (!symbol || !targetPrice) return;
    setIsAdding(true);
    await onAdd({ symbol, name: name || symbol, targetPrice: parseFloat(targetPrice), condition, isCrypto });
    setSymbol(''); setName(''); setTargetPrice(''); setCondition('above'); setIsCrypto(false);
    setIsAdding(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md animate-slideIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bell size={20} className="text-amber-400" />Create Price Alert</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL, BTC..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-10">
                {searchResults.map(r => (
                  <button key={r.symbol} onClick={() => selectResult(r)} className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center justify-between">
                    <span className="text-white font-medium">{r.symbol}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${r.isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{r.isCrypto ? 'CRYPTO' : 'STOCK'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentPrice > 0 && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-500">Current Price</p>
              <p className="text-lg font-bold font-mono text-white">${currentPrice.toFixed(2)}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Alert Condition</label>
            <div className="flex gap-2">
              <button onClick={() => setCondition('above')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${condition === 'above' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                <TrendingUp size={16} />Price Goes Above
              </button>
              <button onClick={() => setCondition('below')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${condition === 'below' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                <TrendingDown size={16} />Price Goes Below
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Target Price ($)</label>
            <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder={currentPrice > 0 ? (condition === 'above' ? (currentPrice * 1.1).toFixed(2) : (currentPrice * 0.9).toFixed(2)) : "0.00"} step="any"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
          </div>

          {targetPrice && currentPrice > 0 && (
            <div className={`p-3 rounded-lg ${condition === 'above' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
              <p className="text-sm text-slate-300">
                Alert when <span className="font-bold">{symbol}</span> goes {condition} <span className="font-bold font-mono">${parseFloat(targetPrice).toFixed(2)}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {condition === 'above' 
                  ? `${((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(1)}% above current price`
                  : `${((currentPrice - parseFloat(targetPrice)) / currentPrice * 100).toFixed(1)}% below current price`
                }
              </p>
            </div>
          )}
          
          <button onClick={handleSubmit} disabled={!symbol || !targetPrice || isAdding}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2">
            {isAdding ? <Loader size={18} className="animate-spin" /> : <Bell size={18} />}
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
};

// Alert Card
const AlertCard = ({ alert, currentPrice, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const isAbove = alert.condition === 'above';
  const isTriggered = isAbove ? currentPrice >= alert.targetPrice : currentPrice <= alert.targetPrice;
  const distance = currentPrice ? Math.abs(((currentPrice - alert.targetPrice) / alert.targetPrice) * 100).toFixed(1) : 0;

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(alert.id);
    setIsRemoving(false);
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${isTriggered ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${alert.isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {alert.isCrypto ? (CRYPTO_ICONS[alert.symbol] || alert.symbol.substring(0, 2)) : alert.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white">{alert.symbol}</h4>
              {isTriggered && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold animate-pulse">TRIGGERED!</span>}
            </div>
            <p className="text-[10px] text-slate-500">{alert.name || alert.symbol}</p>
          </div>
        </div>
        <button onClick={handleRemove} disabled={isRemoving} className="p-1.5 hover:bg-rose-500/20 rounded-lg transition-colors">
          {isRemoving ? <Loader size={14} className="animate-spin text-slate-400" /> : <Trash2 size={14} className="text-slate-500 hover:text-rose-400" />}
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isAbove ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isAbove ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="text-xs font-bold">{isAbove ? 'Above' : 'Below'}</span>
        </div>
        <span className="text-lg font-bold font-mono text-white">${alert.targetPrice.toFixed(2)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-slate-900/50 rounded-lg">
          <p className="text-[10px] text-slate-500 mb-1">Current Price</p>
          <p className="text-sm font-bold font-mono text-white">${currentPrice?.toFixed(2) || 'N/A'}</p>
        </div>
        <div className="p-2 bg-slate-900/50 rounded-lg">
          <p className="text-[10px] text-slate-500 mb-1">Distance</p>
          <p className={`text-sm font-bold font-mono ${isTriggered ? 'text-amber-400' : 'text-slate-300'}`}>{distance}%</p>
        </div>
      </div>
    </div>
  );
};

// Alerts Tab
const AlertsTab = ({ currentUser, alerts, onAddAlert, onRemoveAlert, prices, stocks, cryptos }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  if (!currentUser) {
    return (
      <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
        <Bell size={32} className="mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Sign in to set price alerts</h3>
        <a href="/" className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm">Sign In / Sign Up</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bell size={20} className="text-amber-400" />Price Alerts</h2>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-bold text-sm flex items-center gap-2 hover:from-amber-400 hover:to-orange-400">
          <Plus size={16} />New Alert
        </button>
      </div>
      
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {activeAlerts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2"><BellRing size={14} className="text-cyan-400" />Active Alerts ({activeAlerts.length})</h3>
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} currentPrice={prices[alert.symbol]} onRemove={onRemoveAlert} />
                ))}
              </div>
            </div>
          )}
          
          {triggeredAlerts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2"><Check size={14} className="text-emerald-400" />Triggered Alerts ({triggeredAlerts.length})</h3>
              <div className="space-y-3 opacity-60">
                {triggeredAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} currentPrice={prices[alert.symbol]} onRemove={onRemoveAlert} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
          <Bell size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No alerts set</h3>
          <p className="text-slate-400 text-sm mb-4">Get notified when a stock or crypto hits your target price</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-bold text-sm">
            <Plus size={16} className="inline mr-1" />Create Your First Alert
          </button>
        </div>
      )}
      
      <AddAlertModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={onAddAlert} stocks={stocks} cryptos={cryptos} currentPrices={prices} />
    </div>
  );
};

// Portfolio Components
const AddHoldingModal = ({ isOpen, onClose, onAdd, stocks, cryptos }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [isCrypto, setIsCrypto] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (symbol.length >= 1) {
      const stockMatches = stocks.filter(s => s.ticker.toLowerCase().includes(symbol.toLowerCase())).slice(0, 3);
      const cryptoMatches = cryptos.filter(c => c.symbol.toLowerCase().includes(symbol.toLowerCase())).slice(0, 3);
      setSearchResults([...stockMatches.map(s => ({ ...s, isCrypto: false })), ...cryptoMatches.map(c => ({ symbol: c.symbol, name: c.name, ticker: c.symbol, isCrypto: true }))]);
      setShowSearch(true);
    } else { setSearchResults([]); setShowSearch(false); }
  }, [symbol, stocks, cryptos]);

  const selectResult = (result) => { setSymbol(result.ticker || result.symbol); setName(result.name); setIsCrypto(result.isCrypto); setShowSearch(false); };

  const handleSubmit = async () => {
    if (!symbol || !quantity || !purchasePrice) return;
    setIsAdding(true);
    await onAdd({ symbol, name: name || symbol, quantity: parseFloat(quantity), purchasePrice: parseFloat(purchasePrice), isCrypto });
    setSymbol(''); setName(''); setQuantity(''); setPurchasePrice(''); setIsCrypto(false);
    setIsAdding(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md animate-slideIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={20} className="text-cyan-400" />Add Holding</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL, BTC..." className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
            {showSearch && searchResults.length > 0 && (<div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-10">{searchResults.map(r => (<button key={r.ticker || r.symbol} onClick={() => selectResult(r)} className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center justify-between"><span className="text-white font-medium">{r.ticker || r.symbol}</span><span className={`text-[10px] px-2 py-0.5 rounded ${r.isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{r.isCrypto ? 'CRYPTO' : 'STOCK'}</span></button>))}</div>)}
          </div>
          <div><label className="block text-sm font-medium text-slate-400 mb-1">Name (optional)</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Apple Inc." className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" step="any" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Purchase Price</label><input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="150.00" step="any" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCrypto(false)} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${!isCrypto ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-700 text-slate-400'}`}>📈 Stock</button>
            <button onClick={() => setIsCrypto(true)} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${isCrypto ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-700 text-slate-400'}`}>🪙 Crypto</button>
          </div>
          <button onClick={handleSubmit} disabled={!symbol || !quantity || !purchasePrice || isAdding} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2">{isAdding ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}Add to Portfolio</button>
        </div>
      </div>
    </div>
  );
};

const HoldingCard = ({ holding, currentPrice, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const costBasis = holding.quantity * holding.purchasePrice;
  const currentValue = holding.quantity * (currentPrice || holding.purchasePrice);
  const profitLoss = currentValue - costBasis;
  const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
  const isProfit = profitLoss >= 0;
  const handleRemove = async () => { setIsRemoving(true); await onRemove(holding.id); setIsRemoving(false); };
  return (
    <div className={`p-4 rounded-xl border transition-all ${holding.isCrypto ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${holding.isCrypto ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{holding.isCrypto ? (CRYPTO_ICONS[holding.symbol] || holding.symbol.substring(0, 2)) : holding.symbol.substring(0, 2)}</div>
          <div><div className="flex items-center gap-2"><h4 className="font-bold text-white">{holding.symbol}</h4>{holding.isCrypto && <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">CRYPTO</span>}</div><p className="text-[10px] text-slate-500">{holding.quantity} shares @ ${holding.purchasePrice.toFixed(2)}</p></div>
        </div>
        <button onClick={handleRemove} disabled={isRemoving} className="p-1.5 hover:bg-rose-500/20 rounded-lg transition-colors">{isRemoving ? <Loader size={14} className="animate-spin text-slate-400" /> : <Trash2 size={14} className="text-slate-500 hover:text-rose-400" />}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-slate-900/50 rounded-lg"><p className="text-[10px] text-slate-500 mb-1">Cost Basis</p><p className="text-sm font-bold font-mono text-white">${costBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        <div className="p-2 bg-slate-900/50 rounded-lg"><p className="text-[10px] text-slate-500 mb-1">Current Value</p><p className="text-sm font-bold font-mono text-white">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}><p className="text-[10px] text-slate-500 mb-1">P/L</p><p className={`text-sm font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%</p></div>
      </div>
    </div>
  );
};

const PortfolioSummary = ({ holdings, prices }) => {
  let totalCostBasis = 0; let totalCurrentValue = 0;
  holdings.forEach(h => { const price = prices[h.symbol] || h.purchasePrice; totalCostBasis += h.quantity * h.purchasePrice; totalCurrentValue += h.quantity * price; });
  const totalProfitLoss = totalCurrentValue - totalCostBasis;
  const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;
  const isProfit = totalProfitLoss >= 0;
  const allocation = holdings.map(h => { const price = prices[h.symbol] || h.purchasePrice; const value = h.quantity * price; return { symbol: h.symbol, value, percent: totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0, isCrypto: h.isCrypto }; }).sort((a, b) => b.value - a.value);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"><p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={10} />Total Value</p><p className="text-2xl font-bold font-mono text-white">${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
        <div className={`p-4 rounded-xl border ${isProfit ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}><p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">{isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}Total P/L</p><p className={`text-2xl font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{isProfit ? '+' : ''}${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className={`text-sm font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>({isProfit ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%)</p></div>
      </div>
      {allocation.length > 0 && (<div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"><h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3"><PieChart size={14} className="text-purple-400" />Allocation</h4><div className="space-y-2">{allocation.slice(0, 5).map(a => (<div key={a.symbol} className="flex items-center gap-2"><span className={`w-8 text-xs font-bold ${a.isCrypto ? 'text-orange-400' : 'text-cyan-400'}`}>{a.symbol}</span><div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.isCrypto ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{ width: `${a.percent}%` }} /></div><span className="text-xs text-slate-400 w-12 text-right">{a.percent.toFixed(1)}%</span></div>))}</div></div>)}
    </div>
  );
};

const PortfolioTab = ({ currentUser, holdings, onAddHolding, onRemoveHolding, prices, stocks, cryptos }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  if (!currentUser) return (<div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><Briefcase size={32} className="mx-auto text-slate-600 mb-3" /><h3 className="text-lg font-bold text-white mb-2">Sign in to track your portfolio</h3><a href="/" className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm">Sign In / Sign Up</a></div>);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-purple-400" />My Portfolio</h2><button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm flex items-center gap-2 hover:from-cyan-400 hover:to-purple-400"><Plus size={16} />Add Holding</button></div>
      {holdings.length > 0 ? (<><PortfolioSummary holdings={holdings} prices={prices} /><div className="space-y-3"><h3 className="text-sm font-bold text-slate-400">Holdings ({holdings.length})</h3>{holdings.map(holding => (<HoldingCard key={holding.id} holding={holding} currentPrice={prices[holding.symbol]} onRemove={onRemoveHolding} />))}</div></>) : (<div className="p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><Briefcase size={40} className="mx-auto text-slate-600 mb-3" /><h3 className="text-lg font-bold text-white mb-2">No holdings yet</h3><p className="text-slate-400 text-sm mb-4">Start tracking your investments by adding your first holding</p><button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm"><Plus size={16} className="inline mr-1" />Add Your First Holding</button></div>)}
      <AddHoldingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={onAddHolding} stocks={stocks} cryptos={cryptos} />
    </div>
  );
};

// News Components
const NewsItem = ({ article, compact = false }) => {
  const openArticle = () => { if (article.url) window.open(article.url, '_blank'); };
  if (compact) return (<div onClick={openArticle} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 cursor-pointer transition-all group"><div className="flex items-start gap-3">{article.image && <img src={article.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" onError={(e) => e.target.style.display = 'none'} />}<div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">{article.title}</p><div className="flex items-center gap-2 mt-1"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${article.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{article.type === 'crypto' ? '🪙' : '📈'} {article.symbol || article.type}</span><span className="text-[10px] text-slate-500">{article.source}</span><span className="text-[10px] text-slate-500">{formatTimeAgo(article.timestamp)}</span></div></div><ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400 shrink-0" /></div></div>);
  return (<div onClick={openArticle} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 cursor-pointer transition-all group"><div className="flex gap-4">{article.image && <img src={article.image} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" onError={(e) => e.target.style.display = 'none'} />}<div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${article.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{article.type === 'crypto' ? '🪙 CRYPTO' : '📈 STOCKS'}</span>{article.symbol && <span className="text-xs text-slate-400">${article.symbol}</span>}</div><h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">{article.title}</h3>{article.summary && <p className="text-sm text-slate-400 line-clamp-2 mb-2">{truncateText(article.summary, 150)}</p>}<div className="flex items-center gap-3"><span className="text-xs text-slate-500">{article.source}</span><span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} />{formatTimeAgo(article.timestamp)}</span><ExternalLink size={12} className="text-slate-600 group-hover:text-cyan-400 ml-auto" /></div></div></div></div>);
};

const NewsFeed = ({ news, isLoading, onRefresh, title = "Market News" }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Newspaper size={14} className="text-cyan-400" />{title}</h3><button onClick={onRefresh} className="p-1 hover:bg-slate-700/50 rounded transition-colors"><RefreshCw size={12} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} /></button></div>
    {isLoading ? (<div className="space-y-3">{[1, 2, 3].map(i => (<div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 animate-pulse"><div className="flex gap-4"><div className="w-24 h-24 bg-slate-700 rounded-lg shrink-0" /><div className="flex-1 space-y-2"><div className="h-4 w-20 bg-slate-700 rounded" /><div className="h-5 w-full bg-slate-700 rounded" /><div className="h-4 w-3/4 bg-slate-700 rounded" /></div></div></div>))}</div>) : news.length > 0 ? (<div className="space-y-3">{news.map((article, i) => (<NewsItem key={article.id || i} article={article} />))}</div>) : (<div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><Newspaper size={24} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-500 text-sm">No news available</p></div>)}
  </div>
);

const SearchDropdown = ({ query, stockResults, cryptoResults, isLoading, onSelectStock, onSelectCrypto }) => {
  if (!query || query.length < 1) return null;
  const hasResults = stockResults.length > 0 || cryptoResults.length > 0;
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
      {isLoading ? (<div className="p-4 flex items-center justify-center gap-2"><Loader size={16} className="animate-spin text-cyan-400" /><span className="text-sm text-slate-400">Searching...</span></div>) : hasResults ? (
        <div className="max-h-80 overflow-y-auto">
          {stockResults.length > 0 && (<><div className="px-3 py-2 bg-slate-900/50 border-b border-slate-700"><span className="text-[10px] font-bold text-slate-500">STOCKS</span></div>{stockResults.map((stock) => (<button key={stock.symbol} onClick={() => onSelectStock(stock)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"><div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">{stock.symbol.substring(0, 2)}</div><div className="flex-1 text-left"><p className="font-bold text-white text-sm">{stock.symbol}</p><p className="text-xs text-slate-400 truncate">{stock.name}</p></div><Plus size={16} className="text-slate-500" /></button>))}</>)}
          {cryptoResults.length > 0 && (<><div className="px-3 py-2 bg-slate-900/50 border-b border-slate-700"><span className="text-[10px] font-bold text-orange-400">CRYPTO</span></div>{cryptoResults.map((crypto) => (<button key={crypto.id} onClick={() => onSelectCrypto(crypto)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"><div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">{crypto.image ? <img src={crypto.image} alt={crypto.symbol} className="w-6 h-6 rounded-full" /> : <span className="text-orange-400 font-bold">{CRYPTO_ICONS[crypto.symbol] || crypto.symbol.substring(0, 2)}</span>}</div><div className="flex-1 text-left"><p className="font-bold text-white text-sm">{crypto.symbol}</p><p className="text-xs text-slate-400 truncate">{crypto.name}</p></div><span className="text-[10px] text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">CRYPTO</span></button>))}</>)}
        </div>
      ) : (<div className="p-4 text-center"><p className="text-sm text-slate-400">No results found for "{query}"</p></div>)}
    </div>
  );
};

const StockCard = ({ stock, onSelect, isSelected, isInWatchlist, onToggleWatchlist, userVote, onVote, currentUser, isLoading }) => {
  const [localVotes, setLocalVotes] = useState({ up: stock.thumbsUp || 0, down: stock.thumbsDown || 0 });
  const [isVoting, setIsVoting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => { setLocalVotes({ up: stock.thumbsUp || 0, down: stock.thumbsDown || 0 }); }, [stock]);
  const handleVote = async (type, e) => { e.stopPropagation(); if (!currentUser) { alert('Please sign in to vote!'); return; } if (isVoting) return; setIsVoting(true); const voteValue = type === 'up' ? 'bullish' : 'bearish'; if (userVote === voteValue) { setLocalVotes(prev => ({ up: type === 'up' ? prev.up - 1 : prev.up, down: type === 'down' ? prev.down - 1 : prev.down })); await onVote(stock.ticker, null, stock.price); } else { setLocalVotes(prev => { const newVotes = { ...prev }; if (userVote === 'bullish') newVotes.up -= 1; if (userVote === 'bearish') newVotes.down -= 1; if (type === 'up') newVotes.up += 1; if (type === 'down') newVotes.down += 1; return newVotes; }); await onVote(stock.ticker, voteValue, stock.price); } setIsVoting(false); };
  const handleWatchlistToggle = async (e) => { e.stopPropagation(); if (!currentUser) { alert('Please sign in to use watchlist!'); return; } setIsAdding(true); await onToggleWatchlist(stock); setIsAdding(false); };
  const totalVotes = localVotes.up + localVotes.down; const bullishPercent = totalVotes > 0 ? Math.round((localVotes.up / totalVotes) * 100) : 50; const price = stock.price || 0; const change = stock.change || 0;
  return (
    <div onClick={() => onSelect(stock)} className={`relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/30'}`}>
      <div className="relative">
        <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{stock.ticker.substring(0, 2)}</div><div><h4 className="font-bold text-white text-sm">{stock.ticker}</h4><p className="text-[10px] text-slate-400 truncate max-w-[100px]">{stock.name}</p></div></div><button onClick={handleWatchlistToggle} disabled={isAdding} className={`p-1.5 rounded-lg transition-all ${isInWatchlist ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400 hover:text-amber-400'}`}>{isAdding ? <RefreshCw size={14} className="animate-spin" /> : <Star size={14} className={isInWatchlist ? 'fill-amber-400' : ''} />}</button></div>
        <div className="flex items-end justify-between mb-3"><div>{isLoading ? (<div className="animate-pulse"><div className="h-6 w-20 bg-slate-700 rounded mb-1"></div><div className="h-4 w-14 bg-slate-700 rounded"></div></div>) : (<><p className="text-xl font-bold font-mono text-white">${price.toFixed(2)}</p><div className={`flex items-center gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}<span className="text-xs font-mono">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span></div></>)}</div><div className="text-right"><div className="flex items-center gap-1 text-slate-400 mb-1"><Activity size={10} /><span className="text-[9px] font-bold">VOL</span></div><p className="text-xs font-mono text-slate-300">{formatVolume(stock.volume || 0)}</p></div></div>
        <div className="flex items-center gap-2"><button onClick={(e) => handleVote('up', e)} disabled={isVoting} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${userVote === 'bullish' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}><ThumbsUp size={12} className={userVote === 'bullish' ? 'fill-white' : ''} /><span className="text-xs font-bold">{localVotes.up.toLocaleString()}</span></button><button onClick={(e) => handleVote('down', e)} disabled={isVoting} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${userVote === 'bearish' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'}`}><ThumbsDown size={12} className={userVote === 'bearish' ? 'fill-white' : ''} /><span className="text-xs font-bold">{localVotes.down.toLocaleString()}</span></button></div>
        <div className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${bullishPercent}%` }} /></div>
        <p className="text-[10px] text-slate-500 mt-1 text-center">{bullishPercent}% Bullish</p>
        {userVote && <div className={`absolute top-2 right-12 px-1.5 py-0.5 rounded text-[9px] font-bold ${userVote === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>You: {userVote === 'bullish' ? '👍' : '👎'}</div>}
      </div>
    </div>
  );
};

const CryptoCard = ({ crypto, onSelect, isSelected, isInWatchlist, onToggleWatchlist, userVote, onVote, currentUser, isLoading }) => {
  const [localVotes, setLocalVotes] = useState({ up: crypto.thumbsUp || 100, down: crypto.thumbsDown || 50 });
  const [isVoting, setIsVoting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const handleVote = async (type, e) => { e.stopPropagation(); if (!currentUser) { alert('Please sign in to vote!'); return; } if (isVoting) return; setIsVoting(true); const voteValue = type === 'up' ? 'bullish' : 'bearish'; if (userVote === voteValue) { setLocalVotes(prev => ({ up: type === 'up' ? prev.up - 1 : prev.up, down: type === 'down' ? prev.down - 1 : prev.down })); await onVote(crypto.symbol, null, crypto.price); } else { setLocalVotes(prev => { const newVotes = { ...prev }; if (userVote === 'bullish') newVotes.up -= 1; if (userVote === 'bearish') newVotes.down -= 1; if (type === 'up') newVotes.up += 1; if (type === 'down') newVotes.down += 1; return newVotes; }); await onVote(crypto.symbol, voteValue, crypto.price); } setIsVoting(false); };
  const handleWatchlistToggle = async (e) => { e.stopPropagation(); if (!currentUser) { alert('Please sign in to use watchlist!'); return; } setIsAdding(true); await onToggleWatchlist({ ticker: crypto.symbol, name: crypto.name, isCrypto: true }); setIsAdding(false); };
  const totalVotes = localVotes.up + localVotes.down; const bullishPercent = totalVotes > 0 ? Math.round((localVotes.up / totalVotes) * 100) : 50; const change = crypto.change || 0;
  return (
    <div onClick={() => onSelect(crypto)} className={`relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:border-orange-500/30'}`}>
      <div className="relative">
        <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-orange-500/20 rounded text-[9px] font-bold text-orange-400">CRYPTO</div>
        <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${change >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>{crypto.image ? <img src={crypto.image} alt={crypto.symbol} className="w-7 h-7 rounded-full" /> : <span className={`text-lg font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{CRYPTO_ICONS[crypto.symbol] || crypto.symbol.substring(0, 2)}</span>}</div><div><h4 className="font-bold text-white text-sm">{crypto.symbol}</h4><p className="text-[10px] text-slate-400 truncate max-w-[100px]">{crypto.name}</p></div></div><button onClick={handleWatchlistToggle} disabled={isAdding} className={`p-1.5 rounded-lg transition-all mt-4 ${isInWatchlist ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400 hover:text-amber-400'}`}>{isAdding ? <RefreshCw size={14} className="animate-spin" /> : <Star size={14} className={isInWatchlist ? 'fill-amber-400' : ''} />}</button></div>
        <div className="flex items-end justify-between mb-3"><div>{isLoading ? (<div className="animate-pulse"><div className="h-6 w-20 bg-slate-700 rounded mb-1"></div><div className="h-4 w-14 bg-slate-700 rounded"></div></div>) : (<><p className="text-xl font-bold font-mono text-white">{formatCryptoPrice(crypto.price)}</p><div className={`flex items-center gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}<span className="text-xs font-mono">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span></div></>)}</div><div className="text-right"><p className="text-[10px] text-slate-500">MCap</p><p className="text-xs font-mono text-slate-400">{formatMarketCap(crypto.marketCap)}</p><div className="flex items-center justify-end gap-1 mt-1 text-slate-400"><Activity size={9} /><span className="text-[9px]">Vol</span></div><p className="text-[10px] font-mono text-slate-400">{formatVolume(crypto.volume)}</p></div></div>
        <div className="flex items-center gap-2"><button onClick={(e) => handleVote('up', e)} disabled={isVoting} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${userVote === 'bullish' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}><ThumbsUp size={12} className={userVote === 'bullish' ? 'fill-white' : ''} /><span className="text-xs font-bold">{localVotes.up.toLocaleString()}</span></button><button onClick={(e) => handleVote('down', e)} disabled={isVoting} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${userVote === 'bearish' ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'}`}><ThumbsDown size={12} className={userVote === 'bearish' ? 'fill-white' : ''} /><span className="text-xs font-bold">{localVotes.down.toLocaleString()}</span></button></div>
        <div className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${bullishPercent}%` }} /></div>
        <p className="text-[10px] text-slate-500 mt-1 text-center">{bullishPercent}% Bullish</p>
        {userVote && <div className={`absolute top-6 right-12 px-1.5 py-0.5 rounded text-[9px] font-bold ${userVote === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>You: {userVote === 'bullish' ? '👍' : '👎'}</div>}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, currentUser }) => {
  const [liked, setLiked] = useState(comment.likes?.includes(currentUser?.uid));
  const [likesCount, setLikesCount] = useState(comment.likeCount || 0);
  const handleLike = async () => { if (!currentUser) { alert('Please sign in to like!'); return; } if (liked) { setLiked(false); setLikesCount(prev => prev - 1); await unlikeComment(currentUser.uid, comment.id, comment.uid); } else { setLiked(true); setLikesCount(prev => prev + 1); await likeComment(currentUser.uid, comment.id, comment.uid); } };
  const timeAgo = (date) => { const s = Math.floor((new Date() - date) / 1000); if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`; };
  return (<div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"><div className="flex items-start gap-2"><span className="text-xl">{getAvatar(comment.uid)}</span><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-white">{comment.displayName}</span><span className="text-[10px] text-slate-500">{timeAgo(comment.createdAt)}</span></div><p className="text-xs text-slate-300 leading-relaxed">{comment.content}</p><button onClick={handleLike} className={`mt-2 text-[10px] flex items-center gap-1 transition-colors ${liked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}><Heart size={10} className={liked ? 'fill-rose-400' : ''} />{likesCount}</button></div></div></div>);
};

const DetailPanel = ({ item, onClose, userVote, isLoading, currentUser, comments, onAddComment, onRefreshComments, isCrypto, news, isLoadingNews }) => {
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('comments');
  if (!item) return null;
  const symbol = isCrypto ? item.symbol : item.ticker;
  const handlePostComment = async () => { if (!currentUser) { alert('Please sign in to comment!'); return; } if (!newComment.trim()) return; setIsPosting(true); await onAddComment(symbol, newComment.trim()); setNewComment(''); setIsPosting(false); onRefreshComments(symbol); };
  const price = item.price || 0; const change = item.change || 0;
  return (
    <div className={`bg-slate-800/50 rounded-2xl border ${isCrypto ? 'border-orange-500/30' : 'border-slate-700/50'} p-5 animate-slideIn max-h-[85vh] overflow-y-auto`}>
      <div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold overflow-hidden ${change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{isCrypto && item.image ? <img src={item.image} alt={symbol} className="w-10 h-10 rounded-full" /> : isCrypto ? <span>{CRYPTO_ICONS[symbol] || symbol.substring(0, 2)}</span> : symbol.substring(0, 2)}</div><div><div className="flex items-center gap-2"><h3 className="text-xl font-bold text-white">{symbol}</h3>{isCrypto && <span className="px-1.5 py-0.5 bg-orange-500/20 rounded text-[10px] font-bold text-orange-400">CRYPTO</span>}</div><p className="text-sm text-slate-400">{item.name}</p></div></div><button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg"><X size={16} className="text-slate-400" /></button></div>
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-900/50 rounded-xl">{isLoading ? (<div className="col-span-3 text-center py-2"><RefreshCw size={20} className="animate-spin mx-auto text-cyan-400" /></div>) : (<><div><p className="text-[10px] text-slate-500 mb-1">Price</p><p className="text-lg font-bold font-mono text-white">{isCrypto ? formatCryptoPrice(price) : `$${price.toFixed(2)}`}</p></div><div><p className="text-[10px] text-slate-500 mb-1">24h Change</p><p className={`text-lg font-bold font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</p></div><div><p className="text-[10px] text-slate-500 mb-1">{isCrypto ? 'Market Cap' : 'Open'}</p><p className="text-lg font-bold font-mono text-white">{isCrypto ? formatMarketCap(item.marketCap) : `$${(item.open || 0).toFixed(2)}`}</p></div></>)}</div>
      <div className="flex gap-2 mb-4"><button onClick={() => setActiveDetailTab('comments')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeDetailTab === 'comments' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}><MessageSquare size={14} />Comments ({comments.length})</button><button onClick={() => setActiveDetailTab('news')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeDetailTab === 'news' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}><Newspaper size={14} />News ({news.length})</button></div>
      {activeDetailTab === 'comments' && (<div>{currentUser && (<div className="flex gap-2 mb-3"><input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts..." className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" onKeyDown={(e) => e.key === 'Enter' && handlePostComment()} /><button onClick={handlePostComment} disabled={isPosting || !newComment.trim()} className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-lg transition-colors">{isPosting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}</button></div>)}<div className="space-y-2 max-h-60 overflow-y-auto">{comments.length > 0 ? comments.map(comment => <CommentItem key={comment.id} comment={comment} currentUser={currentUser} />) : <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first!</p>}</div></div>)}
      {activeDetailTab === 'news' && (<div className="space-y-2 max-h-80 overflow-y-auto">{isLoadingNews ? (<div className="text-center py-4"><Loader size={20} className="animate-spin mx-auto text-cyan-400" /></div>) : news.length > 0 ? (news.map((article, i) => <NewsItem key={article.id || i} article={article} compact={true} />)) : (<p className="text-center text-slate-500 text-sm py-4">No news available for {symbol}</p>)}</div>)}
    </div>
  );
};

const Leaderboard = ({ leaders, currentUser, onFollow, followingList, avatarMap }) => {
  const getRankBadge = (rank) => { if (rank === 1) return { bg: 'bg-amber-500', icon: '🥇' }; if (rank === 2) return { bg: 'bg-slate-400', icon: '🥈' }; if (rank === 3) return { bg: 'bg-amber-700', icon: '🥉' }; return { bg: 'bg-slate-700', icon: rank }; };
  const getAccuracyColor = (accuracy) => { if (accuracy >= 70) return 'text-emerald-400'; if (accuracy >= 50) return 'text-amber-400'; return 'text-rose-400'; };
  
  const getLeaderAvatar = (uid) => {
    if (avatarMap && avatarMap[uid]) return avatarMap[uid].avatar;
    return getAvatar(uid);
  };
  
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-1"><Trophy size={14} className="text-amber-400" />Top Traders</h3>
      <p className="text-[10px] text-slate-500 mb-3">Ranked by accuracy & engagement</p>
      <div className="space-y-2">
        {leaders.map((leader, i) => { const rank = getRankBadge(i + 1); const isFollowing = followingList?.includes(leader.uid);
          return (<div key={leader.uid} className="p-2 rounded-lg bg-slate-900/30 hover:bg-slate-700/30 transition-colors"><div className="flex items-center gap-2"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rank.bg} text-white`}>{typeof rank.icon === 'string' ? rank.icon : i + 1}</span><AvatarDisplay avatar={getLeaderAvatar(leader.uid)} size="md" /><div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{leader.displayName}</p><div className="flex items-center gap-2 text-[10px]"><span className={`flex items-center gap-0.5 ${getAccuracyColor(leader.accuracy)}`}><Target size={10} />{leader.accuracy}%</span>{leader.streak > 0 && <span className="flex items-center gap-0.5 text-orange-400"><Flame size={10} />{leader.streak}</span>}</div></div><div className="text-right"><p className="text-sm font-bold text-cyan-400">{leader.reputationScore}</p><p className="text-[9px] text-slate-500">REP</p></div>{currentUser && currentUser.uid !== leader.uid && (<button onClick={() => onFollow(leader.uid)} className={`p-1.5 rounded transition-colors ${isFollowing ? 'bg-slate-600 text-slate-400' : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400'}`}>{isFollowing ? <Check size={12} /> : <UserPlus size={12} />}</button>)}</div></div>);
        })}
        {leaders.length === 0 && <div className="text-center py-4"><Award size={24} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-500 text-sm">No traders yet</p></div>}
      </div>
    </div>
  );
};

// Global Community Chat
const GlobalChat = ({ currentUser, userProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = listenToGlobalChat(50, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSend = async () => {
    if (!currentUser || !newMessage.trim()) return;
    setIsSending(true);
    const avatar = userProfile?.avatar || getAvatar(currentUser.uid);
    const displayName = userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Trader';
    await sendGlobalMessage(currentUser.uid, displayName, newMessage.trim(), avatar);
    setNewMessage('');
    setIsSending(false);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    return Math.floor(diff / 86400000) + 'd';
  };

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Globe size={14} className="text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">Global Chat</h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-bold">{messages.length}</span>
        </div>
        <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <>
          {/* Messages */}
          <div ref={chatContainerRef} className="h-64 overflow-y-auto px-4 space-y-3 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <MessageSquare size={24} className="text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No messages yet</p>
                <p className="text-slate-600 text-xs">Start the conversation!</p>
              </div>
            ) : messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.uid === currentUser?.uid ? 'flex-row-reverse' : ''}`}>
                <AvatarDisplay avatar={msg.avatar} size="sm" />
                <div className={`max-w-[80%] ${msg.uid === currentUser?.uid ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5" style={{ justifyContent: msg.uid === currentUser?.uid ? 'flex-end' : 'flex-start' }}>
                    <span className="text-[10px] font-bold text-slate-300">{msg.displayName}</span>
                    <span className="text-[9px] text-slate-600">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <div className={`inline-block px-3 py-1.5 rounded-xl text-xs leading-relaxed ${
                    msg.uid === currentUser?.uid
                      ? 'bg-cyan-500/20 text-cyan-100 rounded-tr-sm'
                      : 'bg-slate-700/50 text-slate-300 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700/50">
            {currentUser ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message the community..."
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  maxLength={500}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !newMessage.trim()}
                  className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isSending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs py-2">
                <a href="/" className="text-cyan-400 hover:underline">Sign in</a> to join the chat
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Announcement Bell with notifications
const AnnouncementBell = ({ currentUser, announcements, unreadCount, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0 && currentUser) {
      announcements.forEach(a => {
        if (!a.readBy?.includes(currentUser.uid)) {
          onMarkRead(a.id);
        }
      });
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'feature': return { icon: '🚀', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      case 'alert': return { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'maintenance': return { icon: '🔧', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      default: return { icon: '📢', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  };

  return (
    <div ref={bellRef} className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
        <BellRing size={18} className={unreadCount > 0 ? 'text-amber-400' : 'text-slate-400'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing size={14} className="text-amber-400" />
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {announcements.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : announcements.map((a) => {
              const typeInfo = getTypeIcon(a.type);
              const isUnread = currentUser && !a.readBy?.includes(currentUser.uid);
              return (
                <div key={a.id} className={`p-3 border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${isUnread ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''}`}>
                  <div className="flex gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${typeInfo.bg}`}>{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-white">{a.displayName}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color} font-bold`}>{a.type}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{timeAgo(a.createdAt)}</p>
                    </div>
                    {isUnread && <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App
export default function Finnysights() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIsCrypto, setSelectedIsCrypto] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stocks');
  const [time, setTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  
  const [stocks, setStocks] = useState(DEFAULT_STOCKS.map(s => ({ ...s, price: 0, change: 0, high: 0, low: 0, open: 0 })));
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [cryptos, setCryptos] = useState([]);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  
  const [stockSearchResults, setStockSearchResults] = useState([]);
  const [cryptoSearchResults, setCryptoSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [itemNews, setItemNews] = useState([]);
  const [isLoadingItemNews, setIsLoadingItemNews] = useState(false);
  
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioPrices, setPortfolioPrices] = useState({});
  
  // Alerts state
  const [alerts, setAlerts] = useState([]);
  const [triggeredAlert, setTriggeredAlert] = useState(null);
  
  // Global chat, announcements, avatar map
  const [announcements, setAnnouncements] = useState([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [avatarMap, setAvatarMap] = useState({});

  const fetchNews = useCallback(async () => { setIsLoadingNews(true); const newsData = await getCombinedNews(); setNews(newsData); setIsLoadingNews(false); }, []);
  const fetchItemNews = useCallback(async (symbol, isCrypto) => { setIsLoadingItemNews(true); let newsData; if (isCrypto) { newsData = await getCryptoNewsBySymbol(symbol); } else { newsData = await getStockNews(symbol); } setItemNews(newsData || []); setIsLoadingItemNews(false); }, []);
  const fetchCryptoData = useCallback(async () => { setIsLoadingCrypto(true); try { const cryptoData = await getCryptoMarketData(10); setCryptos(cryptoData.map(c => ({ ...c, ticker: c.symbol, thumbsUp: Math.floor(Math.random() * 5000) + 1000, thumbsDown: Math.floor(Math.random() * 2000) + 500, sentiment: Math.floor(Math.random() * 40) + 50 }))); setIsOnline(true); } catch (error) { console.error('Error fetching crypto:', error); } setIsLoadingCrypto(false); }, []);
  const fetchStockPrices = useCallback(async () => { setIsLoadingStocks(true); try { const symbols = stocks.map(s => s.ticker); const quotes = await getMultipleQuotes(symbols); setStocks(prev => prev.map(stock => { const quote = quotes[stock.ticker]; if (quote) return { ...stock, price: quote.currentPrice, change: quote.changePercent, high: quote.high, low: quote.low, open: quote.open, volume: quote.volume }; return stock; })); setLastUpdated(new Date()); setIsOnline(true); } catch (error) { console.error('Error fetching stocks:', error); setIsOnline(false); } setIsLoadingStocks(false); }, [stocks]);

  // WebSocket real-time trade handler
  const handleLiveTrade = useCallback((trade) => {
    if (!trade || !trade.symbol) return;
    setStocks(prev => prev.map(stock => {
      if (stock.ticker === trade.symbol) {
        return { ...stock, price: trade.currentPrice, change: trade.changePercent, high: trade.high || stock.high, low: trade.low || stock.low, volume: trade.volume || stock.volume };
      }
      return stock;
    }));
    setLastUpdated(new Date());
    setIsOnline(true);
    if (!isLiveStreaming) setIsLiveStreaming(true);
  }, [isLiveStreaming]);

  // Initialize real-time data (REST + WebSocket)
  const initRealTime = useCallback(async () => {
    setIsLoadingStocks(true);
    try {
      const symbols = stocks.map(s => s.ticker);
      const initialQuotes = await initializeRealTimeData(symbols, handleLiveTrade);
      setStocks(prev => prev.map(stock => { const quote = initialQuotes[stock.ticker]; if (quote) return { ...stock, price: quote.currentPrice, change: quote.changePercent, high: quote.high, low: quote.low, open: quote.open, volume: quote.volume }; return stock; }));
      setLastUpdated(new Date()); setIsOnline(true);
      if (isMarketOpen()) setIsLiveStreaming(true);
    } catch (error) { console.error('Error initializing real-time data:', error); setIsOnline(false); }
    setIsLoadingStocks(false);
  }, [stocks, handleLiveTrade]);
  const fetchAllPrices = useCallback(async () => { await Promise.all([fetchStockPrices(), fetchCryptoData()]); setLastUpdated(new Date()); }, [fetchStockPrices, fetchCryptoData]);
  const fetchComments = useCallback(async (symbol) => { if (!symbol) return; const stockComments = await getStockComments(symbol, 20); setComments(stockComments); }, []);
  const fetchLeaderboard = useCallback(async () => { const topLeaders = await getTopTraders(5); setLeaders(topLeaders); }, []);
  const handleAddComment = async (symbol, content) => { if (!currentUser) return; await addComment(currentUser.uid, symbol, content); };
  const handleFollow = async (targetUid) => { if (!currentUser) return; const isCurrentlyFollowing = userProfile?.following?.includes(targetUid); if (isCurrentlyFollowing) await unfollowUser(currentUser.uid, targetUid); else await followUser(currentUser.uid, targetUid); const updatedProfile = await getUserProfile(currentUser.uid); setUserProfile(updatedProfile); fetchLeaderboard(); };

  const fetchPortfolio = useCallback(async () => { if (!currentUser) return; const portfolioData = await getPortfolio(currentUser.uid); setPortfolio(portfolioData || []); }, [currentUser]);
  const updatePortfolioPrices = useCallback(() => { const prices = {}; stocks.forEach(s => { if (s.price) prices[s.ticker] = s.price; }); cryptos.forEach(c => { if (c.price) prices[c.symbol] = c.price; }); setPortfolioPrices(prices); }, [stocks, cryptos]);
  const handleAddHolding = async (holding) => { if (!currentUser) return; const result = await addHolding(currentUser.uid, holding); if (result) setPortfolio(prev => [...prev, result]); };
  const handleRemoveHolding = async (holdingId) => { if (!currentUser) return; const success = await removeHolding(currentUser.uid, holdingId); if (success) setPortfolio(prev => prev.filter(h => h.id !== holdingId)); };

  // Alert functions
  const handleAddAlert = async (alert) => {
    if (!currentUser) return;
    const success = await addPriceAlert(currentUser.uid, alert);
    if (success) {
      const profile = await getUserProfile(currentUser.uid);
      setAlerts(profile?.alerts || []);
    }
  };

  const handleRemoveAlert = async (alertId) => {
    if (!currentUser) return;
    const success = await removePriceAlert(currentUser.uid, alertId);
    if (success) setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Check alerts when prices update
  const checkAlerts = useCallback(() => {
    if (!alerts.length) return;
    
    alerts.forEach(alert => {
      if (alert.triggered) return;
      
      const currentPrice = portfolioPrices[alert.symbol];
      if (!currentPrice) return;
      
      const isTriggered = alert.condition === 'above' 
        ? currentPrice >= alert.targetPrice 
        : currentPrice <= alert.targetPrice;
      
      if (isTriggered) {
        setTriggeredAlert({ ...alert, currentPrice });
        // Play sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleEg4Y5mxoX1UPTxkgqCtgE42PGB8oK+DWTs+Z4SssoRaOkNqjbS5hFo+Q2qItrqGXEJDbIq3u4teQkRsjbe7il5DRW6Nur2MYENFb466vY5iREZwj7y+kGRFRnKRvb+TZkdIc5O/wJZpSEl1lb/Al2pJSnWWwMGZbEpLd5fBwpttS0x4mcPDnW9MTXqaw8SfcU1OepvExKByTk97nMXFoXNPUHydxsajdFBRfZ7Hx6V2UVJ+n8jIpndSU3+gycmpeFNUgKHJyat6VFWBosrKrHtVVoKjy8utfFZXg6TLy658V1iEpcvMsH5YWYWmzM2xf1lZhqfNzbOAWlqHp87Os4FbW4iozs+0gl1ciajOz7WDXl2Kqc/QtIReXoqq0NC1hV9fi6vQ0baGYGCMq9DRt4dhYI2s0dK4iGJhjqzR0rmJY2KOrNHTuopkY4+t0tS7i2VkjqJkZw==');
          audio.volume = 0.3;
          audio.play();
        } catch (e) {}
      }
    });
  }, [alerts, portfolioPrices]);

  useEffect(() => { checkAlerts(); }, [portfolioPrices, checkAlerts]);

  useEffect(() => { const handleClickOutside = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
  useEffect(() => { if (searchQuery.length < 2) { setStockSearchResults([]); setCryptoSearchResults([]); setShowSearchDropdown(false); return; } if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); searchTimeoutRef.current = setTimeout(async () => { setIsSearching(true); setShowSearchDropdown(true); const [stockResults, cryptoResults] = await Promise.all([searchStocks(searchQuery), searchCrypto(searchQuery)]); setStockSearchResults(stockResults); setCryptoSearchResults(cryptoResults); setIsSearching(false); }, 300); return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); }; }, [searchQuery]);
  const handleSearchSelectStock = async (result) => { setShowSearchDropdown(false); setSearchQuery(''); setActiveTab('stocks'); const existingStock = stocks.find(s => s.ticker === result.symbol); if (existingStock) { setSelectedItem(existingStock); setSelectedIsCrypto(false); return; } const quote = await getQuote(result.symbol); const newStock = { ticker: result.symbol, name: result.name, sector: 'Stock', price: quote?.currentPrice || 0, change: quote?.changePercent || 0, high: quote?.high || 0, low: quote?.low || 0, open: quote?.open || 0, volume: quote?.volume || 0, thumbsUp: 0, thumbsDown: 0, sentiment: 50, sentimentLabel: 'Neutral' }; setStocks(prev => [newStock, ...prev]); setSelectedItem(newStock); setSelectedIsCrypto(false); if (isMarketOpen()) subscribeSymbol(result.symbol); };
  const handleSearchSelectCrypto = async (result) => { setShowSearchDropdown(false); setSearchQuery(''); setActiveTab('crypto'); const existingCrypto = cryptos.find(c => c.symbol === result.symbol); if (existingCrypto) { setSelectedItem(existingCrypto); setSelectedIsCrypto(true); return; } const newCrypto = { ...result, ticker: result.symbol, price: 0, change: 0, thumbsUp: 100, thumbsDown: 50, sentiment: 50 }; setCryptos(prev => [newCrypto, ...prev]); setSelectedItem(newCrypto); setSelectedIsCrypto(true); };
  
  useEffect(() => { initRealTime(); fetchCryptoData(); fetchLeaderboard(); fetchNews(); const pollInterval = setInterval(() => { if (!isMarketOpen()) { fetchStockPrices(); } fetchCryptoData(); }, isMarketOpen() ? 120000 : 60000); return () => { clearInterval(pollInterval); disconnectWebSocket(); }; }, []);
  useEffect(() => { if (selectedItem) { const symbol = selectedIsCrypto ? selectedItem.symbol : selectedItem.ticker; fetchComments(symbol); fetchItemNews(symbol, selectedIsCrypto); } }, [selectedItem, selectedIsCrypto, fetchComments, fetchItemNews]);
  useEffect(() => { updatePortfolioPrices(); }, [stocks, cryptos, updatePortfolioPrices]);
  useEffect(() => { if (currentUser) fetchPortfolio(); }, [currentUser, fetchPortfolio]);
  
  // Fetch real avatars when leaders change
  useEffect(() => {
    if (leaders.length > 0) {
      const uids = leaders.map(l => l.uid);
      getUserAvatars(uids).then(map => setAvatarMap(map));
    }
  }, [leaders]);

  // Listen to announcements in real-time
  useEffect(() => {
    const unsubscribe = listenToAnnouncements((anns) => {
      setAnnouncements(anns);
      if (currentUser) {
        const unread = anns.filter(a => !a.readBy?.includes(currentUser.uid)).length;
        setUnreadAnnouncements(unread);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [currentUser]);

  const handleMarkAnnouncementRead = async (announcementId) => {
    if (!currentUser) return;
    await markAnnouncementRead(currentUser.uid, announcementId);
    setUnreadAnnouncements(prev => Math.max(0, prev - 1));
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingWatchlist(true);
        const profile = await getUserProfile(user.uid); setUserProfile(profile);
        const userWatchlist = await getWatchlist(user.uid); setWatchlist(userWatchlist || []);
        const votes = await getUserVotes(user.uid); setUserVotes(votes || {});
        const portfolioData = await getPortfolio(user.uid); setPortfolio(portfolioData || []);
        setAlerts(profile?.alerts || []);
        setIsLoadingWatchlist(false);
      } else { setUserProfile(null); setWatchlist([]); setUserVotes({}); setPortfolio([]); setAlerts([]); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error('Sign out error:', error); } };
  const handleToggleWatchlist = async (item) => { if (!currentUser) return; const symbol = item.ticker || item.symbol; const isInWatchlist = watchlist.some(s => s.symbol === symbol); if (isInWatchlist) { const success = await removeFromWatchlist(currentUser.uid, symbol); if (success) setWatchlist(prev => prev.filter(s => s.symbol !== symbol)); } else { const success = await addToWatchlist(currentUser.uid, { symbol, name: item.name }); if (success) setWatchlist(prev => [...prev, { symbol, name: item.name, addedAt: new Date().toISOString() }]); } };
  const handleVote = async (symbol, vote, price) => { if (!currentUser) return; if (vote === null) { await removeVote(currentUser.uid, symbol); setUserVotes(prev => { const updated = { ...prev }; delete updated[symbol]; return updated; }); } else { await recordVote(currentUser.uid, symbol, vote, price); setUserVotes(prev => ({ ...prev, [symbol]: { vote, votedAt: new Date().toISOString(), priceAtVote: price } })); } setTimeout(fetchLeaderboard, 1000); };
  const getUserVoteForSymbol = (symbol) => userVotes[symbol]?.vote || null;
  const isInWatchlist = (symbol) => watchlist.some(s => s.symbol === symbol);
  const isLoading = activeTab === 'crypto' ? isLoadingCrypto : isLoadingStocks;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <AnimatedBackground />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap'); * { font-family: 'Outfit', sans-serif; } .font-mono { font-family: 'JetBrains Mono', monospace; } @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } } @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slideIn { animation: slideIn 0.5s ease-out forwards; } .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`}</style>
      
      {/* Alert Toast */}
      {triggeredAlert && (
        <AlertToast 
          alert={triggeredAlert} 
          currentPrice={triggeredAlert.currentPrice}
          onDismiss={() => setTriggeredAlert(null)} 
        />
      )}
      
      <header className="relative z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2"><div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20"><ThumbsUpLogo size={22} className="text-white" /></div><span className="text-xl font-black tracking-tight hidden sm:block">finnysights</span></a>
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50"><Clock size={14} className="text-cyan-400" /><span className="font-mono text-sm text-slate-300">{time.toLocaleTimeString('en-US', { hour12: false })}</span><div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} /></div>
              <div className="hidden lg:block"><MarketCountdown /></div>
            </div>
            <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" placeholder="Search stocks or crypto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" />{searchQuery && <button onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={14} /></button>}</div>
              {showSearchDropdown && <SearchDropdown query={searchQuery} stockResults={stockSearchResults} cryptoResults={cryptoSearchResults} isLoading={isSearching} onSelectStock={handleSearchSelectStock} onSelectCrypto={handleSearchSelectCrypto} />}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchAllPrices} disabled={isLoading} className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50"><RefreshCw size={18} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} /></button>
              {currentUser ? (<><AnnouncementBell currentUser={currentUser} announcements={announcements} unreadCount={unreadAnnouncements} onMarkRead={handleMarkAnnouncementRead} /><a href="/dashboard" className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50"><Settings size={18} className="text-slate-400" /></a><button onClick={handleSignOut} className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50"><LogOut size={18} className="text-slate-400" /></button><AvatarDisplay avatar={userProfile?.avatar || getAvatar(currentUser.uid)} size="lg" className="ring-2 ring-cyan-500/30" /></>) : (<a href="/" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-sm font-bold hover:from-cyan-400 hover:to-purple-400">Sign In</a>)}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/50 bg-slate-900/30"><div className="max-w-7xl mx-auto px-4 py-2"><div className="flex items-center gap-3 overflow-x-auto pb-1"><span className="text-[10px] text-slate-500 font-bold shrink-0">MARKETS</span>{EXCHANGES.map(exchange => <ExchangeBadge key={exchange.id} exchange={exchange} />)}</div></div></div>
      </header>
      
      {lastUpdated && (<div className="relative z-10 bg-slate-800/30 border-b border-slate-700/30"><div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2">{isLiveStreaming ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span><span className="text-[10px] font-bold text-red-400">LIVE</span></> : <Wifi size={12} className={isOnline ? 'text-emerald-400' : 'text-rose-400'} />}<span className="text-[10px] text-slate-500">{isLiveStreaming ? 'Real-time streaming' : isOnline ? 'REST polling' : 'Offline'} • Updated: {lastUpdated.toLocaleTimeString()}</span></div></div>)}
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={() => setActiveTab('stocks')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'stocks' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><TrendingUp size={14} />Stocks</button>
              <button onClick={() => setActiveTab('crypto')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'crypto' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Bitcoin size={14} />Crypto</button>
              <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'portfolio' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Briefcase size={14} />Portfolio</button>
              <button onClick={() => setActiveTab('alerts')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'alerts' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Bell size={14} />Alerts{alerts.filter(a => !a.triggered).length > 0 ? ` (${alerts.filter(a => !a.triggered).length})` : ''}</button>
              <button onClick={() => setActiveTab('news')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'news' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Newspaper size={14} />News</button>
              <button onClick={() => setActiveTab('watchlist')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'watchlist' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Star size={14} />Watchlist{watchlist.length > 0 ? ` (${watchlist.length})` : ''}</button>
            </div>
            
            {activeTab === 'alerts' && <AlertsTab currentUser={currentUser} alerts={alerts} onAddAlert={handleAddAlert} onRemoveAlert={handleRemoveAlert} prices={portfolioPrices} stocks={stocks} cryptos={cryptos} />}
            {activeTab === 'portfolio' && <PortfolioTab currentUser={currentUser} holdings={portfolio} onAddHolding={handleAddHolding} onRemoveHolding={handleRemoveHolding} prices={portfolioPrices} stocks={stocks} cryptos={cryptos} />}
            {activeTab === 'news' && <NewsFeed news={news} isLoading={isLoadingNews} onRefresh={fetchNews} title="Latest Market News" />}
            {activeTab === 'watchlist' && !currentUser && (<div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><Star size={32} className="mx-auto text-slate-600 mb-3" /><h3 className="text-lg font-bold text-white mb-2">Sign in to use Watchlist</h3><a href="/" className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm">Sign In / Sign Up</a></div>)}
            {activeTab === 'watchlist' && currentUser && watchlist.length === 0 && !isLoadingWatchlist && (<div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><Star size={32} className="mx-auto text-slate-600 mb-3" /><h3 className="text-lg font-bold text-white mb-2">Your watchlist is empty</h3><button onClick={() => setActiveTab('stocks')} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm">Browse Markets</button></div>)}
            {activeTab === 'stocks' && (<div className="grid sm:grid-cols-2 gap-4">{stocks.map((stock, i) => (<div key={stock.ticker} style={{ animationDelay: `${i * 50}ms` }}><StockCard stock={stock} onSelect={(s) => { setSelectedItem(s); setSelectedIsCrypto(false); }} isSelected={!selectedIsCrypto && selectedItem?.ticker === stock.ticker} isInWatchlist={isInWatchlist(stock.ticker)} onToggleWatchlist={handleToggleWatchlist} userVote={getUserVoteForSymbol(stock.ticker)} onVote={handleVote} currentUser={currentUser} isLoading={isLoadingStocks} /></div>))}</div>)}
            {activeTab === 'crypto' && (<div className="grid sm:grid-cols-2 gap-4">{cryptos.map((crypto, i) => (<div key={crypto.id || crypto.symbol} style={{ animationDelay: `${i * 50}ms` }}><CryptoCard crypto={crypto} onSelect={(c) => { setSelectedItem(c); setSelectedIsCrypto(true); }} isSelected={selectedIsCrypto && selectedItem?.symbol === crypto.symbol} isInWatchlist={isInWatchlist(crypto.symbol)} onToggleWatchlist={handleToggleWatchlist} userVote={getUserVoteForSymbol(crypto.symbol)} onVote={handleVote} currentUser={currentUser} isLoading={isLoadingCrypto} /></div>))}</div>)}
            {activeTab === 'watchlist' && currentUser && watchlist.length > 0 && (<div className="grid sm:grid-cols-2 gap-4">{watchlist.map((item, i) => { const stock = stocks.find(s => s.ticker === item.symbol); const crypto = cryptos.find(c => c.symbol === item.symbol); if (stock) return <div key={item.symbol} style={{ animationDelay: `${i * 50}ms` }}><StockCard stock={stock} onSelect={(s) => { setSelectedItem(s); setSelectedIsCrypto(false); }} isSelected={!selectedIsCrypto && selectedItem?.ticker === stock.ticker} isInWatchlist={true} onToggleWatchlist={handleToggleWatchlist} userVote={getUserVoteForSymbol(stock.ticker)} onVote={handleVote} currentUser={currentUser} isLoading={isLoadingStocks} /></div>; if (crypto) return <div key={item.symbol} style={{ animationDelay: `${i * 50}ms` }}><CryptoCard crypto={crypto} onSelect={(c) => { setSelectedItem(c); setSelectedIsCrypto(true); }} isSelected={selectedIsCrypto && selectedItem?.symbol === crypto.symbol} isInWatchlist={true} onToggleWatchlist={handleToggleWatchlist} userVote={getUserVoteForSymbol(crypto.symbol)} onVote={handleVote} currentUser={currentUser} isLoading={isLoadingCrypto} /></div>; return null; })}</div>)}
          </div>
          
          <div className="space-y-4">
            {selectedItem ? (<DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} userVote={getUserVoteForSymbol(selectedIsCrypto ? selectedItem.symbol : selectedItem.ticker)} isLoading={isLoading} currentUser={currentUser} comments={comments} onAddComment={handleAddComment} onRefreshComments={fetchComments} isCrypto={selectedIsCrypto} news={itemNews} isLoadingNews={isLoadingItemNews} />) : (<div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center"><BarChart3 size={32} className="mx-auto text-slate-600 mb-3" /><p className="text-slate-400 text-sm">Select a stock or crypto to view details</p></div>)}
            <Leaderboard leaders={leaders} currentUser={currentUser} onFollow={handleFollow} followingList={userProfile?.following || []} avatarMap={avatarMap} />
            <GlobalChat currentUser={currentUser} userProfile={userProfile} />
          </div>
        </div>
      </main>
    </div>
  );
}
