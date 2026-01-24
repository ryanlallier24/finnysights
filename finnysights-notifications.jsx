import React, { useState } from 'react';
import { Bell, BellOff, Settings, Trash2, Check, X, Filter, Clock, TrendingUp, TrendingDown, Activity, MessageSquare, Newspaper, AlertTriangle, DollarSign, Users, Globe, ChevronRight, ChevronDown, Volume2, VolumeX, Mail, Smartphone, Monitor, Zap, Star, BarChart3, Target, Shield } from 'lucide-react';

// Mock notifications data
const NOTIFICATIONS = [
  { id: 1, type: 'price_alert', title: 'NVDA Price Alert', message: 'NVIDIA has risen above your target price of $485', ticker: 'NVDA', time: '2 minutes ago', timestamp: Date.now() - 120000, read: false, priority: 'high' },
  { id: 2, type: 'sentiment_shift', title: 'Sentiment Shift Detected', message: 'TSLA sentiment has dropped from Bullish to Neutral', ticker: 'TSLA', time: '15 minutes ago', timestamp: Date.now() - 900000, read: false, priority: 'medium' },
  { id: 3, type: 'breaking_news', title: 'Breaking News', message: 'Federal Reserve announces interest rate decision - markets reacting', ticker: null, time: '1 hour ago', timestamp: Date.now() - 3600000, read: false, priority: 'high' },
  { id: 4, type: 'community', title: 'Trending Discussion', message: 'AAPL is trending in community with 500+ new posts', ticker: 'AAPL', time: '2 hours ago', timestamp: Date.now() - 7200000, read: true, priority: 'low' },
  { id: 5, type: 'watchlist', title: 'Watchlist Update', message: 'MSFT in your watchlist is up 3.2% today', ticker: 'MSFT', time: '3 hours ago', timestamp: Date.now() - 10800000, read: true, priority: 'low' },
  { id: 6, type: 'volume_spike', title: 'Unusual Volume', message: 'AMD experiencing 3x average trading volume', ticker: 'AMD', time: '4 hours ago', timestamp: Date.now() - 14400000, read: true, priority: 'medium' },
  { id: 7, type: 'analyst_upgrade', title: 'Analyst Upgrade', message: 'Goldman Sachs upgrades GOOGL to Strong Buy', ticker: 'GOOGL', time: '5 hours ago', timestamp: Date.now() - 18000000, read: true, priority: 'medium' },
  { id: 8, type: 'earnings', title: 'Earnings Reminder', message: 'META reports earnings tomorrow after market close', ticker: 'META', time: '1 day ago', timestamp: Date.now() - 86400000, read: true, priority: 'medium' },
];

// Alert type configurations
const ALERT_TYPES = [
  { id: 'price_alert', name: 'Price Alerts', icon: DollarSign, description: 'When stocks hit your target prices', color: 'cyan' },
  { id: 'sentiment_shift', name: 'Sentiment Shifts', icon: Activity, description: 'When sentiment changes significantly', color: 'purple' },
  { id: 'breaking_news', name: 'Breaking News', icon: Newspaper, description: 'Important market-moving news', color: 'amber' },
  { id: 'community', name: 'Community Activity', icon: Users, description: 'Trending discussions and posts', color: 'emerald' },
  { id: 'watchlist', name: 'Watchlist Updates', icon: Star, description: 'Updates on your watched stocks', color: 'blue' },
  { id: 'volume_spike', name: 'Volume Spikes', icon: BarChart3, description: 'Unusual trading volume detected', color: 'rose' },
  { id: 'analyst_upgrade', name: 'Analyst Changes', icon: Target, description: 'Rating upgrades and downgrades', color: 'indigo' },
  { id: 'earnings', name: 'Earnings Events', icon: Clock, description: 'Upcoming earnings reports', color: 'teal' },
];

// Notification icon mapping
const getNotificationIcon = (type) => {
  const iconMap = {
    price_alert: DollarSign,
    sentiment_shift: Activity,
    breaking_news: Newspaper,
    community: Users,
    watchlist: Star,
    volume_spike: BarChart3,
    analyst_upgrade: Target,
    earnings: Clock,
  };
  return iconMap[type] || Bell;
};

// Get icon color
const getIconColor = (type) => {
  const colorMap = {
    price_alert: 'bg-cyan-500/20 text-cyan-400',
    sentiment_shift: 'bg-purple-500/20 text-purple-400',
    breaking_news: 'bg-amber-500/20 text-amber-400',
    community: 'bg-emerald-500/20 text-emerald-400',
    watchlist: 'bg-blue-500/20 text-blue-400',
    volume_spike: 'bg-rose-500/20 text-rose-400',
    analyst_upgrade: 'bg-indigo-500/20 text-indigo-400',
    earnings: 'bg-teal-500/20 text-teal-400',
  };
  return colorMap[type] || 'bg-slate-500/20 text-slate-400';
};

// Priority badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

// Single notification item
const NotificationItem = ({ notification, onRead, onDelete, isSelected, onSelect }) => {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getIconColor(notification.type);

  return (
    <div 
      className={`group relative flex items-start gap-4 p-4 border-b border-slate-800/50 transition-all cursor-pointer ${
        !notification.read ? 'bg-cyan-500/5' : 'hover:bg-slate-800/30'
      } ${isSelected ? 'bg-cyan-500/10' : ''}`}
      onClick={() => onSelect(notification.id)}
    >
      {/* Checkbox */}
      <div className="pt-1">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(notification.id); }}
          className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
            isSelected 
              ? 'bg-cyan-500 border-cyan-500' 
              : 'border-slate-600 hover:border-slate-500'
          }`}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </button>
      </div>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`font-semibold text-sm ${notification.read ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          )}
          <PriorityBadge priority={notification.priority} />
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-3 mt-2">
          {notification.ticker && (
            <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs font-semibold text-white">
              ${notification.ticker}
            </span>
          )}
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={10} />
            {notification.time}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-rose-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// Alert preference toggle
