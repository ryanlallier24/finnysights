import React, { useState } from 'react';
import { Book, Code, Key, Zap, Shield, Globe, ChevronRight, ChevronDown, Copy, Check, ExternalLink, Terminal, Database, Lock, Clock, AlertTriangle, Search, Menu, X, ArrowRight, Play, FileJson, Webhook, BarChart3, Users, Bell, TrendingUp, Activity } from 'lucide-react';

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

// API Endpoints data
const API_ENDPOINTS = {
  stocks: [
    {
      method: 'GET',
      endpoint: '/api/v1/stocks',
      description: 'List all available stocks with current prices and sentiment',
      params: [
        { name: 'exchange', type: 'string', required: false, description: 'Filter by exchange (NYSE, NASDAQ, etc.)' },
        { name: 'sector', type: 'string', required: false, description: 'Filter by sector' },
        { name: 'limit', type: 'integer', required: false, description: 'Number of results (default: 50, max: 500)' },
        { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
      ],
      response: `{
  "data": [
    {
      "ticker": "NVDA",
      "name": "NVIDIA Corporation",
      "exchange": "NASDAQ",
      "price": 487.23,
      "change": 2.54,
      "volume": 67300000,
      "sentiment": {
        "score": 92,
        "label": "Extremely Bullish",
        "votes": { "up": 15678, "down": 2134 }
      }
    }
  ],
  "meta": { "total": 1250, "limit": 50, "offset": 0 }
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/stocks/{ticker}',
      description: 'Get detailed information for a specific stock',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol (e.g., NVDA, AAPL)' },
      ],
      response: `{
  "ticker": "NVDA",
  "name": "NVIDIA Corporation",
  "exchange": "NASDAQ",
  "sector": "Technology",
  "industry": "Semiconductors",
  "price": 487.23,
  "open": 476.50,
  "high": 492.18,
  "low": 474.32,
  "volume": 67300000,
  "marketCap": 1210000000000,
  "pe": 64.32,
  "eps": 7.58,
  "sentiment": {
    "score": 92,
    "label": "Extremely Bullish",
    "sources": [
      { "name": "Reuters", "score": 89 },
      { "name": "Bloomberg", "score": 91 }
    ]
  }
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/stocks/{ticker}/history',
      description: 'Get historical price and sentiment data',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol' },
        { name: 'period', type: 'string', required: false, description: '1d, 1w, 1m, 3m, 6m, 1y, all (default: 1m)' },
        { name: 'interval', type: 'string', required: false, description: '1m, 5m, 15m, 1h, 1d (default: 1d)' },
      ],
      response: `{
  "ticker": "NVDA",
  "period": "1m",
  "interval": "1d",
  "data": [
    {
      "timestamp": "2025-01-20T00:00:00Z",
      "open": 465.00,
      "high": 472.50,
      "low": 463.20,
      "close": 470.15,
      "volume": 52400000,
      "sentiment": 88
    }
  ]
}`,
    },
  ],
  sentiment: [
    {
      method: 'GET',
      endpoint: '/api/v1/sentiment/{ticker}',
      description: 'Get comprehensive sentiment analysis for a stock',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol' },
        { name: 'sources', type: 'string', required: false, description: 'Comma-separated source filters' },
      ],
      response: `{
  "ticker": "NVDA",
  "aggregate": {
    "score": 92,
    "label": "Extremely Bullish",
    "confidence": 94
  },
  "community": {
    "votes": { "up": 15678, "down": 2134 },
    "bullishPercent": 88,
    "totalVotes": 17812
  },
  "sources": [
    {
      "name": "Reuters Analytics",
      "score": 89,
      "trend": "up",
      "confidence": 94,
      "lastUpdate": "2025-01-22T14:30:00Z"
    }
  ],
  "history": [
    { "date": "2025-01-22", "score": 92 },
    { "date": "2025-01-21", "score": 90 }
  ]
}`,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/sentiment/{ticker}/vote',
      description: 'Submit a sentiment vote for a stock',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol' },
        { name: 'vote', type: 'string', required: true, description: '"bullish" or "bearish"' },
      ],
      response: `{
  "success": true,
  "ticker": "NVDA",
  "vote": "bullish",
  "newTotals": {
    "up": 15679,
    "down": 2134,
    "bullishPercent": 88
  }
}`,
    },
  ],
  watchlist: [
    {
      method: 'GET',
      endpoint: '/api/v1/watchlist',
      description: 'Get the authenticated user\'s watchlist',
      params: [],
      response: `{
  "data": [
    {
      "ticker": "NVDA",
      "addedAt": "2025-01-15T10:30:00Z",
      "alerts": [
        { "type": "price", "condition": "above", "value": 500 }
      ],
      "current": {
        "price": 487.23,
        "change": 2.54,
        "sentiment": 92
      }
    }
  ]
}`,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/watchlist',
      description: 'Add a stock to the watchlist',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol to add' },
      ],
      response: `{
  "success": true,
  "ticker": "AAPL",
  "addedAt": "2025-01-22T14:45:00Z"
}`,
    },
    {
      method: 'DELETE',
      endpoint: '/api/v1/watchlist/{ticker}',
      description: 'Remove a stock from the watchlist',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker to remove' },
      ],
      response: `{
  "success": true,
  "ticker": "AAPL",
  "removedAt": "2025-01-22T14:50:00Z"
}`,
    },
  ],
  alerts: [
    {
      method: 'GET',
      endpoint: '/api/v1/alerts',
      description: 'List all configured alerts',
      params: [
        { name: 'active', type: 'boolean', required: false, description: 'Filter by active status' },
      ],
      response: `{
  "data": [
    {
      "id": "alert_123",
      "ticker": "NVDA",
      "type": "price",
      "condition": "above",
      "value": 500,
      "active": true,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}`,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/alerts',
      description: 'Create a new alert',
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol' },
        { name: 'type', type: 'string', required: true, description: 'price, sentiment, volume' },
        { name: 'condition', type: 'string', required: true, description: 'above, below, change' },
        { name: 'value', type: 'number', required: true, description: 'Threshold value' },
      ],
      response: `{
  "success": true,
  "alert": {
    "id": "alert_456",
    "ticker": "NVDA",
    "type": "price",
    "condition": "above",
    "value": 500,
    "active": true
  }
}`,
    },
  ],
};

