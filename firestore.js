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
  increment,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  onSnapshot,
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
      // Voting history - stores as object for easier lookup
      votes: {},
      // Social stats
      followers: [],
      following: [],
      totalVotes: 0,
      correctPredictions: 0,
      reputation: 0,
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
// ENHANCED VOTING FUNCTIONS
// ============================================

// Record or update a user's vote on a stock
export const recordVote = async (uid, symbol, vote) => {
  if (!uid || !symbol || !vote) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    const stockVotesRef = doc(db, 'stockVotes', symbol);
    
    // Get user's current votes
    const userProfile = await getUserProfile(uid);
    const currentVotes = userProfile?.votes || {};
    const previousVote = currentVotes[symbol];
    
    // Update user's vote record
    await updateDoc(userRef, {
      [`votes.${symbol}`]: {
        vote: vote,
        votedAt: new Date().toISOString(),
      },
      totalVotes: increment(previousVote ? 0 : 1)
    });
    
    // Update community vote totals
    const stockVotesSnap = await getDoc(stockVotesRef);
    
    if (!stockVotesSnap.exists()) {
      await setDoc(stockVotesRef, {
        symbol: symbol,
        bullish: vote === 'bullish' ? 1 : 0,
        bearish: vote === 'bearish' ? 1 : 0,
        totalVotes: 1,
        lastUpdated: serverTimestamp(),
      });
    } else {
      const updates = {
        lastUpdated: serverTimestamp(),
      };
      
      if (previousVote && previousVote.vote !== vote) {
        updates[previousVote.vote] = increment(-1);
      }
      
      if (!previousVote || previousVote.vote !== vote) {
        updates[vote] = increment(1);
        if (!previousVote) {
          updates.totalVotes = increment(1);
        }
      }
      
      await updateDoc(stockVotesRef, updates);
    }
    
    console.log(`Recorded ${vote} vote for ${symbol}`);
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
};

// Remove a user's vote on a stock
export const removeVote = async (uid, symbol) => {
  if (!uid || !symbol) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    const stockVotesRef = doc(db, 'stockVotes', symbol);
    
    const userProfile = await getUserProfile(uid);
    const currentVotes = userProfile?.votes || {};
    const previousVote = currentVotes[symbol];
    
    if (!previousVote) return true;
    
    await updateDoc(userRef, {
      [`votes.${symbol}`]: null
    });
    
    const stockVotesSnap = await getDoc(stockVotesRef);
    if (stockVotesSnap.exists()) {
      await updateDoc(stockVotesRef, {
        [previousVote.vote]: increment(-1),
        totalVotes: increment(-1),
        lastUpdated: serverTimestamp(),
      });
    }
    
    console.log(`Removed vote for ${symbol}`);
    return true;
  } catch (error) {
    console.error('Error removing vote:', error);
    return false;
  }
};

// Get user's votes
export const getUserVotes = async (uid) => {
  if (!uid) return {};
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.votes || {};
};

// Get community vote totals for a stock
export const getStockVotes = async (symbol) => {
  if (!symbol) return null;
  
  try {
    const stockVotesRef = doc(db, 'stockVotes', symbol);
    const stockVotesSnap = await getDoc(stockVotesRef);
    
    if (stockVotesSnap.exists()) {
      return stockVotesSnap.data();
    }
    return { bullish: 0, bearish: 0, totalVotes: 0 };
  } catch (error) {
    console.error('Error getting stock votes:', error);
    return { bullish: 0, bearish: 0, totalVotes: 0 };
  }
};

// ============================================
// SOCIAL FEATURES - COMMENTS
// ============================================

// Add a comment to a stock
export const addComment = async (uid, stockSymbol, content) => {
  if (!uid || !stockSymbol || !content) return null;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return null;
    
    const commentData = {
      uid: uid,
      stockSymbol: stockSymbol,
      content: content,
      displayName: userProfile.settings?.anonymousMode ? 'Anonymous' : (userProfile.displayName || userProfile.email?.split('@')[0]),
      isAnonymous: userProfile.settings?.anonymousMode || false,
      createdAt: serverTimestamp(),
      likes: [],
      likesCount: 0,
      reactions: {},
    };
    
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, commentData);
    
    console.log('Comment added:', docRef.id);
    return { id: docRef.id, ...commentData, createdAt: new Date() };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Get comments for a stock
export const getStockComments = async (stockSymbol, limitCount = 20) => {
  if (!stockSymbol) return [];
  
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('stockSymbol', '==', stockSymbol),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// Like a comment
export const likeComment = async (uid, commentId) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: arrayUnion(uid),
      likesCount: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error liking comment:', error);
    return false;
  }
};

// Unlike a comment
export const unlikeComment = async (uid, commentId) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: arrayRemove(uid),
      likesCount: increment(-1)
    });
    return true;
  } catch (error) {
    console.error('Error unliking comment:', error);
    return false;
  }
};

