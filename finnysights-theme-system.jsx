import React, { useState, createContext, useContext, useEffect } from 'react';
import { Moon, Sun, Monitor, Palette, Check, TrendingUp, TrendingDown, Star, Bell, Settings, ChevronRight, Zap, BarChart3 } from 'lucide-react';

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

// Theme definitions
const themes = {
  dark: {
    name: 'Dark',
    icon: Moon,
    colors: {
      // Backgrounds
      bgPrimary: 'bg-slate-950',
      bgSecondary: 'bg-slate-900',
      bgTertiary: 'bg-slate-800',
      bgCard: 'bg-slate-800/30',
      bgCardHover: 'hover:bg-slate-800/50',
      bgInput: 'bg-slate-800/50',
      bgOverlay: 'bg-slate-950/80',
      
      // Borders
      borderPrimary: 'border-slate-700/50',
      borderSecondary: 'border-slate-800/50',
      borderActive: 'border-cyan-500/30',
      
      // Text
      textPrimary: 'text-white',
      textSecondary: 'text-slate-300',
      textTertiary: 'text-slate-400',
      textMuted: 'text-slate-500',
      
      // Gradients
      gradientPrimary: 'from-slate-950 via-slate-900 to-slate-950',
      gradientCard: 'from-cyan-500/10 to-purple-500/10',
      
      // Accents
      accentPrimary: 'bg-cyan-500',
      accentSecondary: 'bg-purple-500',
      accentText: 'text-cyan-400',
      accentGlow: 'shadow-cyan-500/25',
      
      // States
      success: 'text-emerald-400',
      successBg: 'bg-emerald-500/20',
      error: 'text-rose-400',
      errorBg: 'bg-rose-500/20',
      warning: 'text-amber-400',
      warningBg: 'bg-amber-500/20',
    },
  },
  light: {
    name: 'Light',
    icon: Sun,
    colors: {
      // Backgrounds
      bgPrimary: 'bg-slate-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-slate-100',
      bgCard: 'bg-white/80',
      bgCardHover: 'hover:bg-slate-50',
      bgInput: 'bg-slate-100',
      bgOverlay: 'bg-white/80',
      
      // Borders
      borderPrimary: 'border-slate-200',
      borderSecondary: 'border-slate-100',
      borderActive: 'border-cyan-500/50',
      
      // Text
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-700',
      textTertiary: 'text-slate-600',
      textMuted: 'text-slate-500',
      
      // Gradients
      gradientPrimary: 'from-slate-50 via-white to-slate-50',
      gradientCard: 'from-cyan-50 to-purple-50',
      
      // Accents
      accentPrimary: 'bg-cyan-500',
      accentSecondary: 'bg-purple-500',
      accentText: 'text-cyan-600',
      accentGlow: 'shadow-cyan-500/20',
      
      // States
      success: 'text-emerald-600',
      successBg: 'bg-emerald-100',
      error: 'text-rose-600',
      errorBg: 'bg-rose-100',
      warning: 'text-amber-600',
      warningBg: 'bg-amber-100',
    },
  },
  midnight: {
    name: 'Midnight Blue',
    icon: Moon,
    colors: {
      bgPrimary: 'bg-[#0a0f1a]',
      bgSecondary: 'bg-[#111827]',
      bgTertiary: 'bg-[#1e293b]',
      bgCard: 'bg-[#1e293b]/50',
      bgCardHover: 'hover:bg-[#1e293b]/70',
      bgInput: 'bg-[#1e293b]/50',
      bgOverlay: 'bg-[#0a0f1a]/80',
      borderPrimary: 'border-blue-900/50',
      borderSecondary: 'border-blue-950/50',
      borderActive: 'border-blue-500/50',
      textPrimary: 'text-white',
      textSecondary: 'text-blue-100',
      textTertiary: 'text-blue-200/70',
      textMuted: 'text-blue-300/50',
      gradientPrimary: 'from-[#0a0f1a] via-[#111827] to-[#0a0f1a]',
      gradientCard: 'from-blue-500/10 to-indigo-500/10',
      accentPrimary: 'bg-blue-500',
      accentSecondary: 'bg-indigo-500',
      accentText: 'text-blue-400',
      accentGlow: 'shadow-blue-500/25',
      success: 'text-emerald-400',
      successBg: 'bg-emerald-500/20',
      error: 'text-rose-400',
      errorBg: 'bg-rose-500/20',
      warning: 'text-amber-400',
      warningBg: 'bg-amber-500/20',
    },
  },
  sunset: {
    name: 'Sunset',
    icon: Sun,
    colors: {
      bgPrimary: 'bg-[#1a1012]',
      bgSecondary: 'bg-[#261419]',
      bgTertiary: 'bg-[#3d1f24]',
      bgCard: 'bg-[#3d1f24]/50',
      bgCardHover: 'hover:bg-[#3d1f24]/70',
      bgInput: 'bg-[#3d1f24]/50',
      bgOverlay: 'bg-[#1a1012]/80',
      borderPrimary: 'border-rose-900/50',
      borderSecondary: 'border-rose-950/50',
      borderActive: 'border-orange-500/50',
      textPrimary: 'text-white',
      textSecondary: 'text-orange-100',
      textTertiary: 'text-orange-200/70',
      textMuted: 'text-orange-300/50',
      gradientPrimary: 'from-[#1a1012] via-[#261419] to-[#1a1012]',
      gradientCard: 'from-orange-500/10 to-rose-500/10',
      accentPrimary: 'bg-orange-500',
      accentSecondary: 'bg-rose-500',
      accentText: 'text-orange-400',
      accentGlow: 'shadow-orange-500/25',
      success: 'text-emerald-400',
      successBg: 'bg-emerald-500/20',
      error: 'text-rose-400',
      errorBg: 'bg-rose-500/20',
      warning: 'text-amber-400',
      warningBg: 'bg-amber-500/20',
    },
  },
  forest: {
    name: 'Forest',
    icon: Moon,
    colors: {
      bgPrimary: 'bg-[#0a1210]',
      bgSecondary: 'bg-[#111f1a]',
      bgTertiary: 'bg-[#1a3028]',
      bgCard: 'bg-[#1a3028]/50',
      bgCardHover: 'hover:bg-[#1a3028]/70',
      bgInput: 'bg-[#1a3028]/50',
      bgOverlay: 'bg-[#0a1210]/80',
      borderPrimary: 'border-emerald-900/50',
      borderSecondary: 'border-emerald-950/50',
      borderActive: 'border-emerald-500/50',
      textPrimary: 'text-white',
      textSecondary: 'text-emerald-100',
      textTertiary: 'text-emerald-200/70',
      textMuted: 'text-emerald-300/50',
      gradientPrimary: 'from-[#0a1210] via-[#111f1a] to-[#0a1210]',
      gradientCard: 'from-emerald-500/10 to-teal-500/10',
      accentPrimary: 'bg-emerald-500',
      accentSecondary: 'bg-teal-500',
      accentText: 'text-emerald-400',
      accentGlow: 'shadow-emerald-500/25',
      success: 'text-emerald-400',
      successBg: 'bg-emerald-500/20',
      error: 'text-rose-400',
      errorBg: 'bg-rose-500/20',
      warning: 'text-amber-400',
      warningBg: 'bg-amber-500/20',
    },
  },
};

