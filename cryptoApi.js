// Crypto API Service using CoinGecko (Free, no API key needed)
const BASE_URL = 'https://api.coingecko.com/api/v3';

// Top cryptocurrencies to display
export const DEFAULT_CRYPTOS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 
  'cardano', 'dogecoin', 'polkadot', 'polygon', 'litecoin'
];

// Get prices for multiple cryptos
export const getCryptoPrices = async (ids = DEFAULT_CRYPTOS) => {
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {};
  }
};

// Get detailed market data for top cryptos
export const getCryptoMarketData = async (limit = 10) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    const data = await response.json();
    
    return data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      rank: coin.market_cap_rank,
    }));
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    return [];
  }
};

// Search for cryptocurrencies
export const searchCrypto = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${query}`
    );
    const data = await response.json();
    
    return (data.coins || []).slice(0, 10).map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.thumb,
      marketCapRank: coin.market_cap_rank,
    }));
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
};

// Get single crypto details
export const getCryptoDetails = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    const data = await response.json();
    
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.large,
      price: data.market_data?.current_price?.usd,
      change: data.market_data?.price_change_percentage_24h,
      marketCap: data.market_data?.market_cap?.usd,
      volume: data.market_data?.total_volume?.usd,
      high24h: data.market_data?.high_24h?.usd,
      low24h: data.market_data?.low_24h?.usd,
      ath: data.market_data?.ath?.usd,
      athDate: data.market_data?.ath_date?.usd,
      rank: data.market_cap_rank,
      description: data.description?.en,
    };
  } catch (error) {
    console.error('Error fetching crypto details:', error);
    return null;
  }
};

// Get trending cryptos
export const getTrendingCrypto = async () => {
  try {
    const response = await fetch(`${BASE_URL}/search/trending`);
    const data = await response.json();
    
    return (data.coins || []).map(item => ({
      id: item.item.id,
      symbol: item.item.symbol.toUpperCase(),
      name: item.item.name,
      image: item.item.thumb,
      marketCapRank: item.item.market_cap_rank,
      score: item.item.score,
    }));
  } catch (error) {
    console.error('Error fetching trending crypto:', error);
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
