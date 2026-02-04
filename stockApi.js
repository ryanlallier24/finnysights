// Stock API Service using Finnhub
// WebSocket for real-time during market hours, REST polling as fallback
// Free tier: 60 REST calls/minute, 1 WebSocket connection

const FINNHUB_API_KEY = 'd5r20chr01qqqlh9ass0d5r20chr01qqqlh9assg'; // Replace with your key
const BASE_URL = 'https://finnhub.io/api/v1';
const WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

// ============================================
// MARKET HOURS DETECTION
// ============================================

const isMarketOpen = () => {
  const now = new Date();
  const etOptions = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' };
  const etString = now.toLocaleString('en-US', etOptions);
  
  const parts = etString.split(', ');
  const day = parts[0];
  const timeParts = parts[1].split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  const timeInMinutes = hour * 60 + minute;
  
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;
  
  return weekdays.includes(day) && timeInMinutes >= marketOpen && timeInMinutes < marketClose;
};

const isExtendedHours = () => {
  const now = new Date();
  const etOptions = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' };
  const etString = now.toLocaleString('en-US', etOptions);
  
  const parts = etString.split(', ');
  const day = parts[0];
  const timeParts = parts[1].split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  const timeInMinutes = hour * 60 + minute;
  
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const preMarketOpen = 4 * 60;
  const afterMarketClose = 20 * 60;
  
  return weekdays.includes(day) && timeInMinutes >= preMarketOpen && timeInMinutes < afterMarketClose;
};

export { isMarketOpen, isExtendedHours };

// ============================================
// REST API FUNCTIONS
// ============================================

export const getQuote = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    if (data.c === 0 && data.h === 0) {
      console.warn(`No data for ${symbol}`);
      return null;
    }
    
    return {
      symbol: symbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
      volume: data.v,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

export const getMultipleQuotes = async (symbols) => {
  const quotes = {};
  
  for (const symbol of symbols) {
    const quote = await getQuote(symbol);
    if (quote) {
      quotes[symbol] = quote;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return quotes;
};

// ============================================
// WEBSOCKET REAL-TIME STREAMING
// ============================================

let ws = null;
let subscribedSymbols = [];
let onTradeCallback = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000;

const volumeAccumulator = {};
const baseVolumes = {};

// Store latest REST quote data for calculating changes
const latestQuotes = {};

export const connectWebSocket = (symbols, onTrade) => {
  if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
    updateSubscriptions(symbols);
    onTradeCallback = onTrade;
    return;
  }

  isConnecting = true;
  subscribedSymbols = [...symbols];
  onTradeCallback = onTrade;

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('🟢 WebSocket connected - streaming live trades');
      isConnecting = false;
      reconnectAttempts = 0;

      subscribedSymbols.forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });

      startHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'trade' && message.data) {
          message.data.forEach(trade => {
            const symbol = trade.s;
            const price = trade.p;
            const tradeVolume = trade.v;
            const timestamp = trade.t;

            if (!volumeAccumulator[symbol]) {
              volumeAccumulator[symbol] = baseVolumes[symbol] || 0;
            }
            volumeAccumulator[symbol] += tradeVolume;

            // Calculate change from previous close
            const existing = latestQuotes[symbol];
            let change = null;
            let changePercent = null;
            let high = existing?.high || price;
            let low = existing?.low || price;

            if (existing?.previousClose) {
              change = price - existing.previousClose;
              changePercent = ((price - existing.previousClose) / existing.previousClose) * 100;
            }

            if (price > high) high = price;
            if (price < low) low = price;

            // Update stored quote
            if (existing) {
              existing.currentPrice = price;
              existing.change = change;
              existing.changePercent = changePercent;
              existing.high = high;
              existing.low = low;
              existing.volume = volumeAccumulator[symbol];
            }

            if (onTradeCallback) {
              onTradeCallback({
                symbol,
                currentPrice: price,
                change,
                changePercent,
                high,
                low,
                open: existing?.open,
                previousClose: existing?.previousClose,
                volume: volumeAccumulator[symbol],
                tradeVolume,
                timestamp,
                isLive: true,
              });
            }
          });
        }
      } catch (err) {
        console.warn('WebSocket message parse error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('🔴 WebSocket error:', error);
      isConnecting = false;
    };

    ws.onclose = (event) => {
      console.log('🟡 WebSocket closed:', event.code, event.reason);
      isConnecting = false;
      stopHeartbeat();

      if ((isMarketOpen() || isExtendedHours()) && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.min(reconnectAttempts + 1, 5);
        console.log(`Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts + 1})...`);
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          connectWebSocket(subscribedSymbols, onTradeCallback);
        }, delay);
      }
    };
  } catch (error) {
    console.error('WebSocket creation error:', error);
    isConnecting = false;
  }
};

