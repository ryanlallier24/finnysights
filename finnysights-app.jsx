import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Search, Globe, BarChart3, MessageSquare, Users, Zap, ChevronRight, Star, Clock, Volume2, Eye, Filter, Bell, Settings, RefreshCw } from 'lucide-react';

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

// Stock card component
const StockCard = ({ stock, onSelect, isSelected, onVote }) => {
  const [localVotes, setLocalVotes] = useState({ up: stock.thumbsUp, down: stock.thumbsDown });
  const [userVote, setUserVote] = useState(null);

  const handleVote = (type) => {
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
    }
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
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">{stock.ticker}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                stock.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {stock.change >= 0 ? '+' : ''}{stock.change}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white font-mono">${stock.price.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">{stock.exchange}</p>
          </div>
        </div>

        {/* Sentiment */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold ${
            stock.sentiment >= 70 ? 'text-emerald-400' : stock.sentiment >= 40 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {stock.sentimentLabel}
          </span>
          <SentimentMeter score={stock.sentiment} size="sm" />
        </div>

        {/* Voting */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              userVote === 'up' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
            }`}
          >
            <ThumbsUp size={14} />
            <span className="text-xs font-bold">{localVotes.up.toLocaleString()}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              userVote === 'down' 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400'
            }`}
          >
            <ThumbsDown size={14} />
            <span className="text-xs font-bold">{localVotes.down.toLocaleString()}</span>
          </button>
          <div className="flex-1 ml-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${bullishPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{bullishPercent}% bullish</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sentiment analysis panel
const SentimentPanel = ({ stock }) => {
  if (!stock) return (
    <div className="h-full flex items-center justify-center text-slate-500">
      <div className="text-center">
        <Search size={48} className="mx-auto mb-4 opacity-50" />
        <p>Select a stock to view sentiment analysis</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{stock.ticker}</h2>
          <p className="text-sm text-slate-400">{stock.name}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${
          stock.sentiment >= 70 ? 'bg-emerald-500/20 border border-emerald-500/30' : 
          stock.sentiment >= 40 ? 'bg-amber-500/20 border border-amber-500/30' : 
          'bg-rose-500/20 border border-rose-500/30'
        }`}>
          <p className="text-xs text-slate-400">Aggregate Sentiment</p>
          <p className={`text-xl font-black ${
            stock.sentiment >= 70 ? 'text-emerald-400' : stock.sentiment >= 40 ? 'text-amber-400' : 'text-rose-400'
          }`}>{stock.sentiment}%</p>
        </div>
      </div>

      {/* Large sentiment meter */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-rose-400">Bearish</span>
          <span className="text-sm font-semibold text-emerald-400">Bullish</span>
        </div>
        <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-30"
            style={{ width: '100%' }}
          />
          <div 
            className="absolute top-0 h-full w-1 bg-white shadow-lg shadow-white/50 transition-all duration-700"
            style={{ left: `calc(${stock.sentiment}% - 2px)` }}
          />
        </div>
        <p className="text-center mt-2 text-sm font-semibold text-white">{stock.sentimentLabel}</p>
      </div>

      {/* Third-party sources */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Zap size={14} className="text-cyan-400" />
          Third-Party Sentiment Sources
        </h3>
        <div className="space-y-2">
          {SENTIMENT_SOURCES.map((source, i) => (
            <div key={i} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{source.name}</span>
                <div className="flex items-center gap-2">
                  {source.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                  {source.trend === 'down' && <TrendingDown size={14} className="text-rose-400" />}
                  {source.trend === 'neutral' && <Activity size={14} className="text-amber-400" />}
                  <span className={`font-mono font-bold ${
                    source.score >= 70 ? 'text-emerald-400' : source.score >= 40 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{source.score}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      source.score >= 70 ? 'bg-emerald-500' : source.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${source.score}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">Reliability: {source.reliability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Volume</p>
          <p className="text-lg font-bold text-white font-mono">{stock.volume}</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sector</p>
          <p className="text-lg font-bold text-white">{stock.sector}</p>
        </div>
      </div>

      {/* Request analysis button */}
      <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2">
        <BarChart3 size={18} />
        Request Deep Analysis
      </button>
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
                <Star size={10} />{post.likes}
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredStocks = STOCKS.filter(s => 
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <ThumbsUpLogo size={22} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    finnysights
                  </h1>
                  <p className="text-[10px] text-slate-500 tracking-wider">GLOBAL SENTIMENT TRACKER</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500">Market Time</p>
                  <p className="font-mono text-sm text-cyan-400">{time.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                    <Bell size={18} className="text-slate-400" />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                    <Settings size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Exchange ticker */}
        <div className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 text-slate-500 shrink-0">
                <Globe size={14} />
                <span className="text-xs font-semibold">EXCHANGES</span>
              </div>
              {EXCHANGES.map(exchange => (
                <ExchangeBadge key={exchange.id} exchange={exchange} />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column - Stock list */}
            <div className="lg:col-span-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search tickers or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {['trending', 'watchlist', 'movers'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Stock list */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredStocks.map((stock, i) => (
                  <div key={stock.ticker} className="animate-slideIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <StockCard
                      stock={stock}
                      onSelect={setSelectedStock}
                      isSelected={selectedStock?.ticker === stock.ticker}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Center column - Sentiment analysis */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <div className="p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                  <SentimentPanel stock={selectedStock} />
                </div>
              </div>
            </div>

            {/* Right column - Social feed */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <div className="p-4 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                  <SocialFeed />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer stats */}
        <footer className="border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm mt-8">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-cyan-400" />
                  <span className="text-xs text-slate-400"><span className="font-bold text-white">247,893</span> traders online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-purple-400" />
                  <span className="text-xs text-slate-400"><span className="font-bold text-white">1.2M</span> votes today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-emerald-400" />
                  <span className="text-xs text-slate-400"><span className="font-bold text-white">8</span> exchanges tracked</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <RefreshCw size={12} className="animate-spin" />
                <span className="text-[10px]">Real-time data</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
