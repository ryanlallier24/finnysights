import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Search, Globe, BarChart3, MessageSquare, Users, Zap, ChevronRight, Star, Clock, Volume2, Eye, Filter, Bell, Settings, RefreshCw, Activity, Plus, X, Check, Heart, Trash2, LogOut } from 'lucide-react';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addToWatchlist, removeFromWatchlist, getWatchlist, recordVote, getUserProfile } from './firestore.js';

// Thumbs Up Logo Component
const ThumbsUpLogo = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Mock data for global exchanges
const EXCHANGES = [
  { id: 'nyse', name: 'NYSE', country: 'US', flag: '🇺🇸', status: 'open', change: 0.42 },
  { id: 'nasdaq', name: 'NASDAQ', country: 'US', flag: '🇺🇸', status: 'open', change: 0.67 },
  { id: 'lse', name: 'LSE', country: 'UK', flag: '🇬🇧', status: 'closed', change: -0.12 },
  { id: 'tse', name: 'TSE', country: 'JP', flag: '🇯🇵', status: 'closed', change: 1.24 },
  { id: 'sse', name: 'SSE', country: 'CN', flag: '🇨🇳', status: 'closed', change: -0.34 },
  { id: 'hkex', name: 'HKEX', country: 'HK', flag: '🇭🇰', status: 'closed', change: 0.89 },
  { id: 'euronext', name: 'Euronext', country: 'EU', flag: '🇪🇺', status: 'open', change: 0.23 },
  { id: 'asx', name: 'ASX', country: 'AU', flag: '🇦🇺', status: 'closed', change: -0.56 },
];

const STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 178.42, change: 2.34, volume: '45.2M', exchange: 'NASDAQ', sector: 'Technology', thumbsUp: 8934, thumbsDown: 1243, sentiment: 87, sentimentLabel: 'Very Bullish' },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -3.12, volume: '89.1M', exchange: 'NASDAQ', sector: 'Automotive', thumbsUp: 12453, thumbsDown: 8932, sentiment: 58, sentimentLabel: 'Neutral' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 487.23, change: 12.45, volume: '67.3M', exchange: 'NASDAQ', sector: 'Technology', thumbsUp: 15678, thumbsDown: 2134, sentiment: 92, sentimentLabel: 'Extremely Bullish' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: 1.23, volume: '23.4M', exchange: 'NASDAQ', sector: 'Technology', thumbsUp: 7823, thumbsDown: 1923, sentiment: 81, sentimentLabel: 'Bullish' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 145.78, change: -0.89, volume: '34.2M', exchange: 'NASDAQ', sector: 'E-Commerce', thumbsUp: 6234, thumbsDown: 2341, sentiment: 73, sentimentLabel: 'Bullish' },
  { ticker: 'JPM', name: 'JPMorgan Chase', price: 167.34, change: 0.45, volume: '12.1M', exchange: 'NYSE', sector: 'Finance', thumbsUp: 4523, thumbsDown: 1876, sentiment: 71, sentimentLabel: 'Bullish' },
  { ticker: 'BABA', name: 'Alibaba Group', price: 78.23, change: -1.67, volume: '28.9M', exchange: 'HKEX', sector: 'E-Commerce', thumbsUp: 3421, thumbsDown: 4532, sentiment: 43, sentimentLabel: 'Bearish' },
  { ticker: 'TSM', name: 'Taiwan Semi.', price: 98.45, change: 3.21, volume: '18.7M', exchange: 'TSE', sector: 'Technology', thumbsUp: 8934, thumbsDown: 1234, sentiment: 88, sentimentLabel: 'Very Bullish' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 141.23, change: 0.67, volume: '21.3M', exchange: 'NASDAQ', sector: 'Technology', thumbsUp: 9234, thumbsDown: 2134, sentiment: 81, sentimentLabel: 'Bullish' },
  { ticker: 'META', name: 'Meta Platforms', price: 367.89, change: 4.21, volume: '19.8M', exchange: 'NASDAQ', sector: 'Technology', thumbsUp: 7823, thumbsDown: 3421, sentiment: 70, sentimentLabel: 'Bullish' },
];

const SENTIMENT_SOURCES = [
  { name: 'Reuters Analytics', score: 78, trend: 'up', reliability: 94 },
  { name: 'Bloomberg Sentiment', score: 82, trend: 'up', reliability: 96 },
  { name: 'S&P Market Intel', score: 71, trend: 'neutral', reliability: 92 },
  { name: 'Refinitiv Data', score: 85, trend: 'up', reliability: 91 },
];

