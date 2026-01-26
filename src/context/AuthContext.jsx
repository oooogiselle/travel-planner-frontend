// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🟢 AuthProvider useEffect - Setting up auth listener');
    
    // Failsafe: Force loading to false after 3 seconds
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout reached - forcing loading to false');
      setLoading(false);
    }, 3000);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('🟡 Auth state changed:', user ? user.email : 'No user');
        clearTimeout(timeout); // Cancel timeout if auth fires
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Auth error:', error);
        clearTimeout(timeout);
        setLoading(false); // Still set loading to false on error
      }
    );

    // Cleanup
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  console.log('🔵 AuthProvider rendering - loading:', loading, 'user:', currentUser?.email);

  // SHOW LOADING INDICATOR
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading auth... {/* You'll see this if stuck */}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};