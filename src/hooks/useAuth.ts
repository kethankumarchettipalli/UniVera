// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, twitterProvider } from '../config/firebase';
import toast from 'react-hot-toast';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    additionalData?: Partial<UserProfile>
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavorite: (type: 'colleges' | 'pgs', id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // We keep a reference to the profile snapshot unsubscribe so we can cleanup
  useEffect(() => {
    let userDocUnsub: (() => void) | null = null;

    // Listen to auth state and set/clear user + userProfile subscription
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setLoading(true);

      // cleanup previous subscription
      if (userDocUnsub) {
        userDocUnsub();
        userDocUnsub = null;
      }

      if (fbUser) {
        // Try to ensure a user profile exists and then subscribe to it
        try {
          await ensureUserProfileExists(fbUser);
        } catch (err) {
          console.error('[useAuth] ensureUserProfileExists error:', err);
        }

        // subscribe to user doc for realtime updates (this updates userProfile automatically)
        const ref = doc(db, 'users', fbUser.uid);
        userDocUnsub = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as DocumentData;
              // merge auth fields to keep displayName / email consistent with Firebase Auth
              const merged: UserProfile = {
                ...data,
                uid: fbUser.uid,
                email: fbUser.email || data.email || '',
                displayName: fbUser.displayName || data.displayName || '',
                photoURL: fbUser.photoURL || data.photoURL || '',
                emailVerified: fbUser.emailVerified,
              } as UserProfile;

              setUserProfile(merged);
            } else {
              // if user doc doesn't exist (rare), create it
              setUserProfile(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('[useAuth] userDoc onSnapshot error:', err);
            setLoading(false);
          }
        );

        // also update last login (not critical for favorites flow)
        try {
          await updateLastLogin(fbUser.uid);
        } catch (err) {
          console.warn('[useAuth] updateLastLogin error:', err);
        }
      } else {
        // signed out
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userDocUnsub) userDocUnsub();
    };
  }, []);

  // Ensure a user doc exists with initial shape
  const ensureUserProfileExists = async (fbUser: User, additional: Partial<UserProfile> = {}) => {
    try {
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const isAdmin = fbUser.email === 'shinchanhook143@gmail.com';
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || additional.displayName || '',
          photoURL: fbUser.photoURL || undefined,
          role: isAdmin ? 'admin' : 'user',
          emailVerified: fbUser.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          loginCount: 1,
          isActive: true,
          preferences: {
            notifications: true,
            newsletter: true,
            darkMode: false,
            language: 'en',
          },
          favorites: { colleges: [], pgs: [] },
          ...additional,
        };
        await setDoc(ref, newProfile);
        // setUserProfile will be updated by the onSnapshot listener shortly
      }
    } catch (err) {
      console.error('[useAuth] ensureUserProfileExists error:', err);
      throw err;
    }
  };

  const updateLastLogin = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          loginCount: (data?.loginCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  };

  // toggle favorite uses arrayUnion/arrayRemove; onSnapshot will update userProfile automatically
  const toggleFavorite = async (type: 'colleges' | 'pgs', id: string) => {
    if (!user) {
      toast.error('You must be logged in to save favorites.');
      return;
    }

    const ref = doc(db, 'users', user.uid);
    const path = `favorites.${type}`;
    // read from latest userProfile snapshot if possible
    const isFav = !!(userProfile?.favorites?.[type]?.includes(id));

    try {
      if (isFav) {
        await updateDoc(ref, { [path]: arrayRemove(id) });
        toast.success('Removed from favorites!');
      } else {
        await updateDoc(ref, { [path]: arrayUnion(id) });
        toast.success('Added to favorites!');
      }
      // no manual reload — onSnapshot will push new profile
    } catch (err) {
      console.error('Error updating favorites:', err);
      toast.error('Could not update favorites.');
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfileExists(res.user);
      toast.success('Login successful!');
    } catch (err: any) {
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    additional: Partial<UserProfile> = {}
  ) => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName });
      try {
        await sendEmailVerification(res.user);
      } catch (vErr) {
        console.warn('[useAuth] sendEmailVerification failed:', vErr);
      }
      await ensureUserProfileExists(res.user, { displayName, ...additional });
      toast.success('Account created! Please check your email for verification.');
    } catch (err: any) {
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      setLoading(true);
      let prov;
      if (provider === 'google') prov = googleProvider;
      else if (provider === 'facebook') prov = facebookProvider;
      else prov = twitterProvider;

      const res = await signInWithPopup(auth, prov);
      await ensureUserProfileExists(res.user);
      toast.success(`Logged in with ${provider}`);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`${provider} login failed.`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out!');
    } catch {
      toast.error('Error logging out.');
      throw new Error('Logout failed');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Failed to send reset email.');
      throw new Error('Reset failed');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    try {
      const ref = doc(db, 'users', user.uid);
      const updateData = { ...data, updatedAt: serverTimestamp() };
      await updateDoc(ref, updateData);
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
        });
      }
      // onSnapshot will pick up the changes
      toast.success('Profile updated!');
    } catch (err) {
      console.error('[useAuth] updateUserProfile error:', err);
      toast.error('Failed to update profile.');
      throw new Error('Update failed');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error('No user logged in');
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      toast.success('Password changed!');
    } catch (err: any) {
      let msg = 'Password change failed.';
      if (err.code === 'auth/wrong-password') msg = 'Current password incorrect.';
      toast.error(msg);
      throw err;
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user?.email) throw new Error('No user logged in');
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('Account deleted.');
    } catch (err: any) {
      let msg = 'Delete failed.';
      if (err.code === 'auth/wrong-password') msg = 'Password incorrect.';
      toast.error(msg);
      throw err;
    }
  };

  const resendVerification = async () => {
    if (!user) {
      toast.error('No user signed in.');
      throw new Error('No user');
    }
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent!');
    } catch (err) {
      console.error('[useAuth] resendVerification failed:', err);
      toast.error('Failed to send verification email. See console.');
      throw err;
    }
  };

  return {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    deleteAccount,
    resendVerification,
    loginWithGoogle: () => socialLogin('google'),
    loginWithFacebook: () => socialLogin('facebook'),
    loginWithTwitter: () => socialLogin('twitter'),
    refreshUserProfile: async () => user && (await getDoc(doc(db, 'users', user.uid))).data(),
    toggleFavorite,
  };
};

export { AuthContext };
