import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Shield, Eye, EyeOff, Camera, Check, X, TrendingUp, TrendingDown, Star, Trash2, Plus, Clock, DollarSign, PieChart, ChevronRight, Edit3, LogOut, Moon, Sun, Globe, Lock, Mail, Phone, Building, Calendar, BarChart3, Zap, AtSign, EyeOff as Anonymous, RefreshCw, Home } from 'lucide-react';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getUserProfile, updateUserProfile, updateUserSettings, getWatchlist, removeFromWatchlist } from './firestore.js';

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

// Sidebar navigation item
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// Toggle switch component
const ToggleSwitch = ({ enabled, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-cyan-500' : 'bg-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
      enabled ? 'left-7' : 'left-1'
    }`} />
  </button>
);

// Profile Section
const ProfileSection = ({ user, profile, onUpdate, onSaveSettings, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
  });
  const [settings, setSettings] = useState(profile?.settings || {
    theme: 'dark',
    emailAlerts: true,
    pushNotifications: false,
    anonymousMode: false,
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
      });
      setSettings(profile.settings || {
        theme: 'dark',
        emailAlerts: true,
        pushNotifications: false,
        anonymousMode: false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await onSaveSettings(newSettings);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Failed to send reset email. Please try again.');
    }
    setIsSendingReset(false);
  };

  const displayName = settings.anonymousMode 
    ? 'Anonymous User' 
    : (formData.displayName || user?.email?.split('@')[0] || 'User');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile card */}
        <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
                {settings.anonymousMode ? '🎭' : (user?.email?.charAt(0).toUpperCase() || '👤')}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <p className="text-slate-400">{user?.email || 'No email'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">Free Plan</span>
                {settings.anonymousMode && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded flex items-center gap-1">
                    <EyeOff size={10} /> Anonymous
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Anonymous Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <EyeOff size={18} className="text-purple-400" />
              <div>
                <span className="text-sm font-semibold text-white">Anonymous Mode</span>
                <p className="text-xs text-slate-500">Hide your identity from other users</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.anonymousMode} 
              onChange={(value) => handleSettingChange('anonymousMode', value)}
            />
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Display Name <span className="text-slate-600">(shown to others)</span>
            </label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                disabled={!isEditing}
                placeholder="TraderAlex"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>

          {/* Email - Read only */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address <span className="text-emerald-500">(verified)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-400 opacity-60"
              />
              <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            </div>
          </div>

          {/* First/Last Name - Optional */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                First Name <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!isEditing}
                placeholder="John"
                className={`w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Last Name <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!isEditing}
                placeholder="Doe"
                className={`w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>

          {/* Phone - Optional */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Phone Number <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>

          {/* Company - Optional */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Company <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                disabled={!isEditing}
                placeholder="Acme Trading Co."
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Bell size={18} className="text-cyan-400" />
            Notification Settings
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-cyan-400" />
                <div>
                  <span className="text-sm text-white">Email Alerts</span>
                  <p className="text-xs text-slate-500">Price alerts & sentiment shifts</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.emailAlerts} 
                onChange={(value) => handleSettingChange('emailAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-purple-400" />
                <div>
                  <span className="text-sm text-white">Push Notifications</span>
                  <p className="text-xs text-slate-500">Real-time browser alerts</p>
                </div>
              </div>
              <ToggleSwitch 
                enabled={settings.pushNotifications} 
                onChange={(value) => handleSettingChange('pushNotifications', value)}
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Shield size={18} className="text-purple-400" />
            Security
          </h4>

          {/* Password Reset */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-slate-900/50 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-purple-400" />
              <div>
                <span className="text-sm text-white">Reset Password</span>
                <p className="text-xs text-slate-500">We'll send a reset link to {user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handlePasswordReset}
              disabled={isSendingReset || resetEmailSent}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                resetEmailSent 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              }`}
            >
              {isSendingReset ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : resetEmailSent ? (
                <>
                  <Check size={14} />
                  Email Sent!
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          {/* Privacy note */}
          <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Privacy First:</strong> Only your email is required. 
              All other information is optional. Enable Anonymous Mode to hide your identity from other users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Watchlist Section
const WatchlistSection = ({ watchlist, onRemove, isLoading }) => {
  const STOCK_DATA = {
    'AAPL': { name: 'Apple Inc.', price: 178.42, change: 1.32, sentiment: 87 },
    'NVDA': { name: 'NVIDIA Corp.', price: 487.23, change: 2.54, sentiment: 92 },
    'TSLA': { name: 'Tesla Inc.', price: 245.67, change: -1.27, sentiment: 58 },
    'MSFT': { name: 'Microsoft Corp.', price: 378.92, change: 0.33, sentiment: 81 },
    'AMZN': { name: 'Amazon.com Inc.', price: 145.78, change: -0.61, sentiment: 73 },
    'GOOGL': { name: 'Alphabet Inc.', price: 141.23, change: 0.89, sentiment: 79 },
    'META': { name: 'Meta Platforms', price: 367.89, change: 4.21, sentiment: 70 },
    'JPM': { name: 'JPMorgan Chase', price: 167.34, change: 0.45, sentiment: 71 },
    'BABA': { name: 'Alibaba Group', price: 78.23, change: -1.67, sentiment: 43 },
    'TSM': { name: 'Taiwan Semi.', price: 98.45, change: 3.21, sentiment: 88 },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Watchlist</h2>
        <a 
          href="/app"
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Stocks
        </a>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCw size={32} className="mx-auto text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading watchlist...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="p-12 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
          <Star size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
          <p className="text-slate-400 mb-4">Start tracking stocks by adding them to your watchlist</p>
          <a 
            href="/app"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all"
          >
            Browse Stocks
          </a>
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Change</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Sentiment</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item, i) => {
                const stockInfo = STOCK_DATA[item.symbol] || { name: item.name, price: 0, change: 0, sentiment: 50 };
                return (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                          stockInfo.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {item.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.symbol}</p>
                          <p className="text-xs text-slate-500">{stockInfo.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-white">${stockInfo.price}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-mono ${
                        stockInfo.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {stockInfo.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              stockInfo.sentiment >= 70 ? 'bg-emerald-500' : 
                              stockInfo.sentiment >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${stockInfo.sentiment}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{stockInfo.sentiment}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onRemove(item.symbol)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Account Status Section
const AccountStatusSection = ({ profile }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Account Status</h2>

    {/* Free plan card */}
    <div className="p-8 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                ACTIVE
              </span>
            </div>
            <h3 className="text-3xl font-black text-white">Free Forever</h3>
            <p className="text-slate-400 mt-1">Full access to all features</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-emerald-400">$0</p>
            <p className="text-sm text-slate-500">No credit card required</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            'Unlimited watchlist',
            'All 8 global exchanges',
            'Real-time sentiment',
            'Unlimited alerts',
            'API access (10K/day)',
            '5 custom themes'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Account stats */}
    <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
      <h4 className="font-semibold text-white mb-4">Account Statistics</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">{profile?.watchlist?.length || 0}</p>
          <p className="text-xs text-slate-500">Watchlist Items</p>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">{profile?.votes?.length || 0}</p>
          <p className="text-xs text-slate-500">Votes Cast</p>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">
            {profile?.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">Member Since</p>
        </div>
      </div>
    </div>

    {/* Why free */}
    <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Zap size={18} className="text-cyan-400" />
        Why is finnysights free?
      </h4>
      <p className="text-sm text-slate-400 leading-relaxed">
        We believe everyone deserves access to professional trading tools. Our mission is to democratize 
        market intelligence by making institutional-grade sentiment analysis available to all traders. 
        The more traders use finnysights, the better our community sentiment data becomes—it's a win-win.
      </p>
    </div>
  </div>
);

// Main Dashboard Component
export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoading(true);
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        const userWatchlist = await getWatchlist(user.uid);
        setWatchlist(userWatchlist || []);
        setIsLoading(false);
      } else {
        // Redirect to home if not logged in
        window.location.href = '/';
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleUpdateProfile = async (data) => {
    if (!currentUser) return;
    setIsSaving(true);
    await updateUserProfile(currentUser.uid, data);
    setProfile(prev => ({ ...prev, ...data }));
    setIsSaving(false);
  };

  const handleSaveSettings = async (settings) => {
    if (!currentUser) return;
    await updateUserSettings(currentUser.uid, settings);
    setProfile(prev => ({ ...prev, settings }));
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    if (!currentUser) return;
    const success = await removeFromWatchlist(currentUser.uid, symbol);
    if (success) {
      setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection 
            user={currentUser} 
            profile={profile} 
            onUpdate={handleUpdateProfile}
            onSaveSettings={handleSaveSettings}
            isSaving={isSaving}
          />
        );
      case 'watchlist':
        return (
          <WatchlistSection 
            watchlist={watchlist} 
            onRemove={handleRemoveFromWatchlist}
            isLoading={isLoading}
          />
        );
      case 'account':
        return <AccountStatusSection profile={profile} />;
      default:
        return (
          <ProfileSection 
            user={currentUser} 
            profile={profile} 
            onUpdate={handleUpdateProfile}
            onSaveSettings={handleSaveSettings}
            isSaving={isSaving}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto text-cyan-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-slate-900/50 border-r border-slate-800/50 p-4 sticky top-0">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <ThumbsUpLogo size={22} className="text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              finnysights
            </span>
          </a>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavItem icon={Home} label="Trading App" active={false} onClick={() => window.location.href = '/app'} />
            <div className="h-px bg-slate-800 my-3" />
            <NavItem icon={User} label="Profile" active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
            <NavItem icon={Star} label="Watchlist" active={activeSection === 'watchlist'} onClick={() => setActiveSection('watchlist')} badge={watchlist.length} />
            <NavItem icon={Zap} label="Account Status" active={activeSection === 'account'} onClick={() => setActiveSection('account')} />
          </nav>

          {/* User card */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center text-lg">
                  {profile?.settings?.anonymousMode ? '🎭' : (currentUser?.email?.charAt(0).toUpperCase() || '👤')}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm truncate max-w-[120px]">
                    {profile?.settings?.anonymousMode 
                      ? 'Anonymous' 
                      : (profile?.displayName || currentUser?.email?.split('@')[0] || 'User')}
                  </p>
                  <p className="text-xs text-slate-500">Free Plan</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700/50 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
