// Stock API Service using Finnhub
// Free tier: 60 calls/minute

const FINNHUB_API_KEY = 'd5r20chr01qqqlh9ass0d5r20chr01qqqlh9assg';
const BASE_URL = 'https://finnhub.io/api/v1';

// Get real-time quote for a stock
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
      currentPrice: data.c,        // Current price
      change: data.d,              // Change
      changePercent: data.dp,      // Change percent
      high: data.h,                // High of day
      low: data.l,                 // Low of day
      open: data.o,                // Open price
      previousClose: data.pc,      // Previous close
      timestamp: data.t,           // Timestamp
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

// Get quotes for multiple stocks
export const getMultipleQuotes = async (symbols) => {
  const quotes = {};
  
  // Finnhub free tier: 60 calls/min, so we fetch sequentially with small delay
  for (const symbol of symbols) {
    const quote = await getQuote(symbol);
    if (quote) {
      quotes[symbol] = quote;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  return quotes;
};

// Get company profile
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

// Search for stocks
export const searchStocks = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    // Filter for US stocks only and limit results
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

// Get market news
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

// Get company news
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

// Get basic financials
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

// Helper: Format large numbers
export const formatNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

// Helper: Format price
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  return '$' + price.toFixed(2);
};

// Helper: Format percent
export const formatPercent = (percent) => {
  if (!percent && percent !== 0) return 'N/A';
  const sign = percent >= 0 ? '+' : '';
  return sign + percent.toFixed(2) + '%';
};
