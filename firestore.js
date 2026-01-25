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
  deleteDoc
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
    
    // Add to current user's following
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUid)
    });
    
    // Add to target user's followers
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
// SOCIAL FEATURES - POSTS/ACTIVITY
// ============================================

// Create a post
export const createPost = async (uid, content, stockSymbol = null, sentiment = null) => {
  if (!uid || !content) return null;
  
  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) return null;
    
    const postData = {
      uid: uid,
      content: content,
      stockSymbol: stockSymbol,
      sentiment: sentiment, // 'bullish', 'bearish', or null
      displayName: userProfile.settings?.anonymousMode ? 'Anonymous' : (userProfile.displayName || userProfile.email?.split('@')[0]),
      isAnonymous: userProfile.settings?.anonymousMode || false,
      createdAt: serverTimestamp(),
      likes: [],
      likesCount: 0,
      commentsCount: 0,
    };
    
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, postData);
    
    console.log('Post created:', docRef.id);
    return { id: docRef.id, ...postData, createdAt: new Date() };
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// Get recent posts (global feed)
export const getRecentPosts = async (limitCount = 20) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

// Get posts for a specific stock
export const getStockPosts = async (stockSymbol, limitCount = 20) => {
  if (!stockSymbol) return [];
  
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('stockSymbol', '==', stockSymbol),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting stock posts:', error);
    return [];
  }
};

// Like a post
export const likePost = async (uid, postId) => {
  if (!uid || !postId) return false;
  
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(uid),
      likesCount: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
};

// Unlike a post
export const unlikePost = async (uid, postId) => {
  if (!uid || !postId) return false;
  
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(uid),
      likesCount: increment(-1)
    });
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    return false;
  }
};

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

// Get top traders by vote count
export const getLeaderboard = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('totalVotes', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const leaders = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaders.push({
        uid: doc.id,
        displayName: data.settings?.anonymousMode ? 'Anonymous' : (data.displayName || data.email?.split('@')[0]),
        isAnonymous: data.settings?.anonymousMode || false,
        totalVotes: data.totalVotes || 0,
        followers: data.followers?.length || 0,
        reputation: data.reputation || 0,
      });
    });
    
    return leaders;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
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
