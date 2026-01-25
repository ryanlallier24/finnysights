// Firestore Database Functions for finnysights
import { db } from './firebase.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  increment,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc
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
      // Social features
      followers: [],
      following: [],
      followerCount: 0,
      followingCount: 0,
      bio: '',
      // Enhanced ranking stats
      totalVotes: 0,
      correctPredictions: 0,
      accuracy: 0,
      streak: 0,
      bestStreak: 0,
      totalLikesReceived: 0,
      reputationScore: 0,
    };
    
    await setDoc(userRef, userData);
    console.log('New user profile created');
    return userData;
  } else {
    // Existing user - update last login AND ensure new fields exist
    const existingData = userSnap.data();
    const updates = {
      lastLogin: serverTimestamp(),
    };
    
    // Add missing fields for existing users (migration)
    if (existingData.totalVotes === undefined) updates.totalVotes = 0;
    if (existingData.correctPredictions === undefined) updates.correctPredictions = 0;
    if (existingData.accuracy === undefined) updates.accuracy = 0;
    if (existingData.streak === undefined) updates.streak = 0;
    if (existingData.bestStreak === undefined) updates.bestStreak = 0;
    if (existingData.totalLikesReceived === undefined) updates.totalLikesReceived = 0;
    if (existingData.reputationScore === undefined) updates.reputationScore = 0;
    if (existingData.followers === undefined) updates.followers = [];
    if (existingData.following === undefined) updates.following = [];
    if (existingData.followerCount === undefined) updates.followerCount = 0;
    if (existingData.followingCount === undefined) updates.followingCount = 0;
    
    await updateDoc(userRef, updates);
    console.log('User profile updated with new fields');
    return { ...existingData, ...updates };
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() };
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
// ENHANCED VOTING WITH PREDICTION TRACKING
// ============================================

// Record or update a user's vote on a stock (with price tracking for accuracy)
export const recordVote = async (uid, symbol, vote, currentPrice = null) => {
  if (!uid || !symbol || !vote) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    const stockVotesRef = doc(db, 'stockVotes', symbol);
    
    // Get user's current votes
    const userProfile = await getUserProfile(uid);
    const currentVotes = userProfile?.votes || {};
    const previousVote = currentVotes[symbol];
    
    // Update user's vote record with price for prediction tracking
    const voteData = {
      vote: vote,
      votedAt: new Date().toISOString(),
      priceAtVote: currentPrice, // Store price when vote was made
      resolved: false, // Will be true once prediction is checked
      correct: null, // Will be true/false once resolved
    };
    
    await updateDoc(userRef, {
      [`votes.${symbol}`]: voteData,
      totalVotes: increment(previousVote ? 0 : 1),
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
    
    console.log(`Recorded ${vote} vote for ${symbol} at price ${currentPrice}`);
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
};

// Check and update prediction accuracy for a user's votes
export const checkPredictionAccuracy = async (uid, symbol, currentPrice) => {
  if (!uid || !symbol || !currentPrice) return null;
  
  try {
    const userProfile = await getUserProfile(uid);
    const voteData = userProfile?.votes?.[symbol];
    
    if (!voteData || voteData.resolved || !voteData.priceAtVote) return null;
    
    const priceAtVote = voteData.priceAtVote;
    const priceChange = ((currentPrice - priceAtVote) / priceAtVote) * 100;
    
    // Only resolve if price moved at least 1%
    if (Math.abs(priceChange) < 1) return null;
    
    const priceWentUp = priceChange > 0;
    const predictedUp = voteData.vote === 'bullish';
    const isCorrect = priceWentUp === predictedUp;
    
    const userRef = doc(db, 'users', uid);
    
    // Update vote as resolved
    await updateDoc(userRef, {
      [`votes.${symbol}.resolved`]: true,
      [`votes.${symbol}.correct`]: isCorrect,
      [`votes.${symbol}.resolvedAt`]: new Date().toISOString(),
      [`votes.${symbol}.priceAtResolution`]: currentPrice,
      [`votes.${symbol}.priceChangePercent`]: priceChange,
      correctPredictions: increment(isCorrect ? 1 : 0),
      streak: isCorrect ? increment(1) : 0, // Reset streak on wrong prediction
    });
    
    // Update best streak if current streak is higher
    const newProfile = await getUserProfile(uid);
    if (newProfile.streak > (newProfile.bestStreak || 0)) {
      await updateDoc(userRef, {
        bestStreak: newProfile.streak,
      });
    }
    
    // Recalculate accuracy and reputation
    await recalculateUserStats(uid);
    
    console.log(`Prediction for ${symbol}: ${isCorrect ? 'CORRECT' : 'WRONG'} (${priceChange.toFixed(2)}%)`);
    return isCorrect;
  } catch (error) {
    console.error('Error checking prediction:', error);
    return null;
  }
};

// Recalculate user stats (accuracy and reputation score)
export const recalculateUserStats = async (uid) => {
  if (!uid) return false;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return false;
    
    const votes = userProfile.votes || {};
    let totalResolved = 0;
    let totalCorrect = 0;
    
    // Count resolved predictions
    Object.values(votes).forEach(vote => {
      if (vote.resolved) {
        totalResolved++;
        if (vote.correct) totalCorrect++;
      }
    });
    
    // Calculate accuracy (0-100)
    const accuracy = totalResolved > 0 ? Math.round((totalCorrect / totalResolved) * 100) : 0;
    
    // Calculate reputation score (weighted formula)
    // Accuracy: 50% weight (max 50 points)
    // Followers: 30% weight (max 30 points, capped at 100 followers)
    // Engagement: 20% weight (max 20 points, based on likes received)
    const followerCount = userProfile.followerCount || 0;
    const likesReceived = userProfile.totalLikesReceived || 0;
    const streak = userProfile.streak || 0;
    
    const accuracyScore = accuracy * 0.5; // 0-50 points
    const followerScore = Math.min(followerCount, 100) * 0.3; // 0-30 points
    const engagementScore = Math.min(likesReceived, 100) * 0.2; // 0-20 points
    const streakBonus = Math.min(streak * 2, 20); // Bonus for streaks (max 20 points)
    
    const reputationScore = Math.round(accuracyScore + followerScore + engagementScore + streakBonus);
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      accuracy: accuracy,
      correctPredictions: totalCorrect,
      reputationScore: reputationScore,
    });
    
    console.log(`Updated stats for ${uid}: Accuracy ${accuracy}%, Reputation ${reputationScore}`);
    return true;
  } catch (error) {
    console.error('Error recalculating stats:', error);
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
// SOCIAL FEATURES - FOLLOW SYSTEM
// ============================================

// Follow a user
export const followUser = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;
  
  try {
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    // Check if already following
    const currentProfile = await getUserProfile(currentUid);
    if (currentProfile?.following?.includes(targetUid)) {
      console.log('Already following this user');
      return true;
    }
    
    // Add to current user's following list
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUid),
      followingCount: increment(1),
    });
    
    // Add to target user's followers list
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUid),
      followerCount: increment(1),
    });
    
    // Recalculate target user's reputation (followers affect score)
    await recalculateUserStats(targetUid);
    
    console.log(`User ${currentUid} followed ${targetUid}`);
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid || currentUid === targetUid) return false;
  
  try {
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    // Remove from current user's following list
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUid),
      followingCount: increment(-1),
    });
    
    // Remove from target user's followers list
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUid),
      followerCount: increment(-1),
    });
    
    // Recalculate target user's reputation
    await recalculateUserStats(targetUid);
    
    console.log(`User ${currentUid} unfollowed ${targetUid}`);
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

