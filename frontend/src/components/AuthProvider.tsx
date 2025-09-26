'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

interface AuthContextType {
  role: 'admin' | 'member' | null;
}

const AuthContext = createContext<AuthContextType>({ role: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'admin' | 'member' | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: { role: 'admin' | 'member' } = jwtDecode(token);
        setRole(decoded.role);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token'); // Safe now, runs only on client
      setRole(null);
    }
  }, []); // Empty dependency array for one-time execution

  return <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);