import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Globe, Zap, BarChart3, Shield, Bell, ChevronRight, Eye, EyeOff, Check, Star, ArrowRight, Play, Lock, Mail, User, Building, Phone } from 'lucide-react';

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

// Live ticker simulation
const LiveTicker = () => {
  const tickers = [
    { symbol: 'AAPL', price: 178.42, change: 2.34 },
    { symbol: 'NVDA', price: 487.23, change: 12.45 },
    { symbol: 'TSLA', price: 245.67, change: -3.12 },
    { symbol: 'MSFT', price: 378.92, change: 1.23 },
    { symbol: 'AMZN', price: 145.78, change: -0.89 },
    { symbol: 'GOOGL', price: 141.23, change: 0.67 },
    { symbol: 'META', price: 367.89, change: 4.21 },
    { symbol: 'JPM', price: 167.34, change: 0.45 },
  ];

  return (
    <div className="overflow-hidden bg-slate-900/50 border-y border-slate-800/50">
      <div className="flex animate-scroll">
        {[...tickers, ...tickers].map((t, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-2 border-r border-slate-800/50 whitespace-nowrap">
            <span className="font-bold text-white">{t.symbol}</span>
            <span className="font-mono text-sm text-slate-300">${t.price}</span>
            <span className={`font-mono text-sm ${t.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.change >= 0 ? '+' : ''}{t.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature card
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="group relative p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:transform hover:scale-105">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);

// Testimonial card
const TestimonialCard = ({ quote, author, role, avatar }) => (
  <div className="p-6 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/50">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
    <p className="text-slate-300 mb-4 italic">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg">
        {avatar}
      </div>
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

// Stat counter
const StatCounter = ({ value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const target = parseInt(value);
    const increment = target / 50;
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.min(prev + increment, target);
      });
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <p className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        {Math.floor(count).toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );
};

// Auth Modal
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter code, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    agreeTerms: false,
    marketingEmails: false,
    resetCode: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setResetStep(1);
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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'reset') {
      if (resetStep === 1) {
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
      } else if (resetStep === 2) {
        if (!formData.resetCode) {
          newErrors.resetCode = 'Verification code is required';
        } else if (formData.resetCode.length !== 6) {
          newErrors.resetCode = 'Code must be 6 digits';
        }
      } else if (resetStep === 3) {
        if (!formData.newPassword) {
          newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
          newErrors.confirmNewPassword = 'Passwords do not match';
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    if (mode === 'reset') {
      if (resetStep === 1) {
        setResetStep(2);
      } else if (resetStep === 2) {
        setResetStep(3);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMode('login');
          setResetStep(1);
          setFormData(prev => ({ ...prev, resetCode: '', newPassword: '', confirmNewPassword: '' }));
        }, 2000);
      }
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  const handleBackToLogin = () => {
    setMode('login');
    setResetStep(1);
    setFormData(prev => ({ ...prev, resetCode: '', newPassword: '', confirmNewPassword: '' }));
    setErrors({});
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
                {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Account Created!' : 'Password Reset!'}
              </h3>
              <p className="text-slate-400">
                {mode === 'login' ? 'Redirecting to dashboard...' : mode === 'signup' ? 'Check your email to verify your account.' : 'Your password has been updated successfully.'}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
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
                    : resetStep === 1 
                    ? 'Enter your email to receive a reset code'
                    : resetStep === 2
                    ? 'Enter the 6-digit code sent to your email'
                    : 'Create a new password for your account'}
                </p>
              </div>

              {/* Password Reset Progress */}
              {mode === 'reset' && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        resetStep >= step 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {resetStep > step ? <Check size={16} /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-8 h-0.5 ${resetStep > step ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Reset Step 1: Email */}
                {mode === 'reset' && resetStep === 1 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all ${
                          errors.email ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                  </div>
                )}

                {/* Password Reset Step 2: Verification Code */}
                {mode === 'reset' && resetStep === 2 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Verification Code</label>
                    <p className="text-xs text-slate-500 mb-3">We sent a 6-digit code to {formData.email}</p>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="resetCode"
                        value={formData.resetCode}
                        onChange={handleChange}
                        placeholder="000000"
                        maxLength={6}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-center text-lg tracking-widest ${
                          errors.resetCode ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                        }`}
                      />
                    </div>
                    {errors.resetCode && <p className="text-xs text-rose-400 mt-1">{errors.resetCode}</p>}
                    <p className="text-xs text-slate-500 mt-3">
                      Didn't receive the code? <button type="button" className="text-cyan-400 hover:underline">Resend code</button>
                    </p>
                  </div>
                )}

                {/* Password Reset Step 3: New Password */}
                {mode === 'reset' && resetStep === 3 && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all ${
                            errors.newPassword ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="text-xs text-rose-400 mt-1">{errors.newPassword}</p>}
                      <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all ${
                            errors.confirmNewPassword ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                        />
                      </div>
                      {errors.confirmNewPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmNewPassword}</p>}
                    </div>
                  </>
                )}

                {/* Login/Signup fields */}
                {mode !== 'reset' && mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name <span className="text-slate-600">(optional)</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.firstName ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name <span className="text-slate-600">(optional)</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.lastName ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                )}

                {/* Email/Password for login/signup only */}
                {mode !== 'reset' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.email ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-12 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.password ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
                    </div>
                  </>
                )}

                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                            errors.confirmPassword ? 'border-rose-500' : 'border-slate-700/50 focus:border-cyan-500/50'
                          }`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company (Optional)</label>
                        <div className="relative">
                          <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="Acme Inc."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone (Optional)</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            formData.agreeTerms 
                              ? 'bg-cyan-500 border-cyan-500' 
                              : errors.agreeTerms 
                                ? 'border-rose-500' 
                                : 'border-slate-600 group-hover:border-slate-500'
                          }`}>
                            {formData.agreeTerms && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>
                        </span>
                      </label>
                      {errors.agreeTerms && <p className="text-xs text-rose-400">{errors.agreeTerms}</p>}

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            name="marketingEmails"
                            checked={formData.marketingEmails}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            formData.marketingEmails 
                              ? 'bg-cyan-500 border-cyan-500' 
                              : 'border-slate-600 group-hover:border-slate-500'
                          }`}>
                            {formData.marketingEmails && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          Send me market updates and trading insights
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className="w-4 h-4 rounded border-2 border-slate-600 group-hover:border-slate-500 transition-all" />
                      </div>
                      <span className="text-xs text-slate-400">Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : resetStep === 1 ? 'Send Reset Code' : resetStep === 2 ? 'Verify Code' : 'Reset Password'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle mode / Back to login */}
              <p className="text-center text-sm text-slate-400 mt-6">
                {mode === 'reset' ? (
                  <button
                    onClick={handleBackToLogin}
                    className="text-cyan-400 font-semibold hover:underline flex items-center gap-1 mx-auto"
                  >
                    ← Back to sign in
                  </button>
                ) : (
                  <>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      {mode === 'login' ? 'Sign up free' : 'Sign in'}
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Landing Page
export default function FinnysightsLanding() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openLogin = () => setAuthModal({ isOpen: true, mode: 'login' });
  const openSignup = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const closeAuth = () => setAuthModal({ isOpen: false, mode: 'login' });

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <AnimatedBackground />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s ease-out forwards;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <ThumbsUpLogo size={22} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  finnysights
                </span>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#why-free" className="text-sm text-slate-400 hover:text-white transition-colors">Why Free?</a>
                <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Reviews</a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API</a>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={openLogin}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={openSignup}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-sm text-white hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Start Free
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Live Ticker */}
        <div className="pt-16">
          <LiveTicker />
        </div>

        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8 animate-slideUp">
                <Zap size={14} className="text-cyan-400" />
                <span className="text-sm text-cyan-400 font-semibold">Real-time sentiment from 8+ global exchanges</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Trade Smarter with{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Crowd Intelligence
                </span>
              </h1>
              
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
                Harness real-time sentiment analysis from thousands of traders. Get institutional-grade market insights powered by community wisdom and AI.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <button 
                  onClick={openSignup}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-2"
                >
                  Free Always
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group px-8 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl font-bold text-lg text-white hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center gap-2">
                  <Play size={20} className="text-cyan-400" />
                  Watch Demo
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-8 mt-12 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={16} className="text-cyan-400" />
                  <span className="text-xs">250K+ active traders</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Globe size={16} className="text-purple-400" />
                  <span className="text-xs">8 global exchanges</span>
                </div>
              </div>
            </div>

            {/* App preview mockup */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="relative mx-auto max-w-5xl">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-cyan-500/10">
                  {/* Window controls */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="flex-1 text-center">
                      <span className="text-xs text-slate-500">finnysights.io/dashboard</span>
                    </div>
                  </div>
                  {/* Dashboard preview */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {['NVDA', 'AAPL', 'TSLA', 'MSFT'].map((ticker, i) => (
                        <div key={ticker} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">{ticker}</span>
                            <span className={`text-xs ${i === 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {i === 2 ? '-3.12%' : `+${(Math.random() * 5).toFixed(2)}%`}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${i === 2 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${60 + Math.random() * 30}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 h-48 bg-slate-800/50 rounded-xl border border-slate-700/30 flex items-center justify-center">
                        <div className="text-slate-600 flex items-center gap-2">
                          <BarChart3 size={24} />
                          <span>Sentiment Chart</span>
                        </div>
                      </div>
                      <div className="h-48 bg-slate-800/50 rounded-xl border border-slate-700/30 p-4">
                        <div className="text-xs text-slate-500 mb-3">Community Votes</div>
                        <div className="space-y-2">
                          {[92, 78, 65, 43].map((v, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${v}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-8">{v}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-slate-800/50 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCounter value="250000" label="Active Traders" suffix="+" />
              <StatCounter value="1200000" label="Daily Votes" suffix="+" />
              <StatCounter value="8" label="Global Exchanges" />
              <StatCounter value="99" label="Uptime" suffix="%" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Trade Confidently</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Professional-grade tools and insights, accessible to every trader
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Globe}
                title="Global Exchange Coverage"
                description="Track sentiment across NYSE, NASDAQ, LSE, TSE, SSE, HKEX, Euronext, and ASX in real-time."
                color="from-cyan-500 to-blue-500"
              />
              <FeatureCard
                icon={BarChart3}
                title="AI Sentiment Analysis"
                description="Institutional-grade sentiment scoring powered by machine learning and natural language processing."
                color="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={Users}
                title="Community Wisdom"
                description="Vote on stocks and see real-time sentiment from our community of 250,000+ active traders."
                color="from-emerald-500 to-teal-500"
              />
              <FeatureCard
                icon={Zap}
                title="Real-Time Data"
                description="Sub-second updates on prices, sentiment shifts, and community voting trends."
                color="from-amber-500 to-orange-500"
              />
              <FeatureCard
                icon={Shield}
                title="Third-Party Validation"
                description="Cross-reference with Reuters, Bloomberg, and S&P for confidence in your trades."
                color="from-rose-500 to-red-500"
              />
              <FeatureCard
                icon={Bell}
                title="Smart Alerts"
                description="Custom notifications for sentiment shifts, price movements, and community activity."
                color="from-indigo-500 to-violet-500"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-4 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Trusted by Traders Worldwide</h2>
              <p className="text-slate-400">See what our community has to say</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard
                quote="finnysights has completely changed how I approach trading. The sentiment data is incredibly accurate."
                author="Sarah Chen"
                role="Day Trader, New York"
                avatar="👩‍💼"
              />
              <TestimonialCard
                quote="Finally, a platform that combines social sentiment with institutional-grade analysis. Game changer!"
                author="Michael Torres"
                role="Portfolio Manager, London"
                avatar="👨‍💻"
              />
              <TestimonialCard
                quote="The community voting feature gives me an edge I never had before. Can't believe this is free!"
                author="Emma Watson"
                role="Retail Investor, Sydney"
                avatar="👩‍🦰"
              />
            </div>
          </div>
        </section>

        {/* 100% Free Section */}
        <section id="why-free" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
                <Zap size={14} className="text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">100% Free Forever</span>
              </div>
              <h2 className="text-4xl font-black mb-4">
                Every Feature.{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Zero Cost.</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                We believe everyone deserves access to professional trading tools. That's why finnysights is completely free—no hidden fees, no premium tiers, no catch.
              </p>
            </div>

            {/* Single Free Plan Card */}
            <div className="max-w-2xl mx-auto">
              <div className="p-10 bg-gradient-to-b from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full mb-4">
                      <span className="text-emerald-400 font-bold">FULL ACCESS</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-6xl font-black text-white">$0</span>
                      <span className="text-slate-400 text-xl">/forever</span>
                    </div>
                    <p className="text-slate-400">No credit card required. Ever.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {[
                      'Unlimited watchlist stocks',
                      'All 8 global exchanges',
                      'Real-time sentiment data',
                      'Third-party source breakdown',
                      'Community voting & posts',
                      'Unlimited price alerts',
                      'Full historical data',
                      'API access (10K calls/day)',
                      'All chart timeframes',
                      'SMS & push notifications',
                      'Custom themes',
                      'Priority support'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                          <Check size={12} className="text-emerald-400" />
                        </div>
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={openSignup}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-white hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    Get Started — It's Free
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Why Free? */}
            <div className="mt-16 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-center text-white mb-8">Why is finnysights free?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-cyan-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Community Driven</h4>
                  <p className="text-sm text-slate-400">Our sentiment data gets better with more users. You make us better.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield size={24} className="text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Democratize Trading</h4>
                  <p className="text-sm text-slate-400">Professional tools shouldn't be locked behind paywalls.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Mission Focused</h4>
                  <p className="text-sm text-slate-400">We're funded to help traders succeed, not to maximize revenue.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl border border-slate-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4">Ready to Trade Smarter?</h2>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                  Join 250,000+ traders using finnysights to make better-informed decisions. It's completely free.
                </p>
                <button 
                  onClick={openSignup}
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-2 mx-auto"
                >
                  Create Free Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-500 mt-4">No credit card required • Free forever</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <ThumbsUpLogo size={22} className="text-white" />
                  </div>
                  <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    finnysights
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4 max-w-xs">
                  Real-time sentiment analysis and community intelligence for smarter trading decisions.
                </p>
                <div className="flex gap-4">
                  {['twitter', 'linkedin', 'github', 'discord'].map(s => (
                    <a key={s} href="#" className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                      <span className="text-xs uppercase">{s[0]}</span>
                    </a>
                  ))}
                </div>
              </div>
              
              {[
                { title: 'Product', links: ['Features', 'Why Free?', 'API', 'Integrations'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Security'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">© 2025 finnysights. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeAuth} 
        initialMode={authModal.mode}
      />
    </div>
  );
}
