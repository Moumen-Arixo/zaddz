import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';

// Because OAuth provisioning may be pending,
// we wrap the initialization to avoid crashing until the config is present.
let app: any = null;
let auth: any = null;

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export const initFirebase = async () => {
    try {
        // Attempt to load the config dynamically
        const firebaseConfig = await import('../../firebase-applet-config.json').then(m => m.default);
        if(!app && firebaseConfig && firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
        }
    } catch (e) {
        console.warn("firebase-applet-config.json not found yet. OAuth provisioning may have failed or is pending.");
    }
};

export const initAuth = async (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  await initFirebase();
  if(!auth) {
      if (onAuthFailure) onAuthFailure();
      return;
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        cachedUser = user;
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        cachedUser = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  await initFirebase();
  if(!auth) {
      throw new Error("لم يتم تكوين إعدادات الدخول بعد، يرجى المحاولة لاحقاً.");
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  if (auth) {
      await signOut(auth);
  }
  cachedAccessToken = null;
  cachedUser = null;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getGoogleUser = (): User | null => {
  return cachedUser;
};
