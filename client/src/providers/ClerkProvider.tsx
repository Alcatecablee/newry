import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Simple demo auth - accept any email/password combo
    if (email && password) {
      const newUser = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
      };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
