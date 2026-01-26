import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Globe, Zap, BarChart3, Shield, Bell, ChevronRight, Eye, EyeOff, Check, Star, ArrowRight, Play, Lock, Mail, User, Building, Phone } from 'lucide-react';
import { auth, googleProvider } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from './firestore.js';

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

// Google Icon Component
const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Animated background with trading chart lines
const AnimatedBackground = () => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const generateLine = () => {
      const points = [];
      let y = 50 + Math.random() * 200;
      for (let x = 0; x <= 100; x += 2) {
        y += (Math.random() - 0.5) * 20;
        y = Math.max(20, Math.min(280, y));
        points.push(`${x * 20},${y}`);
      }
      return points.join(' ');
    };
    
    setLines([generateLine(), generateLine(), generateLine()]);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Animated chart lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        {lines.map((points, i) => (
          <polyline
            key={i}
            points={points}
            fill="none"
            stroke={i === 0 ? '#06b6d4' : i === 1 ? '#a855f7' : '#10b981'}
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>
      
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Finnhub API for live prices
const FINNHUB_API_KEY = 'd5r20chr01qqqlh9ass0d5r20chr01qqqlh9assg';

// Live ticker with real prices
const LiveTicker = () => {
  const [tickers, setTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch stock prices from Finnhub
        const stockSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'JPM'];
        const stockPromises = stockSymbols.map(symbol =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
            .then(res => res.json())
            .then(data => ({
              symbol,
              price: data.c || 0,
              change: data.dp || 0,
              type: 'stock'
            }))
            .catch(() => ({ symbol, price: 0, change: 0, type: 'stock' }))
        );
        
        // Fetch crypto prices from CoinGecko (free, no API key needed)
        const cryptoPromise = fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true')
          .then(res => res.json())
          .then(data => [
            { symbol: 'BTC', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0, type: 'crypto' },
            { symbol: 'ETH', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0, type: 'crypto' },
            { symbol: 'SOL', price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0, type: 'crypto' },
          ])
          .catch(() => []);
        
        const [stockResults, cryptoResults] = await Promise.all([
          Promise.all(stockPromises),
          cryptoPromise
        ]);
        
        const allTickers = [...stockResults.filter(t => t.price > 0), ...cryptoResults.filter(t => t.price > 0)];
        
        if (allTickers.length > 0) {
          setTickers(allTickers);
          setLastUpdated(new Date());
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price, type) => {
    if (type === 'crypto' && price >= 1000) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return price.toFixed(2);
  };

  if (isLoading || tickers.length === 0) {
    // Show placeholder while loading
    return (
      <div className="w-full bg-slate-900/50 border-y border-slate-800 overflow-hidden">
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-r border-slate-700">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-cyan-400">LIVE</span>
          </div>
          <div className="animate-scroll flex gap-12 py-3 px-4 whitespace-nowrap">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-bold text-white">{['AAPL', 'NVDA', 'TSLA', 'BTC', 'MSFT', 'ETH', 'AMZN', 'SOL'][i % 8]}</span>
                <span className="text-slate-500 font-mono animate-pulse">---</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/50 border-y border-slate-800 overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-r border-slate-700 shrink-0">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">LIVE</span>
        </div>
        <div className="animate-scroll flex gap-12 py-3 px-4 whitespace-nowrap">
          {[...tickers, ...tickers].map((ticker, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`font-bold ${ticker.type === 'crypto' ? 'text-orange-400' : 'text-white'}`}>
                {ticker.type === 'crypto' && '₿ '}{ticker.symbol}
              </span>
              <span className="text-slate-300 font-mono">${formatPrice(ticker.price, ticker.type)}</span>
              <span className={`font-mono ${ticker.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sentiment Card Component
const SentimentCard = ({ symbol, name, sentiment, price, change, votes }) => {
  const isPositive = change >= 0;
  const sentimentColor = sentiment >= 70 ? 'emerald' : sentiment >= 40 ? 'amber' : 'red';
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-white text-lg">{symbol}</h4>
          <p className="text-slate-400 text-sm">{name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full bg-${sentimentColor}-500/20 border border-${sentimentColor}-500/30`}>
          <span className={`text-${sentimentColor}-400 font-bold text-sm`}>{sentiment}%</span>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-white font-mono">${price}</p>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-sm font-mono">{isPositive ? '+' : ''}{change}%</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Community Votes</p>
          <p className="text-slate-300 font-bold">{votes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// Auth Modal Component with Firebase Integration
const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setFirebaseError('');
  }, [initialMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setFirebaseError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'reset') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.agreeTerms) {
          newErrors.agreeTerms = 'You must agree to the terms';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Firebase: Sign up with email/password
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      console.log('User created:', userCredential.user);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setFirebaseError('This email is already registered. Try logging in instead.');
          break;
        case 'auth/weak-password':
          setFirebaseError('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/invalid-email':
          setFirebaseError('Please enter a valid email address.');
          break;
        default:
          setFirebaseError('An error occurred. Please try again.');
      }
      return false;
    }
  };

  // Firebase: Sign in with email/password
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      console.log('User signed in:', userCredential.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setFirebaseError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setFirebaseError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setFirebaseError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setFirebaseError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/invalid-credential':
          setFirebaseError('Invalid email or password. Please try again.');
          break;
        default:
          setFirebaseError('An error occurred. Please try again.');
      }
      return false;
    }
  };

  // Firebase: Sign in with Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFirebaseError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in:', result.user);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onAuthSuccess) onAuthSuccess(result.user);
      }, 1500);
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setFirebaseError('Sign in was cancelled.');
      } else {
        setFirebaseError('Could not sign in with Google. Please try again.');
      }
    }
    setIsLoading(false);
  };

  // Firebase: Password reset
  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, formData.email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setFirebaseError('No account found with this email.');
          break;
        case 'auth/invalid-email':
          setFirebaseError('Please enter a valid email address.');
          break;
        default:
          setFirebaseError('An error occurred. Please try again.');
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setFirebaseError('');
    
    let success = false;
    
    if (mode === 'reset') {
      success = await handlePasswordReset();
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMode('login');
          setFormData(prev => ({ ...prev, email: formData.email }));
        }, 3000);
      }
    } else if (mode === 'signup') {
      success = await handleSignUp();
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onAuthSuccess) onAuthSuccess(auth.currentUser);
        }, 1500);
      }
    } else {
      success = await handleSignIn();
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          if (onAuthSuccess) onAuthSuccess(auth.currentUser);
        }, 1500);
      }
    }
    
    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    setMode('login');
    setFormData(prev => ({ ...prev, email: '' }));
    setErrors({});
    setFirebaseError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10 overflow-hidden animate-modalIn">
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {success ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Check size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Account Created!' : 'Email Sent!'}
              </h3>
              <p className="text-slate-400">
                {mode === 'login' ? 'Redirecting to dashboard...' : mode === 'signup' ? 'Welcome to finnysights!' : 'Check your email for a password reset link.'}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <ThumbsUpLogo size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {mode === 'login' 
                    ? 'Sign in to access your trading dashboard' 
                    : mode === 'signup'
                    ? 'Join thousands of traders worldwide'
                    : 'Enter your email to receive a reset link'}
                </p>
              </div>

              {/* Firebase Error Message */}
              {firebaseError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{firebaseError}</p>
                </div>
              )}

              {/* Google Sign In Button */}
              {mode !== 'reset' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-900 text-slate-500">or continue with email</span>
                    </div>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Reset: Email */}
                {mode === 'reset' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                )}

                {/* Login/Signup: Email */}
                {mode !== 'reset' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                )}

                {/* Password */}
                {mode !== 'reset' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-800/50 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                  </div>
                )}

                {/* Confirm Password (Signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                  </div>
                )}

                {/* Terms Agreement (Signup only) */}
                {mode === 'signup' && (
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <label className="text-xs text-slate-400">
                      I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                )}
                {errors.agreeTerms && <p className="text-xs text-red-400">{errors.agreeTerms}</p>}

                {/* Forgot Password Link */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switch */}
              <div className="mt-6 text-center">
                {mode === 'reset' ? (
                  <button
                    onClick={handleBackToLogin}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to sign in
                  </button>
                ) : (
                  <p className="text-sm text-slate-400">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20">
      <Icon size={24} className="text-cyan-400" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

// Demo Video Modal Component
const DemoVideoModal = ({ isOpen, onClose }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = React.useRef(null);

  const scenes = 9;
  const sceneDurations = [4500, 5500, 4500, 5500, 5000, 5000, 4500, 4500, 5000];

  useEffect(() => {
    if (!isOpen) {
      setCurrentScene(0);
      setIsPlaying(false);
      setHasStarted(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying || currentScene >= scenes) return;
    
    const timer = setTimeout(() => {
      if (currentScene < scenes - 1) {
        setCurrentScene(prev => prev + 1);
      } else {
        setIsPlaying(false);
        // Fade out music
        if (audioRef.current) {
          const fadeOut = setInterval(() => {
            if (audioRef.current && audioRef.current.volume > 0.05) {
              audioRef.current.volume -= 0.05;
            } else {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.volume = volume / 100;
              }
              clearInterval(fadeOut);
            }
          }, 100);
        }
      }
    }, sceneDurations[currentScene]);

    return () => clearTimeout(timer);
  }, [isPlaying, currentScene, scenes, volume]);

  const startDemo = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setCurrentScene(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(e => console.log('Audio blocked:', e));
    }
  };

  const restartDemo = () => {
    setCurrentScene(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.muted = !isMuted;
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  if (!isOpen) return null;

  const progressPercent = hasStarted ? ((currentScene + 1) / scenes) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* Audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Modal */}
      <div className="relative w-full h-full max-w-7xl max-h-[95vh] m-2 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white text-xl transition-all">✕</button>
        
        {/* Music Controls */}
        {hasStarted && (
          <div className="absolute top-4 left-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-800/80 rounded-xl">
            <div className="flex items-end gap-1 h-6">
              {[0, 0.1, 0.2, 0.15, 0.05].map((delay, i) => (
                <span key={i} className="w-1 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full" style={{ 
                  height: isMuted ? '6px' : '100%',
                  animation: isMuted ? 'none' : `visualizer 0.4s ease-in-out ${delay}s infinite alternate`
                }} />
              ))}
            </div>
            <button onClick={toggleMute} className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-20 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer" />
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 z-50">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {!hasStarted ? (
            /* Start Screen */
            <div className="flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/30">
                <ThumbsUpLogo size={55} className="text-white" />
              </div>
              <h2 className="text-5xl font-black mb-3"><span className="text-cyan-400">finny</span><span className="text-white">sights</span></h2>
              <p className="text-xl text-slate-400 mb-8">Product Demo</p>
              <button onClick={startDemo} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-xl font-bold hover:from-cyan-400 hover:to-purple-400 transition-all flex items-center gap-3 shadow-xl">
                <span className="text-2xl">▶</span> Play Demo
              </button>
              <p className="mt-6 text-slate-500 text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                ~45 seconds with music
              </p>
            </div>
          ) : (
            /* Scenes */
            <div className="w-full h-full">
              {/* Scene 1: Intro */}
              {currentScene === 0 && (
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                  <div className="w-28 h-28 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-8 animate-scaleIn">
                    <ThumbsUpLogo size={65} className="text-white" />
                  </div>
                  <h1 className="text-7xl font-black mb-4 animate-fadeInUp"><span className="text-cyan-400">finny</span><span className="text-white">sights</span></h1>
                  <p className="text-2xl text-slate-400 animate-fadeInUp animation-delay-500">Where traders vote on the market</p>
                </div>
              )}

              {/* Scene 2: Problem */}
              {currentScene === 1 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-5xl font-bold text-white mb-12 animate-fadeInUp">The Problem</h2>
                  <div className="space-y-5 w-full max-w-2xl">
                    <div className="flex items-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-rose-500/30 animate-fadeInLeft"><span className="text-4xl">📊</span><span className="text-xl text-slate-300">Too many opinions, no clear signal</span></div>
                    <div className="flex items-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-rose-500/30 animate-fadeInLeft animation-delay-300"><span className="text-4xl">🤯</span><span className="text-xl text-slate-300">Information overload everywhere</span></div>
                    <div className="flex items-center gap-6 p-6 bg-slate-800/50 rounded-2xl border border-rose-500/30 animate-fadeInLeft animation-delay-600"><span className="text-4xl">❓</span><span className="text-xl text-slate-300">What does the crowd really think?</span></div>
                  </div>
                </div>
              )}

              {/* Scene 3: Solution */}
              {currentScene === 2 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-5xl font-bold text-white mb-6 animate-scaleIn">The Solution</h2>
                  <div className="flex items-center gap-5 mb-10 animate-fadeInUp animation-delay-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"><ThumbsUpLogo size={38} className="text-white" /></div>
                    <span className="text-4xl font-black"><span className="text-cyan-400">finny</span><span className="text-white">sights</span></span>
                  </div>
                  <p className="text-2xl text-center text-slate-300 max-w-3xl leading-relaxed animate-fadeInUp animation-delay-600">
                    Real-time <span className="text-cyan-400 font-bold">community sentiment</span> for stocks & crypto.<br/>
                    See what traders think <span className="text-emerald-400 font-bold">before</span> you trade.
                  </p>
                </div>
              )}

              {/* Scene 4: Voting Demo */}
              {currentScene === 3 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-4xl font-bold text-white mb-10 animate-fadeInUp">Simple Voting System</h2>
                  <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 w-full max-w-lg animate-scaleIn animation-delay-300">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center text-3xl font-bold text-emerald-400">AA</div>
                      <div><h3 className="text-2xl font-bold text-white">AAPL</h3><p className="text-slate-400">Apple Inc.</p></div>
                      <div className="ml-auto text-right"><p className="text-3xl font-bold font-mono text-white">$248.04</p><p className="text-emerald-400 font-mono">+0.12%</p></div>
                    </div>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-xl font-bold bg-emerald-500 text-white"><span>👍</span><span>8,935</span></div>
                      <div className="flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-xl font-bold bg-rose-500/20 text-rose-400"><span>👎</span><span>1,243</span></div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{width:'88%'}}/></div>
                    <p className="text-center text-slate-400 mt-2">88% Bullish</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 animate-bounce"><span className="text-4xl">👆</span><span className="text-xl text-cyan-400 font-bold">Vote recorded!</span></div>
                </div>
              )}

              {/* Scene 5: Features */}
              {currentScene === 4 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-4xl font-bold text-white mb-10 animate-fadeInUp">Packed with Features</h2>
                  <div className="grid grid-cols-3 gap-5 w-full max-w-4xl">
                    {[{icon:'📈',title:'Live Stock Prices',desc:'Real-time data'},{icon:'🪙',title:'Crypto Markets',desc:'BTC, ETH, SOL & more'},{icon:'⭐',title:'Watchlist',desc:'Track favorites'},{icon:'💬',title:'Comments',desc:'Discuss with traders'},{icon:'🏆',title:'Leaderboard',desc:'Follow top performers'},{icon:'🔔',title:'Price Alerts',desc:'Never miss a move'}].map((f,i) => (
                      <div key={i} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-fadeInUp" style={{animationDelay:`${i*150}ms`}}>
                        <span className="text-4xl mb-3 block">{f.icon}</span>
                        <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
                        <p className="text-sm text-slate-400">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene 6: Portfolio */}
              {currentScene === 5 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-4xl font-bold text-white mb-10 animate-fadeInUp">Track Your Portfolio</h2>
                  <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 w-full max-w-xl animate-scaleIn animation-delay-300">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-5 bg-slate-900/50 rounded-xl"><p className="text-sm text-slate-500 mb-1">Total Value</p><p className="text-3xl font-bold font-mono text-white">$47,832</p></div>
                      <div className="p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/30"><p className="text-sm text-slate-500 mb-1">Total P/L</p><p className="text-3xl font-bold font-mono text-emerald-400">+$8,234</p></div>
                    </div>
                    <div className="space-y-3">
                      {[{s:'AAPL',n:25,v:'$6,201',p:'+12.3%',c:'cyan'},{s:'NVDA',n:10,v:'$1,876',p:'+45.2%',c:'cyan'},{s:'BTC',n:0.5,v:'$52,261',p:'+8.1%',c:'orange'}].map((h,i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg animate-fadeInLeft" style={{animationDelay:`${(i+2)*200}ms`}}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-${h.c}-500/20 rounded-lg flex items-center justify-center text-${h.c}-400 font-bold`}>{h.s.substring(0,2)}</div>
                            <div><p className="font-bold text-white">{h.s}</p><p className="text-xs text-slate-500">{h.n} {h.s==='BTC'?'coins':'shares'}</p></div>
                          </div>
                          <div className="text-right"><p className="font-mono text-white">{h.v}</p><p className="text-sm font-mono text-emerald-400">{h.p}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scene 7: Leaderboard */}
              {currentScene === 6 && (
                <div className="flex flex-col items-center justify-center h-full px-12 animate-fadeIn">
                  <h2 className="text-4xl font-bold text-white mb-10 animate-fadeInUp">🏆 Follow Top Traders</h2>
                  <div className="w-full max-w-lg space-y-4">
                    {[{r:'🥇',a:'🦁',n:'CryptoKing',acc:87,rep:2847,bc:'amber-500'},{r:'🥈',a:'🦊',n:'StockMaster',acc:82,rep:2134,bc:'slate-400'},{r:'🥉',a:'🐺',n:'TradingPro',acc:79,rep:1876,bc:'amber-700'}].map((t,i) => (
                      <div key={i} className="flex items-center gap-5 p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-fadeInLeft" style={{animationDelay:`${(i+1)*300}ms`}}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-${t.bc}`}>{t.r}</div>
                        <span className="text-3xl">{t.a}</span>
                        <div className="flex-1"><p className="text-xl font-bold text-white">{t.n}</p><span className="text-emerald-400 text-sm">🎯 {t.acc}% accuracy</span></div>
                        <div className="text-right"><p className="text-2xl font-bold text-cyan-400">{t.rep.toLocaleString()}</p><p className="text-xs text-slate-500">REP</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene 8: Stats */}
              {currentScene === 7 && (
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                  <h2 className="text-4xl font-bold text-white mb-16 animate-fadeInUp">Join the Community</h2>
                  <div className="flex gap-16">
                    {[{v:'50K+',l:'Active Traders'},{v:'1M+',l:'Votes Cast'},{v:'500+',l:'Assets Tracked'}].map((s,i) => (
                      <div key={i} className="text-center animate-scaleIn" style={{animationDelay:`${(i+1)*300}ms`}}>
                        <p className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3">{s.v}</p>
                        <p className="text-xl text-slate-400">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene 9: CTA */}
              {currentScene === 8 && (
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                  <div className="flex items-center gap-5 mb-8 animate-scaleIn">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30"><ThumbsUpLogo size={48} className="text-white" /></div>
                    <span className="text-5xl font-black"><span className="text-cyan-400">finny</span><span className="text-white">sights</span></span>
                  </div>
                  <h2 className="text-5xl font-bold text-white mb-5 animate-fadeInUp animation-delay-300">Start Trading Smarter</h2>
                  <p className="text-xl text-slate-400 mb-10 animate-fadeInUp animation-delay-500">100% Free. No credit card required.</p>
                  <div className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-2xl font-bold text-white shadow-2xl shadow-cyan-500/30 animate-pulse animate-scaleIn animation-delay-700">
                    Join Now → finnysights.com
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Replay Button */}
        {hasStarted && !isPlaying && currentScene === scenes - 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <button onClick={restartDemo} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all flex items-center gap-2">↻ Replay</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Landing Page Component
export default function FinnysightsLanding() {
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [currentUser, setCurrentUser] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      console.log('Auth state changed:', user);
      
      if (user) {
        // Load or create user profile in Firestore
        const profile = await createUserProfile(user);
        setUserProfile(profile);
        console.log('User profile:', profile);
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = async (user) => {
    console.log('Auth success:', user);
    // Create/update user profile in Firestore
    const profile = await createUserProfile(user);
    setUserProfile(profile);
    // Redirect to dashboard
    window.location.href = '/app';
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openAuthModal = (mode) => {
    setAuthModal({ open: true, mode });
  };

  const sentimentData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', sentiment: 87, price: '487.23', change: 4.56, votes: 12453 },
    { symbol: 'AAPL', name: 'Apple Inc', sentiment: 72, price: '178.42', change: 1.23, votes: 9876 },
    { symbol: 'TSLA', name: 'Tesla Inc', sentiment: 45, price: '245.67', change: -2.34, votes: 15234 },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                <ThumbsUpLogo size={22} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">finnysights</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#why-free" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Why Free?</a>
              <a href="#reviews" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Reviews</a>
              <a href="#api" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">API</a>
            </div>
            
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-sm text-slate-400 hidden sm:block">
                    {currentUser.email}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                  <a 
                    href="/app"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all"
                  >
                    Dashboard
                  </a>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all"
                  >
                    Start Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Live Ticker */}
      <div className="pt-16">
        <LiveTicker />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Zap size={14} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">Real-time sentiment from 8+ global exchanges</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                Trade Smarter with{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Crowd Intelligence
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Harness real-time sentiment analysis from thousands of traders. Get institutional-grade market insights powered by community wisdom and AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-lg font-bold hover:from-cyan-400 hover:to-purple-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                >
                  Free Always
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="group px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-lg font-semibold hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={20} className="text-cyan-400" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-cyan-400" />
                  <span className="text-slate-400 text-sm">250K+ active traders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-purple-400" />
                  <span className="text-slate-400 text-sm">8 global exchanges</span>
                </div>
              </div>
            </div>
            
            {/* Sentiment Cards Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative space-y-4">
                {sentimentData.map((stock, i) => (
                  <div key={stock.symbol} style={{ transform: `translateX(${i * 20}px)` }}>
                    <SentimentCard {...stock} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything You Need to Trade Smarter</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Professional-grade tools that were once only available to hedge funds, now free for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={BarChart3}
              title="Real-time Sentiment"
              description="Track market sentiment across thousands of stocks with AI-powered analysis updated every second."
            />
            <FeatureCard 
              icon={Users}
              title="Community Voting"
              description="Join thousands of traders in voting on market direction. See what the crowd is thinking in real-time."
            />
            <FeatureCard 
              icon={Bell}
              title="Smart Alerts"
              description="Get notified when sentiment shifts dramatically or when your watchlist stocks show unusual activity."
            />
            <FeatureCard 
              icon={Globe}
              title="Global Coverage"
              description="Access sentiment data from 8 major exchanges worldwide including NYSE, NASDAQ, LSE, and more."
            />
            <FeatureCard 
              icon={Zap}
              title="API Access"
              description="Build your own trading tools with our powerful API. 10,000 free calls per day included."
            />
            <FeatureCard 
              icon={Shield}
              title="Anonymous Mode"
              description="Trade analysis without revealing your identity. Your privacy is our priority."
            />
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section id="why-free" className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">Why Is It Free?</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            We believe market intelligence should be accessible to everyone, not just Wall Street insiders. 
            Our freemium model is supported by optional premium features, but the core sentiment analysis 
            and community features will always be free.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <Check size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">No credit card required. Free forever.</span>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="relative py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Loved by Traders Worldwide</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-slate-400">4.9 out of 5 from 10,000+ reviews</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Alex T.', role: 'Day Trader', review: 'Finally a free platform that actually works! The sentiment data has been incredibly accurate for my trades.' },
              { name: 'Sarah M.', role: 'Swing Trader', review: 'I love the community voting feature. Its like having thousands of analysts working for you for free.' },
              { name: 'Michael R.', role: 'Retail Investor', review: 'The API is a game-changer. Built my own trading bot using their sentiment data. Highly recommend!' },
            ].map((review, i) => (
              <div key={i} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">{review.review}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">{review.name}</p>
                    <p className="text-sm text-slate-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Trade Smarter?</h2>
          <p className="text-slate-300 text-lg mb-8">
            Join 250,000+ traders already using finnysights to make better trading decisions.
          </p>
          <button 
            onClick={() => openAuthModal('signup')}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-lg font-bold hover:from-cyan-400 hover:to-purple-400 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <ThumbsUpLogo size={16} className="text-white" />
              </div>
              <span className="font-bold">finnysights</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">API Docs</a>
            </div>
            <p className="text-sm text-slate-500">© 2026 finnysights. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })}
        initialMode={authModal.mode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Demo Video Modal */}
      <DemoVideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-modalIn {
          animation: modalIn 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        @keyframes visualizer {
          from { height: 6px; }
          to { height: 24px; }
        }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
}