const AlertToggle = ({ alert, enabled, onToggle }) => {
  const colorClass = `text-${alert.color}-400`;
  const bgClass = `bg-${alert.color}-500/20`;
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <alert.icon size={20} className={colorClass} />
        </div>
        <div>
          <p className="font-semibold text-white">{alert.name}</p>
          <p className="text-xs text-slate-500">{alert.description}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(alert.id)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
};

// Delivery channel setting
const DeliveryChannel = ({ icon: Icon, name, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
        <Icon size={20} className="text-slate-400" />
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-slate-700'
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);

// Main Notification Center
export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [alertPrefs, setAlertPrefs] = useState(
    Object.fromEntries(ALERT_TYPES.map(a => [a.id, true]))
  );
  const [deliveryChannels, setDeliveryChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab !== 'all') return n.type === activeTab;
    return true;
  });

  // Handle actions
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => prev.map(n => 
      selectedIds.includes(n.id) ? {...n, read: true} : n
    ));
    setSelectedIds([]);
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const clearAll = () => {
    setNotifications([]);
    setSelectedIds([]);
  };

  const toggleAlertPref = (id) => {
    setAlertPrefs(prev => ({...prev, [id]: !prev[id]}));
  };

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
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <Bell size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notification Center</h1>
              <p className="text-sm text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showSettings 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {showSettings ? (
          /* Settings Panel */
          <div className="space-y-6">
            {/* Alert Types */}
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                Alert Types
              </h2>
              <div className="grid gap-3">
                {ALERT_TYPES.map(alert => (
                  <AlertToggle
                    key={alert.id}
                    alert={alert}
                    enabled={alertPrefs[alert.id]}
                    onToggle={toggleAlertPref}
                  />
                ))}
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor size={18} className="text-purple-400" />
                Delivery Channels
              </h2>
              <div className="grid gap-3">
                <DeliveryChannel
                  icon={Monitor}
                  name="Push Notifications"
                  description="Browser and desktop notifications"
                  enabled={deliveryChannels.push}
                  onToggle={() => setDeliveryChannels(p => ({...p, push: !p.push}))}
                />
                <DeliveryChannel
                  icon={Mail}
                  name="Email Notifications"
                  description="Receive alerts via email"
                  enabled={deliveryChannels.email}
                  onToggle={() => setDeliveryChannels(p => ({...p, email: !p.email}))}
                />
                <DeliveryChannel
                  icon={Smartphone}
                  name="SMS Notifications"
                  description="Text message alerts (Pro feature)"
                  enabled={deliveryChannels.sms}
                  onToggle={() => setDeliveryChannels(p => ({...p, sms: !p.sms}))}
                />
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <VolumeX size={18} className="text-amber-400" />
                  Quiet Hours
                </h2>
                <button
                  onClick={() => setQuietHours(p => ({...p, enabled: !p.enabled}))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    quietHours.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    quietHours.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                Silence non-urgent notifications during specific hours
              </p>

              <div className={`flex gap-4 ${!quietHours.enabled && 'opacity-50 pointer-events-none'}`}>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => setQuietHours(p => ({...p, start: e.target.value}))}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">End Time</label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => setQuietHours(p => ({...p, end: e.target.value}))}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
              <Check size={18} />
              Save Notification Preferences
            </button>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-4">
            {/* Tabs and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread', badge: unreadCount },
                  { id: 'price_alert', label: 'Price' },
                  { id: 'sentiment_shift', label: 'Sentiment' },
                  { id: 'breaking_news', label: 'News' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{selectedIds.length} selected</span>
                  <button
                    onClick={markSelectedAsRead}
                    className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                  >
                    Mark as read
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-1.5 bg-rose-500/20 rounded-lg text-sm text-rose-400 hover:bg-rose-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Notification list */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Select all header */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      onClick={selectAll}
                      className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                        selectedIds.length === filteredNotifications.length
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {selectedIds.length === filteredNotifications.length && (
                        <Check size={12} className="text-white" />
                      )}
                    </button>
                    <span className="text-sm text-slate-400">Select all</span>
                  </label>

                  <button
                    onClick={clearAll}
                    className="text-sm text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Notifications */}
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-slate-800/50">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      isSelected={selectedIds.includes(notification.id)}
                      onSelect={toggleSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <BellOff size={32} className="text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-2">No notifications</p>
                  <p className="text-sm text-slate-500">
                    {activeTab === 'unread' 
                      ? "You're all caught up!" 
                      : "Notifications will appear here"}
                  </p>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Alerts', value: notifications.length, icon: Bell, color: 'cyan' },
                { label: 'Unread', value: unreadCount, icon: AlertTriangle, color: 'amber' },
                { label: 'Price Alerts', value: notifications.filter(n => n.type === 'price_alert').length, icon: DollarSign, color: 'emerald' },
                { label: 'News', value: notifications.filter(n => n.type === 'breaking_news').length, icon: Newspaper, color: 'purple' },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={16} className={`text-${stat.color}-400`} />
                    <span className="text-xs text-slate-500">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
