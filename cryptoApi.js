// Crypto API Service using CoinPaprika (Free, no API key, CORS supported)
const BASE_URL = 'https://api.coinpaprika.com/v1';

// Top cryptocurrencies to display
export const DEFAULT_CRYPTOS = [
  'btc-bitcoin', 'eth-ethereum', 'bnb-binance-coin', 'sol-solana', 'xrp-xrp',
  'ada-cardano', 'doge-dogecoin', 'dot-polkadot', 'matic-polygon', 'ltc-litecoin'
];

// Get detailed market data for top cryptos
export const getCryptoMarketData = async (limit = 10) => {
  try {
    const response = await fetch(`${BASE_URL}/tickers?limit=${limit}`);
    const data = await response.json();

    if (!Array.isArray(data)) return [];

    return data.map(coin => {
      const usd = coin.quotes?.USD || {};
      return {
        id: coin.id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name,
        image: `https://static.coinpaprika.com/coin/${coin.id}/logo.png`,
        price: usd.price || 0,
        change: usd.percent_change_24h || 0,
        marketCap: usd.market_cap || 0,
        volume: usd.volume_24h || 0,
        high24h: null,
        low24h: null,
        rank: coin.rank || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    return [];
  }
};

// Search for cryptocurrencies
export const searchCrypto = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();

    const coins = data.currencies || [];
    return coins.slice(0, 10).map(coin => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase() || '',
      name: coin.name,
      image: `https://static.coinpaprika.com/coin/${coin.id}/logo.png`,
      marketCapRank: coin.rank || null,
    }));
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
};

// Get single crypto details
export const getCryptoDetails = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/tickers/${id}`);
    const coin = await response.json();

    if (!coin || coin.error) return null;

    const usd = coin.quotes?.USD || {};
    return {
      id: coin.id,
      symbol: coin.symbol?.toUpperCase() || '',
      name: coin.name,
      image: `https://static.coinpaprika.com/coin/${coin.id}/logo.png`,
      price: usd.price || 0,
      change: usd.percent_change_24h || 0,
      marketCap: usd.market_cap || 0,
      volume: usd.volume_24h || 0,
      rank: coin.rank || 0,
      athPrice: usd.ath_price || null,
      athDate: usd.ath_date || null,
    };
  } catch (error) {
    console.error('Error fetching crypto details:', error);
    return null;
  }
};

// Get top movers (biggest gainers/losers)
export const getTopMovers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tickers?limit=50`);
    const data = await response.json();

    if (!Array.isArray(data)) return [];

    const sorted = data
      .filter(c => c.quotes?.USD?.percent_change_24h)
      .sort((a, b) => Math.abs(b.quotes.USD.percent_change_24h) - Math.abs(a.quotes.USD.percent_change_24h));

    return sorted.slice(0, 10).map(coin => {
      const usd = coin.quotes.USD;
      return {
        id: coin.id,
        symbol: coin.symbol?.toUpperCase() || '',
        name: coin.name,
        image: `https://static.coinpaprika.com/coin/${coin.id}/logo.png`,
        price: usd.price || 0,
        change: usd.percent_change_24h || 0,
        volume: usd.volume_24h || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching top movers:', error);
    return [];
  }
};

// Helper: Format crypto price (handles small decimals)
export const formatCryptoPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  if (price >= 1) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 0.01) return '$' + price.toFixed(4);
  return '$' + price.toFixed(8);
};

// Helper: Format market cap
export const formatMarketCap = (num) => {
  if (!num) return 'N/A';
  if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  return '$' + num.toLocaleString();
};