// Check if user is following another user
export const isFollowing = async (currentUid, targetUid) => {
  if (!currentUid || !targetUid) return false;
  
  const userProfile = await getUserProfile(currentUid);
  return userProfile?.following?.includes(targetUid) || false;
};

// ============================================
// SOCIAL FEATURES - COMMENTS
// ============================================

// Add a comment to a stock
export const addComment = async (uid, symbol, content) => {
  if (!uid || !symbol || !content) return null;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return null;
    
    const commentsRef = collection(db, 'stockComments');
    const commentData = {
      uid: uid,
      symbol: symbol,
      content: content,
      displayName: userProfile.settings?.anonymousMode ? 'Anonymous' : (userProfile.displayName || 'User'),
      createdAt: serverTimestamp(),
      likes: [],
      likeCount: 0,
    };
    
    const docRef = await addDoc(commentsRef, commentData);
    console.log(`Added comment to ${symbol}`);
    
    return { id: docRef.id, ...commentData, createdAt: new Date() };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Get comments for a stock
export const getStockComments = async (symbol, limitCount = 20) => {
  if (!symbol) return [];
  
  try {
    const commentsRef = collection(db, 'stockComments');
    const q = query(
      commentsRef, 
      where('symbol', '==', symbol), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    const comments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// Like a comment
export const likeComment = async (uid, commentId, authorUid) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'stockComments', commentId);
    await updateDoc(commentRef, {
      likes: arrayUnion(uid),
      likeCount: increment(1),
    });
    
    // Update author's total likes received (for reputation)
    if (authorUid && authorUid !== uid) {
      const authorRef = doc(db, 'users', authorUid);
      await updateDoc(authorRef, {
        totalLikesReceived: increment(1),
      });
      // Recalculate author's reputation
      await recalculateUserStats(authorUid);
    }
    
    return true;
  } catch (error) {
    console.error('Error liking comment:', error);
    return false;
  }
};

// Unlike a comment
export const unlikeComment = async (uid, commentId, authorUid) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'stockComments', commentId);
    await updateDoc(commentRef, {
      likes: arrayRemove(uid),
      likeCount: increment(-1),
    });
    
    // Update author's total likes received
    if (authorUid && authorUid !== uid) {
      const authorRef = doc(db, 'users', authorUid);
      await updateDoc(authorRef, {
        totalLikesReceived: increment(-1),
      });
      await recalculateUserStats(authorUid);
    }
    
    return true;
  } catch (error) {
    console.error('Error unliking comment:', error);
    return false;
  }
};

// Delete a comment (only by author)
export const deleteComment = async (uid, commentId) => {
  if (!uid || !commentId) return false;
  
  try {
    const commentRef = doc(db, 'stockComments', commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (commentSnap.exists() && commentSnap.data().uid === uid) {
      await deleteDoc(commentRef);
      console.log(`Deleted comment ${commentId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// ============================================
// LEADERBOARD - TOP TRADERS
// ============================================

// Get top traders by reputation score
export const getTopTraders = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    // Simple query without orderBy to avoid needing Firestore index
    const q = query(usersRef, limit(50));
    const snapshot = await getDocs(q);
    
    const traders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Include users with any votes (even 0 initially to show new users)
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
          reputationScore: data.reputationScore || totalVotes, // Fallback to totalVotes
        });
      }
    });
    
    // Sort by reputation score (or totalVotes as fallback) in JavaScript
    traders.sort((a, b) => b.reputationScore - a.reputationScore || b.totalVotes - a.totalVotes);
    
    // Return top traders
    return traders.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting top traders:', error);
    return [];
  }
};

// Get user's rank
export const getUserRank = async (uid) => {
  if (!uid) return null;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return null;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('reputationScore', '>', userProfile.reputationScore || 0));
    const snapshot = await getDocs(q);
    
    return snapshot.size + 1; // Rank is number of users with higher score + 1
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
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