const SOCIAL_POSTS = [
  { user: 'TradingPro', avatar: '👨‍💼', ticker: 'NVDA', content: 'AI boom continues! NVDA breaking through resistance levels. Target $550 EOY.', time: '2m', likes: 234, sentiment: 'bullish' },
  { user: 'MarketWatcher', avatar: '📊', ticker: 'TSLA', content: 'Watching TSLA closely at this support level. Could go either way from here.', time: '5m', likes: 156, sentiment: 'neutral' },
  { user: 'ValueInvestor', avatar: '🎯', ticker: 'AAPL', content: 'AAPL fundamentals remain strong. Services revenue growth is undervalued.', time: '12m', likes: 423, sentiment: 'bullish' },
  { user: 'BearishBen', avatar: '🐻', ticker: 'BABA', content: 'China tech facing headwinds. BABA might test lower support soon.', time: '18m', likes: 89, sentiment: 'bearish' },
];

// Animated background component
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
    <div className="absolute inset-0 opacity-30">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
    <svg className="absolute inset-0 w-full h-full opacity-5">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// Exchange status badge
const ExchangeBadge = ({ exchange }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer ${
    exchange.status === 'open' 
      ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400' 
      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
  }`}>
    <span className="text-lg">{exchange.flag}</span>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-white">{exchange.name}</span>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${exchange.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className={`text-[10px] ${exchange.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {exchange.change >= 0 ? '+' : ''}{exchange.change}%
        </span>
      </div>
    </div>
  </div>
);

// Sentiment meter component
const SentimentMeter = ({ score, size = 'md' }) => {
  const getColor = (s) => {
    if (s >= 80) return 'from-emerald-400 to-cyan-400';
    if (s >= 60) return 'from-cyan-400 to-blue-400';
    if (s >= 40) return 'from-amber-400 to-orange-400';
    return 'from-rose-400 to-red-500';
  };

  const sizes = {
    sm: { width: 60, height: 6, text: 'text-xs' },
    md: { width: 100, height: 8, text: 'text-sm' },
    lg: { width: 150, height: 10, text: 'text-base' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: s.width, height: s.height }}>
        <div className="absolute inset-0 bg-slate-700/50 rounded-full" />
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getColor(score)} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
        <div className="absolute inset-0 rounded-full" style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }} />
      </div>
      <span className={`font-mono font-bold ${s.text} ${
        score >= 60 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400'
      }`}>{score}%</span>
    </div>
  );
};

// Stock card component with watchlist functionality
const StockCard = ({ stock, onSelect, isSelected, isInWatchlist, onToggleWatchlist, onVote, currentUser }) => {
  const [localVotes, setLocalVotes] = useState({ up: stock.thumbsUp, down: stock.thumbsDown });
  const [userVote, setUserVote] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleVote = async (type, e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      alert('Please log in to vote');
      return;
    }

    if (userVote === type) {
      setUserVote(null);
      setLocalVotes(prev => ({
        ...prev,
        [type === 'up' ? 'up' : 'down']: prev[type === 'up' ? 'up' : 'down'] - 1
      }));
    } else {
      if (userVote) {
        setLocalVotes(prev => ({
          ...prev,
          [userVote === 'up' ? 'up' : 'down']: prev[userVote === 'up' ? 'up' : 'down'] - 1
        }));
      }
      setUserVote(type);
      setLocalVotes(prev => ({
        ...prev,
        [type === 'up' ? 'up' : 'down']: prev[type === 'up' ? 'up' : 'down'] + 1
      }));
      
      // Save vote to Firestore
      await recordVote(currentUser.uid, stock.ticker, type === 'up' ? 'bullish' : 'bearish');
    }
  };

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to use watchlist');
      return;
    }
    setIsAdding(true);
    await onToggleWatchlist(stock);
    setIsAdding(false);
  };

  const totalVotes = localVotes.up + localVotes.down;
  const bullishPercent = totalVotes > 0 ? Math.round((localVotes.up / totalVotes) * 100) : 50;

  return (
    <div 
      onClick={() => onSelect(stock)}
      className={`relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
          : 'bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/50'
      }`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
              stock.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {stock.ticker.substring(0, 2)}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{stock.ticker}</h4>
              <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{stock.name}</p>
            </div>
          </div>
          
          {/* Watchlist button */}
          <button
            onClick={handleWatchlistToggle}
            disabled={isAdding}
            className={`p-1.5 rounded-lg transition-all ${
              isInWatchlist 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-amber-400'
            } ${isAdding ? 'opacity-50' : ''}`}
          >
            {isAdding ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Star size={14} className={isInWatchlist ? 'fill-amber-400' : ''} />
            )}
          </button>
        </div>
        
        {/* Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xl font-bold font-mono text-white">${stock.price}</p>
            <div className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="text-xs font-mono">{stock.change >= 0 ? '+' : ''}{stock.change}%</span>
            </div>
          </div>
          <SentimentMeter score={stock.sentiment} size="sm" />
        </div>
        
        {/* Voting */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => handleVote('up', e)}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              userVote === 'up' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <ThumbsUp size={12} className={userVote === 'up' ? 'fill-white' : ''} />
            <span className="text-xs font-bold">{localVotes.up.toLocaleString()}</span>
          </button>
          <button 
            onClick={(e) => handleVote('down', e)}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              userVote === 'down' 
                ? 'bg-rose-500 text-white' 
                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <ThumbsDown size={12} className={userVote === 'down' ? 'fill-white' : ''} />
            <span className="text-xs font-bold">{localVotes.down.toLocaleString()}</span>
          </button>
        </div>
        
        {/* Bullish bar */}
        <div className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${bullishPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1 text-center">{bullishPercent}% Bullish</p>
      </div>
    </div>
  );
};

