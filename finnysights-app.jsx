import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Search, Globe, BarChart3, MessageSquare, Users, Zap, ChevronRight, Star, Clock, Volume2, Eye, Filter, Bell, Settings, RefreshCw, Activity, Plus, X, Check, Heart, Trash2, LogOut, Wifi, WifiOff, Loader } from 'lucide-react';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addToWatchlist, removeFromWatchlist, getWatchlist, recordVote, removeVote, getUserVotes, getUserProfile } from './firestore.js';
import { getMultipleQuotes, getQuote, searchStocks } from './stockApi.js';

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

// Default stock data (used as fallback and for sentiment/votes)
const DEFAULT_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', thumbsUp: 8934, thumbsDown: 1243, sentiment: 87, sentimentLabel: 'Very Bullish' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', thumbsUp: 12453, thumbsDown: 8932, sentiment: 58, sentimentLabel: 'Neutral' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', thumbsUp: 15678, thumbsDown: 2134, sentiment: 92, sentimentLabel: 'Extremely Bullish' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', thumbsUp: 7823, thumbsDown: 1923, sentiment: 81, sentimentLabel: 'Bullish' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', thumbsUp: 6234, thumbsDown: 2341, sentiment: 73, sentimentLabel: 'Bullish' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', thumbsUp: 9234, thumbsDown: 2134, sentiment: 81, sentimentLabel: 'Bullish' },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', thumbsUp: 7823, thumbsDown: 3421, sentiment: 70, sentimentLabel: 'Bullish' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', thumbsUp: 4523, thumbsDown: 1876, sentiment: 71, sentimentLabel: 'Bullish' },
];

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
  { user: 'BearishBen', avatar: '🐻', ticker: 'META', content: 'META facing headwinds with AI spending. Watch for pullback.', time: '18m', likes: 89, sentiment: 'bearish' },
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