// Code examples in different languages
const CODE_EXAMPLES = {
  curl: `curl -X GET "https://api.finnysights.io/v1/stocks/NVDA" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  
  javascript: `const response = await fetch('https://api.finnysights.io/v1/stocks/NVDA', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.sentiment.score); // 92`,

  python: `import requests

response = requests.get(
    'https://api.finnysights.io/v1/stocks/NVDA',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)

data = response.json()
print(data['sentiment']['score'])  # 92`,

  node: `const axios = require('axios');

const { data } = await axios.get('https://api.finnysights.io/v1/stocks/NVDA', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

console.log(data.sentiment.score); // 92`,
};

// Method color mapping
const methodColors = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

// Code block with copy functionality
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 bg-slate-700/50 rounded hover:bg-slate-600 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
        </button>
      </div>
      <pre className="p-4 pt-12 bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-x-auto">
        <code className="text-sm text-slate-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

// Endpoint documentation card
const EndpointCard = ({ endpoint, isOpen, onToggle }) => (
  <div className="border border-slate-700/50 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors"
    >
      <span className={`px-2 py-1 rounded text-xs font-bold border ${methodColors[endpoint.method]}`}>
        {endpoint.method}
      </span>
      <code className="text-sm text-cyan-400 font-mono">{endpoint.endpoint}</code>
      <span className="text-sm text-slate-400 flex-1 text-left">{endpoint.description}</span>
      <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    
    {isOpen && (
      <div className="p-4 bg-slate-800/20 border-t border-slate-700/50 space-y-4">
        {endpoint.params.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Required</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.params.map((param, i) => (
                    <tr key={i} className="border-t border-slate-700/30">
                      <td className="py-2 pr-4">
                        <code className="text-cyan-400">{param.name}</code>
                      </td>
                      <td className="py-2 pr-4 text-purple-400">{param.type}</td>
                      <td className="py-2 pr-4">
                        {param.required ? (
                          <span className="text-rose-400">Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>
                      <td className="py-2 text-slate-300">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Response</h4>
          <CodeBlock code={endpoint.response} language="json" />
        </div>
      </div>
    )}
  </div>
);

// Sidebar navigation
const DocsSidebar = ({ activeSection, setActiveSection, searchQuery, setSearchQuery }) => {
  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
    { id: 'errors', label: 'Error Handling', icon: AlertTriangle },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
    { id: 'sentiment', label: 'Sentiment', icon: Activity },
    { id: 'watchlist', label: 'Watchlist', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'sdks', label: 'SDKs & Libraries', icon: Code },
  ];

  return (
    <aside className="w-64 bg-slate-900/50 border-r border-slate-800/50 min-h-screen sticky top-0">
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <ThumbsUpLogo size={22} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              finnysights
            </span>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">API Docs</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === section.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* API Version */}
      <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">API Version</span>
          <span className="text-xs font-mono text-cyan-400">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};

// Main content sections
const OverviewSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">finnysights API Documentation</h1>
      <p className="text-lg text-slate-400">
        Welcome to the finnysights API. Access real-time stock data, sentiment analysis, 
        and community insights programmatically.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { icon: Globe, label: 'RESTful API', desc: 'Standard REST endpoints' },
        { icon: Zap, label: 'Real-time Data', desc: 'WebSocket support' },
        { icon: Shield, label: 'Secure', desc: 'OAuth 2.0 authentication' },
      ].map((feature, i) => (
        <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <feature.icon size={24} className="text-cyan-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
          <p className="text-sm text-slate-400">{feature.desc}</p>
        </div>
      ))}
    </div>

    <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
      <h3 className="font-bold text-white mb-2">Base URL</h3>
      <code className="px-3 py-2 bg-slate-900/80 rounded-lg text-cyan-400 font-mono inline-block">
        https://api.finnysights.io/v1
      </code>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Quick Start</h3>
      <div className="space-y-4">
        <div className="flex gap-4">
          {['curl', 'javascript', 'python', 'node'].map(lang => (
            <button
              key={lang}
              className="px-4 py-2 bg-slate-800/50 text-slate-400 rounded-lg text-sm font-medium hover:text-white hover:bg-slate-800 transition-all capitalize"
            >
              {lang}
            </button>
          ))}
        </div>
        <CodeBlock code={CODE_EXAMPLES.javascript} language="JavaScript" />
      </div>
    </div>
  </div>
);

const AuthenticationSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">Authentication</h1>
      <p className="text-slate-400">
        The finnysights API uses API keys to authenticate requests. You can manage your API keys in your dashboard.
      </p>
    </div>

    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-4">
      <AlertTriangle className="text-amber-400 shrink-0" />
      <div>
        <h4 className="font-semibold text-amber-400 mb-1">Keep your API keys secure</h4>
        <p className="text-sm text-slate-400">
          Never share your API keys in publicly accessible areas such as GitHub, client-side code, or social media.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Using Your API Key</h3>
      <p className="text-slate-400 mb-4">
        Include your API key in the Authorization header of all requests:
      </p>
      <CodeBlock 
        code={`curl -X GET "https://api.finnysights.io/v1/stocks" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} 
        language="bash" 
      />
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">API Key Types</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Key size={18} className="text-cyan-400" />
            <h4 className="font-semibold text-white">Test Keys</h4>
          </div>
          <p className="text-sm text-slate-400">
            Use test keys during development. Requests are free but rate-limited.
          </p>
          <code className="text-xs text-slate-500 mt-2 block">sk_test_...</code>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} className="text-purple-400" />
            <h4 className="font-semibold text-white">Live Keys</h4>
          </div>
          <p className="text-sm text-slate-400">
            Use live keys in production. Requests count against your plan limits.
          </p>
          <code className="text-xs text-slate-500 mt-2 block">sk_live_...</code>
        </div>
      </div>
    </div>
  </div>
);

const RateLimitsSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">Rate Limits</h1>
      <p className="text-slate-400">
        Rate limits help ensure fair usage and API stability. Limits vary by plan.
      </p>
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-700/50">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800/50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Plan</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Requests/min</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Requests/day</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">WebSocket Connections</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {[
            { plan: 'Free', rpm: '60', rpd: '1,000', ws: '1' },
            { plan: 'Starter', rpm: '120', rpd: '10,000', ws: '5' },
            { plan: 'Pro', rpm: '600', rpd: '100,000', ws: '25' },
            { plan: 'Enterprise', rpm: 'Unlimited', rpd: 'Unlimited', ws: 'Unlimited' },
          ].map((tier, i) => (
            <tr key={i} className="bg-slate-800/20">
              <td className="px-4 py-3 font-semibold text-white">{tier.plan}</td>
              <td className="px-4 py-3 text-slate-300">{tier.rpm}</td>
              <td className="px-4 py-3 text-slate-300">{tier.rpd}</td>
              <td className="px-4 py-3 text-slate-300">{tier.ws}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Rate Limit Headers</h3>
      <p className="text-slate-400 mb-4">
        Every response includes headers showing your current rate limit status:
      </p>
      <CodeBlock 
        code={`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1706025600`} 
        language="headers" 
      />
    </div>
  </div>
);

const ErrorsSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">Error Handling</h1>
      <p className="text-slate-400">
        The API uses conventional HTTP response codes to indicate success or failure.
      </p>
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-700/50">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800/50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Code</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {[
            { code: '200', status: 'OK', desc: 'Request succeeded', color: 'text-emerald-400' },
            { code: '400', status: 'Bad Request', desc: 'Invalid request parameters', color: 'text-amber-400' },
            { code: '401', status: 'Unauthorized', desc: 'Invalid or missing API key', color: 'text-rose-400' },
            { code: '403', status: 'Forbidden', desc: 'Access denied to resource', color: 'text-rose-400' },
            { code: '404', status: 'Not Found', desc: 'Resource does not exist', color: 'text-slate-400' },
            { code: '429', status: 'Rate Limited', desc: 'Too many requests', color: 'text-amber-400' },
            { code: '500', status: 'Server Error', desc: 'Internal server error', color: 'text-rose-400' },
          ].map((error, i) => (
            <tr key={i} className="bg-slate-800/20">
              <td className={`px-4 py-3 font-mono font-bold ${error.color}`}>{error.code}</td>
              <td className="px-4 py-3 text-white">{error.status}</td>
              <td className="px-4 py-3 text-slate-400">{error.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Error Response Format</h3>
      <CodeBlock 
        code={`{
  "error": {
    "code": "invalid_ticker",
    "message": "The ticker symbol 'INVALID' was not found",
    "param": "ticker",
    "doc_url": "https://docs.finnysights.io/errors/invalid_ticker"
  }
}`} 
        language="json" 
      />
    </div>
  </div>
);

const EndpointsSection = ({ category, endpoints }) => {
  const [openEndpoints, setOpenEndpoints] = useState({});

  const toggleEndpoint = (index) => {
    setOpenEndpoints(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const categoryInfo = {
    stocks: { icon: TrendingUp, title: 'Stocks', desc: 'Access stock data, prices, and market information' },
    sentiment: { icon: Activity, title: 'Sentiment', desc: 'Get sentiment analysis and community voting data' },
    watchlist: { icon: BarChart3, title: 'Watchlist', desc: 'Manage user watchlists and tracked stocks' },
    alerts: { icon: Bell, title: 'Alerts', desc: 'Create and manage price and sentiment alerts' },
  };

  const info = categoryInfo[category];
  const Icon = info.icon;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <Icon size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{info.title}</h1>
            <p className="text-slate-400">{info.desc}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <EndpointCard
            key={index}
            endpoint={endpoint}
            isOpen={openEndpoints[index]}
            onToggle={() => toggleEndpoint(index)}
          />
        ))}
      </div>
    </div>
  );
};

const WebhooksSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">Webhooks</h1>
      <p className="text-slate-400">
        Receive real-time notifications when events occur in finnysights.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Available Events</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { event: 'price.alert', desc: 'Triggered when a price alert condition is met' },
          { event: 'sentiment.change', desc: 'Triggered when sentiment shifts significantly' },
          { event: 'volume.spike', desc: 'Triggered when unusual volume is detected' },
          { event: 'news.breaking', desc: 'Triggered for major market news' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <code className="text-cyan-400 text-sm">{item.event}</code>
            <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-xl font-bold text-white mb-4">Webhook Payload</h3>
      <CodeBlock 
        code={`{
  "id": "evt_1234567890",
  "type": "price.alert",
  "created": "2025-01-22T14:30:00Z",
  "data": {
    "ticker": "NVDA",
    "alert_id": "alert_123",
    "condition": "price_above",
    "threshold": 500,
    "current_price": 502.15
  }
}`} 
        language="json" 
      />
    </div>
  </div>
);

const SDKsSection = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-4">SDKs & Libraries</h1>
      <p className="text-slate-400">
        Official client libraries to integrate finnysights into your applications.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { name: 'JavaScript/Node.js', pkg: 'npm install finnysights', icon: '📦', color: 'amber' },
        { name: 'Python', pkg: 'pip install finnysights', icon: '🐍', color: 'blue' },
        { name: 'Ruby', pkg: 'gem install finnysights', icon: '💎', color: 'rose' },
        { name: 'Go', pkg: 'go get github.com/finnysights/go', icon: '🔷', color: 'cyan' },
      ].map((sdk, i) => (
        <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{sdk.icon}</span>
            <h3 className="font-semibold text-white">{sdk.name}</h3>
          </div>
          <code className="block px-3 py-2 bg-slate-900/80 rounded-lg text-sm text-slate-300 font-mono">
            {sdk.pkg}
          </code>
          <a href="#" className="flex items-center gap-1 text-sm text-cyan-400 mt-3 hover:underline">
            View on GitHub <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  </div>
);

// Main API Documentation Component
export default function APIDocumentation() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'authentication': return <AuthenticationSection />;
      case 'rate-limits': return <RateLimitsSection />;
      case 'errors': return <ErrorsSection />;
      case 'stocks': return <EndpointsSection category="stocks" endpoints={API_ENDPOINTS.stocks} />;
      case 'sentiment': return <EndpointsSection category="sentiment" endpoints={API_ENDPOINTS.sentiment} />;
      case 'watchlist': return <EndpointsSection category="watchlist" endpoints={API_ENDPOINTS.watchlist} />;
      case 'alerts': return <EndpointsSection category="alerts" endpoints={API_ENDPOINTS.alerts} />;
      case 'webhooks': return <WebhooksSection />;
      case 'sdks': return <SDKsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <DocsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
            <div className="flex items-center justify-between px-8 h-16">
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-400 hover:text-white">
                  <Menu size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  API Status
                </a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Support
                </a>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-all">
                  Get API Key
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-8 py-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
