// src/firebase/auth.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};