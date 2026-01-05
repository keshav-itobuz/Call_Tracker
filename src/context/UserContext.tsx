import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user fields as needed
}

interface UserContextType {
  user: User | null;
  setUserData: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@CallTracker:user';

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserData = useCallback((userData: User | null) => {
    (async () => {
      try {
        if (userData) {
          await AsyncStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(userData),
          );
          setUser(userData);
        } else {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to save user:', error);
      }
    })();
  }, []);

  const logout = useCallback(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    })();
  }, []);

  const contextValue = useMemo(
    () => ({ user, setUserData, logout, isLoading }),
    [user, setUserData, logout, isLoading],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
