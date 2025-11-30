import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, pass) => {
    if (email === "admin@pps.com") {
      setUser({ role: "admin", email });
    } else if (email === "agent@pps.com") {
      setUser({ role: "agent", email });
    } else {
      setUser({ role: "customer", email });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}
