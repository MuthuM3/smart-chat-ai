import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  imageUrl?: string;
  accessToken?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
    }
  }, [user]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
