import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Role } from '../types';

export interface ClientSession {
  role: string;
  id: string;
  car?: string;
  carNumber?: string;
  vehicleReg?: string;
  name?: string;
  email?: string;
  customerId?: string;
  familyId?: string;
  hospitalId?: string;
  hospitalName?: string;
  requiresPasswordChange?: boolean;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  adminUser: User | null;
  clientSession: ClientSession | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isFirebaseConfigured: boolean;
  isMock: boolean;
  setSession: (session: any) => void;
  signIn: (userId: string, password: string, role: string, extra?: any) => Promise<{success: boolean, requiresPasswordChange?: boolean}>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  adminUser: null,
  clientSession: null,
  role: null,
  loading: true,
  signOut: async () => {},
  isFirebaseConfigured: false,
  isMock: false,
  setSession: () => {},
  signIn: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [clientSession, setClientSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(!isFirebaseConfigured);

  useEffect(() => {
    try {
      const session = localStorage.getItem('rakshak_user_session');
      if (session) {
        setClientSession(JSON.parse(session));
      }
    } catch (e) {
      console.error('Failed to parse client session', e);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn('Firebase is not configured. Falling back to mock auth state.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAdminUser({
              id: userDoc.id,
              uid: user.uid,
              email: user.email || '',
              displayName: data.displayName || '',
              role: data.role as Role,
              status: data.status || 'active',
              lastActive: data.lastActive,
              createdAt: data.createdAt,
            });
          } else {
            setAdminUser(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('rakshak_user_session');
    setClientSession(null);
    if (auth) {
      await firebaseSignOut(auth);
    }
    if (isMock && adminUser) {
      setCurrentUser(null);
      setAdminUser(null);
    }
  };

  const setMockAdmin = () => {
    setCurrentUser({ uid: 'mock-uid', email: 'pv8281309@gmail.com' } as FirebaseUser);
    setAdminUser({
      id: 'mock-id',
      uid: 'mock-uid',
      email: 'pv8281309@gmail.com',
      displayName: 'System Admin',
      role: 'admin',
      status: 'active',
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    setIsMock(true);
  };

  if (typeof window !== 'undefined') {
    (window as any).enableMockAdmin = setMockAdmin;
  }

  
      const signIn = async (userId: string, password: string, activeRole: string, extra?: any): Promise<{success: boolean, requiresPasswordChange?: boolean}> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          password,
          role: activeRole,
          vehicleReg: extra?.carNumber,
          carNumber: extra?.carNumber
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Login failed");
      if (data.success) {
        const verifiedVehicle = data.user?.vehicleReg || extra?.carNumber || "";
        const session = { 
           role: activeRole, 
           id: data.user?.id || userId,
           hospitalId: data.user?.hospitalId || data.user?.id || userId,
           hospitalName: data.user?.hospitalName || data.user?.name || '',
           customerId: data.user?.customerId || data.user?.id || userId,
           familyId: data.user?.familyId || (activeRole === 'family' ? userId : ''),
           name: data.user?.name || data.user?.hospitalName || data.user?.id || userId,
           vehicleReg: verifiedVehicle,
           requiresPasswordChange: data.user?.requiresPasswordChange || false,
           car: verifiedVehicle
        };
        localStorage.setItem('rakshak_user_session', JSON.stringify(session));
        setClientSession(session);
        return { success: true, requiresPasswordChange: data.user.requiresPasswordChange };
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
    return { success: false };
  };

  const setSession = (session: any) => {
    setClientSession(session);
  };

  const role = adminUser ? 'admin' : clientSession ? clientSession.role : null;

  return (
    <AuthContext.Provider value={{ currentUser, adminUser, clientSession, role, loading, signOut, isFirebaseConfigured, isMock, setSession, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};