// React to a stock comment with an emoji
export const reactToComment = async (uid, commentId, emoji) => {
  if (!uid || !commentId || !emoji) return false;

  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) return false;

    const reactions = commentSnap.data().reactions || {};
    const emojiReactions = reactions[emoji] || [];
    const hasReacted = emojiReactions.includes(uid);

    if (hasReacted) {
      const updated = emojiReactions.filter(id => id !== uid);
      if (updated.length === 0) {
        const newReactions = { ...reactions };
        delete newReactions[emoji];
        await updateDoc(commentRef, { reactions: newReactions });
      } else {
        await updateDoc(commentRef, { [`reactions.${emoji}`]: updated });
      }
    } else {
      await updateDoc(commentRef, { [`reactions.${emoji}`]: arrayUnion(uid) });
    }
    return true;
  } catch (error) {
    console.error('Error reacting to comment:', error);
    return false;
  }
};

// Delete a comment (only owner)
export const deleteComment = async (uid, commentId) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (!commentSnap.exists()) return false;
    if (commentSnap.data().uid !== uid) return false;
    
    await deleteDoc(commentRef);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// ============================================
// SOCIAL FEATURES - FOLLOWING
// ============================================

// Follow a user
export const followUser = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;
  
  try {
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUid)
    });
    
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUid)
    });
    
    console.log(`User ${currentUid} now following ${targetUid}`);
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid) return false;
  
  try {
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUid)
    });
    
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUid)
    });
    
    console.log(`User ${currentUid} unfollowed ${targetUid}`);
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

// Check if following
export const isFollowing = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid) return false;
  
  try {
    const userProfile = await getUserProfile(currentUid);
    return userProfile?.following?.includes(targetUid) || false;
  } catch (error) {
    return false;
  }
};

// Get user's followers
export const getFollowers = async (uid) => {
  if (!uid) return [];
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.followers || [];
};

// Get user's following
export const getFollowing = async (uid) => {
  if (!uid) return [];
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.following || [];
};

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

// Get top traders by reputation/votes
export const getTopTraders = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(50));
    const snapshot = await getDocs(q);
    
    const traders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const totalVotes = data.totalVotes || 0;
      const isAnonymous = data.settings?.anonymousMode === true;
      
      if (!isAnonymous) {
        traders.push({
          uid: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Trader',
          totalVotes: totalVotes,
          accuracy: data.accuracy || 0,
          correctPredictions: data.correctPredictions || 0,
          streak: data.streak || 0,
          bestStreak: data.bestStreak || 0,
          followerCount: data.followerCount || 0,
          reputationScore: data.reputationScore || totalVotes,
        });
      }
    });
    
    traders.sort((a, b) => b.reputationScore - a.reputationScore || b.totalVotes - a.totalVotes);
    
    return traders.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting top traders:', error);
    return [];
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
        condition: alert.condition,
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
// PORTFOLIO FUNCTIONS
// ============================================

// Add a holding to portfolio
export const addHolding = async (uid, holding) => {
  if (!uid || !holding) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    const holdingData = {
      id: Date.now().toString(),
      symbol: holding.symbol.toUpperCase(),
      name: holding.name || holding.symbol,
      quantity: parseFloat(holding.quantity),
      purchasePrice: parseFloat(holding.purchasePrice),
      purchaseDate: holding.purchaseDate || new Date().toISOString(),
      isCrypto: holding.isCrypto || false,
      notes: holding.notes || '',
      createdAt: new Date().toISOString(),
    };
    
    await updateDoc(userRef, {
      portfolio: arrayUnion(holdingData)
    });
    console.log(`Added ${holding.symbol} to portfolio`);
    return holdingData;
  } catch (error) {
    console.error('Error adding holding:', error);
    return false;
  }
};

// Remove a holding from portfolio
export const removeHolding = async (uid, holdingId) => {
  if (!uid || !holdingId) return false;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile?.portfolio) return false;
    
    const holdingToRemove = userProfile.portfolio.find(h => h.id === holdingId);
    if (!holdingToRemove) return false;
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      portfolio: arrayRemove(holdingToRemove)
    });
    console.log(`Removed holding ${holdingId}`);
    return true;
  } catch (error) {
    console.error('Error removing holding:', error);
    return false;
  }
};

// Get user's portfolio
export const getPortfolio = async (uid) => {
  if (!uid) return [];
  
  const userProfile = await getUserProfile(uid);
  return userProfile?.portfolio || [];
};

// ============================================
// GLOBAL COMMUNITY CHAT FUNCTIONS
// ============================================

