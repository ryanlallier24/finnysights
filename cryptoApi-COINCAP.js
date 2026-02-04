// Crypto API Service using CoinCap (Free, no API key, CORS supported)
const BASE_URL = 'https://api.coincap.io/v2';

// Icon URL helper - CoinCap provides icons
const getCryptoIcon = (symbol) =>
  `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

// Top cryptocurrencies to display
export const DEFAULT_CRYPTOS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
  'cardano', 'dogecoin', 'polkadot', 'polygon', 'litecoin'
];

// Get detailed market data for top cryptos
export const getCryptoMarketData = async (limit = 10) => {
  try {
    const response = await fetch(`${BASE_URL}/assets?limit=${limit}`);
    const json = await response.json();
    const data = json.data || [];

    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: getCryptoIcon(coin.symbol),
      price: parseFloat(coin.priceUsd) || 0,
      change: parseFloat(coin.changePercent24Hr) || 0,
      marketCap: parseFloat(coin.marketCapUsd) || 0,
      volume: parseFloat(coin.volumeUsd24Hr) || 0,
      high24h: null,
      low24h: null,
      rank: parseInt(coin.rank) || 0,
      supply: parseFloat(coin.supply) || 0,
      maxSupply: parseFloat(coin.maxSupply) || null,
      vwap24h: parseFloat(coin.vwap24Hr) || 0,
    }));
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    return [];
  }
};

// Search for cryptocurrencies
export const searchCrypto = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/assets?search=${encodeURIComponent(query)}&limit=10`);
    const json = await response.json();
    const data = json.data || [];

    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: getCryptoIcon(coin.symbol),
      marketCapRank: parseInt(coin.rank) || null,
    }));
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
};

// Get single crypto details
export const getCryptoDetails = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${id}`);
    const json = await response.json();
    const coin = json.data;

    if (!coin) return null;

    return {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: getCryptoIcon(coin.symbol),
      price: parseFloat(coin.priceUsd) || 0,
      change: parseFloat(coin.changePercent24Hr) || 0,
      marketCap: parseFloat(coin.marketCapUsd) || 0,
      volume: parseFloat(coin.volumeUsd24Hr) || 0,
      rank: parseInt(coin.rank) || 0,
      supply: parseFloat(coin.supply) || 0,
      maxSupply: parseFloat(coin.maxSupply) || null,
      vwap24h: parseFloat(coin.vwap24Hr) || 0,
      explorer: coin.explorer,
    };
  } catch (error) {
    console.error('Error fetching crypto details:', error);
    return null;
  }
};

// Get top movers (biggest gainers/losers)
export const getTopMovers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/assets?limit=50`);
    const json = await response.json();
    const data = json.data || [];

    const sorted = data
      .filter(c => parseFloat(c.changePercent24Hr))
      .sort((a, b) => Math.abs(parseFloat(b.changePercent24Hr)) - Math.abs(parseFloat(a.changePercent24Hr)));

    return sorted.slice(0, 10).map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: getCryptoIcon(coin.symbol),
      price: parseFloat(coin.priceUsd) || 0,
      change: parseFloat(coin.changePercent24Hr) || 0,
      volume: parseFloat(coin.volumeUsd24Hr) || 0,
    }));
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
