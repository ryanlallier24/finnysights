import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Star, Bell, BellOff, Share2, ExternalLink, Clock, MessageSquare, BarChart3, Activity, Zap, Users, Globe, ChevronLeft, ChevronRight, Calendar, Filter, ArrowUpRight, ArrowDownRight, Volume2, DollarSign, PieChart, Target, AlertTriangle, Newspaper, Twitter, Building, TrendingUp as Trend } from 'lucide-react';

// Mock stock data
const STOCK_DATA = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  exchange: 'NASDAQ',
  sector: 'Technology',
  industry: 'Semiconductors',
  price: 487.23,
  change: 12.45,
  changePercent: 2.62,
  open: 476.50,
  high: 492.18,
  low: 474.32,
  volume: '67.3M',
  avgVolume: '54.2M',
  marketCap: '$1.21T',
  peRatio: 64.32,
  eps: 7.58,
  dividend: 0.16,
  dividendYield: 0.03,
  week52High: 505.48,
  week52Low: 222.97,
  beta: 1.72,
  sentiment: 92,
  sentimentLabel: 'Extremely Bullish',
  thumbsUp: 15678,
  thumbsDown: 2134,
  analystRating: 'Strong Buy',
  priceTarget: 550,
};

// Mock chart data
const generateChartData = (days, basePrice) => {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    price = price + (Math.random() - 0.48) * 10;
    price = Math.max(price, basePrice * 0.7);
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 80 + 30) * 1000000,
      sentiment: Math.floor(Math.random() * 30 + 60),
    });
  }
  return data;
};

const CHART_DATA = generateChartData(90, 450);

// Mock news data
const NEWS_DATA = [
  {
    id: 1,
    title: 'NVIDIA Announces Next-Gen AI Chips at CES 2025',
    source: 'Reuters',
    time: '2h ago',
    sentiment: 'positive',
    summary: 'NVIDIA unveiled its latest Blackwell Ultra architecture, promising 4x performance improvements for AI workloads.',
    image: '🎮'
  },
  {
    id: 2,
    title: 'Analysts Raise NVDA Price Targets Amid AI Boom',
    source: 'Bloomberg',
    time: '5h ago',
    sentiment: 'positive',
    summary: 'Major Wall Street firms have increased price targets following strong datacenter demand projections.',
    image: '📈'
  },
  {
    id: 3,
    title: 'NVIDIA Partners with Major Cloud Providers',
    source: 'CNBC',
    time: '8h ago',
    sentiment: 'positive',
    summary: 'New partnerships with AWS, Azure, and Google Cloud expand NVIDIA\'s enterprise AI footprint.',
    image: '☁️'
  },
  {
    id: 4,
    title: 'Supply Chain Constraints May Limit Q1 Production',
    source: 'WSJ',
    time: '1d ago',
    sentiment: 'negative',
    summary: 'Industry analysts warn that chip supply constraints could impact near-term revenue growth.',
    image: '⚠️'
  },
  {
    id: 5,
    title: 'NVIDIA Gaming Revenue Beats Expectations',
    source: 'The Verge',
    time: '2d ago',
    sentiment: 'positive',
    summary: 'RTX 50-series GPUs drive stronger-than-expected gaming segment performance.',
    image: '🕹️'
  },
];

// Mock social posts
const SOCIAL_POSTS = [
  { user: 'AITrader', avatar: '🤖', content: 'NVDA breaking out! AI demand is insane right now. $600 by summer.', time: '5m', likes: 342, sentiment: 'bullish' },
  { user: 'ChartMaster', avatar: '📊', content: 'Beautiful cup and handle forming on the daily. This wants higher.', time: '12m', likes: 187, sentiment: 'bullish' },
  { user: 'ValueHunter', avatar: '🎯', content: 'PE ratio is stretched but growth justifies premium. Still adding.', time: '28m', likes: 94, sentiment: 'bullish' },
  { user: 'SkepticalSam', avatar: '🤔', content: 'Everyone is bullish... that makes me nervous. Taking some profits here.', time: '45m', likes: 156, sentiment: 'bearish' },
  { user: 'TechWatcher', avatar: '👁️', content: 'Competition from AMD is heating up. Keep an eye on market share.', time: '1h', likes: 78, sentiment: 'neutral' },
];

// Historical sentiment data
const SENTIMENT_HISTORY = [
  { period: '1D', sentiment: 92, change: 2 },
  { period: '1W', sentiment: 88, change: 5 },
  { period: '1M', sentiment: 82, change: -3 },
  { period: '3M', sentiment: 79, change: 12 },
  { period: '6M', sentiment: 71, change: 8 },
  { period: '1Y', sentiment: 65, change: 15 },
];