// Accent color options
const accentColors = [
  { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/25' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/25' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/25' },
  { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/25' },
  { name: 'Rose', value: 'rose', bg: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-rose-500/25' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/25' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/25' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-400', glow: 'shadow-pink-500/25' },
];

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');
  const [accentColor, setAccentColor] = useState('cyan');
  const [systemTheme, setSystemTheme] = useState(false);

  const theme = themes[themeName];
  const accent = accentColors.find(a => a.value === accentColor);

  // Detect system preference
  useEffect(() => {
    if (systemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setThemeName(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e) => setThemeName(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [systemTheme]);

  const value = {
    themeName,
    setThemeName,
    theme,
    accentColor,
    setAccentColor,
    accent,
    systemTheme,
    setSystemTheme,
    themes,
    accentColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme selector card
const ThemeCard = ({ themeKey, isActive, onClick }) => {
  const themeData = themes[themeKey];
  const Icon = themeData.icon;
  
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isActive 
          ? 'border-cyan-500 bg-cyan-500/10' 
          : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/30'
      }`}
    >
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
      
      {/* Theme preview */}
      <div className={`w-full h-20 rounded-lg mb-3 overflow-hidden ${themeData.colors.bgPrimary}`}>
        <div className={`h-6 ${themeData.colors.bgSecondary} border-b ${themeData.colors.borderSecondary}`} />
        <div className="p-2 flex gap-2">
          <div className={`w-8 h-8 rounded ${themeData.colors.bgCard}`} />
          <div className="flex-1 space-y-1">
            <div className={`h-2 rounded ${themeData.colors.bgTertiary}`} />
            <div className={`h-2 rounded w-2/3 ${themeData.colors.bgTertiary}`} />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
          {themeData.name}
        </span>
      </div>
    </button>
  );
};

// Accent color picker
const AccentColorPicker = ({ selected, onSelect }) => (
  <div className="grid grid-cols-4 gap-3">
    {accentColors.map(color => (
      <button
        key={color.value}
        onClick={() => onSelect(color.value)}
        className={`relative p-3 rounded-xl border-2 transition-all ${
          selected === color.value
            ? `border-${color.value}-500 bg-${color.value}-500/10`
            : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/30'
        }`}
      >
        {selected === color.value && (
          <div className={`absolute top-1 right-1 w-4 h-4 ${color.bg} rounded-full flex items-center justify-center`}>
            <Check size={10} className="text-white" />
          </div>
        )}
        <div className={`w-full h-8 rounded-lg ${color.bg} mb-2`} />
        <span className="text-xs text-slate-400">{color.name}</span>
      </button>
    ))}
  </div>
);

// Sample stock card with theme
const ThemedStockCard = ({ colors, accent }) => (
  <div className={`p-4 rounded-xl border ${colors.bgCard} ${colors.borderPrimary} ${colors.bgCardHover} transition-all`}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${colors.textPrimary}`}>NVDA</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.successBg} ${colors.success}`}>
            +2.54%
          </span>
        </div>
        <p className={`text-sm ${colors.textTertiary}`}>NVIDIA Corp.</p>
      </div>
      <div className="text-right">
        <p className={`text-xl font-bold ${colors.textPrimary} font-mono`}>$487.23</p>
        <p className={`text-xs ${colors.textMuted}`}>NASDAQ</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-2 rounded-full ${colors.bgTertiary}`}>
        <div className={`h-full w-[92%] rounded-full ${accent.bg}`} />
      </div>
      <span className={`text-sm font-semibold ${accent.text}`}>92%</span>
    </div>
  </div>
);

// Theme settings panel
const ThemeSettings = () => {
  const { 
    themeName, setThemeName, theme, 
    accentColor, setAccentColor, accent,
    systemTheme, setSystemTheme,
  } = useTheme();

  const colors = theme.colors;

  return (
    <div className={`min-h-screen ${colors.bgPrimary}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Background gradients */}
      <div className={`fixed inset-0 bg-gradient-to-br ${colors.gradientPrimary}`} />
      
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center shadow-lg ${accent.glow}`}>
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${colors.textPrimary}`}>Appearance Settings</h1>
              <p className={`text-sm ${colors.textTertiary}`}>Customize your finnysights experience</p>
            </div>
          </div>
        </div>

        {/* Theme selector */}
        <div className={`p-6 rounded-xl border ${colors.bgCard} ${colors.borderPrimary} mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${colors.textPrimary}`}>Theme</h2>
            
            {/* System theme toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`text-sm ${colors.textTertiary}`}>Use system theme</span>
              <button 
                onClick={() => setSystemTheme(!systemTheme)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  systemTheme ? accent.bg : colors.bgTertiary
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  systemTheme ? 'translate-x-6' : 'translate-x-0.5'
                }`}>
                  <Monitor size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </button>
            </label>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${systemTheme ? 'opacity-50 pointer-events-none' : ''}`}>
            {Object.keys(themes).map(key => (
              <ThemeCard 
                key={key}
                themeKey={key}
                isActive={themeName === key}
                onClick={() => setThemeName(key)}
              />
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div className={`p-6 rounded-xl border ${colors.bgCard} ${colors.borderPrimary} mb-6`}>
          <h2 className={`font-semibold ${colors.textPrimary} mb-4`}>Accent Color</h2>
          <AccentColorPicker selected={accentColor} onSelect={setAccentColor} />
        </div>

        {/* Preview */}
        <div className={`p-6 rounded-xl border ${colors.bgCard} ${colors.borderPrimary}`}>
          <h2 className={`font-semibold ${colors.textPrimary} mb-4`}>Preview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stock card preview */}
            <div>
              <p className={`text-sm ${colors.textMuted} mb-3`}>Stock Card</p>
              <ThemedStockCard colors={colors} accent={accent} />
            </div>

            {/* UI elements preview */}
            <div>
              <p className={`text-sm ${colors.textMuted} mb-3`}>UI Elements</p>
              <div className="space-y-3">
                {/* Button */}
                <button className={`w-full py-3 ${accent.bg} rounded-xl font-semibold text-white shadow-lg ${accent.glow} transition-all hover:opacity-90`}>
                  Primary Button
                </button>
                
                {/* Input */}
                <input 
                  type="text"
                  placeholder="Search stocks..."
                  className={`w-full px-4 py-3 ${colors.bgInput} border ${colors.borderPrimary} rounded-xl text-sm ${colors.textPrimary} placeholder:${colors.textMuted} focus:outline-none focus:${colors.borderActive}`}
                />
                
                {/* Stats row */}
                <div className="flex gap-3">
                  <div className={`flex-1 p-3 rounded-lg ${colors.bgTertiary}`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className={colors.success} />
                      <span className={`text-sm ${colors.textSecondary}`}>+12.5%</span>
                    </div>
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${colors.bgTertiary}`}>
                    <div className="flex items-center gap-2">
                      <TrendingDown size={16} className={colors.error} />
                      <span className={`text-sm ${colors.textSecondary}`}>-3.2%</span>
                    </div>
                  </div>
                </div>

                {/* Badge row */}
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.successBg} ${colors.success}`}>
                    Bullish
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.warningBg} ${colors.warning}`}>
                    Neutral
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.errorBg} ${colors.error}`}>
                    Bearish
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full card preview */}
          <div className="mt-6">
            <p className={`text-sm ${colors.textMuted} mb-3`}>Dashboard Preview</p>
            <div className={`p-4 rounded-xl border ${colors.bgSecondary} ${colors.borderSecondary}`}>
              {/* Mini header */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b ${colors.borderSecondary}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${accent.bg} rounded-lg flex items-center justify-center`}>
                    <ThumbsUpLogo size={16} className="text-white" />
                  </div>
                  <span className={`font-bold ${accent.text}`}>finnysights</span>
                </div>
                <div className="flex gap-2">
                  <div className={`w-8 h-8 ${colors.bgTertiary} rounded-lg`} />
                  <div className={`w-8 h-8 ${colors.bgTertiary} rounded-lg`} />
                </div>
              </div>
              
              {/* Mini content */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${colors.bgCard}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className={accent.text} />
                    <span className={`text-xs ${colors.textTertiary}`}>Sentiment</span>
                  </div>
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>92%</p>
                </div>
                <div className={`p-3 rounded-lg ${colors.bgCard}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className={colors.warning} />
                    <span className={`text-xs ${colors.textTertiary}`}>Watchlist</span>
                  </div>
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>6</p>
                </div>
                <div className={`p-3 rounded-lg ${colors.bgCard}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className={colors.success} />
                    <span className={`text-xs ${colors.textTertiary}`}>Alerts</span>
                  </div>
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button className={`px-6 py-3 ${accent.bg} rounded-xl font-semibold text-white shadow-lg ${accent.glow} transition-all hover:opacity-90 flex items-center gap-2`}>
            <Check size={18} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

// Main export with provider
export default function ThemeSystem() {
  return (
    <ThemeProvider>
      <ThemeSettings />
    </ThemeProvider>
  );
}
