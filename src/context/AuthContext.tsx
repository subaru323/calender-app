import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, firebaseEnabled } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Firebase 設定済みか（false ならゲストモード固定） */
  firebaseEnabled: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Firebase 有効時のみ初期ローディングあり。無効ならすぐゲストとして表示。
  const [loading, setLoading] = useState<boolean>(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    if (!auth) return;
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function signOutUser() {
    if (!auth) return;
    await fbSignOut(auth);
  }

  const value: AuthContextValue = {
    user,
    loading,
    firebaseEnabled,
    signInWithGoogle,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