// Third-party sentiment sources
const SENTIMENT_SOURCES = [
  { name: 'Reuters Analytics', score: 89, trend: 'up', confidence: 94 },
  { name: 'Bloomberg Sentiment', score: 91, trend: 'up', confidence: 96 },
  { name: 'S&P Market Intel', score: 85, trend: 'up', confidence: 92 },
  { name: 'Refinitiv Data', score: 88, trend: 'up', confidence: 91 },
  { name: 'FactSet Insights', score: 87, trend: 'neutral', confidence: 89 },
];

// Mini chart component
const MiniChart = ({ data, color = 'cyan', height = 60 }) => {
  const min = Math.min(...data.map(d => d.price));
  const max = Math.max(...data.map(d => d.price));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.price - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color === 'cyan' ? '#06b6d4' : '#10b981'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color === 'cyan' ? '#06b6d4' : '#10b981'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon 
        points={`0,100 ${points} 100,100`} 
        fill={`url(#gradient-${color})`}
      />
      <polyline 
        points={points} 
        fill="none" 
        stroke={color === 'cyan' ? '#06b6d4' : '#10b981'} 
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// Large interactive chart
const PriceChart = ({ data, timeframe, setTimeframe }) => {
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  const filteredData = data.slice(-{
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': data.length,
  }[timeframe]);

  const min = Math.min(...filteredData.map(d => d.price));
  const max = Math.max(...filteredData.map(d => d.price));
  const range = max - min || 1;

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <BarChart3 size={18} className="text-cyan-400" />
          Price History
        </h3>
        <div className="flex gap-1">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-64 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500 font-mono">
          <span>${max.toFixed(2)}</span>
          <span>${((max + min) / 2).toFixed(2)}</span>
          <span>${min.toFixed(2)}</span>
        </div>
        
        {/* Chart */}
        <div className="ml-16 h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
            ))}
            
            {/* Gradient fill */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area */}
            <polygon 
              points={`0,100 ${filteredData.map((d, i) => {
                const x = (i / (filteredData.length - 1)) * 100;
                const y = 100 - ((d.price - min) / range) * 100;
                return `${x},${y}`;
              }).join(' ')} 100,100`}
              fill="url(#chartGradient)"
            />
            
            {/* Line */}
            <polyline
              points={filteredData.map((d, i) => {
                const x = (i / (filteredData.length - 1)) * 100;
                const y = 100 - ((d.price - min) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* Volume bars */}
      <div className="ml-16 h-12 flex items-end gap-px">
        {filteredData.slice(-50).map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-700/50 rounded-t"
            style={{ height: `${(d.volume / 100000000) * 100}%` }}
          />
        ))}
      </div>
      <p className="ml-16 text-xs text-slate-500 mt-1">Volume</p>
    </div>
  );
};

// Sentiment gauge
const SentimentGauge = ({ score }) => {
  const angle = (score / 100) * 180 - 90;
  
  return (
    <div className="relative w-48 h-24 mx-auto">
      {/* Background arc */}
      <svg viewBox="0 0 100 50" className="w-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 141.37} 141.37`}
        />
      </svg>
      
      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-16 bg-white rounded-full origin-bottom shadow-lg"
        style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
      />
      <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
      
      {/* Score */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-3xl font-black text-white">{score}</p>
        <p className="text-xs text-slate-500">/ 100</p>
      </div>
    </div>
  );
};

// News card
const NewsCard = ({ news }) => (
  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all cursor-pointer group">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-2xl shrink-0">
        {news.image}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            news.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
            news.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-400' :
            'bg-slate-600/50 text-slate-400'
          }`}>
            {news.sentiment.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500">{news.source}</span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs text-slate-500">{news.time}</span>
        </div>
        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
          {news.title}
        </h4>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{news.summary}</p>
      </div>
      <ExternalLink size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
    </div>
  </div>
);

// Social post
const SocialPost = ({ post }) => (
  <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
    <div className="flex items-start gap-2">
      <span className="text-xl">{post.avatar}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-white">{post.user}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            post.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
            post.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
            'bg-slate-600/50 text-slate-400'
          }`}>
            {post.sentiment}
          </span>
          <span className="text-[10px] text-slate-500 ml-auto">{post.time}</span>
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
);

