// News API Service for finnysights
// Uses Finnhub for stock news (already have API key)
// Uses CoinCap for crypto market updates (free, CORS supported)

const FINNHUB_API_KEY = 'd5r20chr01qqqlh9ass0d5r20chr01qqqlh9assg'; // Replace with your key
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const COINCAP_BASE = 'https://api.coincap.io/v2';

// ============================================
// STOCK NEWS (Finnhub)
// ============================================

// Get general market news
export const getMarketNews = async (category = 'general') => {
  try {
    const response = await fetch(
      `${FINNHUB_BASE}/news?category=${category}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return (data || []).slice(0, 15).map(article => ({
      id: article.id,
      title: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      timestamp: new Date(article.datetime * 1000),
      category: article.category,
      type: 'stock',
    }));
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
};

// Get news for a specific stock
export const getStockNews = async (symbol, daysBack = 7) => {
  try {
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return (data || []).slice(0, 10).map(article => ({
      id: article.id,
      title: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      timestamp: new Date(article.datetime * 1000),
      symbol: symbol,
      type: 'stock',
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

// ============================================
// CRYPTO NEWS (CoinCap market data)
// ============================================

// Get crypto news from market movers via CoinCap
export const getCryptoNews = async () => {
  try {
    const response = await fetch(`${COINCAP_BASE}/assets?limit=20`);
    const json = await response.json();
    const coins = json.data || [];

    const news = [];

    // Generate news from significant movers
    coins.forEach(coin => {
      const change = parseFloat(coin.changePercent24Hr) || 0;
      const price = parseFloat(coin.priceUsd) || 0;
      const volume = parseFloat(coin.volumeUsd24Hr) || 0;
      const marketCap = parseFloat(coin.marketCapUsd) || 0;
      const direction = change >= 0 ? 'rises' : 'falls';
      const emoji = change >= 0 ? '📈' : '📉';

      if (Math.abs(change) > 2) {
        news.push({
          id: `market-${coin.id}-${Date.now()}`,
          title: `${emoji} ${coin.name} (${coin.symbol}) ${direction} ${Math.abs(change).toFixed(1)}% in 24 hours`,
          summary: `${coin.name} is currently trading at $${price.toLocaleString(undefined, { maximumFractionDigits: 2 })} with a market cap of $${(marketCap / 1e9).toFixed(2)}B. 24h trading volume: $${(volume / 1e9).toFixed(2)}B.`,
          source: 'Market Data',
          url: `https://coincap.io/assets/${coin.id}`,
          image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
          timestamp: new Date(),
          symbol: coin.symbol.toUpperCase(),
          type: 'crypto',
          isMarketUpdate: true,
        });
      }
    });

    // If no big movers, add top 3 by market cap as general updates
    if (news.length === 0) {
      coins.slice(0, 3).forEach(coin => {
        const change = parseFloat(coin.changePercent24Hr) || 0;
        const price = parseFloat(coin.priceUsd) || 0;
        news.push({
          id: `update-${coin.id}-${Date.now()}`,
          title: `${coin.name} (${coin.symbol}) trading at $${price >= 1 ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price.toFixed(4)}`,
          summary: `${coin.name} is ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}% in the last 24 hours. Rank #${coin.rank} by market cap.`,
          source: 'Market Data',
          url: `https://coincap.io/assets/${coin.id}`,
          image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
          timestamp: new Date(),
          symbol: coin.symbol.toUpperCase(),
          type: 'crypto',
          isMarketUpdate: true,
        });
      });
    }

    return news.slice(0, 10);
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return [];
  }
};

// Get news for a specific crypto by symbol
export const getCryptoNewsBySymbol = async (symbol) => {
  // Map common symbols to CoinCap IDs
  const symbolToId = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'AVAX': 'avalanche',
    'LINK': 'chainlink',
    'MATIC': 'polygon',
    'BNB': 'binance-coin',
    'SHIB': 'shiba-inu',
    'LTC': 'litecoin',
  };

  const coinId = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();

  try {
    const response = await fetch(`${COINCAP_BASE}/assets/${coinId}`);
    const json = await response.json();
    const coin = json.data;

    if (!coin) return [];

    const change = parseFloat(coin.changePercent24Hr) || 0;
    const price = parseFloat(coin.priceUsd) || 0;
    const volume = parseFloat(coin.volumeUsd24Hr) || 0;
    const marketCap = parseFloat(coin.marketCapUsd) || 0;

    const news = [];

    // Price update
    news.push({
      id: `${coinId}-price-${Date.now()}`,
      title: `${coin.name} ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}% today`,
      summary: `Current price: $${price >= 1 ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price.toFixed(6)}. Market cap rank: #${coin.rank}. 24h volume: $${(volume / 1e9).toFixed(2)}B.`,
      source: 'Live Data',
      url: `https://coincap.io/assets/${coinId}`,
      image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
      timestamp: new Date(),
      symbol: symbol.toUpperCase(),
      type: 'crypto',
      isLiveUpdate: true,
    });

    // Supply info
    const supply = parseFloat(coin.supply) || 0;
    const maxSupply = parseFloat(coin.maxSupply);
    if (maxSupply) {
      const supplyPercent = ((supply / maxSupply) * 100).toFixed(1);
      news.push({
        id: `${coinId}-supply-${Date.now()}`,
        title: `${coin.name} Supply: ${supplyPercent}% of max supply in circulation`,
        summary: `${(supply / 1e6).toFixed(2)}M of ${(maxSupply / 1e6).toFixed(2)}M ${coin.symbol} are currently in circulation. Market cap: $${(marketCap / 1e9).toFixed(2)}B.`,
        source: 'Token Info',
        url: `https://coincap.io/assets/${coinId}`,
        image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
        timestamp: new Date(),
        symbol: symbol.toUpperCase(),
        type: 'crypto',
        isAbout: true,
      });
    }

    return news;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

// ============================================
// COMBINED NEWS FEED
// ============================================

export const getCombinedNews = async () => {
  try {
    const [stockNews, cryptoNews] = await Promise.all([
      getMarketNews('general'),
      getCryptoNews(),
    ]);

    const combined = [...stockNews, ...cryptoNews];
    combined.sort((a, b) => b.timestamp - a.timestamp);

    return combined.slice(0, 20);
  } catch (error) {
    console.error('Error fetching combined news:', error);
    return [];
  }
};

// ============================================
// HELPERS
// ============================================

export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
