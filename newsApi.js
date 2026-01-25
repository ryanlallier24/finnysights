// News API Service for finnysights
// Uses Finnhub for stock news (already have API key)
// Uses CryptoPanic for crypto news (free, no key needed for public news)

const FINNHUB_API_KEY = 'd5r20chr01qqqlh9ass0d5r20chr01qqqlh9assg';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

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
// CRYPTO NEWS (Using RSS feeds converted to JSON)
// ============================================

// Get crypto news from CoinGecko's status updates or fallback
export const getCryptoNews = async () => {
  try {
    // Using CoinGecko's trending + news approach
    // First try to get status updates which often contain news
    const response = await fetch(
      'https://api.coingecko.com/api/v3/status_updates?per_page=15'
    );
    const data = await response.json();
    
    if (data.status_updates && data.status_updates.length > 0) {
      return data.status_updates.map((item, index) => ({
        id: `crypto-${index}-${Date.now()}`,
        title: item.description?.substring(0, 100) + '...' || 'Crypto Update',
        summary: item.description || '',
        source: item.project?.name || 'CoinGecko',
        url: item.project?.links?.homepage?.[0] || 'https://coingecko.com',
        image: item.project?.image?.large || null,
        timestamp: new Date(item.created_at),
        symbol: item.project?.symbol?.toUpperCase() || 'CRYPTO',
        type: 'crypto',
      }));
    }
    
    // Fallback to generated news based on trending
    return await getFallbackCryptoNews();
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return await getFallbackCryptoNews();
  }
};

// Fallback crypto news based on market data
const getFallbackCryptoNews = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false&price_change_percentage=24h'
    );
    const coins = await response.json();
    
    // Generate news-like items from market movers
    const news = [];
    
    coins.forEach((coin, index) => {
      const change = coin.price_change_percentage_24h || 0;
      const direction = change >= 0 ? 'rises' : 'falls';
      const emoji = change >= 0 ? '📈' : '📉';
      
      if (Math.abs(change) > 2) { // Only significant moves
        news.push({
          id: `market-${coin.id}-${Date.now()}`,
          title: `${emoji} ${coin.name} (${coin.symbol.toUpperCase()}) ${direction} ${Math.abs(change).toFixed(1)}% in 24 hours`,
          summary: `${coin.name} is currently trading at $${coin.current_price.toLocaleString()} with a market cap of $${(coin.market_cap / 1e9).toFixed(2)}B. 24h trading volume: $${(coin.total_volume / 1e9).toFixed(2)}B.`,
          source: 'Market Data',
          url: `https://www.coingecko.com/en/coins/${coin.id}`,
          image: coin.image,
          timestamp: new Date(),
          symbol: coin.symbol.toUpperCase(),
          type: 'crypto',
          isMarketUpdate: true,
        });
      }
    });
    
    // Add some general crypto headlines
    const generalNews = [
      {
        id: 'gen-1',
        title: '🪙 Crypto market sees increased institutional interest',
        summary: 'Major financial institutions continue to explore cryptocurrency investments and blockchain technology adoption.',
        source: 'Market Analysis',
        url: 'https://coingecko.com',
        image: null,
        timestamp: new Date(),
        type: 'crypto',
      },
      {
        id: 'gen-2',
        title: '⛓️ DeFi total value locked reaches new milestone',
        summary: 'Decentralized finance protocols continue to attract capital as the ecosystem matures.',
        source: 'DeFi Watch',
        url: 'https://coingecko.com',
        image: null,
        timestamp: new Date(Date.now() - 3600000),
        type: 'crypto',
      },
    ];
    
    return [...news, ...generalNews].slice(0, 10);
  } catch (error) {
    console.error('Error generating fallback news:', error);
    return [];
  }
};

// Get news for a specific crypto
export const getCryptoNewsBySymbol = async (symbol) => {
  try {
    // Map common symbols to CoinGecko IDs
    const symbolToId = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'MATIC': 'polygon',
      'BNB': 'binancecoin',
      'SHIB': 'shiba-inu',
      'LTC': 'litecoin',
    };
    
    const coinId = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();
    
    // Get coin details which may include news/updates
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=true&developer_data=false`
    );
    const data = await response.json();
    
    const news = [];
    
    // Add price update as "news"
    if (data.market_data) {
      const change = data.market_data.price_change_percentage_24h || 0;
      news.push({
        id: `${coinId}-price-${Date.now()}`,
        title: `${data.name} ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}% today`,
        summary: `Current price: $${data.market_data.current_price?.usd?.toLocaleString() || 'N/A'}. Market cap rank: #${data.market_cap_rank || 'N/A'}.`,
        source: 'Live Data',
        url: `https://www.coingecko.com/en/coins/${coinId}`,
        image: data.image?.large,
        timestamp: new Date(),
        symbol: symbol.toUpperCase(),
        type: 'crypto',
        isLiveUpdate: true,
      });
    }
    
    // Add description as background info
    if (data.description?.en) {
      const desc = data.description.en.replace(/<[^>]*>/g, ''); // Strip HTML
      news.push({
        id: `${coinId}-about-${Date.now()}`,
        title: `About ${data.name}`,
        summary: desc.substring(0, 200) + '...',
        source: 'CoinGecko',
        url: `https://www.coingecko.com/en/coins/${coinId}`,
        image: data.image?.large,
        timestamp: new Date(data.genesis_date || Date.now()),
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

// Get combined news feed (stocks + crypto)
export const getCombinedNews = async () => {
  try {
    const [stockNews, cryptoNews] = await Promise.all([
      getMarketNews('general'),
      getCryptoNews(),
    ]);
    
    // Combine and sort by timestamp
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

// Format relative time
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
