// Firestore Database Functions for finnysights
import { db } from './firebase.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  where,
  Timestamp
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

// ============================================
// GLOBAL COMMUNITY CHAT FUNCTIONS
// ============================================

// Send a message to global chat
export const sendGlobalMessage = async (uid, displayName, content, avatar = '👤') => {
  if (!uid || !content?.trim()) return null;
  
  try {
    const messagesRef = collection(db, 'globalChat');
    const docRef = await addDoc(messagesRef, {
      uid,
      displayName: displayName || 'Anonymous',
      content: content.trim(),
      avatar: avatar || '👤',
      createdAt: serverTimestamp(),
      likes: [],
      likeCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending global message:', error);
    return null;
  }
};

// Get recent global chat messages
export const getGlobalMessages = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'globalChat'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })).reverse();
  } catch (error) {
    console.error('Error fetching global messages:', error);
    return [];
  }
};

// Listen for new global chat messages in real-time
export const listenToGlobalChat = (limitCount, callback) => {
  const q = query(
    collection(db, 'globalChat'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })).reverse();
    callback(messages);
  });
};

// Like a global chat message
export const likeGlobalMessage = async (uid, messageId) => {
  if (!uid || !messageId) return false;
  try {
    const msgRef = doc(db, 'globalChat', messageId);
    await updateDoc(msgRef, {
      likes: arrayUnion(uid),
      likeCount: (await getDoc(msgRef)).data()?.likeCount + 1 || 1,
    });
    return true;
  } catch (error) {
    console.error('Error liking message:', error);
    return false;
  }
};

// ============================================
// ANNOUNCEMENTS / SYSTEM ALERTS FUNCTIONS
// ============================================

// Post an announcement (admin use)
export const postAnnouncement = async (uid, displayName, content, type = 'update') => {
  if (!uid || !content?.trim()) return null;
  
  try {
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, {
      uid,
      displayName: displayName || 'finnysights',
      content: content.trim(),
      type, // 'update', 'feature', 'alert', 'maintenance'
      createdAt: serverTimestamp(),
      readBy: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error posting announcement:', error);
    return null;
  }
};

// Get recent announcements
export const getAnnouncements = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

// Listen to announcements in real-time
export const listenToAnnouncements = (callback) => {
  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));
    callback(announcements);
  });
};

// Mark announcement as read by user
export const markAnnouncementRead = async (uid, announcementId) => {
  if (!uid || !announcementId) return false;
  try {
    const annRef = doc(db, 'announcements', announcementId);
    await updateDoc(annRef, {
      readBy: arrayUnion(uid),
    });
    return true;
  } catch (error) {
    console.error('Error marking announcement read:', error);
    return false;
  }
};

// ============================================
// BATCH USER AVATAR FETCHING
// ============================================

// Get multiple user avatars at once (for leaderboard)
export const getUserAvatars = async (uids) => {
  if (!uids || uids.length === 0) return {};
  
  const avatarMap = {};
  try {
    for (const uid of uids) {
      const profile = await getUserProfile(uid);
      if (profile) {
        avatarMap[uid] = {
          avatar: profile.avatar || '👤',
          displayName: profile.displayName || 'Trader',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching avatars:', error);
  }
  return avatarMap;
};
