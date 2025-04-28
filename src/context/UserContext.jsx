// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "/src/supabaseClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // contiene user + rol
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserWithRol = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const supabaseUser = sessionData?.session?.user;

      if (supabaseUser) {
        const { data: empleado, error } = await supabase
          .from("profile")
          .select("id, nombre, rol")
          .eq("supabase_user_id", supabaseUser.id)
          .single();

        if (!error) {
          setUser({ ...supabaseUser, ...empleado }); // contás con el `rol`
        }
      }

      setLoading(false);
    };

    fetchUserWithRol();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
