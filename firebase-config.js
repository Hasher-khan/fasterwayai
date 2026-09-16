/**
 * firebase-config.js
 * fasterway.ai - Firebase Auth, Firestore & Analytics Engine
 * Provides: Authentication, User-Isolated Database Storage, & Analytics
 */

const firebaseConfig = {
  apiKey: "AIzaSyDQ_IzDpg6abPW94I09PFasOuj0IU98KM4",
  authDomain: "growfastingai.firebaseapp.com",
  projectId: "growfastingai",
  storageBucket: "growfastingai.firebasestorage.app",
  messagingSenderId: "114118332558",
  appId: "1:114118332558:web:72cb14eb112a14530039df",
  measurementId: "G-YVT4WPY4KP"
};

// Global Firebase Instances
let firebaseApp = null;
let analytics = null;
let auth = null;
let db = null;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK scripts not loaded yet.');
      return;
    }

    // Initialize App
    if (firebase.apps.length === 0) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.apps[0];
    }

    // Initialize Auth
    if (typeof firebase.auth === 'function') {
      auth = firebase.auth();
      console.log('[Firebase] ✅ Auth initialized');
    }

    // Initialize Firestore
    if (typeof firebase.firestore === 'function') {
      db = firebase.firestore();
      console.log('[Firebase] ✅ Firestore initialized');
    }

    // Initialize Analytics
    if (typeof firebase.analytics === 'function') {
      analytics = firebase.analytics();
      console.log('[Firebase] ✅ Analytics initialized for growfastingai');
    }

  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err.message);
  }
}

/* =====================================================
   AUTHENTICATION API (EMAIL/PASSWORD & GOOGLE)
   ===================================================== */

/**
 * Sign up a new user with Email, Password & Display Name
 */
async function signUpWithEmail(email, password, displayName) {
  if (!auth) throw new Error("Firebase Auth is not ready.");
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  
  if (displayName && user.updateProfile) {
    await user.updateProfile({ displayName });
  }
  
  // Create user initial document in Firestore
  if (db && user) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    }, { merge: true });
  }

  return user;
}

/**
 * Sign in existing user with Email & Password
 */
async function signInWithEmail(email, password) {
  if (!auth) throw new Error("Firebase Auth is not ready.");
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
}

/**
 * Sign in with Google OAuth popup
 */
async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is not ready.");
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  const user = result.user;

  // Initialize or update user doc in Firestore
  if (db && user) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      lastLogin: new Date().toISOString()
    }, { merge: true });
  }

  return user;
}

/**
 * Sign out current user
 */
async function signOutUser() {
  if (!auth) throw new Error("Firebase Auth is not ready.");
  await auth.signOut();
}

/**
 * Listen for authentication state changes
 */
function onAuthChange(callback) {
  if (auth) {
    return auth.onAuthStateChanged(callback);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (auth) auth.onAuthStateChanged(callback);
    });
  }
}

/* =====================================================
   FIRESTORE USER DATA STORAGE (PER USER UID ISOLATION)
   ===================================================== */

/**
 * Save user history and preferences under users/{uid}
 */
async function saveUserDataToFirestore(uid, dataObj) {
  if (!db || !uid) return;
  try {
    await db.collection('users').doc(uid).set({
      ...dataObj,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firestore] Saved data for UID: ${uid}`);
  } catch (err) {
    console.error('[Firestore] Error saving user data:', err);
  }
}

/**
 * Load user data from users/{uid}
 */
async function getUserDataFromFirestore(uid) {
  if (!db || !uid) return null;
  try {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log(`[Firestore] Loaded data for UID: ${uid}`);
      return docSnap.data();
    } else {
      return null;
    }
  } catch (err) {
    console.error('[Firestore] Error fetching user data:', err);
    return null;
  }
}

/* =====================================================
   ANALYTICS HELPER FUNCTIONS
   ===================================================== */

function logEvent(eventName, params = {}) {
  try {
    if (analytics) {
      analytics.logEvent(eventName, {
        app: 'fasterway.ai',
        timestamp: new Date().toISOString(),
        ...params
      });
    }
  } catch (err) {}
}

function trackEmailGenerated(params = {}) {
  logEvent('email_generated', {
    tone: params.tone || 'professional',
    length: params.length || 'standard',
    has_custom_prompt: Boolean(params.customPrompt),
    has_sender: Boolean(params.senderName),
    has_recipient: Boolean(params.recipientName)
  });
}

function trackGrammarChecked(params = {}) {
  logEvent('grammar_checked', {
    char_count: params.charCount || 0,
    auto_mode: Boolean(params.autoMode),
    suggestion_count: params.suggestionCount || 0
  });
}

function trackTemplateUsed(params = {}) {
  logEvent('template_used', {
    template_id: params.templateId || 'unknown',
    category: params.category || 'general',
    auto_generate: Boolean(params.autoGenerate)
  });
}

function trackPageView(viewName) {
  logEvent('page_view', {
    page_title: viewName,
    page_location: window.location.href
  });
}

// Auto-init on script load
initFirebase();
