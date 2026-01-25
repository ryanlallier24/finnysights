// Firestore Database Functions for finnysights
import { db } from './firebase.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

// Create or update user profile when they sign up/login
export const createUserProfile = async (user) => {
  if (!user) return null;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // New user - create profile
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      // Default settings
      settings: {
        theme: 'dark',
        emailAlerts: true,
        pushNotifications: false,
        anonymousMode: false,
      },
      // Empty watchlist to start
      watchlist: [],
      // Voting history
      votes: [],
    };
    
    await setDoc(userRef, userData);
    console.log('New user profile created');
    return userData;
  } else {
    // Existing user - update last login
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
    console.log('User profile updated');
    return userSnap.data();
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  if (!uid) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

// ============================================
// WATCHLIST FUNCTIONS
// ============================================

// Add stock to watchlist
export const addToWatchlist = async (uid, stock) => {
  if (!uid || !stock) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      watchlist: arrayUnion({
        symbol: stock.symbol,
        name: stock.name,
        addedAt: new Date().toISOString(),
      })
    });
    console.log(`Added ${stock.symbol} to watchlist`);
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

// Remove stock from watchlist
export const removeFromWatchlist = async (uid, symbol) => {
  if (!uid || !symbol) return false;
  
  try {
    // First get the current watchlist to find the exact item
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return false;
    
    const stockToRemove = userProfile.watchlist.find(s => s.symbol === symbol);
    if (!stockToRemove) return false;
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      watchlist: arrayRemove(stockToRemove)
    });
    console.log(`Removed ${symbol} from watchlist`);
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};

// Get user's watchlist
export const getWatchlist = async (uid) => {
  if (!uid) return [];
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.watchlist || [];
};

// ============================================
// USER SETTINGS FUNCTIONS
// ============================================

// Update user settings
export const updateUserSettings = async (uid, settings) => {
  if (!uid) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      settings: settings
    });
    console.log('Settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

// Get user settings
export const getUserSettings = async (uid) => {
  if (!uid) return null;
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.settings || null;
};

// ============================================
// VOTING FUNCTIONS
// ============================================

// Record a user's vote on a stock
export const recordVote = async (uid, symbol, vote) => {
  if (!uid || !symbol || !vote) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      votes: arrayUnion({
        symbol: symbol,
        vote: vote, // 'bullish' or 'bearish'
        votedAt: new Date().toISOString(),
      })
    });
    console.log(`Recorded ${vote} vote for ${symbol}`);
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
};

// ============================================
// ALERTS FUNCTIONS
// ============================================

// Add price alert
export const addPriceAlert = async (uid, alert) => {
  if (!uid || !alert) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      alerts: arrayUnion({
        id: Date.now().toString(),
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition, // 'above' or 'below'
        createdAt: new Date().toISOString(),
        triggered: false,
      })
    });
    console.log(`Added price alert for ${alert.symbol}`);
    return true;
  } catch (error) {
    console.error('Error adding alert:', error);
    return false;
  }
};

// Remove price alert
export const removePriceAlert = async (uid, alertId) => {
  if (!uid || !alertId) return false;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile?.alerts) return false;
    
    const alertToRemove = userProfile.alerts.find(a => a.id === alertId);
    if (!alertToRemove) return false;
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      alerts: arrayRemove(alertToRemove)
    });
    console.log(`Removed alert ${alertId}`);
    return true;
  } catch (error) {
    console.error('Error removing alert:', error);
    return false;
  }
};
