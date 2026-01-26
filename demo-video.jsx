import React, { useState, useEffect } from 'react';

// Thumbs Up Logo
const ThumbsUpLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Animated counter
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
};

// Scene components
const IntroScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-8">
          <ThumbsUpLogo size={70} />
        </div>
      </div>
      <h1 className={`text-7xl font-black mb-4 transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <span className="text-cyan-400">finny</span><span className="text-white">sights</span>
      </h1>
      <p className={`text-2xl text-slate-400 transition-all duration-1000 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Where traders vote on the market
      </p>
    </div>
  );
};

const ProblemScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => onComplete(), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const problems = [
    { icon: '📊', text: 'Too many opinions, no clear signal' },
    { icon: '🤯', text: 'Information overload from news & social' },
    { icon: '❓', text: "What does the crowd really think?" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-20">
      <h2 className={`text-5xl font-bold text-white mb-12 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        The Problem
      </h2>
      <div className="space-y-6 w-full max-w-2xl">
        {problems.map((problem, i) => (
          <div key={i} className={`flex items-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-rose-500/30 transition-all duration-700 ${phase >= i + 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <span className="text-4xl">{problem.icon}</span>
            <span className="text-2xl text-slate-300">{problem.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SolutionScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-20">
      <h2 className={`text-5xl font-bold text-white mb-6 transition-all duration-700 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        The Solution
      </h2>
      <div className={`flex items-center gap-4 mb-12 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
          <ThumbsUpLogo size={36} />
        </div>
        <span className="text-4xl font-black">
          <span className="text-cyan-400">finny</span><span className="text-white">sights</span>
        </span>
      </div>
      <p className={`text-3xl text-center text-slate-300 max-w-3xl leading-relaxed transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Real-time <span className="text-cyan-400 font-bold">community sentiment</span> for stocks & crypto.
        <br />See what traders think <span className="text-emerald-400 font-bold">before</span> you trade.
      </p>
    </div>
  );
};

const VotingDemoScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [votes, setVotes] = useState({ up: 8934, down: 1243 });
  const [userVoted, setUserVoted] = useState(null);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => { setPhase(3); setUserVoted('up'); setVotes(v => ({ ...v, up: v.up + 1 })); }, 2500),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => onComplete(), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const bullishPercent = Math.round((votes.up / (votes.up + votes.down)) * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full px-20">
      <h2 className={`text-4xl font-bold text-white mb-10 transition-all duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        Simple Voting System
      </h2>
      
      <div className={`bg-slate-800/50 rounded-3xl p-8 border border-slate-700 w-full max-w-lg transition-all duration-700 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center text-3xl font-bold text-emerald-400">
            AA
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">AAPL</h3>
            <p className="text-slate-400">Apple Inc.</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold font-mono text-white">$248.04</p>
            <p className="text-emerald-400 font-mono">+0.12%</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-4">
          <button className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-xl font-bold transition-all duration-500 ${userVoted === 'up' ? 'bg-emerald-500 text-white scale-105' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <span>👍</span>
            <span>{votes.up.toLocaleString()}</span>
          </button>
          <button className="flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-xl font-bold bg-rose-500/20 text-rose-400">
            <span>👎</span>
            <span>{votes.down.toLocaleString()}</span>
          </button>
        </div>
        
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${bullishPercent}%` }} />
        </div>
        <p className="text-center text-slate-400 mt-2">{bullishPercent}% Bullish</p>
      </div>
      
      {phase >= 3 && (
        <div className="mt-6 flex items-center gap-3 animate-bounce">
          <span className="text-4xl">👆</span>
          <span className="text-xl text-cyan-400 font-bold">Vote recorded!</span>
        </div>
      )}
      
      {phase >= 4 && (
        <p className="mt-4 text-xl text-slate-400 animate-fadeIn">
          Your vote shapes the community sentiment
        </p>
      )}
    </div>
  );
};

const FeaturesScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 1800),
      setTimeout(() => setPhase(5), 2300),
      setTimeout(() => setPhase(6), 2800),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const features = [
    { icon: '📈', title: 'Live Stock Prices', desc: 'Real-time data from major exchanges' },
    { icon: '🪙', title: 'Crypto Markets', desc: 'Bitcoin, Ethereum, Solana & more' },
    { icon: '⭐', title: 'Watchlist', desc: 'Track your favorite assets' },
    { icon: '💬', title: 'Comments', desc: 'Discuss with other traders' },
    { icon: '🏆', title: 'Leaderboard', desc: 'Follow top performers' },
    { icon: '🔔', title: 'Price Alerts', desc: 'Never miss a move' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <h2 className={`text-4xl font-bold text-white mb-10 transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        Packed with Features
      </h2>
      
      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
        {features.map((feature, i) => (
          <div key={i} className={`p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all duration-500 hover:border-cyan-500/50 ${phase >= i + 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <span className="text-4xl mb-3 block">{feature.icon}</span>
            <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PortfolioScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-20">
      <h2 className={`text-4xl font-bold text-white mb-10 transition-all duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        Track Your Portfolio
      </h2>
      
      <div className={`bg-slate-800/50 rounded-3xl p-8 border border-slate-700 w-full max-w-2xl transition-all duration-700 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Total Value</p>
            <p className="text-3xl font-bold font-mono text-white">$47,832.45</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <p className="text-sm text-slate-500 mb-1">Total P/L</p>
            <p className="text-3xl font-bold font-mono text-emerald-400">+$8,234.12</p>
            <p className="text-emerald-400 font-mono">+20.8%</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { symbol: 'AAPL', shares: 25, value: '$6,201', pl: '+12.3%', color: 'emerald' },
            { symbol: 'NVDA', shares: 10, value: '$1,876', pl: '+45.2%', color: 'emerald' },
            { symbol: 'BTC', shares: 0.5, value: '$52,261', pl: '+8.1%', color: 'emerald' },
          ].map((holding, i) => (
            <div key={i} className={`flex items-center justify-between p-3 bg-slate-900/30 rounded-lg transition-all duration-500 ${phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: `${i * 150}ms` }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${holding.symbol === 'BTC' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  {holding.symbol.substring(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-white">{holding.symbol}</p>
                  <p className="text-xs text-slate-500">{holding.shares} shares</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">{holding.value}</p>
                <p className={`text-sm font-mono text-${holding.color}-400`}>{holding.pl}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeaderboardScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => onComplete(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const traders = [
    { rank: 1, name: 'CryptoKing', avatar: '🦁', accuracy: 87, rep: 2847 },
    { rank: 2, name: 'StockMaster', avatar: '🦊', accuracy: 82, rep: 2134 },
    { rank: 3, name: 'TradingPro', avatar: '🐺', accuracy: 79, rep: 1876 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-20">
      <h2 className={`text-4xl font-bold text-white mb-10 transition-all duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        🏆 Follow Top Traders
      </h2>
      
      <div className="w-full max-w-lg space-y-4">
        {traders.map((trader, i) => (
          <div key={i} className={`flex items-center gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all duration-700 ${phase >= i + 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </div>
            <span className="text-3xl">{trader.avatar}</span>
            <div className="flex-1">
              <p className="text-xl font-bold text-white">{trader.name}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-emerald-400">🎯 {trader.accuracy}% accuracy</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">{trader.rep}</p>
              <p className="text-xs text-slate-500">REP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => onComplete(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const stats = [
    { value: 50000, label: 'Active Traders', suffix: '+' },
    { value: 1000000, label: 'Votes Cast', suffix: '+' },
    { value: 500, label: 'Assets Tracked', suffix: '+' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className={`text-4xl font-bold text-white mb-16 transition-all duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        Join the Community
      </h2>
      
      <div className="flex gap-16">
        {stats.map((stat, i) => (
          <div key={i} className={`text-center transition-all duration-700 ${phase >= i + 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              {phase >= i + 2 && <AnimatedNumber value={stat.value} />}{stat.suffix}
            </p>
            <p className="text-xl text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CTAScene = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`flex items-center gap-4 mb-8 transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
          <ThumbsUpLogo size={50} />
        </div>
        <span className="text-5xl font-black">
          <span className="text-cyan-400">finny</span><span className="text-white">sights</span>
        </span>
      </div>
      
      <h2 className={`text-5xl font-bold text-white mb-6 text-center transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        Start Trading Smarter
      </h2>
      
      <p className={`text-2xl text-slate-400 mb-10 transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        100% Free. No credit card required.
      </p>
      
      <div className={`transition-all duration-1000 ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl text-2xl font-bold text-white shadow-2xl shadow-cyan-500/30 animate-pulse">
          Join Now → finnysights.com
        </div>
      </div>
    </div>
  );
};

// Main Video Component
export default function FinnysightsDemo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const scenes = [
    { component: IntroScene, name: 'Intro' },
    { component: ProblemScene, name: 'Problem' },
    { component: SolutionScene, name: 'Solution' },
    { component: VotingDemoScene, name: 'Voting' },
    { component: FeaturesScene, name: 'Features' },
    { component: PortfolioScene, name: 'Portfolio' },
    { component: LeaderboardScene, name: 'Leaderboard' },
    { component: StatsScene, name: 'Stats' },
    { component: CTAScene, name: 'CTA' },
  ];

  const handleSceneComplete = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const startDemo = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setCurrentScene(0);
  };

  const restartDemo = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  const CurrentSceneComponent = scenes[currentScene].component;

  return (
    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Main content */}
      <div className="relative z-10 w-full h-full">
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/30">
              <ThumbsUpLogo size={55} />
            </div>
            <h1 className="text-5xl font-black mb-4">
              <span className="text-cyan-400">finny</span><span className="text-white">sights</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10">Product Demo Video</p>
            <button onClick={startDemo} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-xl font-bold hover:from-cyan-400 hover:to-purple-400 transition-all flex items-center gap-3 shadow-xl shadow-cyan-500/20">
              <span className="text-2xl">▶</span> Play Demo
            </button>
            <p className="mt-8 text-slate-500 text-sm">Duration: ~45 seconds</p>
          </div>
        ) : (
          <CurrentSceneComponent key={currentScene} onComplete={handleSceneComplete} />
        )}
      </div>
      
      {/* Progress bar */}
      {hasStarted && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
          />
        </div>
      )}
      
      {/* Controls */}
      {hasStarted && !isPlaying && currentScene === scenes.length - 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button onClick={restartDemo} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all">
            ↻ Replay
          </button>
        </div>
      )}
      
      {/* Scene indicator */}
      {hasStarted && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          {scenes.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentScene ? 'bg-cyan-400 w-6' : i < currentScene ? 'bg-cyan-400/50' : 'bg-slate-700'}`} />
          ))}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
