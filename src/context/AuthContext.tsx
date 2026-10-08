import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'Environmental Inspector' | 'Satellite Analyst' | 'Field Response Team';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

interface StoredAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const ACCOUNTS_KEY = 'oceaneye_accounts';
const SESSION_KEY = 'oceaneye_session';

const demoAccounts: StoredAccount[] = [
  { id: 'demo-1', email: 'inspector@oceaneye.com', password: 'password123', role: 'Environmental Inspector', displayName: 'Sarah Chen' },
  { id: 'demo-2', email: 'analyst@oceaneye.com', password: 'password123', role: 'Satellite Analyst', displayName: 'Marcus Reid' },
  { id: 'demo-3', email: 'field@oceaneye.com', password: 'password123', role: 'Field Response Team', displayName: 'Amira Hassan' },
];

function getAccounts(): StoredAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (!stored) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(demoAccounts));
      return demoAccounts;
    }
    return JSON.parse(stored);
  } catch {
    return demoAccounts;
  }
}

function toAuthUser(acc: StoredAccount): AuthUser {
  return { id: acc.id, email: acc.email, role: acc.role, displayName: acc.displayName };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const accounts = getAccounts();
        const acc = accounts.find((a) => a.id === session);
        if (acc) setUser(toAuthUser(acc));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const accounts = getAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!acc || acc.password !== password) {
      setError('Invalid email or password');
      throw new Error('Invalid credentials');
    }
    localStorage.setItem(SESSION_KEY, acc.id);
    setUser(toAuthUser(acc));
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole, displayName: string) => {
    setError(null);
    const accounts = getAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      setError('An account with this email already exists');
      throw new Error('Email exists');
    }
    const newAcc: StoredAccount = {
      id: `user-${Date.now()}`,
      email,
      password,
      role,
      displayName,
    };
    const updated = [...accounts, newAcc];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_KEY, newAcc.id);
    setUser(toAuthUser(newAcc));
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
