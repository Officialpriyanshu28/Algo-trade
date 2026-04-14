import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from './NotificationProvider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user document exists in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
            // Initialize balance if it doesn't exist
            balance: 100000 
          }, { merge: true });

          // Sync to public profiles
          await setDoc(doc(db, 'public_profiles', user.uid), {
            uid: user.uid,
            displayName: user.isAnonymous ? 'Guest User' : user.displayName,
            photoURL: user.isAnonymous ? null : user.photoURL,
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error('Error syncing user to Firestore:', e);
        }
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      notify('success', 'Welcome!', 'Successfully logged in with Google.');
    } catch (error: any) {
      console.error('Login error:', error);
      notify('error', 'Login Failed', error.message || 'An error occurred during login.');
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      notify('success', 'Welcome Guest!', 'Successfully logged in anonymously.');
    } catch (error: any) {
      console.error('Guest login error:', error);
      notify('error', 'Login Failed', error.message || 'An error occurred during guest login.');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      notify('success', 'Welcome Back!', 'Successfully logged in.');
    } catch (error: any) {
      console.error('Email login error:', error);
      notify('error', 'Login Failed', error.message || 'Invalid email or password.');
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      notify('success', 'Account Created!', 'Welcome to the platform.');
    } catch (error: any) {
      console.error('Email signup error:', error);
      notify('error', 'Signup Failed', error.message || 'Could not create account.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      notify('info', 'Logged Out', 'You have been successfully logged out.');
    } catch (error: any) {
      console.error('Logout error:', error);
      notify('error', 'Logout Failed', error.message || 'An error occurred during logout.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsGuest, loginWithEmail, signupWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