// Main Stock Detail Component
export default function StockDetailPage() {
  const [stock] = useState(STOCK_DATA);
  const [chartTimeframe, setChartTimeframe] = useState('3M');
  const [isWatchlisted, setIsWatchlisted] = useState(true);
  const [hasAlerts, setHasAlerts] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [votes, setVotes] = useState({ up: stock.thumbsUp, down: stock.thumbsDown });
  const [activeTab, setActiveTab] = useState('overview');

  const handleVote = (type) => {
    if (userVote === type) {
      setUserVote(null);
      setVotes(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    } else {
      if (userVote) {
        setVotes(prev => ({
          ...prev,
          [userVote]: prev[userVote] - 1
        }));
      }
      setUserVote(type);
      setVotes(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
    }
  };

  const totalVotes = votes.up + votes.down;
  const bullishPercent = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 50;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all text-slate-400 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-white">{stock.ticker}</h1>
                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">{stock.exchange}</span>
                  </div>
                  <p className="text-sm text-slate-400">{stock.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHasAlerts(!hasAlerts)}
                  className={`p-2 rounded-lg transition-all ${
                    hasAlerts 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {hasAlerts ? <Bell size={20} /> : <BellOff size={20} />}
                </button>
                <button
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`p-2 rounded-lg transition-all ${
                    isWatchlisted 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  <Star size={20} fill={isWatchlisted ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Price section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main price card */}
            <div className="lg:col-span-2 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white font-mono">${stock.price.toFixed(2)}</span>
                    <span className={`text-xl font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Analyst Target</p>
                  <p className="text-2xl font-bold text-cyan-400">${stock.priceTarget}</p>
                  <p className="text-xs text-emerald-400">+{(((stock.priceTarget - stock.price) / stock.price) * 100).toFixed(1)}% upside</p>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Open', value: `$${stock.open}` },
                  { label: 'High', value: `$${stock.high}` },
                  { label: 'Low', value: `$${stock.low}` },
                  { label: 'Volume', value: stock.volume },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="font-semibold text-white font-mono">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment card */}
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                Community Sentiment
              </h3>
              
              <SentimentGauge score={stock.sentiment} />
              
              <p className={`text-center mt-10 text-lg font-bold ${
                stock.sentiment >= 70 ? 'text-emerald-400' : stock.sentiment >= 40 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {stock.sentimentLabel}
              </p>

              {/* Voting */}
              <div className="mt-6 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote('up')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                      userVote === 'up'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                    }`}
                  >
                    <ThumbsUp size={18} />
                    <span className="font-bold">{votes.up.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => handleVote('down')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                      userVote === 'down'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400'
                    }`}
                  >
                    <ThumbsDown size={18} />
                    <span className="font-bold">{votes.down.toLocaleString()}</span>
                  </button>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${bullishPercent}%` }}
                  />
                </div>
                <p className="text-center text-sm text-slate-500">
                  <span className="text-emerald-400 font-semibold">{bullishPercent}%</span> bullish
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'sentiment', 'news', 'financials'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column - Chart and stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price chart */}
              <PriceChart data={CHART_DATA} timeframe={chartTimeframe} setTimeframe={setChartTimeframe} />

              {/* Key statistics */}
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-purple-400" />
                  Key Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Market Cap', value: stock.marketCap },
                    { label: 'P/E Ratio', value: stock.peRatio },
                    { label: 'EPS', value: `$${stock.eps}` },
                    { label: 'Beta', value: stock.beta },
                    { label: '52W High', value: `$${stock.week52High}` },
                    { label: '52W Low', value: `$${stock.week52Low}` },
                    { label: 'Avg Volume', value: stock.avgVolume },
                    { label: 'Dividend', value: `${stock.dividendYield}%` },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="font-semibold text-white font-mono">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Third-party sentiment */}
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-cyan-400" />
                  Third-Party Sentiment Analysis
                </h3>
                <div className="space-y-3">
                  {SENTIMENT_SOURCES.map((source, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          source.trend === 'up' ? 'bg-emerald-400' : source.trend === 'down' ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        <span className="text-sm text-white">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${source.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${source.score}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-400 w-8">{source.score}</span>
                        <span className="text-xs text-slate-500 w-20">Conf: {source.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News */}
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Newspaper size={18} className="text-amber-400" />
                  Latest News
                </h3>
                <div className="space-y-3">
                  {NEWS_DATA.map(news => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Social and sentiment history */}
            <div className="space-y-6">
              {/* Sentiment history */}
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Trend size={18} className="text-emerald-400" />
                  Sentiment History
                </h3>
                <div className="space-y-3">
                  {SENTIMENT_HISTORY.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-sm text-slate-400 w-12">{item.period}</span>
                      <div className="flex-1 mx-3">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.sentiment >= 70 ? 'bg-emerald-500' : item.sentiment >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${item.sentiment}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-white w-8">{item.sentiment}</span>
                        <span className={`text-xs ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social feed */}
              <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-purple-400" />
                  Community Chatter
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {SOCIAL_POSTS.map((post, i) => (
                    <SocialPost key={i} post={post} />
                  ))}
                </div>
                <button className="w-full mt-4 py-2 bg-slate-700/50 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  View All Posts
                </button>
              </div>

              {/* Analyst rating */}
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Target size={18} className="text-cyan-400" />
                  Analyst Consensus
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-black text-emerald-400">{stock.analystRating}</p>
                  <p className="text-sm text-slate-400 mt-1">Based on 42 analysts</p>
                  <div className="flex justify-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={20} className="text-amber-400" fill={i <= 4 ? '#fbbf24' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick action */}
              <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
                <Zap size={20} />
                Request Deep Analysis
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