// Search dropdown component
const SearchDropdown = ({ query, results, isLoading, onSelect, onClose }) => {
  if (!query || query.length < 1) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
      {isLoading ? (
        <div className="p-4 flex items-center justify-center gap-2">
          <Loader size={16} className="animate-spin text-cyan-400" />
          <span className="text-sm text-slate-400">Searching...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="max-h-80 overflow-y-auto">
          {results.map((stock, i) => (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {stock.symbol.substring(0, 2)}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white text-sm">{stock.symbol}</p>
                <p className="text-xs text-slate-400 truncate">{stock.name}</p>
              </div>
              <Plus size={16} className="text-slate-500" />
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-sm text-slate-400">No stocks found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

// Stock card component with real data
const StockCard = ({ stock, onSelect, isSelected, isInWatchlist, onToggleWatchlist, userVote, onVote, currentUser, isLoading }) => {
  const [localVotes, setLocalVotes] = useState({ up: stock.thumbsUp || 0, down: stock.thumbsDown || 0 });
  const [isVoting, setIsVoting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLocalVotes({ up: stock.thumbsUp || 0, down: stock.thumbsDown || 0 });
  }, [stock]);

  const handleVote = async (type, e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      alert('Please sign in to vote!');
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    const voteValue = type === 'up' ? 'bullish' : 'bearish';
    const currentVote = userVote;

    if (currentVote === voteValue) {
      setLocalVotes(prev => ({
        up: type === 'up' ? prev.up - 1 : prev.up,
        down: type === 'down' ? prev.down - 1 : prev.down
      }));
      await onVote(stock.ticker, null);
    } else {
      setLocalVotes(prev => {
        const newVotes = { ...prev };
        if (currentVote === 'bullish') newVotes.up -= 1;
        if (currentVote === 'bearish') newVotes.down -= 1;
        if (type === 'up') newVotes.up += 1;
        if (type === 'down') newVotes.down += 1;
        return newVotes;
      });
      await onVote(stock.ticker, voteValue);
    }

    setIsVoting(false);
  };

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in to use watchlist!');
      return;
    }
    setIsAdding(true);
    await onToggleWatchlist(stock);
    setIsAdding(false);
  };

  const totalVotes = localVotes.up + localVotes.down;
  const bullishPercent = totalVotes > 0 ? Math.round((localVotes.up / totalVotes) * 100) : 50;

  const price = stock.price || 0;
  const change = stock.change || 0;

  return (
    <div 
      onClick={() => onSelect(stock)}
      className={`relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
          : 'bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/50'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
              change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
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
        
        {/* Price - REAL DATA */}
        <div className="flex items-end justify-between mb-3">
          <div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 w-20 bg-slate-700 rounded mb-1"></div>
                <div className="h-4 w-14 bg-slate-700 rounded"></div>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold font-mono text-white">${price.toFixed(2)}</p>
                <div className={`flex items-center gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span className="text-xs font-mono">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
                </div>
              </>
            )}
          </div>
          <SentimentMeter score={stock.sentiment || 50} size="sm" />
        </div>
        
        {/* Voting */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => handleVote('up', e)}
            disabled={isVoting}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              userVote === 'bullish'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            } ${isVoting ? 'opacity-50' : ''}`}
          >
            <ThumbsUp size={12} className={userVote === 'bullish' ? 'fill-white' : ''} />
            <span className="text-xs font-bold">{localVotes.up.toLocaleString()}</span>
          </button>
          <button 
            onClick={(e) => handleVote('down', e)}
            disabled={isVoting}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              userVote === 'bearish'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            } ${isVoting ? 'opacity-50' : ''}`}
          >
            <ThumbsDown size={12} className={userVote === 'bearish' ? 'fill-white' : ''} />
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
        
        {/* User voted indicator */}
        {userVote && (
          <div className={`absolute top-2 right-12 px-1.5 py-0.5 rounded text-[9px] font-bold ${
            userVote === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            You: {userVote === 'bullish' ? '👍' : '👎'}
          </div>
        )}
      </div>
    </div>
  );
};

// Stock detail panel with real data
const StockDetailPanel = ({ stock, onClose, userVote, isLoading }) => {
  if (!stock) return null;
  
  const price = stock.price || 0;
  const change = stock.change || 0;
  const high = stock.high || 0;
  const low = stock.low || 0;
  const open = stock.open || 0;
  
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 animate-slideIn">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
            change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {stock.ticker.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{stock.ticker}</h3>
            <p className="text-sm text-slate-400">{stock.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">{stock.sector || 'Stock'}</span>
              {userVote && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  userVote === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  Your vote: {userVote === 'bullish' ? '👍 Bullish' : '👎 Bearish'}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      
      {/* Price section - REAL DATA */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-900/50 rounded-xl">
        {isLoading ? (
          <div className="col-span-3 text-center py-2">
            <RefreshCw size={20} className="animate-spin mx-auto text-cyan-400" />
          </div>
        ) : (
          <>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Price</p>
              <p className="text-lg font-bold font-mono text-white">${price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Change</p>
              <p className={`text-lg font-bold font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Open</p>
              <p className="text-lg font-bold font-mono text-white">${open.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {/* High/Low */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-900/50 rounded-xl">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Day High</p>
            <p className="text-sm font-bold font-mono text-emerald-400">${high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Day Low</p>
            <p className="text-sm font-bold font-mono text-rose-400">${low.toFixed(2)}</p>
          </div>
        </div>
      )}
      
      {/* Sentiment section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-300">Community Sentiment</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            (stock.sentiment || 50) >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
            (stock.sentiment || 50) >= 40 ? 'bg-amber-500/20 text-amber-400' :
            'bg-rose-500/20 text-rose-400'
          }`}>{stock.sentimentLabel || 'Neutral'}</span>
        </div>
        <SentimentMeter score={stock.sentiment || 50} size="lg" />
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
  const [userVotes, setUserVotes] = useState({});
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  
  // Real stock data state
  const [stocks, setStocks] = useState(DEFAULT_STOCKS.map(s => ({ ...s, price: 0, change: 0, high: 0, low: 0, open: 0 })));
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search stocks with debounce
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Check if searching for existing stocks
    const localResults = stocks.filter(s => 
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (localResults.length > 0 && searchQuery.length < 3) {
      // Use local results for short queries
      setShowSearchDropdown(false);
      return;
    }

    // Debounce API search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, stocks]);

  // Handle search result selection
  const handleSearchSelect = async (result) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    
    // Check if stock already exists in our list
    const existingStock = stocks.find(s => s.ticker === result.symbol);
    if (existingStock) {
      setSelectedStock(existingStock);
      return;
    }
    
    // Fetch quote for new stock and add it
    const quote = await getQuote(result.symbol);
    const newStock = {
      ticker: result.symbol,
      name: result.name,
      sector: 'Stock',
      price: quote?.currentPrice || 0,
      change: quote?.changePercent || 0,
      high: quote?.high || 0,
      low: quote?.low || 0,
      open: quote?.open || 0,
      thumbsUp: 0,
      thumbsDown: 0,
      sentiment: 50,
      sentimentLabel: 'Neutral',
    };
    
    setStocks(prev => [newStock, ...prev]);
    setSelectedStock(newStock);
  };

  // Fetch real stock prices
  const fetchPrices = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      const symbols = stocks.map(s => s.ticker);
      const quotes = await getMultipleQuotes(symbols);
      
      setStocks(prev => prev.map(stock => {
        const quote = quotes[stock.ticker];
        if (quote) {
          return {
            ...stock,
            price: quote.currentPrice,
            change: quote.changePercent,
            high: quote.high,
            low: quote.low,
            open: quote.open,
          };
        }
        return stock;
      }));
      
      setLastUpdated(new Date());
      setIsOnline(true);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setIsOnline(false);
    }
    setIsLoadingPrices(false);
  }, [stocks]);

  // Initial price fetch
  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingWatchlist(true);
        const userWatchlist = await getWatchlist(user.uid);
        setWatchlist(userWatchlist || []);
        const votes = await getUserVotes(user.uid);
        setUserVotes(votes || {});
        setIsLoadingWatchlist(false);
      } else {
        setWatchlist([]);
        setUserVotes({});
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
      const success = await removeFromWatchlist(currentUser.uid, stock.ticker);
      if (success) {
        setWatchlist(prev => prev.filter(s => s.symbol !== stock.ticker));
      }
    } else {
      const success = await addToWatchlist(currentUser.uid, { symbol: stock.ticker, name: stock.name });
      if (success) {
        setWatchlist(prev => [...prev, { symbol: stock.ticker, name: stock.name, addedAt: new Date().toISOString() }]);
      }
    }
  };

  const handleVote = async (ticker, vote) => {
    if (!currentUser) return;
    
    if (vote === null) {
      await removeVote(currentUser.uid, ticker);
      setUserVotes(prev => {
        const updated = { ...prev };
        delete updated[ticker];
        return updated;
      });
    } else {
      await recordVote(currentUser.uid, ticker, vote);
      setUserVotes(prev => ({
        ...prev,
        [ticker]: { vote, votedAt: new Date().toISOString() }
      }));
    }
  };

  const getUserVoteForStock = (ticker) => userVotes[ticker]?.vote || null;
  const isStockInWatchlist = (ticker) => watchlist.some(s => s.symbol === ticker);
  const watchlistStocks = stocks.filter(s => isStockInWatchlist(s.ticker));

  // Filter stocks based on search (local filter for displayed stocks)
  const filteredStocks = searchQuery.length > 0 && !showSearchDropdown
    ? stocks.filter(s => 
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks;

  const displayStocks = activeTab === 'watchlist' ? watchlistStocks : filteredStocks;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <AnimatedBackground />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
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
              
              {/* Time & Status */}
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Clock size={14} className="text-cyan-400" />
                <span className="font-mono text-sm text-slate-300">
                  {time.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className="text-[10px] text-slate-500">EST</span>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </div>
            </div>
            
            {/* Search with dropdown */}
            <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search any stock (e.g. AAPL, MSFT)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              {/* Search dropdown */}
              {showSearchDropdown && (
                <SearchDropdown
                  query={searchQuery}
                  results={searchResults}
                  isLoading={isSearching}
                  onSelect={handleSearchSelect}
                  onClose={() => setShowSearchDropdown(false)}
                />
              )}
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={fetchPrices}
                disabled={isLoadingPrices}
                className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors border border-slate-700/50"
                title="Refresh prices"
              >
                <RefreshCw size={18} className={`text-slate-400 ${isLoadingPrices ? 'animate-spin' : ''}`} />
              </button>
              
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
      
      {/* Last updated banner */}
      {lastUpdated && (
        <div className="relative z-10 bg-slate-800/30 border-b border-slate-700/30">
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
            <Wifi size={12} className={isOnline ? 'text-emerald-400' : 'text-rose-400'} />
            <span className="text-[10px] text-slate-500">
              {isOnline ? 'Live prices' : 'Offline'} • Last updated: {lastUpdated.toLocaleTimeString()} • Search any US stock
            </span>
          </div>
        </div>
      )}
      
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
                <p className="text-slate-400 text-sm mb-4">Search for stocks and click the star to add them</p>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
                >
                  Browse Trending Stocks
                </button>
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
                      userVote={getUserVoteForStock(stock.ticker)}
                      onVote={handleVote}
                      currentUser={currentUser}
                      isLoading={isLoadingPrices}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* No results */}
            {searchQuery && filteredStocks.length === 0 && !showSearchDropdown && activeTab !== 'watchlist' && (
              <div className="text-center py-12">
                <Search size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No stocks found for "{searchQuery}"</p>
                <p className="text-slate-500 text-sm mt-2">Try searching for a stock symbol like AAPL or TSLA</p>
              </div>
            )}
          </div>
          
          {/* Right column - Details & Social */}
          <div className="space-y-4">
            {selectedStock ? (
              <StockDetailPanel 
                stock={selectedStock} 
                onClose={() => setSelectedStock(null)} 
                userVote={getUserVoteForStock(selectedStock.ticker)}
                isLoading={isLoadingPrices}
              />
            ) : (
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
                <BarChart3 size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Select a stock to view details</p>
                <p className="text-slate-500 text-xs mt-2">Or search for any US stock above</p>
              </div>
            )}
            <SocialFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
