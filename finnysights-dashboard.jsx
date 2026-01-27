import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, Bell, Shield, Eye, EyeOff, Camera, Check, X, TrendingUp, TrendingDown, Star, Trash2, Plus, Clock, DollarSign, PieChart, ChevronRight, Edit3, LogOut, Moon, Sun, Globe, Lock, Mail, Phone, Building, Calendar, BarChart3, Zap, AtSign, EyeOff as Anonymous, Upload, Image } from 'lucide-react';
import { auth, storage } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getUserProfile, updateUserProfile } from './firestore.js';

// Avatar emoji options
const AVATAR_OPTIONS = [
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍💻', '👩‍💻', '🧑‍💻', 
  '🦁', '🐯', '🦊', '🐺', '🦅', '🦈', 
  '🚀', '💎', '📈', '🎯', '⚡', '🔥',
  '👑', '🎩', '🎭', '🤖', '👽', '🦄'
];

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

// Default user data (will be replaced by Firebase data)
const DEFAULT_USER_DATA = {
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  avatar: '👨‍💼',
  plan: 'Free',
  joinDate: '',
  totalTrades: 0,
  winRate: 0,
  totalProfit: 0,
  isAnonymous: false,
};

const WATCHLIST = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 487.23, change: 2.54, sentiment: 92, alerts: true },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 178.42, change: 1.32, sentiment: 87, alerts: true },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -1.27, sentiment: 58, alerts: false },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: 0.33, sentiment: 81, alerts: true },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 145.78, change: -0.61, sentiment: 73, alerts: false },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 141.23, change: 0.89, sentiment: 79, alerts: true },
];

