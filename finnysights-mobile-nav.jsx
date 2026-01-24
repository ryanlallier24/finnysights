import React, { useState, useEffect } from 'react';
import { Home, Search, Star, User, Bell, Settings, Menu, X, TrendingUp, BarChart3, Globe, Zap, MessageSquare, ChevronRight, LogOut, Moon, Sun, HelpCircle, Shield, CreditCard, FileText, Users, ExternalLink, Activity } from 'lucide-react';

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

// Mock notification data
const NOTIFICATIONS = [
  { id: 1, type: 'alert', title: 'NVDA Price Alert', message: 'NVDA has risen above $490', time: '2m ago', read: false },
  { id: 2, type: 'sentiment', title: 'Sentiment Shift', message: 'TSLA sentiment dropped to Neutral', time: '15m ago', read: false },
  { id: 3, type: 'news', title: 'Breaking News', message: 'Fed announces rate decision', time: '1h ago', read: true },
  { id: 4, type: 'social', title: 'Trending Discussion', message: 'AAPL is trending in community', time: '2h ago', read: true },
];

// Mobile menu item
const MobileMenuItem = ({ icon: Icon, label, onClick, badge, isActive, color = 'cyan' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
      isActive 
        ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30` 
        : 'text-slate-300 hover:bg-slate-800/50 active:bg-slate-800'
    }`}
  >
    <Icon size={22} />
    <span className="font-medium flex-1 text-left">{label}</span>
    {badge && (
      <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
        {badge}
      </span>
    )}
    <ChevronRight size={18} className="text-slate-600" />
  </button>
);

