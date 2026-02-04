// Push Notification Service for finnysights
// Uses Firebase Cloud Messaging (FCM) for browser push notifications

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase.js';
import { db } from './firebase.js';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

// ============================================
// VAPID KEY - You MUST replace this!
// Get yours from Firebase Console:
// Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
// ============================================
const VAPID_KEY = 'BGUiah-nDUShf4gdFFJ6IRM2h17xIFUoTMtllJ_lKImEerdPhSERRd4Mbe-apJKCbR-WPbcPZ9JUjY4HY25GVm8';

// ============================================
// PERMISSION & TOKEN MANAGEMENT
// ============================================

// Check if browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && messaging !== null;
};

// Get current notification permission status
export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default', 'granted', or 'denied'
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (uid) => {
  if (!isNotificationSupported()) {
    console.warn('Push notifications not supported');
    return { success: false, error: 'not_supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return { success: false, error: 'permission_denied' };
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      
      // Save token to user's Firestore profile
      if (uid) {
        await saveTokenToFirestore(uid, token);
      }
      
      return { success: true, token };
    } else {
      console.warn('No FCM token available');
      return { success: false, error: 'no_token' };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error: error.message };
  }
};

// Save FCM token to user's Firestore profile
const saveTokenToFirestore = async (uid, token) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token),
      notificationsEnabled: true,
      lastTokenUpdate: new Date().toISOString(),
    });
    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Remove FCM token (when user disables notifications)
export const removeNotificationToken = async (uid, token) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      fcmTokens: arrayRemove(token),
      notificationsEnabled: false,
    });
    console.log('FCM token removed');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

// ============================================
// FOREGROUND MESSAGE HANDLING
// ============================================

// Listen for messages when app is in foreground
export const onForegroundMessage = (callback) => {
  if (!messaging) return null;
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// ============================================
// LOCAL NOTIFICATION HELPERS
// ============================================

// Show a local browser notification (for foreground alerts)
export const showLocalNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification(title, {
    icon: '/finny-logo.png',
    badge: '/finny-logo.png',
    vibrate: [200, 100, 200],
    ...options,
  });

  // Auto-close after 8 seconds
  setTimeout(() => notification.close(), 8000);

  notification.onclick = () => {
    window.focus();
    notification.close();
    if (options.onClick) options.onClick();
  };

  return notification;
};

// ============================================
// PRICE ALERT NOTIFICATIONS
// ============================================

// Send price alert notification (local, foreground)
export const sendPriceAlertNotification = (alert, currentPrice) => {
  const isAbove = alert.condition === 'above';
  const direction = isAbove ? '📈 Above' : '📉 Below';
  
  showLocalNotification(
    `${alert.symbol} Price Alert Triggered!`,
    {
      body: `${alert.symbol} is now ${isAbove ? 'above' : 'below'} your target of $${alert.targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`,
      tag: `price-alert-${alert.symbol}-${alert.id}`,
      requireInteraction: true,
      data: { type: 'price_alert', symbol: alert.symbol },
    }
  );
};

// ============================================
// ANNOUNCEMENT NOTIFICATIONS
// ============================================

// Send announcement notification (local, foreground)
export const sendAnnouncementNotification = (announcement) => {
  const typeEmoji = {
    feature: '🚀',
    alert: '⚠️',
    maintenance: '🔧',
    update: '📢',
  };
  
  const emoji = typeEmoji[announcement.type] || '📢';
  
  showLocalNotification(
    `${emoji} finnysights ${announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}`,
    {
      body: announcement.content,
      tag: `announcement-${announcement.id}`,
      data: { type: 'announcement', id: announcement.id },
    }
  );
};

// ============================================
// CHAT NOTIFICATIONS
// ============================================

// Send chat notification when someone mentions you or replies
export const sendChatNotification = (message) => {
  showLocalNotification(
    `💬 ${message.displayName} in Global Chat`,
    {
      body: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
      tag: `chat-${message.id}`,
      data: { type: 'chat', id: message.id },
    }
  );
};

// ============================================
// NOTIFICATION PREFERENCES (Firestore)
// ============================================

// Get user's notification preferences
export const getNotificationPreferences = async (uid) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        enabled: data.notificationsEnabled || false,
        priceAlerts: data.notificationPrefs?.priceAlerts !== false,
        announcements: data.notificationPrefs?.announcements !== false,
        chat: data.notificationPrefs?.chat || false,
        email: data.notificationPrefs?.email || false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (uid, prefs) => {
  if (!uid) return false;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      notificationPrefs: prefs,
    });
    console.log('Notification preferences updated');
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
};