// Stock detail panel
const StockDetailPanel = ({ stock, onClose }) => {
  if (!stock) return null;
  
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 animate-slideIn">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
            stock.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {stock.ticker.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{stock.ticker}</h3>
            <p className="text-sm text-slate-400">{stock.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">{stock.exchange}</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">{stock.sector}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      
      {/* Price section */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-900/50 rounded-xl">
        <div>
          <p className="text-[10px] text-slate-500 mb-1">Price</p>
          <p className="text-lg font-bold font-mono text-white">${stock.price}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-1">24h Change</p>
          <p className={`text-lg font-bold font-mono ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-1">Volume</p>
          <p className="text-lg font-bold font-mono text-white">{stock.volume}</p>
        </div>
      </div>
      
      {/* Sentiment section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-300">Market Sentiment</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            stock.sentiment >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
            stock.sentiment >= 40 ? 'bg-amber-500/20 text-amber-400' :
            'bg-rose-500/20 text-rose-400'
          }`}>{stock.sentimentLabel}</span>
        </div>
        <SentimentMeter score={stock.sentiment} size="lg" />
      </div>
      
      {/* Sentiment sources */}
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 mb-2">Sentiment Sources</p>
        <div className="space-y-2">
          {SENTIMENT_SOURCES.map((source, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-2">
                {source.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                {source.trend === 'down' && <TrendingDown size={14} className="text-rose-400" />}
                {source.trend === 'neutral' && <Activity size={14} className="text-amber-400" />}
                <span className="text-xs text-slate-300">{source.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold ${
                  source.score >= 70 ? 'text-emerald-400' : source.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>{source.score}</span>
                <span className="text-[10px] text-slate-500">{source.reliability}% reliable</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
          <Eye size={16} />
          View Full Analysis
        </button>
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </div>
  );
};

// Social feed component
const SocialFeed = () => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
      <MessageSquare size={14} className="text-purple-400" />
      Community Pulse
    </h3>
    {SOCIAL_POSTS.map((post, i) => (
      <div 
        key={i} 
        className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-purple-500/30 transition-all"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="flex items-start gap-2">
          <span className="text-2xl">{post.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">{post.user}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                post.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                post.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
                'bg-slate-600/50 text-slate-400'
              }`}>${post.ticker}</span>
              <span className="text-[10px] text-slate-500 ml-auto flex items-center gap-1">
                <Clock size={10} />{post.time}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-3 mt-2">
              <button className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1">
                <Heart size={10} />{post.likes}
              </button>
              <button className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <MessageSquare size={10} />Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Main App
export default function Finnysights() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [time, setTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load watchlist from Firestore
        setIsLoadingWatchlist(true);
        const userWatchlist = await getWatchlist(user.uid);
        setWatchlist(userWatchlist || []);
        setIsLoadingWatchlist(false);
      } else {
        setWatchlist([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleToggleWatchlist = async (stock) => {
    if (!currentUser) return;
    
    const isInWatchlist = watchlist.some(s => s.symbol === stock.ticker);
    
    if (isInWatchlist) {
      // Remove from watchlist
      const success = await removeFromWatchlist(currentUser.uid, stock.ticker);
      if (success) {
        setWatchlist(prev => prev.filter(s => s.symbol !== stock.ticker));
      }
    } else {
      // Add to watchlist
      const success = await addToWatchlist(currentUser.uid, { symbol: stock.ticker, name: stock.name });
      if (success) {
        setWatchlist(prev => [...prev, { symbol: stock.ticker, name: stock.name, addedAt: new Date().toISOString() }]);
      }
    }
  };

  const isStockInWatchlist = (ticker) => watchlist.some(s => s.symbol === ticker);

  // Get watchlist stocks with full data
  const watchlistStocks = STOCKS.filter(s => isStockInWatchlist(s.ticker));

  const filteredStocks = STOCKS.filter(s => 
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayStocks = activeTab === 'watchlist' ? watchlistStocks : filteredStocks;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <AnimatedBackground />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <ThumbsUpLogo size={22} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-tight hidden sm:block">finnysights</span>
              </a>
              
              {/* Time */}
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Clock size={14} className="text-cyan-400" />
                <span className="font-mono text-sm text-slate-300">
                  {time.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className="text-[10px] text-slate-500">EST</span>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search stocks, sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  <a href="/dashboard" className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors border border-slate-700/50">
                    <Settings size={18} className="text-slate-400" />
                  </a>
                  <button 
                    onClick={handleSignOut}
                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors border border-slate-700/50"
                    title="Sign Out"
                  >
                    <LogOut size={18} className="text-slate-400" />
                  </button>
                  <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-sm font-bold">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <a 
                  href="/"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-sm font-bold hover:from-cyan-400 hover:to-purple-400 transition-all"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Exchange ticker */}
        <div className="border-t border-slate-800/50 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[10px] text-slate-500 font-bold shrink-0">EXCHANGES</span>
              {EXCHANGES.map(exchange => (
                <ExchangeBadge key={exchange.id} exchange={exchange} />
              ))}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Stock list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'watchlist', label: `Watchlist${watchlist.length > 0 ? ` (${watchlist.length})` : ''}`, icon: Star },
                { id: 'gainers', label: 'Top Gainers', icon: Zap },
                { id: 'losers', label: 'Top Losers', icon: TrendingDown },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Login prompt for watchlist */}
            {activeTab === 'watchlist' && !currentUser && (
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
                <Star size={32} className="mx-auto text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Sign in to use Watchlist</h3>
                <p className="text-slate-400 text-sm mb-4">Create an account to save your favorite stocks</p>
                <a 
                  href="/"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-sm hover:from-cyan-400 hover:to-purple-400 transition-all"
                >
                  Sign In / Sign Up
                </a>
              </div>
            )}
            
            {/* Empty watchlist */}
            {activeTab === 'watchlist' && currentUser && watchlist.length === 0 && !isLoadingWatchlist && (
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
                <Star size={32} className="mx-auto text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Your watchlist is empty</h3>
                <p className="text-slate-400 text-sm mb-4">Click the star icon on any stock to add it to your watchlist</p>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
                >
                  Browse Trending Stocks
                </button>
              </div>
            )}
            
            {/* Loading state */}
            {isLoadingWatchlist && activeTab === 'watchlist' && (
              <div className="p-6 text-center">
                <RefreshCw size={24} className="mx-auto text-cyan-400 animate-spin mb-2" />
                <p className="text-slate-400 text-sm">Loading watchlist...</p>
              </div>
            )}
            
            {/* Stock grid */}
            {(activeTab !== 'watchlist' || (currentUser && watchlist.length > 0)) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayStocks.map((stock, i) => (
                  <div key={stock.ticker} className="animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <StockCard 
                      stock={stock} 
                      onSelect={setSelectedStock}
                      isSelected={selectedStock?.ticker === stock.ticker}
                      isInWatchlist={isStockInWatchlist(stock.ticker)}
                      onToggleWatchlist={handleToggleWatchlist}
                      currentUser={currentUser}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* No results */}
            {searchQuery && filteredStocks.length === 0 && activeTab !== 'watchlist' && (
              <div className="text-center py-12">
                <Search size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No stocks found for "{searchQuery}"</p>
              </div>
            )}
          </div>
          
          {/* Right column - Details & Social */}
          <div className="space-y-4">
            {selectedStock ? (
              <StockDetailPanel stock={selectedStock} onClose={() => setSelectedStock(null)} />
            ) : (
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
                <BarChart3 size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Select a stock to view details</p>
              </div>
            )}
            <SocialFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