export const disconnectWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  stopHeartbeat();
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS;

  if (ws) {
    try {
      subscribedSymbols.forEach(symbol => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        }
      });
      ws.close();
    } catch (err) {
      console.warn('WebSocket close error:', err);
    }
    ws = null;
  }

  subscribedSymbols = [];
  onTradeCallback = null;
  isConnecting = false;
  console.log('WebSocket disconnected');
};

const updateSubscriptions = (newSymbols) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  subscribedSymbols.forEach(symbol => {
    if (!newSymbols.includes(symbol)) {
      ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  });

  newSymbols.forEach(symbol => {
    if (!subscribedSymbols.includes(symbol)) {
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  });

  subscribedSymbols = [...newSymbols];
};

export const subscribeSymbol = (symbol) => {
  if (!subscribedSymbols.includes(symbol)) {
    subscribedSymbols.push(symbol);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      console.log(`Subscribed to ${symbol}`);
    }
  }
};

export const unsubscribeSymbol = (symbol) => {
  subscribedSymbols = subscribedSymbols.filter(s => s !== symbol);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    console.log(`Unsubscribed from ${symbol}`);
  }
};

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

export const getWebSocketStatus = () => {
  if (!ws) return 'disconnected';
  switch (ws.readyState) {
    case WebSocket.CONNECTING: return 'connecting';
    case WebSocket.OPEN: return 'connected';
    case WebSocket.CLOSING: return 'closing';
    case WebSocket.CLOSED: return 'disconnected';
    default: return 'unknown';
  }
};

export const setBaseVolume = (symbol, volume) => {
  baseVolumes[symbol] = volume || 0;
  volumeAccumulator[symbol] = volume || 0;
};

export const resetDailyVolumes = () => {
  Object.keys(volumeAccumulator).forEach(symbol => {
    volumeAccumulator[symbol] = 0;
  });
  Object.keys(baseVolumes).forEach(symbol => {
    baseVolumes[symbol] = 0;
  });
};

// ============================================
// SMART FETCH - REST + WebSocket combined
// ============================================

export const initializeRealTimeData = async (symbols, onUpdate) => {
  console.log('📊 Fetching initial quotes via REST...');
  const initialQuotes = await getMultipleQuotes(symbols);
  
  // Store quotes and set base volumes
  Object.entries(initialQuotes).forEach(([symbol, quote]) => {
    latestQuotes[symbol] = { ...quote };
    setBaseVolume(symbol, quote.volume);
  });

  // Connect WebSocket if market is open
  if (isMarketOpen() || isExtendedHours()) {
    console.log('🔴 Market open - connecting WebSocket for live data...');
    connectWebSocket(symbols, onUpdate);
  } else {
    console.log('🌙 Market closed - REST polling only');
  }

  return initialQuotes;
};

// ============================================
// COMPANY PROFILE & SEARCH
// ============================================

export const getCompanyProfile = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return {
      symbol: symbol,
      name: data.name,
      logo: data.logo,
      industry: data.finnhubIndustry,
      exchange: data.exchange,
      marketCap: data.marketCapitalization,
      weburl: data.weburl,
      country: data.country,
      ipo: data.ipo,
    };
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
};

export const searchStocks = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    const results = (data.result || [])
      .filter(item => item.type === 'Common Stock' && !item.symbol.includes('.'))
      .slice(0, 10)
      .map(item => ({
        symbol: item.symbol,
        name: item.description,
      }));
    
    return results;
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const getMarketNews = async (category = 'general') => {
  try {
    const response = await fetch(
      `${BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return (data || []).slice(0, 10).map(item => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: new Date(item.datetime * 1000),
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getCompanyNews = async (symbol, daysBack = 7) => {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return (data || []).slice(0, 5).map(item => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: new Date(item.datetime * 1000),
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

export const getBasicFinancials = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    const m = data.metric || {};
    return {
      symbol: symbol,
      peRatio: m.peBasicExclExtraTTM,
      pbRatio: m.pbQuarterly,
      eps: m.epsBasicExclExtraItemsTTM,
      dividendYield: m.dividendYieldIndicatedAnnual,
      marketCap: m.marketCapitalization,
      high52Week: m['52WeekHigh'],
      low52Week: m['52WeekLow'],
      avgVolume: m['10DayAverageTradingVolume'],
      beta: m.beta,
    };
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error);
    return null;
  }
};

// ============================================
// HELPERS
// ============================================

export const formatNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  return '$' + price.toFixed(2);
};

export const formatPercent = (percent) => {
  if (!percent && percent !== 0) return 'N/A';
  const sign = percent >= 0 ? '+' : '';
  return sign + percent.toFixed(2) + '%';
};
