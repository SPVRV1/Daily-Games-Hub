import { createContext, useContext } from "react";

export type UserContextType = {
  user: {
    username: string;
    avatarUrl?: string;
  } | null;
  setUser: (user: { username: string; avatarUrl?: string } | null) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