const TRADE_HISTORY = [
  { id: 1, ticker: 'NVDA', type: 'BUY', shares: 50, price: 465.00, total: 23250, date: '2025-01-20', status: 'completed', pnl: 1111.50 },
  { id: 2, ticker: 'AAPL', type: 'SELL', shares: 100, price: 180.50, total: 18050, date: '2025-01-19', status: 'completed', pnl: 450.00 },
  { id: 3, ticker: 'TSLA', type: 'BUY', shares: 25, price: 252.00, total: 6300, date: '2025-01-18', status: 'completed', pnl: -158.25 },
  { id: 4, ticker: 'MSFT', type: 'BUY', shares: 30, price: 375.00, total: 11250, date: '2025-01-17', status: 'completed', pnl: 117.60 },
  { id: 5, ticker: 'META', type: 'SELL', shares: 40, price: 365.00, total: 14600, date: '2025-01-15', status: 'completed', pnl: 892.00 },
  { id: 6, ticker: 'AMD', type: 'BUY', shares: 75, price: 142.00, total: 10650, date: '2025-01-14', status: 'pending', pnl: 0 },
];

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
    {badge && (
      <span className="ml-auto px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// Stats card
const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
  <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      {subValue && (
        <span className={`text-xs font-semibold ${subValue.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {subValue}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

// Profile Section
const ProfileSection = ({ user, onUpdate, onSave, authUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update formData when user prop changes
  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
    setIsSaving(false);
  };

  const selectAvatar = (emoji) => {
    setFormData({...formData, avatar: emoji, avatarType: 'emoji'});
    setShowAvatarPicker(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !authUser) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create storage reference
      const storageRef = ref(storage, `avatars/${authUser.uid}/${Date.now()}_${file.name}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update form data with image URL
      setFormData({...formData, avatar: downloadURL, avatarType: 'image'});
      setShowAvatarPicker(false);
      
      console.log('Avatar uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    }
    setIsUploading(false);
  };

  const isAvatarImage = (avatar) => {
    return avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
  };

  const displayName = formData.isAnonymous ? 'Anonymous User' : (formData.displayName || formData.email?.split('@')[0] || 'User');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-semibold text-white hover:bg-slate-700 transition-all"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-700 transition-all"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg text-sm font-semibold text-white hover:bg-cyan-400 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Avatar section */}
      <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-6">
          <div className="relative">
            {/* Avatar Display - supports both emoji and image */}
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg overflow-hidden">
              {formData.isAnonymous ? (
                '🎭'
              ) : isAvatarImage(formData.avatar) ? (
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.avatar || '👨‍💼'
              )}
            </div>
            
            {/* Edit Avatar Button */}
            {isEditing && (
              <button 
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-2 bg-cyan-500 rounded-full text-white hover:bg-cyan-400 transition-all"
              >
                <Camera size={14} />
              </button>
            )}
            
            {/* Avatar Picker Dropdown */}
            {showAvatarPicker && isEditing && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 w-72">
                {/* Upload Photo Option */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2 font-semibold">Upload Photo</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 border-dashed rounded-lg text-sm text-slate-300 transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="text-cyan-400" />
                        Choose Image
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 mt-1 text-center">Max 5MB • JPG, PNG, GIF</p>
                </div>
                
                {/* Divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-slate-700" />
                  <span className="text-xs text-slate-500">or choose emoji</span>
                  <div className="flex-1 h-px bg-slate-700" />
                </div>
                
                {/* Emoji Options */}
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => selectAvatar(emoji)}
                      className={`w-9 h-9 text-xl rounded-lg hover:bg-slate-700 transition-all flex items-center justify-center ${formData.avatar === emoji ? 'bg-cyan-500/30 ring-2 ring-cyan-500' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {displayName}
              {formData.isAnonymous && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                  Anonymous
                </span>
              )}
            </h3>
            <p className="text-slate-400">{formData.isAnonymous ? '••••••@••••••' : formData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">
                {user.plan} Plan
              </span>
              <span className="text-xs text-slate-500">Member since {user.joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Mode Toggle */}
      <div className="p-6 bg-gradient-to-br from-purple-500/10 to-slate-800/30 rounded-xl border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <EyeOff size={24} className="text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Anonymous Mode</h4>
              <p className="text-sm text-slate-400">Hide your identity from other users. Only your handle will be visible.</p>
            </div>
          </div>
          <button
            onClick={() => isEditing && setFormData({...formData, isAnonymous: !formData.isAnonymous})}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              formData.isAnonymous ? 'bg-purple-500' : 'bg-slate-600'
            } ${!isEditing && 'opacity-60 cursor-not-allowed'}`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                formData.isAnonymous ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <User size={18} className="text-cyan-400" />
            Account Information
          </h4>
          
          {/* Display Name / Handle - Optional */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Display Name / Handle <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                disabled={!isEditing}
                placeholder="Choose a unique handle..."
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-600 ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">This is how other users will see you in the community.</p>
          </div>

          {/* Email - Required */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>
          
          {/* Name fields - Optional */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                First Name <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
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
                value={formData.lastName || ''}
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
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Phone Number <span className="text-slate-600">(optional)</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={formData.phone || ''}
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
                value={formData.company || ''}
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

        <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Shield size={18} className="text-purple-400" />
            Security Settings
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-white ${
                  isEditing ? 'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20' : 'opacity-60'
                } transition-all`}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              <button className="text-cyan-400 hover:underline">Forgot your password? Request a reset link</button>
            </p>
          </div>

          <div className="pt-4 space-y-3">
            {/* Password Reset Request */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-slate-900/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-purple-400" />
                <div>
                  <span className="text-sm text-white">Reset Password via Email</span>
                  <p className="text-xs text-slate-500">We'll send a reset code to {user.email}</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded hover:bg-purple-500/30 transition-all">
                Send Code
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-cyan-400" />
                <span className="text-sm text-white">Login Notifications</span>
              </div>
              <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded">
                Enabled
              </button>
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">Privacy First:</strong> Only your email is required. 
              All other information is optional and will only be used to enhance your experience. 
              Enable Anonymous Mode to hide your identity from other users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Watchlist Section
const WatchlistSection = () => {
  const [watchlist, setWatchlist] = useState(WATCHLIST);
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleAlert = (ticker) => {
    setWatchlist(prev => prev.map(item => 
      item.ticker === ticker ? {...item, alerts: !item.alerts} : item
    ));
  };

  const removeStock = (ticker) => {
    setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 rounded-lg text-sm font-semibold text-white hover:bg-cyan-400 transition-all"
        >
          <Plus size={16} />
          Add Stock
        </button>
      </div>

      <div className="grid gap-4">
        {watchlist.map((stock, index) => (
          <div 
            key={stock.ticker}
            className="group p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{stock.ticker[0]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{stock.ticker}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      stock.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{stock.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-white font-mono">${stock.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stock.sentiment >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${stock.sentiment}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{stock.sentiment}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(stock.ticker)}
                    className={`p-2 rounded-lg transition-all ${
                      stock.alerts 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
                    }`}
                    title={stock.alerts ? 'Alerts enabled' : 'Enable alerts'}
                  >
                    <Bell size={18} />
                  </button>
                  <button
                    onClick={() => removeStock(stock.ticker)}
                    className="p-2 bg-slate-700/50 rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 bg-slate-700/50 rounded-lg text-slate-500 hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {watchlist.length === 0 && (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">Your watchlist is empty</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold hover:bg-cyan-500/30 transition-all"
          >
            Add your first stock
          </button>
        </div>
      )}
    </div>
  );
};

// Trading History Section
const TradingHistorySection = () => {
  const [filter, setFilter] = useState('all');

  const filteredTrades = TRADE_HISTORY.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'buy') return trade.type === 'BUY';
    if (filter === 'sell') return trade.type === 'SELL';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trading History</h2>
        <div className="flex gap-2">
          {['all', 'buy', 'sell'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={BarChart3} 
          label="Total Trades" 
          value={USER_DATA.totalTrades} 
          color="from-cyan-500 to-blue-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Win Rate" 
          value={`${USER_DATA.winRate}%`}
          subValue="+5.2%"
          color="from-emerald-500 to-teal-500"
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Profit" 
          value={`$${USER_DATA.totalProfit.toLocaleString()}`}
          subValue="+$2,341"
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          icon={PieChart} 
          label="Avg. Position" 
          value="$8,420"
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Trade table */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Shares</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">P&L</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, i) => (
                <tr key={trade.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-white">{trade.ticker}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono">{trade.shares}</td>
                  <td className="px-6 py-4 text-slate-300 font-mono">${trade.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-white font-mono font-semibold">${trade.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-semibold ${
                      trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl === 0 ? '-' : `$${trade.pnl.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{trade.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      trade.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Account Status Section (Free Plan)
const AccountStatusSection = () => (
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
            'API access',
            'Priority support'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
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
        market intelligence by making institutional-grade sentiment analysis available to all traders, 
        regardless of portfolio size. The more traders use finnysights, the better our community 
        sentiment data becomes—it's a win-win.
      </p>
    </div>

    {/* Account stats */}
    <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
      <h4 className="font-semibold text-white mb-4">Account Statistics</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">247</p>
          <p className="text-xs text-slate-500">Total Trades</p>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">1,247</p>
          <p className="text-xs text-slate-500">Votes Cast</p>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg">
          <p className="text-2xl font-bold text-white">Jan 2026</p>
          <p className="text-xs text-slate-500">Member Since</p>
        </div>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState(DEFAULT_USER_DATA);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth changes and load profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        
        // Load user profile from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              ...DEFAULT_USER_DATA,
              ...profile,
              email: firebaseUser.email || profile.email || '',
              displayName: profile.displayName || firebaseUser.displayName || '',
              joinDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New Member',
            });
          } else {
            // No profile yet, use auth data
            setUser({
              ...DEFAULT_USER_DATA,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              joinDate: 'New Member',
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setUser({
            ...DEFAULT_USER_DATA,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
          });
        }
      } else {
        // Not logged in, redirect to home
        window.location.href = '/';
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save profile to Firestore
  const handleSaveProfile = async (profileData) => {
    if (!authUser) return;
    
    try {
      await updateUserProfile(authUser.uid, {
        displayName: profileData.displayName,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        company: profileData.company,
        avatar: profileData.avatar,
        isAnonymous: profileData.isAnonymous,
      });
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection user={user} onUpdate={setUser} onSave={handleSaveProfile} authUser={authUser} />;
      case 'watchlist':
        return <WatchlistSection />;
      case 'history':
        return <TradingHistorySection />;
      case 'account':
        return <AccountStatusSection />;
      default:
        return <ProfileSection user={user} onUpdate={setUser} onSave={handleSaveProfile} authUser={authUser} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading your profile...</p>
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
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <ThumbsUpLogo size={22} className="text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              finnysights
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavItem icon={User} label="Profile" active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
            <NavItem icon={Star} label="Watchlist" active={activeSection === 'watchlist'} onClick={() => setActiveSection('watchlist')} badge={WATCHLIST.length} />
            <NavItem icon={Clock} label="Trade History" active={activeSection === 'history'} onClick={() => setActiveSection('history')} />
            <NavItem icon={Zap} label="Account Status" active={activeSection === 'account'} onClick={() => setActiveSection('account')} />
          </nav>

          {/* User card */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                  {user.isAnonymous ? '🎭' : (
                    user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.avatar || '👨‍💼'
                    )
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {user.isAnonymous ? 'Anonymous' : (user.displayName || user.email?.split('@')[0] || 'User')}
                  </p>
                  <p className="text-xs text-slate-500">{user.plan} Plan</p>
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