// Bottom tab item
const TabItem = ({ icon: Icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all ${
      isActive ? 'text-cyan-400' : 'text-slate-500'
    }`}
  >
    <div className="relative">
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
    {isActive && (
      <div className="absolute bottom-0 w-12 h-0.5 bg-cyan-400 rounded-full" />
    )}
  </button>
);

// Notification item
const NotificationItem = ({ notification, onDismiss }) => {
  const icons = {
    alert: TrendingUp,
    sentiment: Activity,
    news: FileText,
    social: MessageSquare,
  };
  const Icon = icons[notification.type] || Bell;

  return (
    <div className={`flex items-start gap-3 p-4 border-b border-slate-800/50 ${
      !notification.read ? 'bg-cyan-500/5' : ''
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        notification.type === 'alert' ? 'bg-amber-500/20 text-amber-400' :
        notification.type === 'sentiment' ? 'bg-purple-500/20 text-purple-400' :
        notification.type === 'news' ? 'bg-cyan-500/20 text-cyan-400' :
        'bg-emerald-500/20 text-emerald-400'
      }`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white text-sm">{notification.title}</p>
          {!notification.read && (
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-slate-600 mt-1">{notification.time}</p>
      </div>
      <button 
        onClick={() => onDismiss(notification.id)}
        className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Slide-out menu panel
const SlideOutMenu = ({ isOpen, onClose, activeTab, setActiveTab, isDarkMode, toggleDarkMode }) => (
  <>
    {/* Backdrop */}
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
    
    {/* Menu panel */}
    <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800/50 z-50 transform transition-transform duration-300 ease-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
              <ThumbsUpLogo size={22} className="text-white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              finnysights
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-xl">
            👨‍💼
          </div>
          <div>
            <p className="font-semibold text-white">Alex Thompson</p>
            <p className="text-xs text-slate-500">Pro Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-4 mb-2">Main Menu</p>
        <MobileMenuItem icon={Home} label="Dashboard" isActive={activeTab === 'home'} onClick={() => { setActiveTab('home'); onClose(); }} />
        <MobileMenuItem icon={Search} label="Explore Stocks" isActive={activeTab === 'search'} onClick={() => { setActiveTab('search'); onClose(); }} />
        <MobileMenuItem icon={Star} label="Watchlist" isActive={activeTab === 'watchlist'} onClick={() => { setActiveTab('watchlist'); onClose(); }} badge="6" />
        <MobileMenuItem icon={BarChart3} label="Sentiment Analysis" isActive={activeTab === 'sentiment'} onClick={() => { setActiveTab('sentiment'); onClose(); }} />
        <MobileMenuItem icon={Globe} label="Global Markets" isActive={activeTab === 'markets'} onClick={() => { setActiveTab('markets'); onClose(); }} />
        
        <div className="h-px bg-slate-800/50 my-4" />
        
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-4 mb-2">Account</p>
        <MobileMenuItem icon={User} label="Profile" onClick={() => { setActiveTab('profile'); onClose(); }} />
        <MobileMenuItem icon={Bell} label="Notifications" onClick={() => { setActiveTab('notifications'); onClose(); }} badge="3" />
        <MobileMenuItem icon={CreditCard} label="Subscription" onClick={() => { setActiveTab('billing'); onClose(); }} />
        <MobileMenuItem icon={Shield} label="Security" onClick={() => { setActiveTab('security'); onClose(); }} />
        <MobileMenuItem icon={Settings} label="Settings" onClick={() => { setActiveTab('settings'); onClose(); }} />
        
        <div className="h-px bg-slate-800/50 my-4" />
        
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-4 mb-2">Resources</p>
        <MobileMenuItem icon={FileText} label="API Documentation" onClick={() => {}} />
        <MobileMenuItem icon={HelpCircle} label="Help Center" onClick={() => {}} />
        <MobileMenuItem icon={Users} label="Community" onClick={() => {}} />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 bg-slate-900">
        {/* Theme toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-amber-400" />}
            <span className="text-sm text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-cyan-500' : 'bg-slate-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        
        {/* Reset Password */}
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors mb-3">
          <Shield size={18} />
          <span className="font-medium">Reset Password</span>
        </button>
        
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 rounded-xl text-slate-400 hover:text-rose-400 transition-colors">
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  </>
);

// Notifications panel
const NotificationsPanel = ({ isOpen, onClose, notifications, onDismiss, onClearAll }) => (
  <>
    {/* Backdrop */}
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
    
    {/* Panel */}
    <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800/50 z-50 transform transition-transform duration-300 ease-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Notifications</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <NotificationItem key={notif.id} notification={notif} onDismiss={onDismiss} />
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell size={40} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500">No notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 bg-slate-900">
          <button 
            onClick={onClearAll}
            className="w-full py-3 bg-slate-800/50 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear All Notifications
          </button>
        </div>
      )}
    </div>
  </>
);

// Desktop navigation bar
const DesktopNavbar = ({ activeTab, setActiveTab, toggleMenu, toggleNotifications, unreadCount }) => (
  <header className="hidden md:block sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <ThumbsUpLogo size={22} className="text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            finnysights
          </span>
        </div>

        {/* Center navigation */}
        <nav className="flex items-center gap-1">
          {[
            { id: 'home', label: 'Dashboard', icon: Home },
            { id: 'search', label: 'Explore', icon: Search },
            { id: 'watchlist', label: 'Watchlist', icon: Star },
            { id: 'markets', label: 'Markets', icon: Globe },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleNotifications}
            className="relative p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <div className="w-px h-8 bg-slate-800 mx-2" />
          <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center text-sm">
              👨‍💼
            </div>
            <span className="text-sm font-medium text-white">Alex</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Mobile header
const MobileHeader = ({ toggleMenu, toggleNotifications, unreadCount }) => (
  <header className="md:hidden sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
    <div className="flex items-center justify-between px-4 h-14">
      <button 
        onClick={toggleMenu}
        className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
          <ThumbsUpLogo size={18} className="text-white" />
        </div>
        <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          finnysights
        </span>
      </div>

      <button 
        onClick={toggleNotifications}
        className="relative p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  </header>
);

// Bottom tab bar (mobile only)
const BottomTabBar = ({ activeTab, setActiveTab }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 z-30 pb-safe">
    <div className="flex items-center justify-around h-16 px-2">
      <TabItem icon={Home} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
      <TabItem icon={Search} label="Explore" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
      <TabItem icon={Star} label="Watchlist" isActive={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} badge={6} />
      <TabItem icon={BarChart3} label="Analysis" isActive={activeTab === 'sentiment'} onClick={() => setActiveTab('sentiment')} />
      <TabItem icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
    </div>
  </nav>
);

// Sample content for demonstration
const PageContent = ({ activeTab }) => {
  const pages = {
    home: { title: 'Dashboard', icon: Home, description: 'Your personalized trading dashboard with real-time sentiment and market data.' },
    search: { title: 'Explore Stocks', icon: Search, description: 'Search and discover stocks across global exchanges.' },
    watchlist: { title: 'Watchlist', icon: Star, description: 'Track your favorite stocks and monitor sentiment changes.' },
    sentiment: { title: 'Sentiment Analysis', icon: BarChart3, description: 'Deep dive into sentiment metrics and community insights.' },
    markets: { title: 'Global Markets', icon: Globe, description: 'Monitor all major global exchanges in real-time.' },
    profile: { title: 'Profile', icon: User, description: 'Manage your account settings and preferences.' },
    notifications: { title: 'Notifications', icon: Bell, description: 'View and manage your alerts and notifications.' },
    billing: { title: 'Subscription', icon: CreditCard, description: 'Manage your subscription and billing details.' },
    security: { title: 'Security', icon: Shield, description: 'Configure security settings and two-factor authentication.' },
    settings: { title: 'Settings', icon: Settings, description: 'Customize your finnysights experience.' },
  };

  const page = pages[activeTab] || pages.home;
  const Icon = page.icon;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
            <Icon size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{page.title}</h1>
            <p className="text-sm text-slate-400">{page.description}</p>
          </div>
        </div>

        {/* Sample content cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg mb-4" />
              <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Navigation Component
export default function MobileNavigation() {
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setMenuOpen(false);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen || notificationsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, notificationsOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0); }
        
        /* Smooth scroll */
        html { scroll-behavior: smooth; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Desktop navbar */}
        <DesktopNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          toggleMenu={toggleMenu}
          toggleNotifications={toggleNotifications}
          unreadCount={unreadCount}
        />

        {/* Mobile header */}
        <MobileHeader 
          toggleMenu={toggleMenu}
          toggleNotifications={toggleNotifications}
          unreadCount={unreadCount}
        />

        {/* Slide-out menu */}
        <SlideOutMenu 
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Notifications panel */}
        <NotificationsPanel 
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onDismiss={dismissNotification}
          onClearAll={clearAllNotifications}
        />

        {/* Page content */}
        <main className="pb-20 md:pb-0">
          <PageContent activeTab={activeTab} />
        </main>

        {/* Bottom tab bar (mobile) */}
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