// Send a message to global chat
export const sendGlobalMessage = async (uid, displayName, content, avatar = '👤') => {
  if (!uid || !content?.trim()) return null;
  
  try {
    const messageData = {
      uid,
      displayName: displayName || 'Anonymous',
      content: content.trim(),
      avatar: avatar,
      createdAt: serverTimestamp(),
      likes: [],
      likeCount: 0,
      reactions: {},
    };
    
    const chatRef = collection(db, 'globalChat');
    const docRef = await addDoc(chatRef, messageData);
    console.log('Global message sent:', docRef.id);
    return { id: docRef.id, ...messageData, createdAt: new Date() };
  } catch (error) {
    console.error('Error sending global message:', error);
    return null;
  }
};

// Get recent global messages
export const getGlobalMessages = async (limitCount = 50) => {
  try {
    const chatRef = collection(db, 'globalChat');
    const q = query(chatRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    
    return messages.reverse();
  } catch (error) {
    console.error('Error getting global messages:', error);
    return [];
  }
};

// Listen to global chat in real-time
export const listenToGlobalChat = (limitCount, callback) => {
  const chatRef = collection(db, 'globalChat');
  const q = query(chatRef, orderBy('createdAt', 'desc'), limit(limitCount || 50));
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    callback(messages.reverse());
  }, (error) => {
    console.error('Error listening to global chat:', error);
  });
};

// Like a global chat message
export const likeGlobalMessage = async (uid, messageId) => {
  if (!uid || !messageId) return false;
  
  try {
    const messageRef = doc(db, 'globalChat', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (!messageSnap.exists()) return false;
    
    const likes = messageSnap.data().likes || [];
    if (likes.includes(uid)) {
      await updateDoc(messageRef, {
        likes: arrayRemove(uid),
        likeCount: increment(-1),
      });
    } else {
      await updateDoc(messageRef, {
        likes: arrayUnion(uid),
        likeCount: increment(1),
      });
    }
    return true;
  } catch (error) {
    console.error('Error liking message:', error);
    return false;
  }
};

// React to a global chat message with an emoji
export const reactToGlobalMessage = async (uid, messageId, emoji) => {
  if (!uid || !messageId || !emoji) return false;

  try {
    const messageRef = doc(db, 'globalChat', messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) return false;

    const reactions = messageSnap.data().reactions || {};
    const emojiReactions = reactions[emoji] || [];
    const hasReacted = emojiReactions.includes(uid);

    if (hasReacted) {
      // Remove reaction
      const updated = emojiReactions.filter(id => id !== uid);
      if (updated.length === 0) {
        // Remove the emoji key entirely
        const newReactions = { ...reactions };
        delete newReactions[emoji];
        await updateDoc(messageRef, { reactions: newReactions });
      } else {
        await updateDoc(messageRef, { [`reactions.${emoji}`]: updated });
      }
    } else {
      // Add reaction
      await updateDoc(messageRef, { [`reactions.${emoji}`]: arrayUnion(uid) });
    }
    return true;
  } catch (error) {
    console.error('Error reacting to message:', error);
    return false;
  }
};

// ============================================
// ANNOUNCEMENTS FUNCTIONS
// ============================================

// Post an announcement (admin only in production)
export const postAnnouncement = async (uid, displayName, content, type = 'update') => {
  if (!uid || !content?.trim()) return null;
  
  try {
    const announcementData = {
      uid,
      displayName: displayName || 'finnysights Team',
      content: content.trim(),
      type: type,
      createdAt: serverTimestamp(),
      readBy: [],
    };
    
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, announcementData);
    console.log('Announcement posted:', docRef.id);
    return { id: docRef.id, ...announcementData, createdAt: new Date() };
  } catch (error) {
    console.error('Error posting announcement:', error);
    return null;
  }
};

// Get recent announcements
export const getAnnouncements = async (limitCount = 20) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const announcements = [];
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    
    return announcements;
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
};

// Listen to announcements in real-time
export const listenToAnnouncements = (callback) => {
  const announcementsRef = collection(db, 'announcements');
  const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(20));
  
  return onSnapshot(q, (snapshot) => {
    const announcements = [];
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    callback(announcements);
  }, (error) => {
    console.error('Error listening to announcements:', error);
  });
};

// Mark announcement as read
export const markAnnouncementRead = async (uid, announcementId) => {
  if (!uid || !announcementId) return false;
  
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, {
      readBy: arrayUnion(uid),
    });
    return true;
  } catch (error) {
    console.error('Error marking announcement read:', error);
    return false;
  }
};

// ============================================
// AVATAR BATCH FETCHING
// ============================================

// Get avatars for multiple users (for leaderboard)
export const getUserAvatars = async (uids) => {
  if (!uids || uids.length === 0) return {};
  
  const avatarMap = {};
  
  try {
    for (const uid of uids) {
      const profile = await getUserProfile(uid);
      if (profile) {
        avatarMap[uid] = {
          avatar: profile.avatar || profile.photoURL || null,
          displayName: profile.displayName || profile.email?.split('@')[0] || 'Trader',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching user avatars:', error);
  }
  
  return avatarMap;
};
